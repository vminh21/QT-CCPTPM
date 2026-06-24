<?php
/**
 * RESTful API Router - Điểm vào duy nhất cho toàn bộ API
 *
 * Route map:
 *   /api/auth/**            → AuthController
 *   /api/members/**         → MemberController
 *   /api/packages           → PackageController
 *   /api/trainers/**        → TrainerController
 *   /api/pt/**              → PTController
 *   /api/profile/**         → ProfileController
 *   /api/payments/**        → PaymentController
 *   /api/notifications/**   → NotificationController
 *   /api/blogs/**           → BlogController
 *   /api/equipment/**       → EquipmentController
 *   /api/staff/**           → StaffController
 *   /api/transactions/**    → TransactionController
 *   /api/dashboard/**       → DashboardController
 *   /api/reports/**         → ReportController
 *   /api/realtime/**        → RealtimeController
 *   /api/chat               → ChatController
 */

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/helpers.php';

// ── Parse URL path ────────────────────────────────────────────────────────────
$requestUri  = $_SERVER['REQUEST_URI'];
$scriptName  = dirname($_SERVER['SCRIPT_NAME']); // /BTLWeb(PC)/backend/api
$path        = parse_url($requestUri, PHP_URL_PATH);

// Strip base path: kết quả ví dụ → /members/5
$basePath = rtrim($scriptName, '/');
if (str_starts_with($path, $basePath)) {
    $path = substr($path, strlen($basePath));
}
$path = '/' . trim($path, '/');

// Tách segments: /members/5 → ['members', '5']
$segments = array_values(array_filter(explode('/', $path)));

$resource = $segments[0] ?? '';   // 'members'
$id       = $segments[1] ?? null; // '5' hoặc null
$sub      = $segments[2] ?? null; // 'status', 'reviews', ...

$method = $_SERVER['REQUEST_METHOD'];

// ── Controller Loader ─────────────────────────────────────────────────────────
function loadController(string $name): void {
    $file = __DIR__ . '/controllers/' . $name . 'Controller.php';
    if (!file_exists($file)) {
        jsonResponse(['success' => false, 'error' => 'Controller not found'], 500);
    }
    require_once $file;
}

// ── Route Dispatch ────────────────────────────────────────────────────────────
match ($resource) {
    'auth'          => (function () use ($id, $method) {
        loadController('Auth');
        AuthController::handle($id, $method);
    })(),

    'members'       => (function () use ($id, $sub, $method) {
        loadController('Member');
        MemberController::handle($id, $sub, $method);
    })(),

    'packages'      => (function () use ($id, $method) {
        loadController('Package');
        PackageController::handle($id, $method);
    })(),

    'trainers'      => (function () use ($id, $sub, $method) {
        loadController('Trainer');
        TrainerController::handle($id, $sub, $method);
    })(),

    'pt'            => (function () use ($id, $sub, $method, $segments) {
        loadController('PT');
        PTController::handle($id, $sub, $method, $segments);
    })(),

    'profile'       => (function () use ($id, $sub, $method, $segments) {
        loadController('Profile');
        ProfileController::handle($id, $sub, $method, $segments);
    })(),

    'payments'      => (function () use ($id, $sub, $method) {
        loadController('Payment');
        PaymentController::handle($id, $sub, $method);
    })(),

    'notifications' => (function () use ($id, $sub, $method) {
        loadController('Notification');
        NotificationController::handle($id, $sub, $method);
    })(),

    'blogs'         => (function () use ($id, $method) {
        loadController('Blog');
        BlogController::handle($id, $method);
    })(),

    'equipment'     => (function () use ($id, $method) {
        loadController('Equipment');
        EquipmentController::handle($id, $method);
    })(),

    'staff'         => (function () use ($id, $method) {
        loadController('Staff');
        StaffController::handle($id, $method);
    })(),

    'transactions'  => (function () use ($id, $method) {
        loadController('Transaction');
        TransactionController::handle($id, $method);
    })(),

    'dashboard'     => (function () use ($id, $method) {
        loadController('Dashboard');
        DashboardController::handle($id, $method);
    })(),

    'reports'       => (function () use ($id, $method) {
        loadController('Report');
        ReportController::handle($id, $method);
    })(),

    'realtime'      => (function () use ($id, $method) {
        loadController('Realtime');
        RealtimeController::handle($id, $method);
    })(),

    'chat'          => (function () use ($method) {
        loadController('Chat');
        ChatController::handle($method);
    })(),

    'schedules'     => (function () use ($id, $method) {
        loadController('Schedule');
        ScheduleController::handle($id, $method);
    })(),

    default         => jsonResponse(['success' => false, 'error' => "Resource '$resource' không tồn tại"], 404),
};
