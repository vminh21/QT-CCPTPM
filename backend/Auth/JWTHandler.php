<?php
/**
 * JWTHandler - Tạo và xác thực JSON Web Token (thuần PHP, không cần thư viện)
 * Algorithm: HS256 (HMAC-SHA256)
 */
class JWTHandler {

    /** Thay bằng chuỗi bí mật riêng - KHÔNG commit lên git */
    private static string $secret = 'GYMWEB_JWT_SECRET_2026_FITPHYSIQUE';

    /** Thời gian sống của token (giây) - 8 giờ */
    private static int $ttl = 28800;

    // ────────────────────────────────────────────────────────────────────────

    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
    }

    // ────────────────────────────────────────────────────────────────────────

    /**
     * Tạo JWT token từ payload
     * @param array $payload  ['role' => ..., 'member_id'|'admin_id'|'trainer_id' => ..., 'full_name' => ...]
     */
    public static function encode(array $payload): string {
        $header = self::base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));

        $payload['iat'] = time();
        $payload['exp'] = time() + self::$ttl;

        $body = self::base64UrlEncode(json_encode($payload));

        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$body", self::$secret, true)
        );

        return "$header.$body.$signature";
    }

    /**
     * Giải mã và xác thực JWT token
     * @return array|null  Payload nếu hợp lệ, null nếu không hợp lệ / hết hạn
     */
    public static function decode(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $body, $sig] = $parts;

        // Kiểm tra chữ ký
        $expected = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$body", self::$secret, true)
        );
        if (!hash_equals($expected, $sig)) return null;

        // Giải mã payload
        $payload = json_decode(self::base64UrlDecode($body), true);
        if (!is_array($payload)) return null;

        // Kiểm tra hết hạn
        if (isset($payload['exp']) && $payload['exp'] < time()) return null;

        return $payload;
    }

    /**
     * Lấy token từ HTTP Authorization header hoặc cookie
     */
    public static function getTokenFromRequest(): ?string {
        // 1. Authorization: Bearer <token>
        $authHeader = $_SERVER['HTTP_AUTHORIZATION']
            ?? apache_request_headers()['Authorization']
            ?? apache_request_headers()['authorization']
            ?? null;

        if ($authHeader && preg_match('/^Bearer\s+(.+)$/i', $authHeader, $m)) {
            return trim($m[1]);
        }

        // 2. Fallback: cookie (dành cho same-origin requests)
        if (!empty($_COOKIE['jwt_token'])) {
            return $_COOKIE['jwt_token'];
        }

        return null;
    }
}
