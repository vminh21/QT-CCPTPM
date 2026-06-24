<?php
/**
 * AuthController
 *
 * POST   /api/auth/login     → Đăng nhập, trả JWT
 * POST   /api/auth/register  → Đăng ký hội viên mới
 * POST   /api/auth/logout    → Logout (client tự xóa token)
 * GET    /api/auth/me        → Thông tin user từ JWT hiện tại
 */

require_once ROOT_PATH . 'BLL/AuthService.php';

class AuthController {

    public static function handle(?string $sub, string $method): void {
    match (true) {
        // POST /api/auth/login
        $sub === 'login' && $method === 'POST'           => self::login(),
        // POST /api/auth/register
        $sub === 'register' && $method === 'POST'        => self::register(),
        // POST /api/auth/logout
        $sub === 'logout' && $method === 'POST'          => self::logout(),
        // GET  /api/auth/me
        $sub === 'me' && $method === 'GET'               => self::me(),
        // POST /api/auth/forgot-password
        $sub === 'forgot-password' && $method === 'POST' => self::forgotPassword(),
        // POST /api/auth/reset-password
        $sub === 'reset-password' && $method === 'POST'  => self::resetPassword(),

        default => jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405),
    };
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────────
    private static function login(): void {
        $body     = getRequestBody();
        $email    = trim($body['username'] ?? $body['email'] ?? '');
        $password = trim($body['password'] ?? '');

        $authService = new AuthService();
        $result = $authService->authenticate($email, $password);

        if (!$result['status']) {
            jsonResponse(['success' => false, 'error' => $result['error']], 401);
        }

        $role = $result['role'];
        $user = $result['user'];

        // Xây JWT payload theo role
        $payload = [
            'role'      => $role,
            'full_name' => $user['full_name'],
        ];

        if ($role === 'admin') {
            $payload['admin_id']  = $user['id'];
            $payload['position']  = $user['position'];
            // Nếu position === 'staff' thì ghi đè role
            if ($user['position'] === 'staff') {
                $payload['role'] = 'staff';
            }
        } elseif ($role === 'pt') {
            $payload['trainer_id'] = $user['id'];
        } else {
            $payload['member_id']  = $user['id'];
        }

        $token = JWTHandler::encode($payload);

        jsonResponse([
            'success'   => true,
            'token'     => $token,
            'role'      => $payload['role'],
            'full_name' => $user['full_name'],
        ]);
    }

    // ── POST /api/auth/register ───────────────────────────────────────────────
    private static function register(): void {
        $body = getRequestBody();

        $authService = new AuthService();
        $result = $authService->register(
            trim($body['full_name']    ?? ''),
            trim($body['email']        ?? ''),
            trim($body['phone']        ?? ''),
            trim($body['address']      ?? ''),
            trim($body['gender']       ?? ''),
            trim($body['password']     ?? ''),
            trim($body['confirm_pass'] ?? '')
        );

        if ($result['status']) {
            jsonResponse(['success' => true, 'message' => $result['message'] ?? 'Đăng ký thành công!'], 201);
        } else {
            jsonResponse(['success' => false, 'errors' => $result['errors'] ?? [], 'error' => $result['error'] ?? ''], 422);
        }
    }

    // ── POST /api/auth/logout ─────────────────────────────────────────────────
    private static function logout(): void {
        // Với JWT stateless, server không cần làm gì - client tự xóa token
        jsonResponse(['success' => true, 'message' => 'Đã đăng xuất thành công']);
    }

    // ── POST /api/auth/forgot-password ────────────────────────────────────────
    private static function forgotPassword(): void {
        $body  = getRequestBody();
        $email = trim($body['email'] ?? '');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['success' => false, 'error' => 'Email không hợp lệ!'], 422);
        }

        // Kiểm tra email tồn tại trong các bảng (members, trainers, staff/admin)
        $authService = new AuthService();
        $userRole = $authService->findUserRoleByEmail($email);

        if (!$userRole) {
            // Trả về success để không lộ thông tin user có tồn tại hay không
            jsonResponse(['success' => true, 'message' => 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn khôi phục.']);
        }

        // Tạo JWT Token có thời hạn 15 phút (900s)
        $payload = [
            'reset_email' => $email,
            'role' => $userRole,
            'exp' => time() + 900 
        ];
        $resetToken = JWTHandler::encode($payload);

        $resetLink = "http://localhost:5173/reset-password?token=" . $resetToken;

        // Gửi email thực tế qua PHPMailer
        require_once ROOT_PATH . 'PHPMailer/src/PHPMailer.php';
        require_once ROOT_PATH . 'PHPMailer/src/SMTP.php';
        require_once ROOT_PATH . 'PHPMailer/src/Exception.php';

        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com'; 
            $mail->SMTPAuth   = true;
            $mail->Username   = 'nguyenvanminh859323@gmail.com'; // Email người gửi
            $mail->Password   = 'vqkw euqz fktf jjpx'; // Mật khẩu ứng dụng Gmail
            $mail->SMTPSecure = 'tls';
            $mail->Port       = 587;
            
            $mail->setFrom('nguyenvanminh859323@gmail.com', 'FitPhysique Support');
            $mail->addAddress($email); // Gửi tới email của người dùng
            
            $mail->isHTML(true);
            $mail->Subject = 'Khoi phuc mat khau - FitPhysique'; // Tiêu đề tiếng việt không dấu (an toàn hơn cho spam filter)
            $mail->Body    = "Chào bạn,<br><br>Bạn vừa yêu cầu khôi phục mật khẩu. Vui lòng click vào link bên dưới để đặt lại mật khẩu mới: <br><br>
                              <a href='{$resetLink}' style='padding: 10px 20px; background-color: #fca311; color: white; text-decoration: none; border-radius: 5px; display: inline-block;'>ĐẶT LẠI MẬT KHẨU</a> <br><br>
                              <i>Lưu ý: Link này chỉ có hiệu lực trong 15 phút.</i><br><br>
                              Nếu bạn không yêu cầu, vui lòng bỏ qua email này.";

            $mail->send();
            
            // Trả về thành công
            jsonResponse([
                'success' => true, 
                'message' => 'Đã gửi email khôi phục mật khẩu! Vui lòng kiểm tra hộp thư.'
            ]);
        } catch (Exception $e) {
            // Lỗi gửi mail
            jsonResponse([
                'success' => false, 
                'error' => 'Lỗi gửi email: ' . $mail->ErrorInfo
            ], 500);
        }
    }

    // ── POST /api/auth/reset-password ────────────────────────────────────────
    private static function resetPassword(): void {
        $body = getRequestBody();
        $token = trim($body['token'] ?? '');
        $newPassword = trim($body['newPassword'] ?? '');

        if (!$token || !$newPassword) {
            jsonResponse(['success' => false, 'error' => 'Thiếu dữ liệu!'], 400);
        }

        if (strlen($newPassword) < 8 || !preg_match('/[a-zA-Z]/', $newPassword) || !preg_match('/[0-9]/', $newPassword)) {
            jsonResponse(['success' => false, 'error' => 'Mật khẩu mới cần ít nhất 8 ký tự, gồm cả chữ và số!'], 422);
        }

        try {
            $payload = JWTHandler::decode($token);
        } catch (Exception $e) {
            jsonResponse(['success' => false, 'error' => 'Đường dẫn khôi phục không hợp lệ hoặc đã hết hạn!'], 401);
        }

        if (!isset($payload['reset_email']) || !isset($payload['role'])) {
            jsonResponse(['success' => false, 'error' => 'Token không hợp lệ!'], 401);
        }

        $authService = new AuthService();
        $result = $authService->resetPassword($payload['reset_email'], $payload['role'], $newPassword);

        if ($result) {
            jsonResponse(['success' => true, 'message' => 'Đổi mật khẩu thành công! Bạn có thể đăng nhập.']);
        } else {
            jsonResponse(['success' => false, 'error' => 'Đổi mật khẩu thất bại, vui lòng thử lại!'], 500);
        }
    }

    // ── GET /api/auth/me ──────────────────────────────────────────────────────
    private static function me(): void {
        $payload = getJWTPayload();
        if (!$payload) {
            jsonResponse(['success' => true, 'data' => ['loggedIn' => false]]);
        }
        jsonResponse([
            'success' => true,
            'data' => [
                'loggedIn'   => true,
                'role'       => $payload['role']       ?? null,
                'full_name'  => $payload['full_name']  ?? null,
                'member_id'  => $payload['member_id']  ?? null,
                'admin_id'   => $payload['admin_id']   ?? null,
                'trainer_id' => $payload['trainer_id'] ?? null,
            ]
        ]);
    }
}
