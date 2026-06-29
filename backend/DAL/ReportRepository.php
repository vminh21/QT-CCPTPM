<?php
require_once __DIR__ . '/../Config/Database.php';

class ReportRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAvailableYears() {
        $stmt = $this->db->query("SELECT DISTINCT YEAR(transaction_date) as y FROM transactions WHERE transaction_date IS NOT NULL ORDER BY y DESC");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function getMonthlyRevenue($year) {
        if ($year === 'all') {
            $stmt = $this->db->prepare("SELECT MONTH(transaction_date) as m, SUM(amount) as t FROM transactions GROUP BY m ORDER BY m ASC");
            $stmt->execute();
        } else {
            $stmt = $this->db->prepare("SELECT MONTH(transaction_date) as m, SUM(amount) as t FROM transactions WHERE YEAR(transaction_date) = :year GROUP BY m ORDER BY m ASC");
            $stmt->bindParam(':year', $year, PDO::PARAM_INT);
            $stmt->execute();
        }
        return $stmt->fetchAll();
    }

    public function getTotalTransactions($year) {
        if ($year === 'all') {
            $stmt = $this->db->query("SELECT COUNT(*) FROM transactions");
        } else {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM transactions WHERE YEAR(transaction_date) = :year");
            $stmt->bindParam(':year', $year, PDO::PARAM_INT);
        }
        $stmt->execute();
        return (int)$stmt->fetchColumn();
    }

    public function getNewRegistrations($year) {
        if ($year === 'all') {
            $stmt = $this->db->query("SELECT COUNT(*) FROM transactions WHERE transaction_type = 'Registration'");
        } else {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM transactions WHERE YEAR(transaction_date) = :year AND transaction_type = 'Registration'");
            $stmt->bindParam(':year', $year, PDO::PARAM_INT);
        }
        $stmt->execute();
        return (int)$stmt->fetchColumn();
    }

    public function getRenewals($year) {
        if ($year === 'all') {
            $stmt = $this->db->query("SELECT COUNT(*) FROM transactions WHERE transaction_type = 'Renewal'");
        } else {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM transactions WHERE YEAR(transaction_date) = :year AND transaction_type = 'Renewal'");
            $stmt->bindParam(':year', $year, PDO::PARAM_INT);
        }
        $stmt->execute();
        return (int)$stmt->fetchColumn();
    }

    public function getGenderStats() {
        $stmt = $this->db->query("SELECT gender, COUNT(*) as count FROM members GROUP BY gender");
        return $stmt->fetchAll();
    }

    public function getPackageStats() {
        $stmt = $this->db->query("SELECT p.package_name, COUNT(s.subscription_id) as count 
            FROM membership_packages p 
            LEFT JOIN member_subscriptions s ON p.package_id = s.package_id 
            GROUP BY p.package_id");
        return $stmt->fetchAll();
    }

    public function getTopSpenders($year, $limit = 5) {
        if ($year === 'all') {
            $stmt = $this->db->prepare("SELECT m.full_name, SUM(t.amount) as total FROM transactions t JOIN members m ON t.member_id = m.member_id GROUP BY m.member_id ORDER BY total DESC LIMIT :limit");
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        } else {
            $stmt = $this->db->prepare("SELECT m.full_name, SUM(t.amount) as total FROM transactions t JOIN members m ON t.member_id = m.member_id WHERE YEAR(t.transaction_date) = :year GROUP BY m.member_id ORDER BY total DESC LIMIT :limit");
            $stmt->bindValue(':year', $year, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        }
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getRecentDetailedTransactions($year, $limit = 5) {
        if ($year === 'all') {
            $stmt = $this->db->prepare("SELECT m.full_name, m.gender, p.package_name, t.amount, t.transaction_type, t.transaction_date 
                FROM transactions t 
                JOIN members m ON t.member_id = m.member_id 
                LEFT JOIN member_subscriptions s ON m.member_id = s.member_id 
                LEFT JOIN membership_packages p ON s.package_id = p.package_id 
                ORDER BY t.transaction_date DESC LIMIT :limit");
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        } else {
            $stmt = $this->db->prepare("SELECT m.full_name, m.gender, p.package_name, t.amount, t.transaction_type, t.transaction_date 
                FROM transactions t 
                JOIN members m ON t.member_id = m.member_id 
                LEFT JOIN member_subscriptions s ON m.member_id = s.member_id 
                LEFT JOIN membership_packages p ON s.package_id = p.package_id 
                WHERE YEAR(t.transaction_date) = :year 
                ORDER BY t.transaction_date DESC LIMIT :limit");
            $stmt->bindValue(':year', $year, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        }
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
?>
