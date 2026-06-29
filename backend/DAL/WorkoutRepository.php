<?php
require_once __DIR__ . '/../Config/Database.php';

class WorkoutRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAllByTrainer($trainer_id) {
        $stmt = $this->db->prepare("SELECT * FROM pt_workouts WHERE trainer_id = ? ORDER BY created_at DESC");
        $stmt->execute([$trainer_id]);
        return $stmt->fetchAll();
    }

    public function getById($workout_id) {
        $stmt = $this->db->prepare("SELECT * FROM pt_workouts WHERE workout_id = ?");
        $stmt->execute([$workout_id]);
        return $stmt->fetch();
    }

    public function create($trainer_id, $title, $description, $difficulty, $duration_weeks, $content) {
        $stmt = $this->db->prepare("INSERT INTO pt_workouts (trainer_id, title, description, difficulty, duration_weeks, content) VALUES (?, ?, ?, ?, ?, ?)");
        return $stmt->execute([$trainer_id, $title, $description, $difficulty, $duration_weeks, $content]);
    }

    public function update($workout_id, $title, $description, $difficulty, $duration_weeks, $content) {
        $stmt = $this->db->prepare("UPDATE pt_workouts SET title = ?, description = ?, difficulty = ?, duration_weeks = ?, content = ? WHERE workout_id = ?");
        return $stmt->execute([$title, $description, $difficulty, $duration_weeks, $content, $workout_id]);
    }

    public function delete($workout_id) {
        $stmt = $this->db->prepare("DELETE FROM pt_workouts WHERE workout_id = ?");
        return $stmt->execute([$workout_id]);
    }
}
?>
