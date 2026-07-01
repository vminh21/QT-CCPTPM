<?php
/**
 * Controller: ReportController (Module Thống kê doanh thu & Báo cáo)
 * Người phụ trách: Nguyễn Anh Tuấn (STT 5 - Nhóm 9)
 *
 * Endpoints:
 *   GET /api/reports          → Lấy dữ liệu thống kê doanh thu theo năm (yêu cầu quyền Admin/Staff)
 *   GET /api/reports/years    → Lấy danh sách các năm có dữ liệu giao dịch trong hệ thống
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
