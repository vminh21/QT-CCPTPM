<?php
require_once __DIR__ . '/../DAL/EquipmentRepository.php';

class EquipmentService {
    private $equipmentRepo;

    public function __construct() {
        $this->equipmentRepo = new EquipmentRepository();
    }

    public function getAllEquipments($search = '') {
        return $this->equipmentRepo->getAllEquipments($search);
    }

    public function getEquipmentById($id) {
        return $this->equipmentRepo->getEquipmentById($id);
    }

    public function getTotalEquipments() {
        return $this->equipmentRepo->getTotalEquipments(); // returns total quantity
    }

    public function saveEquipment($id, $name, $category, $quantity, $status, $purchase_date) {
        if ($id > 0) {
            $success = $this->equipmentRepo->updateEquipment($id, $name, $category, $quantity, $status, $purchase_date);
            return $success ? "success" : "error";
        } else {
            $success = $this->equipmentRepo->createEquipment($name, $category, $quantity, $status, $purchase_date);
            return $success ? "success" : "error";
        }
    }

    public function deleteEquipment($id) {
        $success = $this->equipmentRepo->deleteEquipment($id);
        return $success ? "deleted" : "error";
    }
}
?>
