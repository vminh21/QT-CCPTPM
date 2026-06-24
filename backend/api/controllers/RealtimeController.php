<?php
/**
 * RealtimeController
 *
 * GET /api/realtime/poll  → Polling data (Member hoặc PT)
 */

require_once ROOT_PATH . 'DAL/NotificationRepository.php';

class RealtimeController {

    public static function handle(?string $id, string $method): void {
        if ($method !== 'GET') jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405);

        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');

        $payload   = getJWTPayload();
        $memberId  = $payload['member_id']  ?? null;
        $trainerId = $payload['trainer_id'] ?? null;

        $result = [
            'notif_count'       => 0,
            'latest_notif_id'   => null,
            'pending_schedules' => 0,
            'ts'                => time(),
        ];

        try {
            if ($memberId) {
                $notifRepo = new NotificationRepository();
                $result['notif_count']      = $notifRepo->countUnreadByMember($memberId);
                $result['latest_notif_id']  = $notifRepo->getLatestNotifIdByMember($memberId);

                require_once ROOT_PATH . 'DAL/ScheduleRepository.php';
                $schedRepo = new ScheduleRepository();
                $result['pending_schedules'] = $schedRepo->countPendingByMember($memberId);
            }
            if ($trainerId) {
                require_once ROOT_PATH . 'DAL/ScheduleRepository.php';
                $schedRepo = new ScheduleRepository();
                $result['total_schedules'] = $schedRepo->countSchedulesByTrainer($trainerId);
            }
        } catch (Exception $e) {
            $result['error'] = $e->getMessage();
        }

        jsonResponse(['success' => true, 'data' => $result]);
    }
}
