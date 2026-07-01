<?php
require_once __DIR__ . '/../Config/Database.php';

/**
 * PackageRepository
 *
 * Lớp truy vấn cơ sở dữ liệu (DAL) cho bảng membership_packages và package_trainers.
 */
class PackageRepository {
    /** @var PDO Đối tượng kết nối cơ sở dữ liệu */
    private $db;

    /**
     * Khởi tạo và thiết lập kết nối cơ sở dữ liệu.
     */
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Lấy danh sách toàn bộ các gói tập hiện có.
     *
     * @return array Danh sách các gói tập kèm theo số tháng quy đổi.
     */
    public function getAllPackages() {
        $stmt = $this->db->query("
            SELECT *,
                   ROUND(duration_days / 30) AS duration_months
            FROM membership_packages
            ORDER BY price ASC
        ");
        return $stmt->fetchAll();
    }

    /**
     * Lấy thông tin chi tiết một gói tập bằng ID.
     *
     * @param int $package_id ID gói tập.
     * @return array|bool Dữ liệu chi tiết gói tập hoặc false nếu không tìm thấy.
     */
    public function getPackageById($package_id) {
        $stmt = $this->db->prepare("
            SELECT *,
                   ROUND(duration_days / 30) AS duration_months
            FROM membership_packages
            WHERE package_id = :id
            LIMIT 1
        ");
        $stmt->bindParam(':id', $package_id, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch();
    }

    /**
     * Lấy danh sách các huấn luyện viên (HLV) liên kết với một gói tập.
     *
     * @param int $package_id ID gói tập.
     * @return array Danh sách huấn luyện viên liên kết.
     */
    public function getTrainersByPackage($package_id) {
        $stmt = $this->db->prepare("
            SELECT t.* 
            FROM trainers t 
            JOIN package_trainers pt ON t.trainer_id = pt.trainer_id 
            WHERE pt.package_id = ?
        ");
        $stmt->execute([$package_id]);
        return $stmt->fetchAll();
    }

    /**
     * Gán (phân công) một HLV quản lý hoặc hỗ trợ gói tập cụ thể.
     *
     * @param int $package_id ID gói tập.
     * @param int $trainer_id ID huấn luyện viên.
     * @return bool True nếu thành công.
     */
    public function assignTrainerToPackage($package_id, $trainer_id) {
        $stmt = $this->db->prepare("INSERT IGNORE INTO package_trainers (package_id, trainer_id) VALUES (?, ?)");
        return $stmt->execute([$package_id, $trainer_id]);
    }

    /**
     * Xóa bỏ liên kết của HLV khỏi một gói tập cụ thể.
     *
     * @param int $package_id ID gói tập.
     * @param int $trainer_id ID huấn luyện viên.
     * @return bool True nếu thành công.
     */
    public function removeTrainerFromPackage($package_id, $trainer_id) {
        $stmt = $this->db->prepare("DELETE FROM package_trainers WHERE package_id = ? AND trainer_id = ?");
        return $stmt->execute([$package_id, $trainer_id]);
    }
}
?>
