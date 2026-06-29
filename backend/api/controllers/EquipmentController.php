<?php
/**
 * EquipmentController
 *
 * GET    /api/equipment        → Danh sách (SuperAdmin)
 * POST   /api/equipment        → Tạo mới (SuperAdmin)
 * PUT    /api/equipment/{id}   → Cập nhật (SuperAdmin)
 * DELETE /api/equipment/{id}   → Xóa (SuperAdmin)
 */

require_once ROOT_PATH . 'BLL/EquipmentService.php';

class EquipmentController {

    public static function handle(?string $id, string $method): void {
        requireSuperAdmin();
        match (true) {
            !$id && $method === 'GET'       => self::index(),
            !$id && $method === 'POST'      => self::store(),
            $id && $method === 'GET'        => self::show($id),
            $id && $method === 'PUT'        => self::update($id),
            $id && $method === 'DELETE'     => self::destroy($id),
            default => jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405),
        };
    }

    private static function index(): void {
        $svc    = new EquipmentService();
        $search = trim($_GET['search'] ?? '');
        // 200 OK
        jsonResponse(['success' => true, 'data' => $svc->getAllEquipments($search)], 200);
    }
    
    private static function store(): void {
        $body = getRequestBody();
        $svc  = new EquipmentService();

        $msg  = $svc->saveEquipment(
            0,
            trim($body['name']          ?? ''),
            trim($body['category']      ?? ''),
            (int)($body['quantity']    ?? 0),
            trim($body['status']        ?? 'Hoạt động'),
            trim($body['purchase_date'] ?? date('Y-m-d'))
        );
        
        if ($msg === 'error' || $msg !== 'success') {
            jsonResponse(['success' => false, 'error' => 'Không thể thêm thiết bị mới.'], 400);
        }
        
        jsonResponse(['success' => true, 'message' => 'Thêm thiết bị thành công.'], 201);
    }

    private static function update(string $id): void {
        $body = getRequestBody();
        $svc  = new EquipmentService();

        $msg  = $svc->saveEquipment(
            (int)$id,
            trim($body['name']          ?? ''),
            trim($body['category']      ?? ''),
            (int)($body['quantity']    ?? 0),
            trim($body['status']        ?? 'Hoạt động'),
            trim($body['purchase_date'] ?? date('Y-m-d'))
        );
        
        if ($msg === 'error' || $msg !== 'success') {
            jsonResponse(['success' => false, 'error' => 'Cập nhật thất bại.'], 400);
        }
        
        jsonResponse(['success' => true, 'message' => 'Cập nhật thành công'], 200);
    }

    private static function destroy(string $id): void {
        $svc = new EquipmentService();
        $msg = $svc->deleteEquipment((int)$id);
        
        if ($msg !== 'deleted') {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Thiết bị không tồn tại.'], 404);
        }
        
        // 200 OK
        jsonResponse(['success' => true, 'message' => 'Xóa thiết bị thành công'], 200);
    }
}
