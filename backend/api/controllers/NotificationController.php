<?php
/**
 * NotificationController
 *
 * GET    /api/notifications              → Danh sách (Member: của mình, Admin: tất cả)
 * GET    /api/notifications/count        → Đếm chưa đọc (Member)
 * PATCH  /api/notifications/read         → Đánh dấu tất cả đã đọc (Member)
 * POST   /api/notifications              → Tạo thông báo (SuperAdmin)
 * PUT    /api/notifications/{id}         → Sửa thông báo (SuperAdmin)
 * DELETE /api/notifications/{id}         → Xóa thông báo (SuperAdmin)
 */

require_once ROOT_PATH . 'DAL/NotificationRepository.php';
require_once ROOT_PATH . 'BLL/NotificationService.php';

class NotificationController {

    public static function handle(?string $id, ?string $sub, string $method): void {
        $payload   = getJWTPayload();
        $role      = $payload['role'] ?? null;
        $memberId  = $payload['member_id'] ?? null;
        $adminId   = $payload['admin_id'] ?? null;

        if (!$payload) {
            jsonResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        }
        
        // [Xử lý PHP PUT/PATCH limitation cho upload ảnh]
        if ($method === 'POST') {
            $overrideHeader = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? '';
            $overrideQuery  = $_GET['_method'] ?? '';
            if (strtoupper($overrideHeader) === 'PUT' || strtoupper($overrideQuery) === 'PUT') {
                $method = 'PUT';
            }
        }

        match (true) {
            // GET /api/notifications
            !$id && $method === 'GET'                         => self::index($role, $memberId),
            // GET /api/notifications/count
            $id === 'count' && $method === 'GET'              => self::count($memberId),
            // PATCH /api/notifications/read
            $id === 'read' && $method === 'PATCH'             => self::markRead($memberId),
            // POST /api/notifications
            !$id && $method === 'POST'                        => self::store($adminId),
            // PUT /api/notifications/{id}
            $id && is_numeric($id) && $method === 'PUT'       => self::update($id, $adminId),
            // DELETE /api/notifications/{id}
            $id && is_numeric($id) && $method === 'DELETE'    => self::destroy($id),

            default => jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405),
        };
    }

    private static function index(string $role, ?int $memberId): void {
        $repo = new NotificationRepository();
        $svc  = new NotificationService();
        if (in_array($role, ['admin', 'staff'])) {
            jsonResponse(['success' => true, 'data' => $svc->getNotifications()]);
        }
        if ($memberId) {
            jsonResponse(['success' => true, 'data' => $repo->getNotificationsByMember($memberId)]);
        }
        jsonResponse(['success' => false, 'error' => 'Unauthorized'], 401);
    }

    private static function count(?int $memberId): void {
        if (!$memberId) jsonResponse(['success' => false, 'error' => 'Forbidden'], 403);
        $repo  = new NotificationRepository();
        $count = $repo->countUnreadByMember($memberId);
        jsonResponse(['success' => true, 'data' => ['count' => $count]]);
    }

    private static function markRead(?int $memberId): void {
        if (!$memberId) jsonResponse(['success' => false, 'error' => 'Forbidden'], 403);
        $repo = new NotificationRepository();
        $repo->markAllAsRead($memberId);
        // 200 OK
        jsonResponse(['success' => true], 200);
    }

    private static function store(?int $adminId): void {
        requireSuperAdmin();
        $body = !empty($_POST) ? $_POST : getRequestBody();
        $svc  = new NotificationService();
        $file = (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) ? $_FILES['image'] : null;
        
        $msg  = $svc->saveNotification(
            0,
            $body['title']   ?? '',
            $body['content'] ?? '',
            $adminId,
            $file
        );
        
        if ($msg === 'error_ext') {
            // 422 Unprocessable Entity
            jsonResponse(['success' => false, 'error' => 'Chỉ chấp nhận ảnh JPG/PNG!'], 422);
        } elseif ($msg === 'error' || $msg !== 'success') {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => 'Tạo thông báo thất bại.'], 400);
        }
        
        // 201 Created
        jsonResponse(['success' => true, 'message' => 'Tạo thông báo thành công'], 201);
    }

    private static function update(string $id, ?int $adminId): void {
        requireSuperAdmin();
        $body = !empty($_POST) ? $_POST : getRequestBody();
        $svc  = new NotificationService();
        $file = (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) ? $_FILES['image'] : null;
        
        $msg  = $svc->saveNotification(
            (int)$id,
            $body['title']   ?? '',
            $body['content'] ?? '',
            $adminId,
            $file
        );
        
        if ($msg === 'error_ext') {
            // 422 Unprocessable Entity
            jsonResponse(['success' => false, 'error' => 'Chỉ chấp nhận ảnh JPG/PNG!'], 422);
        } elseif ($msg === 'error' || $msg !== 'success') {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => 'Cập nhật thông báo thất bại.'], 400);
        }
        
        // 200 OK
        jsonResponse(['success' => true, 'message' => 'Cập nhật thông báo thành công'], 200);
    }

    private static function destroy(string $id): void {
        requireSuperAdmin();
        $svc = new NotificationService();
        $msg = $svc->deleteNotification((int)$id);
        
        if ($msg === 'deleted') {
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Xóa thông báo thành công'], 200);
        } else {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Thông báo không tồn tại để xóa'], 404);
        }
    }
}
