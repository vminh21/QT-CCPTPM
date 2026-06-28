<?php
require_once __DIR__ . '/../Config/Database.php';

class MemberRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get basic info (ID, name) of all members for dropdowns
     */
    public function getAllMembersBasicInfo() {
        $stmt = $this->db->query("SELECT member_id, full_name FROM members ORDER BY full_name ASC");
        return $stmt->fetchAll();
    }

    public function searchMembers($search, $filter_package, $filter_status) {
        $where_clauses = ["1=1"];
        $params = [];

        if (!empty($search)) { 
            $where_clauses[] = "m.full_name LIKE :search"; 
            $params[':search'] = "%$search%";
        }
        if (!empty($filter_package)) { 
            $where_clauses[] = "p.package_id = :filter_package"; 
            $params[':filter_package'] = $filter_package;
        }
        if (!empty($filter_status)) {
            if ($filter_status == 'Expired') { 
                $where_clauses[] = "ms.end_date < CURDATE()"; 
            } elseif ($filter_status == 'Active') { 
                $where_clauses[] = "m.status = 'Active' AND (ms.end_date >= CURDATE() OR ms.end_date IS NULL)"; 
            } else { 
                $where_clauses[] = "m.status = :filter_status"; 
                $params[':filter_status'] = $filter_status;
            }
        }

        $where_sql = implode(" AND ", $where_clauses);
        $sql = "SELECT m.*, m.status as m_status, ms.status as sub_status, ms.start_date, ms.end_date, p.package_name, p.package_id
                FROM members m
                LEFT JOIN (
                    SELECT * FROM member_subscriptions 
                    WHERE subscription_id IN (SELECT MAX(subscription_id) FROM member_subscriptions GROUP BY member_id)
                ) ms ON m.member_id = ms.member_id
                LEFT JOIN membership_packages p ON ms.package_id = p.package_id
                WHERE $where_sql
                ORDER BY m.member_id DESC";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getMemberById($id) {
        $stmt = $this->db->prepare("SELECT * FROM members WHERE member_id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function createMember($name, $email, $password, $phone = null, $address = null, $gender = 'Male', $status = 'Active') {
        $stmt = $this->db->prepare("INSERT INTO members (full_name, email, password, phone_number, address, gender, status) VALUES (:name, :email, :password, :phone, :address, :gender, :status)");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':gender', $gender);
        $stmt->bindParam(':status', $status);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function updateMemberDetails($id, $name, $phone, $address, $status) {
        $stmt = $this->db->prepare("UPDATE members SET full_name=:name, phone_number=:phone, address=:address, status=:status WHERE member_id=:id");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function toggleStatus($id, $new_status) {
        $stmt = $this->db->prepare("UPDATE members SET status=:status WHERE member_id=:id");
        $stmt->bindParam(':status', $new_status);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function deleteMember($id) {
        $stmt = $this->db->prepare("DELETE FROM members WHERE member_id=:id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
    public function updateProfile($member_id, $name, $email, $address, $gender, $password = null) {
        if ($password !== null && $password !== "") {
            $stmt = $this->db->prepare("UPDATE members SET full_name = :name, email = :email, address = :address, gender = :gender, password = :password WHERE member_id = :id");
            $stmt->bindParam(':password', $password);
        } else {
            $stmt = $this->db->prepare("UPDATE members SET full_name = :name, email = :email, address = :address, gender = :gender WHERE member_id = :id");
        }
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':gender', $gender);
        $stmt->bindParam(':id', $member_id);
        return $stmt->execute();
    }
}
?>
