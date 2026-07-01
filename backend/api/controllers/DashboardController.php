<?php
/**
 * DashboardController (Module Thống kê toàn hệ thống)
 * Người phụ trách: Hồ Minh Nhật (STT 5 - Nhóm 9)
 *
 * GET /api/dashboard/stats    → Báo cáo các chỉ số: số thành viên, tổng doanh thu (Admin)
 * GET /api/dashboard/members  → Danh sách lịch sử giao dịch của các thành viên (Admin)
 */

require_once ROOT_PATH . 'BLL/DashboardService.php';

class DashboardController {

    public static function handle(?string $id, string $method): void {
        requireAdmin();
        if ($method !== 'GET') jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405);
        $svc = new DashboardService();
        match ($id) {
            'stats'   => jsonResponse(['success' => true, 'data' => $svc->getDashboardStats()]),
            'members' => jsonResponse(['success' => true, 'data' => $svc->getMemberListForDropdown()]),
            default   => jsonResponse(['success' => false, 'error' => 'Not Found'], 404),
        };
    }
}
