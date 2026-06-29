<?php
require_once __DIR__ . '/../DAL/WorkoutRepository.php';

class WorkoutService {
    private $workoutRepo;

    public function __construct() {
        $this->workoutRepo = new WorkoutRepository();
    }

    public function getWorkoutsByTrainer($trainer_id) {
        return $this->workoutRepo->getAllByTrainer($trainer_id);
    }

    public function getWorkout($workout_id) {
        return $this->workoutRepo->getById($workout_id);
    }

    public function saveWorkout($trainer_id, $title, $description, $difficulty, $duration_weeks, $content, $workout_id = null) {
        if (empty($title)) return "Tên giáo trình không được để trống!";
        
        if ($workout_id) {
            $success = $this->workoutRepo->update($workout_id, $title, $description, $difficulty, $duration_weeks, $content);
            return $success ? true : "Lỗi khi cập nhật giáo trình!";
        } else {
            $success = $this->workoutRepo->create($trainer_id, $title, $description, $difficulty, $duration_weeks, $content);
            return $success ? true : "Lỗi khi tạo giáo trình!";
        }
    }

    public function deleteWorkout($workout_id) {
        return $this->workoutRepo->delete($workout_id);
    }
}
?>
