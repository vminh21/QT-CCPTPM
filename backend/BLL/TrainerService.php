<?php
require_once __DIR__ . '/../DAL/TrainerRepository.php';

class TrainerService {
    private $trainerRepo;

    public function __construct() {
        $this->trainerRepo = new TrainerRepository();
    }

    public function getAllTrainers($search = '') {
        return $this->trainerRepo->getAllTrainers($search);
    }

    public function getTrainerById($id) {
        return $this->trainerRepo->getTrainerById($id);
    }

    public function getTopTrainers($limit = 4) {
        return $this->trainerRepo->getTopTrainers($limit);
    }

    public function getTotalTrainers() {
        return $this->trainerRepo->getTotalTrainers();
    }

    public function saveTrainer($id, $name, $specialty, $fb, $tw, $yt, $file, $email = null, $password = null) {
        $image_name = null;
        
        // Handle file upload
        if (isset($file) && $file['error'] == 0) {
            $file_name = $file['name'];
            $ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            $allowed = array("jpg", "jpeg", "png");

            if (in_array($ext, $allowed)) {
                $image_name = time() . "_" . basename($file_name);
                $upload_path = __DIR__ . "/../uploads/" . $image_name;
                move_uploaded_file($file["tmp_name"], $upload_path);
            } else {
                return "error_ext";
            }
        }

        if ($id > 0) {
            // Update
            if ($image_name !== null) {
                // Xoá ảnh cũ nếu có
                $old_data = $this->trainerRepo->getTrainerById($id);
                if ($old_data && !empty($old_data['image'])) {
                    $old_path = __DIR__ . "/../uploads/" . $old_data['image'];
                    if (file_exists($old_path)) {
                        unlink($old_path);
                    }
                }
            }
            $success = $this->trainerRepo->updateTrainer($id, $name, $specialty, $image_name, $fb, $tw, $yt, $email, $password);
            return $success ? "success" : "error";
        } else {
            // Create
            $new_id = $this->trainerRepo->createTrainer($name, $specialty, $image_name, $fb, $tw, $yt, $email, $password);
            return $new_id ? $new_id : "error";
        }
    }

    public function deleteTrainer($id) {
        $old_data = $this->trainerRepo->getTrainerById($id);
        if ($old_data && !empty($old_data['image'])) {
            $old_path = __DIR__ . "/../uploads/" . $old_data['image'];
            if (file_exists($old_path)) {
                unlink($old_path);
            }
        }
        
        $success = $this->trainerRepo->deleteTrainer($id);
        return $success ? "deleted" : "error";
    }
}
?>
