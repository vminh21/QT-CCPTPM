<?php
/**
 * TrainerController
 *
 * GET    /api/trainers                   → Danh sách (public)
 * GET    /api/trainers/{id}              → Chi tiết (public)
 * GET    /api/trainers/{id}/reviews      → Đánh giá của trainer (public)
 * POST   /api/trainers                   → Tạo trainer (SuperAdmin)
 * PUT    /api/trainers/{id}              → Cập nhật (SuperAdmin)
 * DELETE /api/trainers/{id}              → Xóa (SuperAdmin)
 */

require_once ROOT_PATH . 'BLL/TrainerService.php';
require_once ROOT_PATH . 'DAL/PackageRepository.php';

class TrainerController {

    public static function handle(?string $id, ?string $sub, string $method): void {
        // [Xử lý PHP PUT/PATCH limitation]
        if ($method === 'POST') {
            $overrideHeader = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? '';
            $overrideQuery  = $_GET['_method'] ?? '';
            if (strtoupper($overrideHeader) === 'PUT' || strtoupper($overrideQuery) === 'PUT') {
                $method = 'PUT';
            }
        }

        match (true) {
            !$id && $method === 'GET'                          => self::index(),
            !$id && $method === 'POST'                         => self::store(),
            $id && !$sub && $method === 'GET'                  => self::show($id),
            $id && !$sub && $method === 'PUT'                  => self::update($id),
            $id && !$sub && $method === 'DELETE'               => self::destroy($id),
            $id && $sub === 'reviews' && $method === 'GET'     => self::reviews($id),

            default => jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405),
        };
    }

    private static function index(): void {
        $svc    = new TrainerService();
        $search = trim($_GET['search'] ?? '');
        $limit  = isset($_GET['limit']) ? (int)$_GET['limit'] : null;

        $data = $limit
            ? $svc->getTopTrainers($limit)
            : $svc->getAllTrainers($search);

        // 200 OK
        jsonResponse(['success' => true, 'data' => $data], 200);
    }

    private static function show(string $id): void {
        $svc     = new TrainerService();
        $trainer = $svc->getTrainerById((int)$id);
        if (!$trainer) {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Không tìm thấy HLV'], 404);
        }
        // 200 OK
        jsonResponse(['success' => true, 'data' => $trainer], 200);
    }

    private static function reviews(string $id): void {
        require_once ROOT_PATH . 'BLL/ReviewService.php';
        $svc  = new ReviewService();
        // 200 OK
        jsonResponse(['success' => true, 'data' => $svc->getReviewsByTrainer((int)$id)], 200);
    }

    private static function store(): void {
        requireSuperAdmin();
        self::saveTrainer(0);
    }

    private static function update(string $id): void {
        requireSuperAdmin();
        self::saveTrainer((int)$id);
    }

    private static function saveTrainer(int $trainerId): void {
        $svc         = new TrainerService();
        $packageRepo = new PackageRepository();

        if ($trainerId > 0 && !$svc->getTrainerById($trainerId)) {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'HLV không tồn tại để cập nhật'], 404);
        }

        // multipart/form-data (có ảnh) nên đọc từ $_POST
        $body = !empty($_POST) ? $_POST : getRequestBody();

        $name      = $body['full_name']    ?? '';
        $specialty = $body['specialty']    ?? '';
        $fb        = $body['facebook_url'] ?: '#';
        $tw        = $body['twitter_url']  ?: '#';
        $yt        = $body['youtube_url']  ?: '#';
        $email     = $body['email']        ?: null;
        $password  = $body['password']     ?: null;
        $file      = (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) ? $_FILES['image'] : null;

        $msg = $svc->saveTrainer($trainerId, $name, $specialty, $fb, $tw, $yt, $file, $email, $password);

        if ($msg === 'error_ext') {
            // 422 Unprocessable Entity
            jsonResponse(['success' => false, 'error' => 'Chỉ chấp nhận ảnh JPG, JPEG, PNG!'], 422);
        } elseif ($msg === 'error') {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => 'Lỗi lưu thông tin HLV.'], 400);
        }

        // Cập nhật gói tập được gán (Chỉ thực hiện nếu có gửi mảng packages lên)
        if ($trainerId > 0 && isset($body['packages'])) {
            $packages = $packageRepo->getAllPackages();
            $selected = (array)($body['packages'] ?? []);
            foreach ($packages as $pkg) {
                $packageRepo->removeTrainerFromPackage($pkg['package_id'], $trainerId);
                if (in_array($pkg['package_id'], $selected)) {
                    $packageRepo->assignTrainerToPackage($pkg['package_id'], $trainerId);
                }
            }
        }

        // Trả về đúng HTTP code theo Create hay Update
        if ($trainerId === 0) {
            // 201 Created
            jsonResponse(['success' => true, 'message' => 'Thêm mới HLV thành công'], 201);
        } else {
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Cập nhật HLV thành công'], 200);
        }
    }

    private static function destroy(string $id): void {
        requireSuperAdmin();
        $svc = new TrainerService();
        $msg = $svc->deleteTrainer((int)$id);
        
        if ($msg !== 'deleted') {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Lỗi xóa: HLV không tồn tại hoặc lỗi khác'], 404);
        }
        
        // 200 OK
        jsonResponse(['success' => true, 'message' => 'Xóa HLV thành công'], 200);
    }
}
