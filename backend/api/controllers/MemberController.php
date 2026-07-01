<?php
/**
 * MemberController
 * Người phụ trách: Hồ Minh Nhật (STT 5 - Nhóm 9)
 *
 * Quản trị danh sách hội viên dành cho quyền Admin.
 * GET    /api/members                → Danh sách / tìm kiếm (Admin)
 * GET    /api/members/{id}           → Chi tiết (Admin)
 * POST   /api/members                → Tạo mới (Admin)
 * PUT    /api/members/{id}           → Cập nhật (Admin)
 * PATCH  /api/members/{id}/status    → Đổi trạng thái (Admin)
 * DELETE /api/members/{id}           → Xóa (Admin)
 */

require_once ROOT_PATH . 'BLL/MemberService.php';

class MemberController {

    /**
     * Định tuyến yêu cầu API liên quan đến quản lý hội viên.
     *
     * @param string|null $id ID của hội viên.
     * @param string|null $sub Hành động phụ (ví dụ: 'status').
     * @param string $method Phương thức HTTP (GET, POST, PUT, PATCH, DELETE).
     * @return void
     */
    public static function handle(?string $id, ?string $sub, string $method): void {
        match (true) {
            // GET /api/members
            !$id && $method === 'GET'                           => self::index(),
            // POST /api/members
            !$id && $method === 'POST'                          => self::store(),
            // GET /api/members/{id}
            $id && !$sub && $method === 'GET'                   => self::show($id),
            // PUT /api/members/{id}
            $id && !$sub && $method === 'PUT'                   => self::update($id),
            // PATCH /api/members/{id}/status
            $id && $sub === 'status' && $method === 'PATCH'     => self::toggleStatus($id),
            // DELETE /api/members/{id}
            $id && !$sub && $method === 'DELETE'                => self::destroy($id),

            default => jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405),
        };
    }

    /**
     * GET /api/members
     * Lấy danh sách hội viên kèm theo tìm kiếm và bộ lọc.
     *
     * @return void
     */
    private static function index(): void {
        requireAdmin();
        $svc    = new MemberService();
        $search = trim($_GET['search'] ?? '');
        $pkg    = $_GET['filter_package'] ?? '';
        $status = $_GET['filter_status']  ?? '';
        jsonResponse(['success' => true, 'data' => $svc->searchMembers($search, $pkg, $status)], 200);
    }

    /**
     * GET /api/members/{id}
     * Lấy thông tin chi tiết của một hội viên.
     *
     * @param string $id ID hội viên.
     * @return void
     */
    private static function show(string $id): void {
        requireAdmin();
        $svc    = new MemberService();
        $member = $svc->getMemberById((int)$id);
        if (!$member) {
            jsonResponse(['success' => false, 'error' => 'Không tìm thấy hội viên'], 404);
        }
        jsonResponse(['success' => true, 'data' => $member], 200);
    }

    /**
     * POST /api/members
     * Tạo mới một hội viên kèm thông tin đăng ký gói tập ban đầu nếu có.
     *
     * @return void
     */
    private static function store(): void {
        requireAdmin();
        $body = getRequestBody();
        $svc  = new MemberService();
        $msg  = $svc->saveMember(
            '',
            $body['full_name']    ?? '',
            $body['phone_number'] ?? '',
            $body['address']      ?? '',
            $body['status']       ?? 'Active',
            !empty($body['package_id'])  ? $body['package_id']  : null,
            !empty($body['start_date'])  ? $body['start_date']  : null,
            !empty($body['end_date'])    ? $body['end_date']    : null
        );
        
        if ($msg === 'success') {
            jsonResponse(['success' => true, 'message' => 'Thêm hội viên thành công.'], 201);
        } else {
            jsonResponse(['success' => false, 'error' => $msg], 400);
        }
    }

    /**
     * PUT /api/members/{id}
     * Cập nhật thông tin chi tiết của hội viên.
     *
     * @param string $id ID hội viên cần cập nhật.
     * @return void
     */
    private static function update(string $id): void {
        requireAdmin();
        $body = getRequestBody();
        $svc  = new MemberService();
        $msg  = $svc->saveMember(
            $id,
            $body['full_name']    ?? '',
            $body['phone_number'] ?? '',
            $body['address']      ?? '',
            $body['status']       ?? 'Active',
            !empty($body['package_id'])  ? $body['package_id']  : null,
            !empty($body['start_date'])  ? $body['start_date']  : null,
            !empty($body['end_date'])    ? $body['end_date']    : null
        );
        
        if ($msg === 'success') {
            jsonResponse(['success' => true, 'message' => 'Cập nhật thành công'], 200);
        } else {
            jsonResponse(['success' => false, 'error' => $msg], 400);
        }
    }

    /**
     * PATCH /api/members/{id}/status
     * Kích hoạt hoặc khóa tài khoản của hội viên.
     *
     * @param string $id ID hội viên cần đổi trạng thái.
     * @return void
     */
    private static function toggleStatus(string $id): void {
        requireAdmin();
        $body   = getRequestBody();
        $svc    = new MemberService();
        $msg    = $svc->toggleMemberStatus($id, $body['current_status'] ?? 'Active');
        
        if ($msg === 'updated') {
            jsonResponse(['success' => true, 'message' => 'Cập nhật trạng thái thành công'], 200);
        } else {
            jsonResponse(['success' => false, 'error' => 'Không thể đổi trạng thái'], 400);
        }
    }

    /**
     * DELETE /api/members/{id}
     * Xóa hội viên khỏi hệ thống.
     *
     * @param string $id ID hội viên cần xóa.
     * @return void
     */
    private static function destroy(string $id): void {
        requireAdmin();
        $svc = new MemberService();
        $msg = $svc->deleteMember($id);
        
        if ($msg === 'deleted') {
            jsonResponse(['success' => true, 'message' => 'Xoá hội viên thành công'], 200);
        } else {
            jsonResponse(['success' => false, 'error' => 'Hội viên không tồn tại hoặc đã có giao dịch ràng buộc'], 404);
        }
    }
}
?>
