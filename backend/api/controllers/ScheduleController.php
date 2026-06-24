<?php
/**
 * ScheduleController
 *
 * GET  /api/schedules               → Lấy toàn bộ lịch tập (có thể filter)
 * GET  /api/schedules?trainer_id=1&start=2026-05-01&end=2026-05-31
 * GET  /api/schedules?member_id=5&start=2026-05-01&end=2026-05-31
 *
 * Trả về mảng JSON chuẩn FullCalendar (ISO 8601 cho start/end)
 */

require_once ROOT_PATH . 'BLL/ScheduleService.php';

class ScheduleController {

    public static function handle(?string $id, string $method): void {
        match (true) {
            // GET /api/schedules  →  Collection
            !$id && $method === 'GET' => self::index(),

            default => jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405),
        };
    }

    /**
     * Hứng query params, ủy thác cho Service, trả JSON thuần cho FullCalendar.
     * Controller không chứa logic format ngày, không gọi Repository trực tiếp.
     */
    private static function index(): void {
        try {
            // 1. Trích xuất & ép kiểu query parameters (nhiệm vụ duy nhất của Controller)
            $trainer_id = (isset($_GET['trainer_id']) && is_numeric($_GET['trainer_id']))
                ? (int)$_GET['trainer_id'] : null;

            $member_id = (isset($_GET['member_id']) && is_numeric($_GET['member_id']))
                ? (int)$_GET['member_id'] : null;

            // Tham số start/end do FullCalendar tự truyền lên theo chuẩn của nó
            $start_date = !empty($_GET['start']) ? substr(trim($_GET['start']), 0, 10) : null; // Lấy phần YYYY-MM-DD
            $end_date   = !empty($_GET['end'])   ? substr(trim($_GET['end']),   0, 10) : null;

            // 2. Gọi Service - toàn bộ logic nằm trong đây
            $svc    = new ScheduleService();
            $events = $svc->getSchedulesForCalendar($trainer_id, $member_id, $start_date, $end_date);

            // 3. Trả thẳng mảng JSON - không bọc wrapper thừa, FullCalendar nhận trực tiếp
            http_response_code(200);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($events, JSON_UNESCAPED_UNICODE);
            exit;

        } catch (Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => 'Lỗi hệ thống, vui lòng thử lại.']);
            exit;
        }
    }
}
?>
