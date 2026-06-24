<?php
/**
 * ProfileController - Dành cho Member đã đăng nhập
 *
 * GET    /api/profile                           → Toàn bộ dữ liệu hồ sơ
 * PUT    /api/profile                           → Cập nhật thông tin cá nhân
 * DELETE /api/profile/subscription              → Hủy gói tập
 * PATCH  /api/profile/schedules/{id}/status     → Xác nhận/từ chối lịch
 * POST   /api/profile/reviews                   → Gửi đánh giá HLV
 * GET    /api/profile/reviews/can-review        → Kiểm tra có thể đánh giá
 */

require_once ROOT_PATH . 'BLL/ProfileService.php';
require_once ROOT_PATH . 'BLL/TrainerService.php';
require_once ROOT_PATH . 'BLL/ReviewService.php';
require_once ROOT_PATH . 'BLL/ScheduleService.php';
require_once ROOT_PATH . 'Config/Database.php';

class ProfileController {

    public static function handle(?string $id, ?string $sub, string $method, array $segments): void {
        //   /api/profile/{resource}/{id}/{sub}
        // segments[0]='profile', [1]=resource, [2]=id, [3]=sub
        $resource = $segments[1] ?? null;
        $resId    = $segments[2] ?? null;
        $resSub   = $segments[3] ?? null;

        match (true) {
            // GET /api/profile
            !$resource && $method === 'GET'                                                  => self::show(),
            // PUT /api/profile
            !$resource && $method === 'PUT'                                                  => self::update(),
            // DELETE /api/profile/subscription
            $resource === 'subscription' && $method === 'DELETE'                            => self::cancelSubscription(),
            // PATCH /api/profile/schedules/{id}/status
            $resource === 'schedules' && $resId && $resSub === 'status' && $method === 'PATCH' => self::confirmSchedule($resId),
            // POST /api/profile/reviews
            $resource === 'reviews' && !$resId && $method === 'POST'                        => self::submitReview(),
            // GET /api/profile/reviews/can-review?trainer_id=
            $resource === 'reviews' && $resId === 'can-review' && $method === 'GET'         => self::canReview(),

            default => jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405),
        };
    }

    private static function getMemberId(): int {
        $payload = requireMember();
        return (int)$payload['member_id'];
    }

    // ── GET /api/profile ──────────────────────────────────────────────────────
    private static function show(): void {
        $memberId = self::getMemberId();
        $profSvc  = new ProfileService();
        $trnSvc   = new TrainerService();
        $schedSvc = new ScheduleService();

        $data       = $profSvc->getProfileData($memberId);
        $notifs     = $profSvc->getPersonalNotifications($memberId);
        $schedules  = $schedSvc->getUpcomingSchedulesByMember($memberId);
        $trainers   = $trnSvc->getAllTrainers();

        $pendingCount = count(array_filter($schedules, fn($s) => $s['status'] === 'Chờ xác nhận'));

        jsonResponse(['success' => true, 'data' => [
            'member'        => $data['member'],
            'active_sub'    => $data['active_sub'],
            'days_left'     => $data['days_left'],
            'packages'      => $data['packages'],
            'transactions'  => $data['transactions'],
            'notifications' => $notifs,
            'schedules'     => $schedules,
            'pending_count' => $pendingCount,
            'trainers'      => $trainers,
        ]]);
    }

    // ── PUT /api/profile ──────────────────────────────────────────────────────
    private static function update(): void {
        $memberId = self::getMemberId();
        $body     = getRequestBody();
        $svc      = new ProfileService();

        $ok = $svc->updateProfile(
            $memberId,
            trim($body['full_name'] ?? ''),
            trim($body['email']    ?? ''),
            trim($body['address']  ?? ''),
            $body['gender']        ?? '',
            trim($body['password'] ?? '')
        );

        if ($ok) {
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Cập nhật thông tin thành công!'], 200);
        } else {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => 'Có lỗi xảy ra khi cập nhật hồ sơ.'], 400);
        }
    }

    // ── DELETE /api/profile/subscription ─────────────────────────────────────
    private static function cancelSubscription(): void {
        $memberId = self::getMemberId();
        $svc      = new ProfileService();
        $ok       = $svc->cancelSubscription($memberId);
        
        if ($ok) {
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Đã hủy gói tập thành công!'], 200);
        } else {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => 'Không tìm thấy gói tập hoặc lỗi khi hủy.'], 400);
        }
    }

    // ── PATCH /api/profile/schedules/{id}/status ──────────────────────────────
    private static function confirmSchedule(string $scheduleId): void {
        requireMember();
        $body    = getRequestBody();
        $svc     = new ScheduleService();
        $ok      = $svc->updateStatus((int)$scheduleId, $body['status'] ?? '');
        
        if ($ok) {
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Cập nhật trạng thái lịch tập thành công'], 200);
        } else {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Không tìm thấy lịch tập cần cập nhật'], 404);
        }
    }

    // ── POST /api/profile/reviews ─────────────────────────────────────────────
    private static function submitReview(): void {
        $memberId = self::getMemberId();
        $body     = getRequestBody();
        $svc      = new ReviewService();
        $msg      = $svc->submitReview(
            (int)($body['trainer_id'] ?? 0),
            $memberId,
            (int)($body['rating']   ?? 0),
            trim($body['comment']   ?? '')
        );
        if ($msg === 'Cảm ơn bạn đã gửi đánh giá!') {
            jsonResponse(['success' => true, 'message' => $msg], 201);
        } else {
            jsonResponse(['success' => false, 'error' => $msg], 422);
        }
    }

    // ── GET /api/profile/reviews/can-review ───────────────────────────────────
    private static function canReview(): void {
        $memberId  = self::getMemberId();
        $trainerId = (int)($_GET['trainer_id'] ?? 0);
        if (!$trainerId) jsonResponse(['success' => false, 'can_review' => false]);

        $db   = Database::getInstance()->getConnection();
        $stmt = $db->prepare('SELECT 1 FROM pt_schedules WHERE member_id = ? AND trainer_id = ? LIMIT 1');
        $stmt->execute([$memberId, $trainerId]);
        jsonResponse(['success' => true, 'can_review' => (bool)$stmt->fetch()]);
    }
}
