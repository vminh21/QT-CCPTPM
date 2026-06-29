<?php
require_once __DIR__ . '/../DAL/StaffRepository.php';

class StaffService {
    private $staffRepo;

    public function __construct() {
        $this->staffRepo = new StaffRepository();
    }

    public function getStaffList($search = '') {
        return $this->staffRepo->getAllStaff($search);
    }

    public function getTotalStaff() {
        return $this->staffRepo->getTotalStaff();
    }

    public function saveStaff($id, $email, $password, $full_name, $phone_number, $salary) {
        if (empty($id)) {
            $success = $this->staffRepo->createStaff($email, $password, $full_name, $phone_number, $salary);
            return $success ? "success" : "error";
        } else {
            $success = $this->staffRepo->updateStaff($id, $email, $full_name, $phone_number, $salary);
            return $success ? "updated" : "error";
        }
    }

    public function deleteStaff($id) {
        $success = $this->staffRepo->deleteStaff($id);
        return $success ? "deleted" : "error";
    }
}
?>
