<?php
/**
 * StaffController
 *
 * GET    /api/staff        → Danh sách nhân viên (SuperAdmin)
 * POST   /api/staff        → Tạo mới (SuperAdmin)
 * PUT    /api/staff/{id}   → Cập nhật (SuperAdmin)
 * DELETE /api/staff/{id}   → Xóa (SuperAdmin)
 */

require_once ROOT_PATH . 'BLL/StaffService.php';

class StaffController {

    public static function handle(?string $id, string $method): void {
        requireSuperAdmin();
        match (true) {
            !$id && $method === 'GET'       => self::index(),
            !$id && $method === 'POST'      => self::store(),
            $id && $method === 'PUT'        => self::update($id),
            $id && $method === 'DELETE'     => self::destroy($id),
            default => jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405),
        };
    }

    private static function index(): void {
        $svc    = new StaffService();
        $search = trim($_GET['search'] ?? '');
        // 200 OK
        jsonResponse(['success' => true, 'data' => $svc->getStaffList($search)], 200);
    }

    private static function store(): void {
        $body = getRequestBody();
        $svc  = new StaffService();
        $msg  = $svc->saveStaff(
            0,
            trim($body['email']     ?? ''),
            trim($body['password']  ?? ''),
            trim($body['full_name'] ?? ''),
            trim($body['phone']     ?? ''),
            trim($body['salary']    ?? '')
        );
        
        if ($msg === 'error_email') {
            // 422 Unprocessable Entity
            jsonResponse(['success' => false, 'error' => 'Email đã tồn tại.'], 422);
        } elseif ($msg === 'error' || $msg !== 'success') {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => 'Thêm nhân viên thất bại.'], 400);
        }

        // 201 Created
        jsonResponse(['success' => true, 'message' => 'Thêm nhân viên thành công.'], 201);
    }

    private static function update(string $id): void {
        $body = getRequestBody();
        $svc  = new StaffService();
        $msg  = $svc->saveStaff(
            (int)$id,
            trim($body['email']     ?? ''),
            trim($body['password']  ?? ''),
            trim($body['full_name'] ?? ''),
            trim($body['phone']     ?? ''),
            trim($body['salary']    ?? '')
        );
        
        if ($msg === 'error_email') {
            // 422 Unprocessable Entity
            jsonResponse(['success' => false, 'error' => 'Email đã tồn tại.'], 422);
        } elseif ($msg === 'error' || $msg !== 'success') {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => 'Cập nhật thất bại. (Sai ID hoặc thông tin không đổi)'], 400);
        }
        
        // 200 OK
        jsonResponse(['success' => true, 'message' => 'Cập nhật nhân viên thành công'], 200);
    }

    private static function destroy(string $id): void {
        $svc = new StaffService();
        $msg = $svc->deleteStaff((int)$id);
        
        if ($msg === 'deleted') {
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Xoá nhân viên thành công'], 200);
        } else {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Nhân viên không tồn tại để xóa'], 404);
        }
    }
}
