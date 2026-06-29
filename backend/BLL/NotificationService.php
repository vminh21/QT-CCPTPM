<?php
require_once __DIR__ . '/../DAL/NotificationRepository.php';

class NotificationService {
    private $notifRepo;

    public function __construct() {
        $this->notifRepo = new NotificationRepository();
    }

    public function getNotifications() {
        return $this->notifRepo->getAllNotifications();
    }

    public function getNotification($id) {
        return $this->notifRepo->getNotificationById($id);
    }

    public function saveNotification($id, $title, $content, $admin_id, $file) {
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
                // Remove old image
                $old_data = $this->notifRepo->getNotificationById($id);
                if ($old_data && !empty($old_data['image'])) {
                    $old_path = __DIR__ . "/../uploads/" . $old_data['image'];
                    if (file_exists($old_path)) {
                        unlink($old_path);
                    }
                }
            }
            $success = $this->notifRepo->updateNotification($id, $title, $content, $image_name);
        } else {
            // Create
            $success = $this->notifRepo->createNotification($title, $content, $image_name, $admin_id);
        }

        return $success ? "success" : "error";
    }

    public function deleteNotification($id) {
        $old_data = $this->notifRepo->getNotificationById($id);
        if ($old_data && !empty($old_data['image'])) {
            $old_path = __DIR__ . "/../uploads/" . $old_data['image'];
            if (file_exists($old_path)) {
                unlink($old_path);
            }
        }
        
        $success = $this->notifRepo->deleteNotification($id);
        return $success ? "deleted" : "error";
    }
}
?>
