<?php
require_once __DIR__ . '/../Config/Database.php';

class DashboardRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getTotalMembers() {
        $stmt = $this->db->query("SELECT COUNT(DISTINCT member_id) FROM transactions");
        return $stmt->fetchColumn() ?: 0;
    }

    public function getActiveMembers() {
        $stmt = $this->db->query("SELECT COUNT(DISTINCT member_id) FROM member_subscriptions WHERE end_date >= CURDATE()");
        return $stmt->fetchColumn() ?: 0;
    }

    public function getExpiredMembers() {
        $stmt = $this->db->query("SELECT COUNT(DISTINCT member_id) FROM member_subscriptions WHERE end_date < CURDATE()");
        return $stmt->fetchColumn() ?: 0;
    }

    public function getTotalRevenue() {
        $stmt = $this->db->query("SELECT SUM(amount) FROM transactions");
        return $stmt->fetchColumn() ?: 0;
    }

    public function getRecentTransactions($searchName = '', $searchType = '') {
        $where_clauses = ["1=1"];
        $params = [];

        if (!empty($searchName)) {
            $where_clauses[] = "m.full_name LIKE :search_name";
            $params[':search_name'] = "%$searchName%";
        }
        if (!empty($searchType)) {
            $where_clauses[] = "t.transaction_type = :search_type";
            $params[':search_type'] = $searchType;
        }

        $where_sql = implode(" AND ", $where_clauses);

        $sql = "SELECT t.*, m.full_name, 
              (SELECT MAX(ms.end_date) FROM member_subscriptions ms WHERE ms.member_id = t.member_id) AS end_date 
              FROM transactions t 
              JOIN members m ON t.member_id = m.member_id 
              WHERE $where_sql
              ORDER BY t.transaction_date DESC LIMIT 20";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
}
?>
