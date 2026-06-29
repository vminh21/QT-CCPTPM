<?php
require_once __DIR__ . '/../Config/Database.php';

class NotificationRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAllNotifications() {
        $stmt = $this->db->query("
            SELECT n.*, COALESCE(a.full_name, CONCAT('Admin #', n.created_by)) AS creator_name
            FROM notifications n
            LEFT JOIN admins a ON n.created_by = a.admin_id
            WHERE n.type = 'general'
            ORDER BY n.created_at DESC
        ");
        return $stmt->fetchAll();
    }

    public function getNotificationById($id) {
        $stmt = $this->db->prepare("SELECT * FROM notifications WHERE notification_id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function createNotification($title, $content, $image, $created_by) {
        $stmt = $this->db->prepare("INSERT INTO notifications (title, content, image, created_by) VALUES (:title, :content, :image, :created_by)");
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':image', $image);
        $stmt->bindParam(':created_by', $created_by);
        return $stmt->execute();
    }

    public function updateNotification($id, $title, $content, $image = null) {
        if ($image !== null) {
            $stmt = $this->db->prepare("UPDATE notifications SET title=:title, content=:content, image=:image WHERE notification_id=:id");
            $stmt->bindParam(':image', $image);
        } else {
            $stmt = $this->db->prepare("UPDATE notifications SET title=:title, content=:content WHERE notification_id=:id");
        }
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function deleteNotification($id) {
        $stmt = $this->db->prepare("DELETE FROM notifications WHERE notification_id = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    // ====== THÔNG BÁO CÁ NHÂN CHO MEMBER (LỊCH TẬP PT) ======
    public function createPersonalNotification($member_id, $title, $content) {
        $stmt = $this->db->prepare("
            INSERT INTO notifications (title, content, member_id, type, created_by)
            VALUES (:title, :content, :member_id, 'schedule', NULL)
        ");
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':member_id', $member_id);
        return $stmt->execute();
    }

    public function getNotificationsByMember($member_id) {
        $stmt = $this->db->prepare("
            SELECT * FROM notifications
            WHERE member_id = :member_id OR (member_id IS NULL AND type = 'general')
            ORDER BY created_at DESC
            LIMIT 20
        ");
        $stmt->bindParam(':member_id', $member_id);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function countUnreadByMember($member_id) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as cnt FROM notifications
            WHERE (member_id = :member_id OR (member_id IS NULL AND type = 'general'))
              AND is_read = 0
              AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ");
        $stmt->bindParam(':member_id', $member_id);
        $stmt->execute();
        $row = $stmt->fetch();
        return $row ? (int)$row['cnt'] : 0;
    }

    public function markAllAsRead($member_id) {
        $stmt = $this->db->prepare("
            UPDATE notifications 
            SET is_read = 1 
            WHERE (member_id = :member_id OR (member_id IS NULL AND type = 'general'))
              AND is_read = 0
        ");
        $stmt->bindParam(':member_id', $member_id);
        return $stmt->execute();
    }

    /**
     * Lấy ID của thông báo mới nhất cho member (dùng để phát hiện thông báo mới qua polling)
     */
    public function getLatestNotifIdByMember($member_id) {
        $stmt = $this->db->prepare("
            SELECT notification_id FROM notifications
            WHERE member_id = :member_id OR (member_id IS NULL AND type = 'general')
            ORDER BY notification_id DESC
            LIMIT 1
        ");
        $stmt->bindParam(':member_id', $member_id);
        $stmt->execute();
        $row = $stmt->fetch();
        return $row ? (int)$row['notification_id'] : null;
    }
}
?>
