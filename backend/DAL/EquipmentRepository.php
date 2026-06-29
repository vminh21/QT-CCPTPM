<?php
require_once __DIR__ . '/../Config/Database.php';

class EquipmentRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAllEquipments($search = '') {
        $sql = "SELECT * FROM equipments";
        if (!empty($search)) {
            $sql .= " WHERE name LIKE :search OR category LIKE :search";
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['search' => "%$search%"]);
        } else {
            $sql .= " ORDER BY equipment_id DESC";
            $stmt = $this->db->query($sql);
        }
        return $stmt->fetchAll();
    }

    public function getEquipmentById($id) {
        $stmt = $this->db->prepare("SELECT * FROM equipments WHERE equipment_id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getTotalEquipments() {
        $stmt = $this->db->query("SELECT SUM(quantity) FROM equipments");
        return $stmt->fetchColumn() ?: 0;
    }

    public function createEquipment($name, $category, $quantity, $status, $purchase_date) {
        $stmt = $this->db->prepare("INSERT INTO equipments (name, category, quantity, status, purchase_date) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([$name, $category, $quantity, $status, $purchase_date]);
    }

    public function updateEquipment($id, $name, $category, $quantity, $status, $purchase_date) {
        $stmt = $this->db->prepare("UPDATE equipments SET name=?, category=?, quantity=?, status=?, purchase_date=? WHERE equipment_id=?");
        return $stmt->execute([$name, $category, $quantity, $status, $purchase_date, $id]);
    }

    public function deleteEquipment($id) {
        $stmt = $this->db->prepare("DELETE FROM equipments WHERE equipment_id = ?");
        return $stmt->execute([$id]);
    }
}
?>
