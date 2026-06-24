<?php
/**
 * API Helpers - Dùng chung cho tất cả Controllers
 * - CORS, JSON response, JWT auth middleware
 */

// ── Config đường dẫn ─────────────────────────────────────────────────────────
define('ROOT_PATH',   dirname(__DIR__) . '/');
define('UPLOAD_PATH', ROOT_PATH . 'uploads/');
define('UPLOAD_URL',  '/BTLWeb(PC)/backend/uploads/');

require_once ROOT_PATH . 'Auth/JWTHandler.php';

// ── CORS Headers ─────────────────────────────────────────────────────────────
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Xử lý OPTIONS preflight ngay lập tức
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── JSON Response Helper ──────────────────────────────────────────────────────
function jsonResponse(array $data, int $statusCode = 200): never {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// ── Request Body Helper ───────────────────────────────────────────────────────
/**
 * Đọc request body: ưu tiên JSON, fallback về $_POST, hỗ trợ multipart/form-data
 */
function getRequestBody(): array {
    // Nếu Content-Type là application/json
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($contentType, 'application/json')) {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }
    // multipart/form-data hoặc application/x-www-form-urlencoded
    return $_POST ?: [];
}

// ── JWT Auth Middlewares ──────────────────────────────────────────────────────

/** Lấy JWT payload hiện tại (null nếu chưa đăng nhập) */
function getJWTPayload(): ?array {
    $token = JWTHandler::getTokenFromRequest();
    if (!$token) return null;
    return JWTHandler::decode($token);
}

/** Yêu cầu đăng nhập bất kỳ role nào, trả về payload */
function requireAuth(): array {
    $payload = getJWTPayload();
    if (!$payload) {
        jsonResponse(['success' => false, 'error' => 'Unauthorized - Vui lòng đăng nhập'], 401);
    }
    return $payload;
}

/** Yêu cầu role admin hoặc staff */
function requireAdmin(): array {
    $payload = requireAuth();
    if (!in_array($payload['role'] ?? '', ['admin', 'staff'])) {
        jsonResponse(['success' => false, 'error' => 'Forbidden - Yêu cầu quyền Admin'], 403);
    }
    return $payload;
}

/** Chỉ chấp nhận admin (không phải staff) */
function requireSuperAdmin(): array {
    $payload = requireAuth();
    if (($payload['role'] ?? '') !== 'admin') {
        jsonResponse(['success' => false, 'error' => 'Forbidden - Yêu cầu quyền Admin cao nhất'], 403);
    }
    return $payload;
}

/** Yêu cầu role member */
function requireMember(): array {
    $payload = requireAuth();
    if (($payload['role'] ?? '') !== 'member') {
        jsonResponse(['success' => false, 'error' => 'Forbidden - Yêu cầu quyền Hội viên'], 403);
    }
    return $payload;
}

/** Yêu cầu role pt */
function requirePT(): array {
    $payload = requireAuth();
    if (($payload['role'] ?? '') !== 'pt') {
        jsonResponse(['success' => false, 'error' => 'Forbidden - Yêu cầu quyền PT'], 403);
    }
    return $payload;
}
