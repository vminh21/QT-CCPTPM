<?php
require_once __DIR__ . '/../Config/Database.php';

class ReviewRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function addOrUpdateReview($trainer_id, $member_id, $rating, $comment) {
        $sql = "INSERT INTO trainer_reviews (trainer_id, member_id, rating, comment) 
                VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), created_at = current_timestamp()";
        $stmt = $this->db->prepare($sql);
        $success = $stmt->execute([$trainer_id, $member_id, $rating, $comment]);

        if ($success) {
            // Cập nhật lại rating trung bình cho trainer
            $updateSql = "UPDATE trainers 
                          SET rating = (SELECT IFNULL(AVG(rating), 5.0) FROM trainer_reviews WHERE trainer_id = ?) 
                          WHERE trainer_id = ?";
            $updateStmt = $this->db->prepare($updateSql);
            $updateStmt->execute([$trainer_id, $trainer_id]);
        }

        return $success;
    }

    public function getReviewByMemberAndTrainer($member_id, $trainer_id) {
        $stmt = $this->db->prepare("SELECT * FROM trainer_reviews WHERE member_id = ? AND trainer_id = ?");
        $stmt->execute([$member_id, $trainer_id]);
        return $stmt->fetch();
    }

    public function getReviewsByTrainer($trainer_id) {
        $stmt = $this->db->prepare("
            SELECT tr.*, m.full_name as reviewer_name
            FROM trainer_reviews tr
            LEFT JOIN members m ON tr.member_id = m.member_id
            WHERE tr.trainer_id = ?
            ORDER BY tr.created_at DESC
        ");
        $stmt->execute([$trainer_id]);
        return $stmt->fetchAll();
    }
}
?>
