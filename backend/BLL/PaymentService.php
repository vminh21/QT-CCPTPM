<?php
require_once __DIR__ . '/../DAL/SubscriptionRepository.php';
require_once __DIR__ . '/../DAL/PackageRepository.php';
require_once __DIR__ . '/../DAL/TransactionRepository.php';

class PaymentService {
    private $subRepo;
    private $pkgRepo;
    private $transRepo;

    public function __construct() {
        $this->subRepo = new SubscriptionRepository();
        $this->pkgRepo = new PackageRepository();
        $this->transRepo = new TransactionRepository();
    }

    private function execPostRequest($url, $data) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen($data))
        );
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $result = curl_exec($ch);
        curl_close($ch);
        return $result;
    }

    /**
     * Kiểm tra xem user có đủ điều kiện mua gói mới không
     */
    public function checkEligibleForNewPackage(int $member_id, bool $ignore_active = false): void {
        $activeSub = $this->subRepo->getActiveSubscriptionDetails($member_id);
        if ($activeSub && !$ignore_active) {
            throw new Exception('Bạn đang có gói tập đang kích hoạt. Vui lòng Huỷ gói cũ tại trang Hồ sơ trước khi mua gói mới!', 409);
        }
    }

    /**
     * Kích hoạt gói tập, hỗ trợ Tiền mặt và Chuyển khoản
     */
    public function activatePackage(int $member_id, int $package_id, string $payment_method, ?int $trainer_id = null, ?string $course_name = null): void {
        $pkg = $this->pkgRepo->getPackageById($package_id);
        if (!$pkg) {
            throw new Exception("Không tìm thấy gói tập ID=$package_id", 404);
        }

        $duration  = intval($pkg['duration_days']);
        $price     = $pkg['price'];
        $pkg_name  = $pkg['package_name'];
        $start_date = date("Y-m-d");
        $end_date   = date('Y-m-d', strtotime("+$duration days"));

        try {
            // Sử dụng repo để quản lý Transaction
            $this->transRepo->beginTransaction();

            // 1. Expire tất cả gói Active hiện tại
            $this->subRepo->expireActiveSubscriptions($member_id);

            // 2. Tạo subscription mới
            $this->subRepo->createSubscription($member_id, $package_id, $start_date, $end_date, $trainer_id, $course_name);

            // 3. Ghi giao dịch
            $note = "Thanh toán ($payment_method): $pkg_name";
            $this->transRepo->createTransactionWithNote($member_id, $price, $payment_method, 'Registration', $note);

            $this->transRepo->commit();
        } catch (\Throwable $e) {
            $this->transRepo->rollBack();
            throw new Exception("Lỗi kích hoạt gói: " . $e->getMessage(), 500);
        }
    }

    /**
     * Tạo thông tin chuyển khoản (QR code)
     */
    public function generateTransferInfo(int $member_id, int $package_id): array {
        $pkg = $this->pkgRepo->getPackageById($package_id);
        if (!$pkg) {
            throw new Exception("Không tìm thấy gói tập ID=$package_id", 404);
        }

        $price   = $pkg['price'];
        $bank    = 'TECHCOMBANK';
        $stk     = '1117122005';
        $accName = 'NHU TUNG LAM';
        $content = "GYM{$member_id}PKG{$package_id}";
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
     * Khởi tạo giao dịch MoMo
     */
    public function createMoMoPayment(int $member_id, int $package_id, string $hostUrl, string $frontendUrl, ?int $trainer_id = null, ?string $course_name = null): array {
        $pkg = $this->pkgRepo->getPackageById($package_id);
        if (!$pkg) {
            throw new Exception("Không tìm thấy gói tập ID=$package_id", 404);
        }
        $price = $pkg['price'];

        $endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
        $partnerCode = "MOMOBKUN20180529";
        $accessKey = "klm05TvNBzhg7h7j";
        $secretKey = "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
        
        $orderInfo = "Thanh toan goi tap GYM MASTER";
        $amount = strval((int)$price); 
        $orderId = time() . ""; 
        $requestId = time() . "";
        $extraData = $package_id . "|" . ($trainer_id ?? 0) . "|" . ($course_name ?? 'None');
        
        $redirectUrl = rtrim($frontendUrl, '/') . "/member"; 
        $ipnUrl = rtrim($hostUrl, '/') . "/BTLWeb(PC)/backend/api/payment.php"; // Chú ý đường dẫn IPN phải chính xác

        $rawHash = "accessKey=".$accessKey."&amount=".$amount."&extraData=".$extraData."&ipnUrl=".$ipnUrl."&orderId=".$orderId."&orderInfo=".$orderInfo."&partnerCode=".$partnerCode."&redirectUrl=".$redirectUrl."&requestId=".$requestId."&requestType=captureWallet";
        $signature = hash_hmac("sha256", $rawHash, $secretKey);

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

        $result = $this->execPostRequest($endpoint, json_encode($data));
        $response = json_decode($result, true);

        if (!is_array($response) || empty($response['payUrl'])) {
            $err = is_array($response) ? ($response['message'] ?? 'Lỗi không xác định') : 'Không thể kết nối MoMo';
            throw new Exception("Lỗi khởi tạo MoMo: " . $err, 500);
        }

        return $response;
    }
}
?>
