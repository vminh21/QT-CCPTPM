<?php
/**
 * MemberController
 *
 * GET    /api/members                → Danh sách / tìm kiếm (Admin)
 * GET    /api/members/{id}           → Chi tiết (Admin)
 * POST   /api/members                → Tạo mới (Admin)
 * PUT    /api/members/{id}           → Cập nhật (Admin)
 * PATCH  /api/members/{id}/status    → Đổi trạng thái (Admin)
 * DELETE /api/members/{id}           → Xóa (Admin)
 */

require_once ROOT_PATH . 'BLL/MemberService.php';

class MemberController {

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

    private static function index(): void {
        requireAdmin();
        $svc    = new MemberService();
        $search = trim($_GET['search'] ?? '');
        $pkg    = $_GET['filter_package'] ?? '';
        $status = $_GET['filter_status']  ?? '';
        // 200 OK
        jsonResponse(['success' => true, 'data' => $svc->searchMembers($search, $pkg, $status)], 200);
    }

    private static function show(string $id): void {
        requireAdmin();
        $svc    = new MemberService();
        $member = $svc->getMemberById((int)$id);
        if (!$member) {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Không tìm thấy hội viên'], 404);
        }
        // 200 OK
        jsonResponse(['success' => true, 'data' => $member], 200);
    }

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
            // 201 Created
            jsonResponse(['success' => true, 'message' => 'Thêm hội viên thành công.'], 201);
        } else {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => $msg], 400);
        }
    }

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
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Cập nhật thành công'], 200);
        } else {
            // 400 Bad Request (hoặc 404 do logic db xử lý)
            jsonResponse(['success' => false, 'error' => $msg], 400);
        }
    }

    private static function toggleStatus(string $id): void {
        requireAdmin();
        $body   = getRequestBody();
        $svc    = new MemberService();
        $msg    = $svc->toggleMemberStatus($id, $body['current_status'] ?? 'Active');
        
        if ($msg === 'updated') {
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Cập nhật trạng thái thành công'], 200);
        } else {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => 'Không thể đổi trạng thái'], 400);
        }
    }

    private static function destroy(string $id): void {
        requireAdmin();
        $svc = new MemberService();
        $msg = $svc->deleteMember($id);
        
        if ($msg === 'deleted') {
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Xoá hội viên thành công'], 200);
        } else {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Hội viên không tồn tại hoặc đã có giao dịch ràng buộc'], 404);
        }
    }
}
