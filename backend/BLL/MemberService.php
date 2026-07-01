<?php
require_once __DIR__ . '/../DAL/MemberRepository.php';
require_once __DIR__ . '/../DAL/PackageRepository.php';
require_once __DIR__ . '/../DAL/SubscriptionRepository.php';
require_once __DIR__ . '/../DAL/TransactionRepository.php';

/**
 * Lớp MemberService chịu trách nhiệm xử lý các nghiệp vụ liên quan đến quản lý danh sách hội viên.
 * Cung cấp các chức năng cho Admin/Quản lý như: hiển thị gói tập, tìm kiếm và lọc hội viên,
 * thêm mới hội viên kèm gói tập ban đầu (sử dụng Database Transaction), cập nhật thông tin chi tiết
 * của hội viên (kèm điều chỉnh thông tin đăng ký gói), kích hoạt/khóa tài khoản và xóa hội viên.
 */
class MemberService {
    /** @var MemberRepository Repository quản lý thông tin tài khoản hội viên */
    private $memberRepo;
    
    /** @var PackageRepository Repository quản lý thông tin các gói tập */
    private $packageRepo;
    
    /** @var SubscriptionRepository Repository quản lý thông tin đăng ký gói tập */
    private $subRepo;
    
    /** @var TransactionRepository Repository quản lý lịch sử giao dịch và tài chính */
    private $transRepo;

    /**
     * Khởi tạo đối tượng MemberService và khởi tạo các repository đi kèm.
     */
    public function __construct() {
        $this->memberRepo = new MemberRepository();
        $this->packageRepo = new PackageRepository();
        $this->subRepo = new SubscriptionRepository();
        $this->transRepo = new TransactionRepository();
    }

    /**
     * Lấy toàn bộ danh sách gói tập hiện có trên hệ thống.
     *
     * @return array Danh sách tất cả các gói tập.
     */
    public function getPackages() {
        return $this->packageRepo->getAllPackages();
    }

    /**
     * Tìm kiếm và lọc danh sách hội viên theo từ khóa và các tiêu chí lọc.
     * Tự động quét và cập nhật trạng thái hết hạn cho toàn bộ các gói tập trước khi truy vấn danh sách
     * để đảm bảo dữ liệu hiển thị (như trạng thái hoạt động của hội viên) luôn chính xác nhất.
     *
     * @param string $search Từ khóa tìm kiếm (tên, số điện thoại, email,...).
     * @param string|int $filter_package Điều kiện lọc theo ID gói tập (hoặc chuỗi rỗng/null nếu không lọc).
     * @param string $filter_status Điều kiện lọc theo trạng thái của hội viên (ví dụ: 'Active', 'Inactive').
     * @return array Danh sách hội viên thỏa mãn các điều kiện tìm kiếm và lọc.
     */
    public function searchMembers($search, $filter_package, $filter_status) {
        // Tự động kiểm tra và chuyển trạng thái "Expired" cho tất cả các gói tập đã quá thời hạn sử dụng trên toàn hệ thống
        $this->subRepo->autoExpireALLStaleSubscriptions();
        
        // Thực hiện truy vấn danh sách hội viên tại tầng DAL
        return $this->memberRepo->searchMembers($search, $filter_package, $filter_status);
    }

    /**
     * Lưu thông tin hội viên (Hỗ trợ cả chức năng Thêm mới hoặc Cập nhật thông tin chi tiết).
     *
     * - **Trường hợp thêm mới ($id rỗng):**
     *   1. Tự động sinh địa chỉ email mặc định dạng `mem_[timestamp]@fit.com`.
     *   2. Mã hóa mật khẩu mặc định là "123456".
     *   3. Thực hiện tạo mới tài khoản hội viên.
     *   4. Nếu có chọn gói tập đăng ký ban đầu, tiến hành tạo đăng ký gói tập (Subscription) tương ứng và ghi nhận giao dịch thanh toán trực tiếp bằng Tiền mặt.
     *   5. Quy trình này được gói trong Database Transaction để đảm bảo tính nhất quán (nếu lỗi ở bất kỳ bước nào sẽ rollback hoàn toàn).
     *
     * - **Trường hợp cập nhật ($id có giá trị):**
     *   1. Cập nhật các thông tin cơ bản (tên, sđt, địa chỉ, trạng thái) của hội viên.
     *   2. Nếu Admin điều chỉnh thông tin gói tập (hoặc ngày bắt đầu, ngày kết thúc) từ giao diện, hệ thống sẽ kiểm tra so với gói tập đang hoạt động hiện tại. Nếu có sự thay đổi, hệ thống sẽ đánh dấu gói cũ là hết hạn và tạo gói mới tương ứng.
     *
     * @param int|null $id ID của hội viên. Nếu rỗng (null/0/empty string) thì thực hiện THÊM MỚI, ngược lại thực hiện CẬP NHẬT.
     * @param string $name Họ tên hội viên.
     * @param string $phone Số điện thoại liên hệ.
     * @param string $address Địa chỉ nơi ở.
     * @param string $status Trạng thái của hội viên ('Active' hoặc 'Inactive').
     * @param int|null $package_id ID của gói tập đăng ký mua. Mặc định là null.
     * @param string|null $start_date Ngày bắt đầu gói tập (định dạng Y-m-d). Mặc định là null.
     * @param string|null $end_date Ngày kết thúc gói tập (định dạng Y-m-d). Mặc định là null.
     * @return string Trả về chuỗi "success" nếu thành công, ngược lại trả về "error".
     */
    public function saveMember($id, $name, $phone, $address, $status, $package_id = null, $start_date = null, $end_date = null) {
        if (empty($id)) {
            // Tự động sinh email ngẫu nhiên dựa theo timestamp để tránh trùng lặp
            $email    = "mem_" . time() . "@fit.com";
            // Mã hóa mật khẩu mặc định sử dụng thuật toán bcrypt
            $password = password_hash("123456", PASSWORD_BCRYPT);

            try {
                // Khởi động Database Transaction
                $this->transRepo->beginTransaction();

                // Tạo mới tài khoản hội viên và lấy ID của bản ghi vừa sinh ra
                $new_id = $this->memberRepo->createMember($name, $email, $password, $phone, $address, 'Male', $status);
                
                // Nếu Admin có chọn gói tập đăng ký ban đầu cho hội viên mới
                if (!empty($package_id)) {
                    // Tạo thông tin đăng ký gói tập mới cho hội viên
                    $this->subRepo->createSubscription($new_id, $package_id, $start_date, $end_date);
                    
                    // Duyệt danh sách các gói tập để tìm đơn giá của gói tập được chọn
                    $packages = $this->getPackages();
                    $amount = 0;
                    foreach ($packages as $pkg) {
                        if ($pkg['package_id'] == $package_id) {
                            $amount = $pkg['price'];
                            break;
                        }
                    }
                    
                    // Ghi nhận lịch sử giao dịch thanh toán bằng Tiền mặt cho gói tập đăng ký ban đầu
                    $this->transRepo->createTransaction($new_id, $amount, 'Tiền mặt', 'Registration');
                }
                
                // Commit lưu lại toàn bộ thay đổi vào database
                $this->transRepo->commit();
                return "success";
            } catch (Exception $e) {
                // Hủy bỏ toàn bộ thao tác ghi dữ liệu nếu xảy ra lỗi trong quá trình thực thi
                $this->transRepo->rollBack();
                return "error";
            }
        } else {
            // Thực hiện cập nhật các thông tin cơ bản của hội viên hiện tại
            $success = $this->memberRepo->updateMemberDetails($id, $name, $phone, $address, $status);
            
            // Xử lý thay đổi thông tin gói tập khi Admin sửa thông tin hội viên
            if (!empty($package_id) && !empty($start_date) && !empty($end_date)) {
                // Lấy thông tin đăng ký gói đang hoạt động hiện tại
                $activeSub = $this->subRepo->getActiveSubscriptionDetails($id);
                
                // Nếu chưa có gói nào hoạt động, hoặc gói mới khác ID gói hiện tại, hoặc khác ngày hết hạn
                if (!$activeSub || $activeSub['package_id'] != $package_id || $activeSub['end_date'] != $end_date) {
                    // Đánh dấu gói tập cũ đang hoạt động là hết hạn ngay lập tức thay vì update ghi đè trực tiếp
                    $this->subRepo->expireActiveSubscriptions($id);
                    // Kích hoạt gói tập mới với thời hạn được chọn
                    $this->subRepo->createSubscription($id, $package_id, $start_date, $end_date);
                }
            }
            
            return $success ? "success" : "error";
        }
    }

    /**
     * Kích hoạt hoặc tạm khóa tài khoản của hội viên bằng cách thay đổi trạng thái (Status).
     * Chuyển trạng thái từ 'Active' sang 'Inactive' hoặc ngược lại.
     *
     * @param int $id ID của hội viên cần thay đổi trạng thái.
     * @param string $current_status Trạng thái hiện tại của hội viên ('Active' hoặc 'Inactive').
     * @return string Trả về chuỗi "updated" nếu thay đổi trạng thái thành công, ngược lại trả về "error".
     */
    public function toggleMemberStatus($id, $current_status) {
        // Đảo trạng thái hiện tại
        $new_status = ($current_status == 'Active') ? 'Inactive' : 'Active';
        $success = $this->memberRepo->toggleStatus($id, $new_status);
        return $success ? "updated" : "error";
    }

    /**
     * Xóa tài khoản của hội viên khỏi hệ thống.
     *
     * @param int $id ID của hội viên cần xóa.
     * @return string Trả về chuỗi "deleted" nếu xóa thành công, ngược lại trả về "error".
     */
    public function deleteMember($id) {
        $success = $this->memberRepo->deleteMember($id);
        return $success ? "deleted" : "error";
    }
}
?>
