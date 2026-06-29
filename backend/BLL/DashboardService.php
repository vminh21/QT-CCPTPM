<?php
require_once __DIR__ . '/../DAL/DashboardRepository.php';
require_once __DIR__ . '/../DAL/MemberRepository.php';

class DashboardService {
    private $dashboardRepo;
    private $memberRepo;

    public function __construct() {
        $this->dashboardRepo = new DashboardRepository();
        // Sẽ gọi MemberRepository để lấy danh sách tên thành viên cho combo box
        $this->memberRepo = new MemberRepository();
    }

    public function getDashboardStats() {
        return [
            'total_members' => $this->dashboardRepo->getTotalMembers(),
            'active_members' => $this->dashboardRepo->getActiveMembers(),
            'expired_members' => $this->dashboardRepo->getExpiredMembers(),
            'total_revenue' => $this->dashboardRepo->getTotalRevenue()
        ];
    }

    public function getRecentTransactions($searchName = '', $searchType = '') {
        return $this->dashboardRepo->getRecentTransactions($searchName, $searchType);
    }

    public function getMemberListForDropdown() {
        return $this->memberRepo->getAllMembersBasicInfo();
    }
}
?>
