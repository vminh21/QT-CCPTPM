<?php
require_once __DIR__ . '/../Config/Database.php';

class StaffRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAllStaff($search = '') {
        $sql = "SELECT * FROM admins WHERE position = 'staff'";
        $params = [];
        
        if (!empty($search)) {
            $sql .= " AND (full_name LIKE :search OR email LIKE :search OR phone_number LIKE :search)";
            $params[':search'] = "%$search%";
        }
        
        $sql .= " ORDER BY admin_id DESC";
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getTotalStaff() {
        $stmt = $this->db->query("SELECT COUNT(*) FROM admins WHERE position = 'staff'");
        return $stmt->fetchColumn() ?? 0;
    }

    public function createStaff($email, $password, $full_name, $phone_number, $salary) {
        $stmt = $this->db->prepare("INSERT INTO admins (email, password, full_name, phone_number, position, salary) VALUES (:email, :password, :full_name, :phone, 'staff', :salary)");
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':full_name', $full_name);
        $stmt->bindParam(':phone', $phone_number);
        $stmt->bindParam(':salary', $salary);
        return $stmt->execute();
    }

    public function updateStaff($id, $email, $full_name, $phone_number, $salary) {
        $stmt = $this->db->prepare("UPDATE admins SET full_name=:full_name, email=:email, phone_number=:phone, salary=:salary WHERE admin_id = :id AND position = 'staff'");
        $stmt->bindParam(':full_name', $full_name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone_number);
        $stmt->bindParam(':salary', $salary);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function deleteStaff($id) {
        $stmt = $this->db->prepare("DELETE FROM admins WHERE admin_id = :id AND position = 'staff'");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
?>
