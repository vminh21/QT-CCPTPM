<?php
/**
 * BlogController
 *
 * GET    /api/blogs        → Danh sách (public)
 * GET    /api/blogs/{id}   → Chi tiết (public)
 * POST   /api/blogs        → Tạo (Admin)
 * PUT    /api/blogs/{id}   → Cập nhật (Admin)
 * DELETE /api/blogs/{id}   → Xóa (Admin)
 */

require_once ROOT_PATH . 'BLL/BlogService.php';

class BlogController {

    public static function handle(?string $id, string $method): void {
        // [Xử lý PHP PUT/PATCH limitation]
        if ($method === 'POST') {
            $overrideHeader = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? '';
            $overrideQuery  = $_GET['_method'] ?? '';
            if (strtoupper($overrideHeader) === 'PUT' || strtoupper($overrideQuery) === 'PUT') {
                $method = 'PUT';
            }
        }

        match (true) {
            !$id && $method === 'GET'               => self::index(),
            !$id && $method === 'POST'              => self::store(),
            $id && $method === 'GET'                => self::show($id),
            $id && $method === 'PUT'                => self::update($id),
            $id && $method === 'DELETE'             => self::destroy($id),

            default => jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405),
        };
    }

    private static function index(): void {
        $svc   = new BlogService();
        $limit = isset($_GET['limit']) ? $_GET['limit'] : null;
        $data  = $limit ? $svc->getLatestBlogs($limit) : $svc->getAllBlogs();
        // 200 OK
        jsonResponse(['success' => true, 'data' => $data], 200);
    }

    private static function show(string $id): void {
        $svc  = new BlogService();
        $blog = $svc->getBlogById($id);
        if (!$blog) {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Không tìm thấy bài viết'], 404);
        }
        // 200 OK
        jsonResponse(['success' => true, 'data' => $blog], 200);
    }

    private static function store(): void {
        requireAdmin();
        $body = getRequestBody();
        $svc  = new BlogService();
        $file = (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) ? $_FILES['image_file'] : null;
        
        $msg  = $svc->saveBlog('', $body['title'] ?? '', $body['content'] ?? '', $file);
        
        if ($msg === 'error_ext') {
            // 422 Unprocessable Entity
            jsonResponse(['success' => false, 'error' => 'Chỉ chấp nhận ảnh JPG/PNG!'], 422);
        } elseif ($msg === 'error' || $msg !== 'success') {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => 'Tạo bài viết thất bại.'], 400);
        }
        
        // 201 Created
        jsonResponse(['success' => true, 'message' => 'Tạo bài viết thành công.'], 201);
    }

    private static function update(string $id): void {
        requireAdmin();
        $svc  = new BlogService();

        // Kiểm tra xem ID có tồn tại để update không
        if (!$svc->getBlogById($id)) {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Bài viết không tồn tại để cập nhật.'], 404);
        }

        $body = getRequestBody();
        $file = (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) ? $_FILES['image_file'] : null;
        
        $msg  = $svc->saveBlog($id, $body['title'] ?? '', $body['content'] ?? '', $file);
        
        if ($msg === 'error_ext') {
            // 422 Unprocessable Entity
            jsonResponse(['success' => false, 'error' => 'Định dạng ảnh không hợp lệ.'], 422);
        } elseif ($msg === 'error' || $msg !== 'success') {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => 'Cập nhật thất bại.'], 400);
        }
        
        // 200 OK
        jsonResponse(['success' => true, 'message' => 'Cập nhật thành công'], 200);
    }

    private static function destroy(string $id): void {
        requireAdmin();
        $svc = new BlogService();
        
        $msg = $svc->deleteBlog($id);
        if ($msg !== 'deleted') {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Không thể xóa do bài viết không tồn tại hoặc lỗi.'], 404);
        }

        // 200 OK
        jsonResponse(['success' => true, 'message' => 'Xóa bài viết thành công.'], 200);
    }
}
