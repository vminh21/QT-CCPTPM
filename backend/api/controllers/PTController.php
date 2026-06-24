<?php
/**
 * PTController - Dành cho Personal Trainer đã đăng nhập
 *
 * GET    /api/pt/dashboard             → Tổng quan dashboard PT
 * GET    /api/pt/schedules             → Danh sách lịch dạy
 * POST   /api/pt/schedules             → Tạo lịch dạy mới
 * PATCH  /api/pt/schedules/{id}/status → Cập nhật trạng thái lịch
 * DELETE /api/pt/schedules/{id}        → Xóa lịch dạy
 * GET    /api/pt/students              → Danh sách học viên
 * GET    /api/pt/workouts              → Danh sách giáo trình
 * POST   /api/pt/workouts              → Tạo giáo trình mới
 * PUT    /api/pt/workouts/{id}         → Cập nhật giáo trình
 * DELETE /api/pt/workouts/{id}         → Xóa giáo trình
 * GET    /api/pt/reviews               → Đánh giá của PT
 *
 * URL Segments: /api/pt/{resource}/{id}/{sub}
 *   segments = ['pt', resource, id?, sub?]
 */

require_once ROOT_PATH . 'BLL/ScheduleService.php';
require_once ROOT_PATH . 'BLL/WorkoutService.php';
require_once ROOT_PATH . 'BLL/TrainerService.php';
require_once ROOT_PATH . 'BLL/ReviewService.php';

class PTController {

    public static function handle(?string $resource, ?string $id, string $method, array $segments): void {
        // segments[0]='pt', [1]=resource, [2]=id, [3]=sub
        $ptResource = $segments[1] ?? 'dashboard';
        $ptId       = $segments[2] ?? null;
        $ptSub      = $segments[3] ?? null;

        $payload    = requirePT();
        $trainerId  = $payload['trainer_id'];
        $trainerName = $payload['full_name'];

        match (true) {
            // Dashboard
            $ptResource === 'dashboard' && $method === 'GET'                              => self::dashboard($trainerId),
            // Schedules
            $ptResource === 'schedules' && !$ptId && $method === 'GET'                   => self::getSchedules($trainerId),
            $ptResource === 'schedules' && !$ptId && $method === 'POST'                  => self::addSchedule($trainerId, $trainerName),
            $ptResource === 'schedules' && $ptId && $ptSub === 'status' && $method === 'PATCH' => self::updateScheduleStatus($ptId),
            $ptResource === 'schedules' && $ptId && !$ptSub && $method === 'DELETE'      => self::deleteSchedule($ptId),
            // Students
            $ptResource === 'students' && $method === 'GET'                              => self::getStudents($trainerId),
            // Workouts
            $ptResource === 'workouts' && !$ptId && $method === 'GET'                    => self::getWorkouts($trainerId),
            $ptResource === 'workouts' && !$ptId && $method === 'POST'                   => self::saveWorkout($trainerId, null),
            $ptResource === 'workouts' && $ptId && $method === 'PUT'                     => self::saveWorkout($trainerId, $ptId),
            $ptResource === 'workouts' && $ptId && $method === 'DELETE'                  => self::deleteWorkout($ptId),
            // Reviews
            $ptResource === 'reviews' && $method === 'GET'                               => self::getReviews($trainerId),

            default => jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405),
        };
    }

    private static function dashboard(int $trainerId): void {
        $schedSvc  = new ScheduleService();
        $workSvc   = new WorkoutService();
        $trnSvc    = new TrainerService();
        jsonResponse(['success' => true, 'data' => [
            'trainer'   => $trnSvc->getTrainerById($trainerId),
            'schedules' => $schedSvc->getUpcomingSchedules($trainerId, 3),
            'students'  => $schedSvc->getStudents($trainerId),
            'workouts'  => $workSvc->getWorkoutsByTrainer($trainerId),
        ]]);
    }

    private static function getSchedules(int $trainerId): void {
        $svc = new ScheduleService();
        jsonResponse(['success' => true, 'data' => $svc->getSchedulesByTrainer($trainerId)]);
    }

    private static function addSchedule(int $trainerId, string $trainerName): void {
        $body         = getRequestBody();
        $svc          = new ScheduleService();
        $result = $svc->addSchedule(
            $trainerId,
            (int)($body['member_id']    ?? 0),
            $body['session_date']       ?? '',
            $body['time_start']         ?? '',
            $body['time_end']           ?? '',
            trim($body['session_title'] ?? 'Buổi tập cá nhân'),
            trim($body['notes']         ?? ''),
            $trainerName
        );
        $ok = ($result === true);
        jsonResponse(['success' => $ok, 'message' => $ok ? 'Đã thêm lịch tập!' : $result], $ok ? 201 : 422);
    }

    private static function updateScheduleStatus(string $id): void {
        $body = getRequestBody();
        $svc  = new ScheduleService();
        $result = $svc->updateStatus((int)$id, $body['status'] ?? '');
        
        if ($result === true) {
            jsonResponse(['success' => true, 'message' => 'Cập nhật trạng thái thành công'], 200);
        } else {
            jsonResponse(['success' => false, 'error' => $result ?: 'Cập nhật trạng thái thất bại'], 400);
        }
    }

    private static function deleteSchedule(string $id): void {
        $svc = new ScheduleService();
        $ok  = $svc->deleteSchedule((int)$id);
        
        if ($ok) {
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Xoá lịch dạy thành công'], 200);
        } else {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Lịch dạy không tồn tại để xóa'], 404);
        }
    }

    private static function getStudents(int $trainerId): void {
        $svc = new ScheduleService();
        jsonResponse(['success' => true, 'data' => $svc->getStudents($trainerId)]);
    }

    private static function getWorkouts(int $trainerId): void {
        $svc = new WorkoutService();
        jsonResponse(['success' => true, 'data' => $svc->getWorkoutsByTrainer($trainerId)]);
    }

    private static function saveWorkout(int $trainerId, ?string $workoutId): void {
        $body   = getRequestBody();
        $svc    = new WorkoutService();
        
        if ($workoutId > 0 && !$svc->getWorkoutsByTrainer($trainerId)) {
            // Giả lập check tồn tại, nếu cần chi tiết hơn thì dùng getWorkoutById
        }

        $result = $svc->saveWorkout(
            $trainerId,
            trim($body['title']          ?? ''),
            trim($body['description']    ?? ''),
            trim($body['difficulty']     ?? 'Cơ bản'),
            (int)($body['duration_weeks'] ?? 4),
            trim($body['content']        ?? ''),
            $workoutId ? (int)$workoutId : null
        );
        $ok = ($result === true);
        
        if (!$ok) {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => $result], 400);
        }
        
        if ($workoutId) {
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Cập nhật giáo trình thành công'], 200);
        } else {
            // 201 Created
            jsonResponse(['success' => true, 'message' => 'Tạo giáo trình thành công'], 201);
        }
    }

    private static function deleteWorkout(string $id): void {
        $svc = new WorkoutService();
        $ok  = $svc->deleteWorkout((int)$id);
        
        if ($ok) {
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Xoá giáo trình thành công'], 200);
        } else {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Giáo trình không tồn tại'], 404);
        }
    }

    private static function getReviews(int $trainerId): void {
        $svc = new ReviewService();
        jsonResponse(['success' => true, 'data' => $svc->getReviewsByTrainer($trainerId)]);
    }
}
