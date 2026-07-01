<?php
/**
 * PaymentController
 *
 * Điều phối các yêu cầu API liên quan đến thanh toán.
 * POST /api/payments -> Khởi tạo thanh toán
 * POST /api/payments/confirm -> Xác nhận chuyển khoản
 */

require_once ROOT_PATH . 'BLL/PaymentService.php';

class PaymentController {

    /**
     * Định tuyến yêu cầu POST đến đúng luồng xử lý tương ứng.
     *
     * @param string|null $id Action phụ hoặc ID của thanh toán (ví dụ: 'confirm').
     * @param string|null $sub Tham số phụ bổ sung.
     * @param string $method Phương thức HTTP (POST, GET, ...).
     * @return void
     */
    public static function handle(?string $id, ?string $sub, string $method): void {
        if ($method === 'POST') {
            // Xác nhận chuyển khoản
            if ($id === 'confirm') {
                self::processPaymentRequest('confirm');
                return;
            }
            // Khởi tạo thanh toán
            if (empty($id)) {
                self::processPaymentRequest('initiate');
                return;
            }
        }
        jsonResponse(['success' => false, 'error' => 'Endpoint Not Found or Method Not Allowed'], 404);
    }

    /**
     * Xử lý luồng nghiệp vụ thanh toán (Tiền mặt, Chuyển khoản, MoMo).
     *
     * @param string $action Hành động thanh toán ('confirm' hoặc 'initiate').
     * @return void
     */
    private static function processPaymentRequest(string $action): void {
        try {
            // Xác thực hội viên và lấy thông tin request body
            $payload   = requireMember();
            $memberId  = (int)$payload['member_id'];
            $body      = getRequestBody();

            $packageId     = (int)($body['package_id'] ?? 0);
            $trainerId     = !empty($body['trainer_id']) ? (int)$body['trainer_id'] : null;
            $courseName    = !empty($body['course_name']) ? trim($body['course_name']) : null;
            $paymentMethod = trim($body['payment_method'] ?? 'Tiền mặt');
            $ignoreActive  = !empty($body['ignore_active']);

            if ($packageId <= 0) {
                jsonResponse(['success' => false, 'error' => 'Thiếu thông tin gói tập hợp lệ.'], 400);
            }

            $svc = new PaymentService();

            // Kiểm tra điều kiện mua gói mới
            $svc->checkEligibleForNewPackage($memberId, $ignoreActive);

            // Kích hoạt ngay đối với thanh toán tiền mặt tại quầy
            if ($paymentMethod === 'Tiền mặt') {
                $svc->activatePackage($memberId, $packageId, 'Tiền mặt', $trainerId, $courseName);
                jsonResponse(['success' => true, 'message' => 'Đăng ký thành công! Vui lòng thanh toán tại quầy.'], 201);
            }

            // Thanh toán chuyển khoản (Quét mã QR hoặc Xác nhận)
            if ($paymentMethod === 'Chuyển khoản') {
                if ($action === 'confirm') {
                    // Xác nhận chuyển khoản hoàn tất
                    $svc->activatePackage($memberId, $packageId, 'Chuyển khoản', $trainerId, $courseName);
                    jsonResponse(['success' => true, 'message' => 'Xác nhận chuyển khoản thành công! Gói tập đã kích hoạt.'], 201);
                } else {
                    // Lấy thông tin chuyển khoản VietQR
                    $data = $svc->generateTransferInfo($memberId, $packageId);
                    $data['success'] = true;
                    $data['package_id'] = $packageId;
                    $data['trainer_id'] = $trainerId;
                    $data['course_name'] = $courseName;
                    jsonResponse($data, 200);
                }
            }

            // Thanh toán qua cổng MoMo (lấy payUrl để redirect)
            if ($paymentMethod === 'Momo') {
                $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
                $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
                $hostUrl = $protocol . $host;
                $frontendUrl = $protocol . "localhost:5173";

                $data = $svc->createMoMoPayment($memberId, $packageId, $hostUrl, $frontendUrl, $trainerId, $courseName);
                jsonResponse(['success' => true, 'method' => 'momo', 'payUrl' => $data['payUrl']], 200);
            }

            jsonResponse(['success' => false, 'error' => 'Phương thức thanh toán không hợp lệ'], 400);

        } catch (Exception $e) {
            $statusCode = $e->getCode();
            if ($statusCode < 400 || $statusCode > 599) {
                $statusCode = 500;
            }
            jsonResponse(['success' => false, 'error' => $e->getMessage()], $statusCode);
        }
    }
}
?>
