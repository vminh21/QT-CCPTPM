<?php
/**
 * TransactionController
 *
 * GET    /api/transactions        → Danh sách giao dịch (Admin)
 * POST   /api/transactions        → Tạo giao dịch (Admin)
 * PUT    /api/transactions/{id}   → Sửa giao dịch (Admin)
 * DELETE /api/transactions/{id}   → Xóa giao dịch (Admin)
 */

require_once ROOT_PATH . 'BLL/TransactionService.php';

class TransactionController {

    public static function handle(?string $id, string $method): void {
        requireAdmin();
        match (true) {
            !$id && $method === 'GET'       => self::index(),
            !$id && $method === 'POST'      => self::store(),
            $id && $method === 'PUT'        => self::update($id),
            $id && $method === 'DELETE'     => self::destroy($id),
            default => jsonResponse(['success' => false, 'error' => 'Method Not Allowed'], 405),
        };
    }

    private static function index(): void {
        require_once ROOT_PATH . 'BLL/DashboardService.php';
        $svc       = new DashboardService();
        $searchName = trim($_GET['search_name'] ?? '');
        $searchType = trim($_GET['search_type'] ?? '');
        jsonResponse(['success' => true, 'data' => $svc->getRecentTransactions($searchName, $searchType)]);
    }

    private static function store(): void {
        $body = getRequestBody();
        $svc  = new TransactionService();
        $msg  = $svc->createTransaction(
            $body['member_id']        ?? '',
            $body['amount']           ?? 0,
            $body['transaction_type'] ?? '',
            $body['payment_method']   ?? 'Tiền mặt',
            $body['new_member_name']  ?? null
        );
        if (str_starts_with($msg, 'error')) {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => $msg], 400);
        }
        
        // 201 Created
        jsonResponse(['success' => true, 'message' => 'Tạo giao dịch thành công'], 201);
    }

    private static function update(string $id): void {
        $body = getRequestBody();
        $svc  = new TransactionService();
        $msg  = $svc->updateTransaction(
            $id,
            $body['member_id']        ?? 0,
            $body['amount']           ?? 0,
            $body['transaction_type'] ?? '',
            $body['payment_method']   ?? '',
            $body['end_date']         ?? ''
        );
        if ($msg === 'updated') {
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Cập nhật giao dịch thành công'], 200);
        } else {
            // 400 Bad Request
            jsonResponse(['success' => false, 'error' => 'Cập nhật thất bại'], 400);
        }
    }

    private static function destroy(string $id): void {
        $svc = new TransactionService();
        $msg = $svc->deleteTransaction((int)$id);
        if ($msg === 'deleted') {
            // 200 OK
            jsonResponse(['success' => true, 'message' => 'Xoá giao dịch thành công'], 200);
        } else {
            // 404 Not Found
            jsonResponse(['success' => false, 'error' => 'Giao dịch không tồn tại để xóa'], 404);
        }
    }
}
