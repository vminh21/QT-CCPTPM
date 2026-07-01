<?php
require_once __DIR__ . '/../DAL/MemberRepository.php';
require_once __DIR__ . '/../DAL/SubscriptionRepository.php';
require_once __DIR__ . '/../DAL/TransactionRepository.php';
require_once __DIR__ . '/../DAL/PackageRepository.php';
require_once __DIR__ . '/../DAL/NotificationRepository.php';

/**
 * Lớp ProfileService chịu trách nhiệm xử lý các nghiệp vụ liên quan đến thông tin cá nhân của hội viên.
 * Bao gồm: truy xuất toàn bộ dữ liệu hồ sơ (thông tin hội viên, gói tập đang hoạt động, tính số ngày còn lại,
 * danh sách gói tập hiện có, lịch sử giao dịch), cập nhật thông tin cá nhân, hủy gói tập hiện tại, 
 * và lấy danh sách các thông báo cá nhân dành cho hội viên.
 */
class ProfileService {
    /** @var MemberRepository Repository quản lý thông tin hội viên */
    private $memberRepo;
    
    /** @var SubscriptionRepository Repository quản lý đăng ký và trạng thái gói tập */
    private $subRepo;
    
    /** @var TransactionRepository Repository quản lý lịch sử giao dịch thanh toán */
    private $transRepo;
    
    /** @var PackageRepository Repository quản lý các gói tập có trên hệ thống */
    private $pkgRepo;
    
    /** @var NotificationRepository Repository quản lý hệ thống thông báo */
    private $notifRepo;

    /**
     * Khởi tạo đối tượng ProfileService và khởi tạo các repository đi kèm.
     */
    public function __construct() {
        $this->memberRepo = new MemberRepository();
        $this->subRepo    = new SubscriptionRepository();
        $this->transRepo  = new TransactionRepository();
        $this->pkgRepo    = new PackageRepository();
        $this->notifRepo  = new NotificationRepository();
    }

    /**
     * Lấy toàn bộ dữ liệu cần thiết để hiển thị trên trang Hồ sơ (Profile) của hội viên.
     * Quy trình xử lý bao gồm:
     * 1. Lấy thông tin cơ bản của hội viên.
     * 2. Tự động kiểm tra và chuyển trạng thái các đăng ký gói tập đã quá ngày hết hạn mà chưa được cập nhật.
     * 3. Lấy thông tin gói tập đang kích hoạt của hội viên.
     * 4. Tính toán số ngày sử dụng còn lại của gói tập đang hoạt động (nếu có).
     * 5. Lấy danh sách toàn bộ các gói tập trong hệ thống để phục vụ việc đăng ký mới.
     * 6. Lấy lịch sử giao dịch của hội viên theo thứ tự mới nhất xếp trước.
     *
     * @param int $member_id ID của hội viên cần truy xuất thông tin hồ sơ.
     * @return array Mảng chứa toàn bộ dữ liệu hồ sơ bao gồm: thông tin cá nhân, gói tập đang hoạt động, số ngày còn lại, danh sách gói tập và lịch sử giao dịch.
     */
    public function getProfileData($member_id) {
        // Truy vấn thông tin tài khoản hội viên từ cơ sở dữ liệu
        $member = $this->memberRepo->getMemberById($member_id);

        // Tự động quét và chuyển trạng thái "Expired" cho các gói tập đã quá hạn ngày end_date nhưng cơ sở dữ liệu chưa kịp cập nhật trạng thái
        $this->subRepo->autoExpireStaleSubscriptions($member_id);

        // Lấy thông tin chi tiết về gói tập đang ở trạng thái kích hoạt (Active) của hội viên
        $active_sub = $this->subRepo->getActiveSubscriptionDetails($member_id);
        
        $days_left = 0;
        // Kiểm tra xem hội viên có gói tập hoạt động không và ngày hết hạn có tồn tại hay không
        if ($active_sub && isset($active_sub['end_date'])) {
            $today = new DateTime(); // Ngày hiện tại
            $expiry = new DateTime($active_sub['end_date']); // Ngày hết hạn của gói tập
            
            // Nếu ngày hết hạn lớn hơn hoặc bằng ngày hôm nay thì tính toán số ngày còn lại
            if ($expiry >= $today) {
                // Sử dụng hàm diff để lấy số ngày chênh lệch giữa hai thời điểm và cộng thêm 1 ngày để tính cả ngày hiện tại
                $days_left = $today->diff($expiry)->days + 1;
            }
        }

        // Truy vấn toàn bộ danh sách gói tập trong hệ thống
        $packages = $this->pkgRepo->getAllPackages();
        
        // Lấy danh sách lịch sử giao dịch của hội viên theo thứ tự giảm dần thời gian (mới nhất lên đầu)
        $transactions = $this->transRepo->getTransactionsByMemberDesc($member_id);

        return [
            'member'       => $member,
            'active_sub'   => $active_sub,
            'days_left'    => $days_left,
            'packages'     => $packages,
            'transactions' => $transactions
        ];
    }

    /**
     * Cập nhật thông tin cá nhân của hội viên (bao gồm đổi mật khẩu nếu được cung cấp).
     *
     * @param int $member_id ID của hội viên cần cập nhật thông tin.
     * @param string $name Họ tên mới của hội viên.
     * @param string $email Địa chỉ email mới.
     * @param string $address Địa chỉ nhà mới.
     * @param string $gender Giới tính.
     * @param string|null $password Mật khẩu mới (nếu muốn thay đổi mật khẩu cũ, nếu không đổi hãy truyền chuỗi trống hoặc null).
     * @return bool Trả về true nếu cập nhật thành công trong cơ sở dữ liệu, ngược lại trả về false.
     */
    public function updateProfile($member_id, $name, $email, $address, $gender, $password) {
        // Gọi tầng DAL để thực thi câu lệnh SQL UPDATE thông tin cá nhân của hội viên
        return $this->memberRepo->updateProfile($member_id, $name, $email, $address, $gender, $password);
    }

    /**
     * Hủy kích hoạt gói tập đang sử dụng của hội viên.
     * Trạng thái gói tập sẽ được chuyển về ngừng hoạt động (người dùng tự hủy).
     *
     * @param int $member_id ID của hội viên muốn hủy gói tập.
     * @return bool Trả về true nếu quá trình cập nhật trạng thái hủy gói tập thành công, ngược lại là false.
     */
    public function cancelSubscription($member_id) {
        // Thực hiện hủy gói tập đang kích hoạt thông qua SubscriptionRepository
        return $this->subRepo->cancelActiveSubscription($member_id);
    }

    /**
     * Lấy danh sách các thông báo cá nhân dành riêng cho hội viên.
     *
     * @param int $member_id ID của hội viên nhận thông báo.
     * @return array Danh sách các thông báo đã gửi cho hội viên từ trước đến nay.
     */
    public function getPersonalNotifications($member_id) {
        // Truy vấn danh sách thông báo cá nhân của hội viên thông qua NotificationRepository
        return $this->notifRepo->getNotificationsByMember($member_id);
    }
}
?>
