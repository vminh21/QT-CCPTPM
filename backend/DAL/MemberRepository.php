<?php
require_once __DIR__ . '/../Config/Database.php';

/**
 * MemberRepository
 *
 * Lớp truy vấn cơ sở dữ liệu (DAL) cho bảng members.
 */
class MemberRepository {
    /** @var PDO Đối tượng kết nối cơ sở dữ liệu */
    private $db;

    /**
     * Khởi tạo và thiết lập kết nối cơ sở dữ liệu.
     */
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Lấy thông tin cơ bản (ID, tên) của tất cả hội viên để hiển thị dạng dropdown/select.
     *
     * @return array Danh sách ID và họ tên hội viên.
     */
    public function getAllMembersBasicInfo() {
        $stmt = $this->db->query("SELECT member_id, full_name FROM members ORDER BY full_name ASC");
        return $stmt->fetchAll();
    }

    /**
     * Tìm kiếm và lọc danh sách hội viên theo nhiều tiêu chí.
     *
     * @param string $search Từ khóa tìm kiếm theo tên.
     * @param string|int $filter_package ID gói tập để lọc.
     * @param string $filter_status Trạng thái hoạt động hoặc trạng thái gói (Expired/Active/Khác).
     * @return array Danh sách hội viên thỏa mãn bộ lọc.
     */
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
        
        // Truy vấn thông tin hội viên cùng đăng ký gói tập mới nhất của họ
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

    /**
     * Lấy thông tin một hội viên bằng ID.
     *
     * @param int $id ID hội viên.
     * @return array|bool Dữ liệu hội viên hoặc false nếu không tìm thấy.
     */
    public function getMemberById($id) {
        $stmt = $this->db->prepare("SELECT * FROM members WHERE member_id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    /**
     * Thêm mới một hội viên vào cơ sở dữ liệu.
     *
     * @param string $name Họ tên hội viên.
     * @param string $email Địa chỉ email.
     * @param string $password Mật khẩu đã mã hóa.
     * @param string|null $phone Số điện thoại.
     * @param string|null $address Địa chỉ.
     * @param string $gender Giới tính.
     * @param string $status Trạng thái hoạt động.
     * @return string ID của hội viên vừa được tạo.
     */
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

    /**
     * Cập nhật thông tin cơ bản của hội viên từ trang quản trị.
     *
     * @param int $id ID hội viên.
     * @param string $name Họ tên mới.
     * @param string $phone Số điện thoại mới.
     * @param string $address Địa chỉ mới.
     * @param string $status Trạng thái mới.
     * @return bool True nếu thành công.
     */
    public function updateMemberDetails($id, $name, $phone, $address, $status) {
        $stmt = $this->db->prepare("UPDATE members SET full_name=:name, phone_number=:phone, address=:address, status=:status WHERE member_id=:id");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    /**
     * Đổi trạng thái (Status) hoạt động của hội viên.
     *
     * @param int $id ID hội viên.
     * @param string $new_status Trạng thái mới.
     * @return bool True nếu thành công.
     */
    public function toggleStatus($id, $new_status) {
        $stmt = $this->db->prepare("UPDATE members SET status=:status WHERE member_id=:id");
        $stmt->bindParam(':status', $new_status);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    /**
     * Xóa hội viên bằng ID.
     *
     * @param int $id ID hội viên.
     * @return bool True nếu thành công.
     */
    public function deleteMember($id) {
        $stmt = $this->db->prepare("DELETE FROM members WHERE member_id=:id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    /**
     * Cập nhật thông tin hồ sơ cá nhân của hội viên (Hỗ trợ tùy chọn đổi mật khẩu).
     *
     * @param int $member_id ID hội viên.
     * @param string $name Họ tên mới.
     * @param string $email Email mới.
     * @param string $address Địa chỉ mới.
     * @param string $gender Giới tính.
     * @param string|null $password Mật khẩu mới (nếu có).
     * @return bool True nếu thành công.
     */
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
