<?php
require_once __DIR__ . '/../DAL/ScheduleRepository.php';
require_once __DIR__ . '/../DAL/NotificationRepository.php';

class ScheduleService {
    private $scheduleRepo;
    private $notifRepo;

    public function __construct() {
        $this->scheduleRepo = new ScheduleRepository();
        $this->notifRepo    = new NotificationRepository();
    }

    public function getSchedulesByTrainer($trainer_id) {
        return $this->scheduleRepo->getByTrainer($trainer_id);
    }

    /**
     * Lấy lịch tập và format chuẩn cho FullCalendar (React).
     * Gộp session_date + time_start/time_end thành chuỗi ISO 8601 chuẩn.
     * Logic màu sắc dựa trên trạng thái nằm tại đây (BLL), không phải Controller.
     */
    public function getSchedulesForCalendar(
        ?int $trainer_id,
        ?int $member_id,
        ?string $start_date,
        ?string $end_date
    ): array {
        $rows = $this->scheduleRepo->getSchedulesForCalendar($trainer_id, $member_id, $start_date, $end_date);

        // Map màu sắc theo trạng thái (Bài toán nghiệp vụ - chỉ thuộc về tầng BLL)
        $colorMap = [
            'Chờ xác nhận' => '#f59e0b', // Vàng
            'Đã xác nhận'  => '#10b981', // Xanh lá
            'Hoàn thành'   => '#6366f1', // Tím
            'Đã hủy'       => '#ef4444', // Đỏ
        ];

        $events = [];
        foreach ($rows as $row) {
            // Ghép ngày + giờ -> định dạng ISO 8601 đầy đủ
            $startISO = date('Y-m-d\TH:i:s', strtotime($row['session_date'] . ' ' . $row['time_start']));
            $endISO   = date('Y-m-d\TH:i:s', strtotime($row['session_date'] . ' ' . $row['time_end']));

            $events[] = [
                'id'              => $row['id'],
                'title'           => $row['title'] ?: 'Buổi tập',
                'start'           => $startISO,
                'end'             => $endISO,
                'backgroundColor' => $colorMap[$row['status']] ?? '#3788d8',
                'borderColor'     => $colorMap[$row['status']] ?? '#3788d8',
                'extendedProps'   => [
                    'status'       => $row['status'],
                    'member_id'    => $row['member_id'],
                    'member_name'  => $row['member_name'],
                    'trainer_id'   => $row['trainer_id'],
                    'trainer_name' => $row['trainer_name'],
                    'notes'        => $row['notes'],
                ],
            ];
        }

        return $events;
    }

    public function getUpcomingSchedules($trainer_id, $limit = 5) {
        return $this->scheduleRepo->getUpcomingByTrainer($trainer_id, $limit);
    }

    public function getUpcomingSchedulesByMember($member_id) {
        return $this->scheduleRepo->getUpcomingByMember($member_id);
    }

    public function getStudents($trainer_id) {
        return $this->scheduleRepo->getMembersByTrainer($trainer_id);
    }

    public function addSchedule($trainer_id, $member_id, $date, $start, $end, $title, $notes, $trainer_name = '') {
        if (empty($member_id) || empty($date) || empty($start) || empty($end)) {
            return "Vui lòng nhập đầy đủ thông tin buổi tập!";
        }

        $success = $this->scheduleRepo->create($trainer_id, $member_id, $date, $start, $end, $title, $notes);

        if ($success) {
            // Gửi thông báo cá nhân cho member
            $date_vn     = date('d/m/Y', strtotime($date));
            $start_vn    = date('H:i', strtotime($start));
            $end_vn      = date('H:i', strtotime($end));
            $pt_name     = $trainer_name ?: 'HLV của bạn';
            $session     = $title ?: 'Buổi tập cá nhân';

            $notif_title = "📅 Lịch tập mới: {$session}";
            $notif_content = "HLV {$pt_name} đã lên lịch cho bạn:\n"
                           . "• Nội dung: {$session}\n"
                           . "• Ngày: {$date_vn}  |  Giờ: {$start_vn} – {$end_vn}\n"
                           . ($notes ? "• Ghi chú: {$notes}" : "");

            $this->notifRepo->createPersonalNotification($member_id, $notif_title, $notif_content);
            return true;
        }

        return "Lỗi khi thêm lịch tập!";
    }

    public function updateStatus($schedule_id, $status) {
        $schedule = $this->scheduleRepo->getById($schedule_id);
        if (!$schedule) return "Lịch tập không tồn tại!";

        // Kiểm tra nghiệp vụ khi đổi sang "Hoàn thành"
        if ($status === 'Hoàn thành') {
            if ($schedule['status'] !== 'Đã xác nhận') {
                return "Học viên chưa xác nhận lịch tập này, không thể đánh dấu Hoàn thành!";
            }
            
            // Lấy thời điểm kết thúc buổi tập
            $sessionEnd = strtotime($schedule['session_date'] . ' ' . $schedule['time_end']);
            if (time() < $sessionEnd) {
                return "Chưa qua thời gian buổi tập, không thể đánh dấu Hoàn thành!";
            }
        }
        
        $ok = $this->scheduleRepo->updateStatus($schedule_id, $status);
        return $ok ? true : "Lỗi cập nhật trạng thái!";
    }

    public function deleteSchedule($schedule_id) {
        return $this->scheduleRepo->delete($schedule_id);
    }
}
?>
