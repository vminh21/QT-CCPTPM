<?php
require_once __DIR__ . '/../Config/Database.php';

class PackageRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAllPackages() {
        $stmt = $this->db->query("
            SELECT *,
                   ROUND(duration_days / 30) AS duration_months
            FROM membership_packages
            ORDER BY price ASC
        ");
        return $stmt->fetchAll();
    }

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

    public function assignTrainerToPackage($package_id, $trainer_id) {
        $stmt = $this->db->prepare("INSERT IGNORE INTO package_trainers (package_id, trainer_id) VALUES (?, ?)");
        return $stmt->execute([$package_id, $trainer_id]);
    }

    public function removeTrainerFromPackage($package_id, $trainer_id) {
        $stmt = $this->db->prepare("DELETE FROM package_trainers WHERE package_id = ? AND trainer_id = ?");
        return $stmt->execute([$package_id, $trainer_id]);
    }
}
?>
