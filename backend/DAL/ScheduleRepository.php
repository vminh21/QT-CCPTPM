<?php
require_once __DIR__ . '/../Config/Database.php';

class ScheduleRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getById($schedule_id) {
        $stmt = $this->db->prepare("SELECT * FROM pt_schedules WHERE schedule_id = ?");
        $stmt->execute([$schedule_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByTrainer($trainer_id) {
        $stmt = $this->db->prepare("
            SELECT s.*, m.full_name as member_name 
            FROM pt_schedules s 
            JOIN members m ON s.member_id = m.member_id 
            WHERE s.trainer_id = ? 
            ORDER BY s.session_date ASC, s.time_start ASC
        ");
        $stmt->execute([$trainer_id]);
        return $stmt->fetchAll();
    }

    public function getUpcomingByTrainer($trainer_id, $limit = 5) {
        $stmt = $this->db->prepare("
            SELECT s.*, m.full_name as member_name 
            FROM pt_schedules s 
            JOIN members m ON s.member_id = m.member_id 
            WHERE s.trainer_id = ? AND s.session_date >= CURDATE() 
            ORDER BY s.session_date ASC, s.time_start ASC 
            LIMIT ?
        ");
        $stmt->bindValue(1, $trainer_id, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getUpcomingByMember($member_id) {
        $stmt = $this->db->prepare("
            SELECT s.*, t.full_name as trainer_name 
            FROM pt_schedules s 
            JOIN trainers t ON s.trainer_id = t.trainer_id 
            WHERE s.member_id = ? AND s.session_date >= CURDATE() 
            ORDER BY s.session_date ASC, s.time_start ASC
        ");
        $stmt->execute([$member_id]);
        return $stmt->fetchAll();
    }

    public function getMembersByTrainer($trainer_id) {
        $stmt = $this->db->prepare("
            SELECT DISTINCT m.* 
            FROM members m 
            JOIN member_subscriptions ms ON m.member_id = ms.member_id 
            WHERE ms.trainer_id = ? AND ms.status = 'Active'
        ");
        $stmt->execute([$trainer_id]);
        return $stmt->fetchAll();
    }

    public function create($trainer_id, $member_id, $date, $start, $end, $title, $notes) {
        $stmt = $this->db->prepare("INSERT INTO pt_schedules (trainer_id, member_id, session_date, time_start, time_end, session_title, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
        return $stmt->execute([$trainer_id, $member_id, $date, $start, $end, $title, $notes]);
    }

    public function updateStatus($schedule_id, $status) {
        $stmt = $this->db->prepare("UPDATE pt_schedules SET status = ? WHERE schedule_id = ?");
        return $stmt->execute([$status, $schedule_id]);
    }

    public function delete($schedule_id) {
        $stmt = $this->db->prepare("DELETE FROM pt_schedules WHERE schedule_id = ?");
        return $stmt->execute([$schedule_id]);
    }

    /* ====== CALENDAR / FULLCALENDAR HELPERS ====== */

    /**
     * Tự động chuyển các lịch 'Chờ xác nhận' đã qua thời gian thành 'Đã hủy'
     */
    public function autoCancelExpiredSchedules() {
        $stmt = $this->db->prepare("
            UPDATE pt_schedules 
            SET status = 'Đã hủy' 
            WHERE status = 'Chờ xác nhận' 
              AND TIMESTAMP(session_date, time_end) < NOW()
        ");
        $stmt->execute();
    }

    /**
     * Lấy danh sách lịch tập trong khoảng ngày, trả raw data để Service format ISO 8601.
     * Hỗ trợ filter theo trainer_id hoặc member_id (hoặc cả hai).
     */
    public function getSchedulesForCalendar(
        ?int $trainer_id,
        ?int $member_id,
        ?string $start_date,
        ?string $end_date
    ): array {
        // Tự động huỷ các lịch đã quá hạn trước khi query
        $this->autoCancelExpiredSchedules();

        $sql = "SELECT 
                    s.schedule_id   AS id,
                    s.session_title AS title,
                    s.session_date,
                    s.time_start,
                    s.time_end,
                    s.status,
                    s.notes,
                    s.trainer_id,
                    s.member_id,
                    m.full_name     AS member_name,
                    t.full_name     AS trainer_name
                FROM pt_schedules s
                JOIN members  m ON s.member_id  = m.member_id
                JOIN trainers t ON s.trainer_id = t.trainer_id
                WHERE 1=1";

        $params = [];

        if ($trainer_id) {
            $sql .= " AND s.trainer_id = :trainer_id";
            $params[':trainer_id'] = $trainer_id;
        }

        if ($member_id) {
            $sql .= " AND s.member_id = :member_id";
            $params[':member_id'] = $member_id;
        }

        if ($start_date) {
            $sql .= " AND s.session_date >= :start_date";
            $params[':start_date'] = $start_date;
        }

        if ($end_date) {
            $sql .= " AND s.session_date <= :end_date";
            $params[':end_date'] = $end_date;
        }

        $sql .= " ORDER BY s.session_date ASC, s.time_start ASC";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /* ====== REALTIME POLLING HELPERS ====== */

    /**
     * Đếm số lịch tập "Chờ xác nhận" của member (cho polling)
     */
    public function countPendingByMember($member_id) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as cnt
            FROM pt_schedules
            WHERE member_id = ? AND status = 'Chờ xác nhận' AND session_date >= CURDATE()
        ");
        $stmt->execute([$member_id]);
        $row = $stmt->fetch();
        return $row ? (int)$row['cnt'] : 0;
    }

    /**
     * Đếm tổng số lịch dạy của PT (PT dùng để phát hiện lịch mới)
     */
    public function countSchedulesByTrainer($trainer_id) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as cnt
            FROM pt_schedules
            WHERE trainer_id = ? AND session_date >= CURDATE()
        ");
        $stmt->execute([$trainer_id]);
        $row = $stmt->fetch();
        return $row ? (int)$row['cnt'] : 0;
    }
}
?>
