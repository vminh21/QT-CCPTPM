<?php
require_once __DIR__ . '/../DAL/SubscriptionRepository.php';
require_once __DIR__ . '/../DAL/PackageRepository.php';
require_once __DIR__ . '/../DAL/TransactionRepository.php';

/**
 * Lớp PaymentService chịu trách nhiệm xử lý các nghiệp vụ liên quan đến thanh toán và gói tập.
 * Bao gồm: kiểm tra điều kiện mua gói mới, kích hoạt gói tập trực tiếp (tiền mặt/chuyển khoản),
 * tạo thông tin chuyển khoản bằng mã QR VietQR, và tích hợp thanh toán trực tuyến qua cổng MoMo.
 */
class PaymentService {
    /** @var SubscriptionRepository Repository quản lý thông tin đăng ký gói tập */
    private $subRepo;
    
    /** @var PackageRepository Repository quản lý thông tin các gói tập */
    private $pkgRepo;
    
    /** @var TransactionRepository Repository quản lý lịch sử giao dịch và cơ sở dữ liệu giao dịch */
    private $transRepo;

    /**
     * Khởi tạo đối tượng PaymentService và khởi tạo các repository đi kèm.
     */
    public function __construct() {
        $this->subRepo = new SubscriptionRepository();
        $this->pkgRepo = new PackageRepository();
        $this->transRepo = new TransactionRepository();
    }

    /**
     * Gửi một yêu cầu HTTP POST sử dụng thư viện cURL của PHP.
     * Thường dùng để kết nối và gọi API từ các cổng thanh toán bên thứ ba như MoMo.
     *
     * @param string $url URL đích nhận yêu cầu POST.
     * @param string $data Chuỗi dữ liệu gửi đi (định dạng JSON).
     * @return string|bool Kết quả phản hồi từ máy chủ dưới dạng chuỗi hoặc false nếu gặp lỗi.
     */
    private function execPostRequest($url, $data) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen($data))
        );
        curl_setopt($ch, CURLOPT_TIMEOUT, 5); // Thiết lập thời gian tối đa để thực thi yêu cầu là 5 giây
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5); // Thiết lập thời gian tối đa để kết nối tới server là 5 giây
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Bỏ qua việc xác thực chứng chỉ SSL (thích hợp cho môi trường phát triển/sandbox)
        $result = curl_exec($ch);
        curl_close($ch);
        return $result;
    }

    /**
     * Kiểm tra xem hội viên có đủ điều kiện để mua và kích hoạt một gói tập mới hay không.
     * Một hội viên không được phép mua gói mới nếu họ đang sở hữu một gói tập khác đang hoạt động,
     * ngoại trừ trường hợp tham số $ignore_active được đặt thành true để bỏ qua việc kiểm tra này.
     *
     * @param int $member_id ID của hội viên cần kiểm tra điều kiện.
     * @param bool $ignore_active Nếu là true, hệ thống sẽ bỏ qua kiểm tra gói đang hoạt động. Mặc định là false.
     * @throws Exception Nếu hội viên đã có gói tập đang kích hoạt và không yêu cầu bỏ qua kiểm tra (mã lỗi 409).
     * @return void
     */
    public function checkEligibleForNewPackage(int $member_id, bool $ignore_active = false): void {
        // Truy vấn chi tiết gói tập đang kích hoạt của hội viên từ SubscriptionRepository
        $activeSub = $this->subRepo->getActiveSubscriptionDetails($member_id);
        
        // Nếu tìm thấy gói tập đang hoạt động và không có cờ bỏ qua kiểm tra
        if ($activeSub && !$ignore_active) {
            throw new Exception('Bạn đang có gói tập đang kích hoạt. Vui lòng Huỷ gói cũ tại trang Hồ sơ trước khi mua gói mới!', 409);
        }
    }

    /**
     * Kích hoạt trực tiếp gói tập cho hội viên (Hỗ trợ phương thức thanh toán Tiền mặt hoặc Chuyển khoản).
     * Hàm này thực hiện toàn bộ quy trình nghiệp vụ dưới dạng một Database Transaction để đảm bảo tính toàn vẹn dữ liệu:
     * 1. Hủy kích hoạt (expire) tất cả các gói tập hiện có của hội viên.
     * 2. Tạo một bản đăng ký gói tập mới có hiệu lực kể từ thời điểm hiện tại.
     * 3. Ghi nhận giao dịch thanh toán tương ứng vào lịch sử giao dịch.
     *
     * @param int $member_id ID của hội viên được kích hoạt gói tập.
     * @param int $package_id ID của gói tập muốn kích hoạt.
     * @param string $payment_method Phương thức thanh toán sử dụng (ví dụ: 'Cash', 'Transfer').
     * @param int|null $trainer_id ID của huấn luyện viên cá nhân đi kèm (nếu có). Mặc định là null.
     * @param string|null $course_name Tên khóa học đi kèm gói tập (nếu có). Mặc định là null.
     * @throws Exception Nếu không tìm thấy gói tập (404) hoặc xảy ra lỗi trong quá trình xử lý cơ sở dữ liệu (500).
     * @return void
     */
    public function activatePackage(int $member_id, int $package_id, string $payment_method, ?int $trainer_id = null, ?string $course_name = null): void {
        // Lấy thông tin gói tập từ PackageRepository để lấy thời hạn sử dụng và đơn giá
        $pkg = $this->pkgRepo->getPackageById($package_id);
        if (!$pkg) {
            throw new Exception("Không tìm thấy gói tập ID=$package_id", 404);
        }

        $duration  = intval($pkg['duration_days']);
        $price     = $pkg['price'];
        $pkg_name  = $pkg['package_name'];
        
        // Xác định ngày bắt đầu từ ngày hôm nay và tính toán ngày kết thúc dựa trên số ngày của gói tập
        $start_date = date("Y-m-d");
        $end_date   = date('Y-m-d', strtotime("+$duration days"));

        try {
            // Khởi động Database Transaction để đảm bảo mọi thao tác ghi dữ liệu bên dưới phải thành công đồng bộ
            $this->transRepo->beginTransaction();

            // Bước 1: Vô hiệu hóa (Expire) tất cả các gói tập đang hoạt động hiện tại của hội viên này
            $this->subRepo->expireActiveSubscriptions($member_id);

            // Bước 2: Tạo bản ghi đăng ký gói tập mới (subscription)
            $this->subRepo->createSubscription($member_id, $package_id, $start_date, $end_date, $trainer_id, $course_name);

            // Bước 3: Ghi nhận lịch sử giao dịch thanh toán
            $note = "Thanh toán ($payment_method): $pkg_name";
            $this->transRepo->createTransactionWithNote($member_id, $price, $payment_method, 'Registration', $note);

            // Xác nhận và lưu các thay đổi vào cơ sở dữ liệu
            $this->transRepo->commit();
        } catch (\Throwable $e) {
            // Hoàn tác (Rollback) mọi thay đổi dữ liệu nếu phát sinh bất kỳ ngoại lệ hoặc lỗi nào trong khối try
            $this->transRepo->rollBack();
            throw new Exception("Lỗi kích hoạt gói: " . $e->getMessage(), 500);
        }
    }

    /**
     * Tạo thông tin chuyển khoản ngân hàng và tự động sinh đường dẫn mã QR VietQR.
     * Hỗ trợ thanh toán chuyển khoản qua ngân hàng Techcombank với thông tin tài khoản và nội dung định danh định sẵn.
     *
     * @param int $member_id ID của hội viên thực hiện giao dịch chuyển khoản.
     * @param int $package_id ID của gói tập hội viên muốn mua.
     * @throws Exception Nếu không tìm thấy thông tin gói tập (404).
     * @return array Mảng chứa thông tin thanh toán chi tiết bao gồm: phương thức, số tiền, tên ngân hàng, số tài khoản, tên tài khoản thụ hưởng, nội dung chuyển khoản và URL mã QR.
     */
    public function generateTransferInfo(int $member_id, int $package_id): array {
        // Truy vấn thông tin gói tập để lấy giá tiền cần thanh toán
        $pkg = $this->pkgRepo->getPackageById($package_id);
        if (!$pkg) {
            throw new Exception("Không tìm thấy gói tập ID=$package_id", 404);
        }

        $price   = $pkg['price'];
        $bank    = 'TECHCOMBANK';
        $stk     = '1117122005';
        $accName = 'NHU TUNG LAM';
        
        // Sinh nội dung chuyển khoản định danh có định dạng chuẩn (ví dụ: GYM1PKG2) để hỗ trợ đối soát giao dịch
        $content = "GYM{$member_id}PKG{$package_id}";
        
        // Sử dụng dịch vụ VietQR để sinh mã QR thanh toán nhanh, truyền các tham số bao gồm ngân hàng, stk, số tiền và nội dung chuyển khoản
        $qrUrl   = "https://img.vietqr.io/image/{$bank}-{$stk}-compact2.png?amount={$price}&addInfo={$content}&accountName=" . urlencode($accName);

        return [
            'method'      => 'transfer',
            'price'       => $price,
            'bank'        => $bank,
            'account'     => $stk,
            'accountName' => $accName,
            'content'     => $content,
            'qrUrl'       => $qrUrl
        ];
    }

    /**
     * Khởi tạo giao dịch thanh toán trực tuyến qua cổng MoMo (môi trường Sandbox/Testing).
     * Hàm này thực hiện chuẩn bị các tham số cần thiết, sinh chữ ký bảo mật SHA256 dựa trên secretKey,
     * gửi yêu cầu khởi tạo giao dịch tới MoMo và trả về URL trang thanh toán (payUrl) để người dùng chuyển hướng.
     *
     * @param int $member_id ID của hội viên mua gói tập.
     * @param int $package_id ID của gói tập hội viên đăng ký mua.
     * @param string $hostUrl URL của backend/server dùng để nhận thông báo trạng thái thanh toán bất đồng bộ (IPN/Webhook) từ MoMo.
     * @param string $frontendUrl URL trang giao diện người dùng để MoMo chuyển hướng khách hàng về sau khi thanh toán xong.
     * @param int|null $trainer_id ID của huấn luyện viên cá nhân đi kèm (nếu có). Mặc định là null.
     * @param string|null $course_name Tên khóa học đi kèm gói tập (nếu có). Mặc định là null.
     * @throws Exception Nếu không tìm thấy thông tin gói tập (404) hoặc có lỗi xảy ra trong quá trình khởi tạo với MoMo (500).
     * @return array Kết quả phản hồi từ API MoMo, trong đó quan trọng nhất là trường 'payUrl' dùng để thanh toán.
     */
    public function createMoMoPayment(int $member_id, int $package_id, string $hostUrl, string $frontendUrl, ?int $trainer_id = null, ?string $course_name = null): array {
        // Truy vấn thông tin gói tập để tính toán giá tiền cần thanh toán
        $pkg = $this->pkgRepo->getPackageById($package_id);
        if (!$pkg) {
            throw new Exception("Không tìm thấy gói tập ID=$package_id", 404);
        }
        $price = $pkg['price'];

        // Cấu hình thông tin tích hợp tài khoản MoMo Sandbox (Môi trường thử nghiệm)
        $endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
        $partnerCode = "MOMOBKUN20180529";
        $accessKey = "klm05TvNBzhg7h7j";
        $secretKey = "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
        
        $orderInfo = "Thanh toan goi tap GYM MASTER";
        $amount = strval((int)$price); 
        $orderId = time() . ""; // Sinh mã đơn hàng duy nhất dựa trên nhãn thời gian hiện tại
        $requestId = time() . ""; // Sinh mã requestId duy nhất dựa trên nhãn thời gian hiện tại
        
        // Đóng gói dữ liệu bổ sung gửi kèm MoMo để khi nhận lại webhook (IPN), hệ thống khôi phục được thông tin đơn hàng
        $extraData = $package_id . "|" . ($trainer_id ?? 0) . "|" . ($course_name ?? 'None');
        
        // URL Redirect sau khi kết thúc thanh toán trên cổng MoMo
        $redirectUrl = rtrim($frontendUrl, '/') . "/member"; 
        
        // URL IPN (Instant Payment Notification) - Nơi MoMo gửi kết quả thanh toán trực tiếp về máy chủ của chúng ta. 
        // Đường dẫn này cần phải chính xác và truy cập được từ internet bên ngoài.
        $ipnUrl = rtrim($hostUrl, '/') . "/BTLWeb(PC)/backend/api/payment.php";

        // Xây dựng chuỗi rawHash ghép các tham số theo thứ tự bảng chữ cái đúng theo tài liệu đặc tả của MoMo
        $rawHash = "accessKey=".$accessKey."&amount=".$amount."&extraData=".$extraData."&ipnUrl=".$ipnUrl."&orderId=".$orderId."&orderInfo=".$orderInfo."&partnerCode=".$partnerCode."&redirectUrl=".$redirectUrl."&requestId=".$requestId."&requestType=captureWallet";
        
        // Ký chữ ký số HMAC SHA256 sử dụng khoá bí mật secretKey của merchant
        $signature = hash_hmac("sha256", $rawHash, $secretKey);

        // Tạo mảng dữ liệu payload yêu cầu thanh toán
        $data = array(
            'partnerCode' => $partnerCode,
            'partnerName' => "GYM MASTER",
            'storeId' => 'GymStore',
            'requestId' => $requestId,
            'amount' => $amount,
            'orderId' => $orderId,
            'orderInfo' => $orderInfo,
            'redirectUrl' => $redirectUrl,
            'ipnUrl' => $ipnUrl,
            'lang' => 'vi',
            'extraData' => $extraData,
            'requestType' => 'captureWallet',
            'signature' => $signature
        );

        // Gửi yêu cầu HTTP POST chứa payload JSON tới cổng thanh toán MoMo
        $result = $this->execPostRequest($endpoint, json_encode($data));
        $response = json_decode($result, true);

        // Kiểm tra phản hồi trả về từ MoMo, nếu không hợp lệ hoặc thiếu đường dẫn thanh toán thì ném ra ngoại lệ
        if (!is_array($response) || empty($response['payUrl'])) {
            $err = is_array($response) ? ($response['message'] ?? 'Lỗi không xác định') : 'Không thể kết nối MoMo';
            throw new Exception("Lỗi khởi tạo MoMo: " . $err, 500);
        }

        return $response;
    }
}
?>
