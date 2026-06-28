<?php
require_once __DIR__ . '/../Config/Database.php';

class AuthRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Xác thực admin — hỗ trợ cả plain text (cũ) & bcrypt (mới)
     */
    public function getAdminByCredentials($email, $password) {
        $stmt = $this->db->prepare("SELECT * FROM admins WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $admin = $stmt->fetch();

        if (!$admin) return false;
        return $this->verifyPassword($password, $admin['password'], 'admin', $admin['admin_id']) ? $admin : false;
    }

    /**
     * Xác thực member — hỗ trợ cả plain text (cũ) & bcrypt (mới)
     */
    public function getMemberByCredentials($email, $password) {
        $stmt = $this->db->prepare("SELECT * FROM members WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $member = $stmt->fetch();

        if (!$member) return false;
        return $this->verifyPassword($password, $member['password'], 'member', $member['member_id']) ? $member : false;
    }

    /**
     * Xác thực trainer — hỗ trợ cả plain text (cũ) & bcrypt (mới)
     */
    public function getTrainerByCredentials($email, $password) {
        $stmt = $this->db->prepare("SELECT * FROM trainers WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $trainer = $stmt->fetch();

        if (!$trainer) return false;
        return $this->verifyPassword($password, $trainer['password'], 'trainer', $trainer['trainer_id']) ? $trainer : false;
    }

    /**
     * Verify password: thử bcrypt trước, fallback plain text.
     * Nếu match plain text → tự động nâng cấp lên bcrypt (seamless migration).
     */
    private function verifyPassword($input, $stored, $table, $id) {
        // Thử bcrypt
        if (password_verify($input, $stored)) {
            return true;
        }
        // Fallback: plain text (tài khoản cũ chưa được hash)
        if ($input === $stored) {
            // Auto-upgrade sang bcrypt
            $hashed = password_hash($input, PASSWORD_BCRYPT);
            $tableMap = [
                'admin'   => ['table' => 'admins',  'pk' => 'admin_id'],
                'member'  => ['table' => 'members',  'pk' => 'member_id'],
                'trainer' => ['table' => 'trainers', 'pk' => 'trainer_id'],
            ];
            $t = $tableMap[$table] ?? null;
            if ($t) {
                $upd = $this->db->prepare(
                    "UPDATE {$t['table']} SET password = :pwd WHERE {$t['pk']} = :id"
                );
                $upd->bindValue(':pwd', $hashed);
                $upd->bindValue(':id', $id);
                $upd->execute();
            }
            return true;
        }
        return false;
    }

    /**
     * Check if a member email already exists
     */
    public function checkMemberExists($email) {
        $stmt = $this->db->prepare("SELECT 1 FROM members WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch() !== false;
    }

    /**
     * Tạo member mới — password được hash bcrypt
     */
    public function createMember($fullName, $email, $password, $phone, $address, $gender) {
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->db->prepare(
            "INSERT INTO members (full_name, email, password, phone_number, address, gender)
             VALUES (:full_name, :email, :password, :phone, :address, :gender)"
        );
        $stmt->bindParam(':full_name', $fullName);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':gender', $gender);
        return $stmt->execute();
    }

    /**
     * Đổi mật khẩu — luôn hash bcrypt
     */
    public function updatePassword($email, $newPassword) {
        $hashed = password_hash($newPassword, PASSWORD_BCRYPT);
        $stmt = $this->db->prepare("UPDATE members SET password = :password WHERE email = :email");
        $stmt->bindParam(':password', $hashed);
        $stmt->bindParam(':email', $email);
        return $stmt->execute();
    }
}
?>
