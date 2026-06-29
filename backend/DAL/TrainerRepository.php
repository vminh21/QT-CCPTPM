<?php
require_once __DIR__ . '/../Config/Database.php';

class TrainerRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAllTrainers($search = '') {
        $sql = "SELECT t.*, COALESCE(AVG(r.rating), 5.0) as calculated_rating, COUNT(r.review_id) as total_reviews 
                FROM trainers t 
                LEFT JOIN trainer_reviews r ON t.trainer_id = r.trainer_id";
        if (!empty($search)) {
            $sql .= " WHERE t.full_name LIKE :search OR t.specialty LIKE :search GROUP BY t.trainer_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['search' => "%$search%"]);
        } else {
            $sql .= " GROUP BY t.trainer_id ORDER BY t.trainer_id DESC";
            $stmt = $this->db->query($sql);
        }
        return $stmt->fetchAll();
    }

    public function getTrainerById($id) {
        $stmt = $this->db->prepare("SELECT t.*, COALESCE(AVG(r.rating), 5.0) as calculated_rating, COUNT(r.review_id) as total_reviews 
                                    FROM trainers t 
                                    LEFT JOIN trainer_reviews r ON t.trainer_id = r.trainer_id 
                                    WHERE t.trainer_id = ? 
                                    GROUP BY t.trainer_id");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getTotalTrainers() {
        $stmt = $this->db->query("SELECT COUNT(*) FROM trainers");
        return $stmt->fetchColumn();
    }

    public function getTopTrainers($limit = 4) {
        $stmt = $this->db->prepare("SELECT t.*, COALESCE(AVG(r.rating), 5.0) as calculated_rating, COUNT(r.review_id) as total_reviews 
                                    FROM trainers t 
                                    LEFT JOIN trainer_reviews r ON t.trainer_id = r.trainer_id 
                                    GROUP BY t.trainer_id 
                                    ORDER BY calculated_rating DESC, total_reviews DESC, t.trainer_id DESC LIMIT ?");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function createTrainer($name, $specialty, $image, $fb, $tw, $yt, $email = null, $password = null) {
        $stmt = $this->db->prepare("INSERT INTO trainers (full_name, specialty, image, facebook_url, twitter_url, youtube_url, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        if ($stmt->execute([$name, $specialty, $image, $fb, $tw, $yt, $email, $password])) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    public function updateTrainer($id, $name, $specialty, $image, $fb, $tw, $yt, $email = null, $password = null) {
        if ($image) {
            $stmt = $this->db->prepare("UPDATE trainers SET full_name=?, specialty=?, image=?, facebook_url=?, twitter_url=?, youtube_url=?, email=?, password=? WHERE trainer_id=?");
            return $stmt->execute([$name, $specialty, $image, $fb, $tw, $yt, $email, $password, $id]);
        } else {
            // Không cập nhật ảnh
            $stmt = $this->db->prepare("UPDATE trainers SET full_name=?, specialty=?, facebook_url=?, twitter_url=?, youtube_url=?, email=?, password=? WHERE trainer_id=?");
            return $stmt->execute([$name, $specialty, $fb, $tw, $yt, $email, $password, $id]);
        }
    }

    public function deleteTrainer($id) {
        $stmt = $this->db->prepare("DELETE FROM trainers WHERE trainer_id = ?");
        return $stmt->execute([$id]);
    }
}
?>
