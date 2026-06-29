<?php
/**
 * ReportController
 *
 * GET /api/reports          → Báo cáo theo năm (Admin), query: ?year=2025
 * GET /api/reports/years    → Danh sách năm có dữ liệu (Admin)
 */

require_once ROOT_PATH . 'BLL/ReportService.php';

class ReportController {

    public static function handle(?string $id, string $method): void {
        requireAdmin();
        if ($method !== 'GET') jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405);
        $svc = new ReportService();
        if ($id === 'years') {
            jsonResponse(['success' => true, 'data' => $svc->getAvailableYears()]);
        }
        $year = (int)($_GET['year'] ?? date('Y'));
        jsonResponse(['success' => true, 'year' => $year, 'data' => $svc->getDashboardStats($year)]);
    }
}
