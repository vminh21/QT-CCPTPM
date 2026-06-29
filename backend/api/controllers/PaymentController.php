<?php
/**
 * PaymentController
 *
 * Chuẩn RESTful API: 
 * POST /api/payments -> Khởi tạo thanh toán
 * POST /api/payments/confirm -> Xác nhận chuyển khoản
 */

require_once ROOT_PATH . 'BLL/PaymentService.php';

class PaymentController {

    public static function handle(?string $id, ?string $sub, string $method): void {
        if ($method === 'POST') {
            // Trường hợp: POST /api/payments/confirm
            if ($id === 'confirm') {
                self::processPaymentRequest('confirm');
                return;
            }
            // Trường hợp: POST /api/payments
            if (empty($id)) {
                self::processPaymentRequest('initiate');
                return;
            }
        }
        jsonResponse(['success' => false, 'error' => 'Endpoint Not Found or Method Not Allowed'], 404);
    }

    private static function processPaymentRequest(string $action): void {
        try {
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

            // Gọi Service kiểm tra điều kiện (BLL)
            $svc->checkEligibleForNewPackage($memberId, $ignoreActive);

            if ($paymentMethod === 'Tiền mặt') {
                $svc->activatePackage($memberId, $packageId, 'Tiền mặt', $trainerId, $courseName);
                jsonResponse(['success' => true, 'message' => 'Đăng ký thành công! Vui lòng thanh toán tại quầy.'], 201);
            }

            if ($paymentMethod === 'Chuyển khoản') {
                if ($action === 'confirm') {
                    // Xác nhận chuyển khoản
                    $svc->activatePackage($memberId, $packageId, 'Chuyển khoản', $trainerId, $courseName);
                    jsonResponse(['success' => true, 'message' => 'Xác nhận chuyển khoản thành công! Gói tập đã kích hoạt.'], 201);
                } else {
                    // Khởi tạo chuyển khoản (Lấy thông tin QR)
                    $data = $svc->generateTransferInfo($memberId, $packageId);
                    $data['success'] = true;
                    $data['package_id'] = $packageId;
                    $data['trainer_id'] = $trainerId;
                    $data['course_name'] = $courseName;
                    jsonResponse($data, 200);
                }
            }

            if ($paymentMethod === 'Momo') {
                // Trích xuất biến môi trường để truyền vào Service
                $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
                $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
                $hostUrl = $protocol . $host;
                $frontendUrl = $protocol . "localhost:5173"; // Lấy từ env trong thực tế

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
