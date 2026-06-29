<?php
/**
 * DashboardController
 *
 * GET /api/dashboard/stats    → Thống kê tổng quan (Admin)
 * GET /api/dashboard/members  → Dropdown thành viên (Admin)
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
