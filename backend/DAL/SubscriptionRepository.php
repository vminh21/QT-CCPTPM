<?php
require_once __DIR__ . '/../Config/Database.php';

class SubscriptionRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getSubscriptionByMember($member_id) {
        $stmt = $this->db->prepare("SELECT * FROM member_subscriptions WHERE member_id = :id");
        $stmt->bindParam(':id', $member_id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function createSubscription($member_id, $package_id, $start_date, $end_date, $trainer_id = null, $course_name = null) {
        $stmt = $this->db->prepare("INSERT INTO member_subscriptions (member_id, package_id, start_date, end_date, status, trainer_id, course_name) VALUES (:m_id, :p_id, :s_date, :e_date, 'Active', :t_id, :c_name)");
        $stmt->bindParam(':m_id', $member_id);
        $stmt->bindParam(':p_id', $package_id);
        $stmt->bindParam(':s_date', $start_date);
        $stmt->bindParam(':e_date', $end_date);
        $stmt->bindParam(':t_id', $trainer_id);
        $stmt->bindParam(':c_name', $course_name);
        return $stmt->execute();
    }

    public function updateSubscription($member_id, $package_id, $end_date, $status = 'Active') {
        $stmt = $this->db->prepare("UPDATE member_subscriptions SET package_id = :p_id, end_date = :e_date, status = :status WHERE member_id = :m_id");
        $stmt->bindParam(':p_id', $package_id);
        $stmt->bindParam(':e_date', $end_date);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':m_id', $member_id);
        return $stmt->execute();
    }

    public function deleteSubscription($member_id) {
        $stmt = $this->db->prepare("DELETE FROM member_subscriptions WHERE member_id = :id");
        $stmt->bindParam(':id', $member_id);
        return $stmt->execute();
    }

    public function checkSubscriptionExists($member_id) {
        $stmt = $this->db->prepare("SELECT 1 FROM member_subscriptions WHERE member_id = :id LIMIT 1");
        $stmt->bindParam(':id', $member_id);
        $stmt->execute();
        return $stmt->fetch() !== false;
    }
    public function getActiveSubscriptionDetails($member_id) {
        $stmt = $this->db->prepare("SELECT p.package_name, s.end_date, s.package_id, s.course_name 
               FROM member_subscriptions s
               JOIN membership_packages p ON s.package_id = p.package_id
               WHERE s.member_id = :id AND s.status = 'Active' AND s.end_date >= CURDATE()
               ORDER BY s.end_date DESC LIMIT 1");
        $stmt->bindParam(':id', $member_id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function expireActiveSubscriptions($member_id) {
        // Expire tất cả gói Active của member này (khi mua gói mới)
        $stmt = $this->db->prepare("UPDATE member_subscriptions SET status = 'Expired' WHERE member_id = :id AND status = 'Active'");
        $stmt->bindParam(':id', $member_id);
        return $stmt->execute();
    }

    // Tự động expire các gói hết hạn (end_date đã qua) mà chưa được đặt Expired
    public function autoExpireStaleSubscriptions($member_id) {
        $stmt = $this->db->prepare("
            UPDATE member_subscriptions 
            SET status = 'Expired' 
            WHERE member_id = :id AND status = 'Active' AND end_date < CURDATE()
        ");
        $stmt->bindParam(':id', $member_id);
        return $stmt->execute();
    }

    public function autoExpireALLStaleSubscriptions() {
        $stmt = $this->db->prepare("
            UPDATE member_subscriptions 
            SET status = 'Expired' 
            WHERE status = 'Active' AND end_date < CURDATE()
        ");
        return $stmt->execute();
    }

    public function cancelActiveSubscription($member_id) {
        $stmt = $this->db->prepare("UPDATE member_subscriptions SET status = 'Cancelled' WHERE member_id = :id AND status = 'Active'");
        $stmt->bindParam(':id', $member_id);
        return $stmt->execute();
    }

    public function getSubscriptionEndDate($member_id) {
        $stmt = $this->db->prepare("SELECT end_date FROM member_subscriptions WHERE member_id = :id LIMIT 1");
        $stmt->bindParam(':id', $member_id);
        $stmt->execute();
        $row = $stmt->fetch();
        return $row ? $row['end_date'] : null;
    }
}
?>
