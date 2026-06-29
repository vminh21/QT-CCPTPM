<?php
require_once __DIR__ . '/../DAL/ReportRepository.php';

class ReportService {
    private $reportRepo;

    public function __construct() {
        $this->reportRepo = new ReportRepository();
    }

    public function getAvailableYears() {
        return $this->reportRepo->getAvailableYears();
    }

    public function getDashboardStats($year) {
        // 1. Revenue
        $revenuesData = $this->reportRepo->getMonthlyRevenue($year);
        $monthly_revenue = [];
        $revenuesMap = [];
        foreach ($revenuesData as $r) {
            $revenuesMap[(int)$r['m']] = (float)$r['t'];
        }
        
        $grand_total = 0;
        for($i=1; $i<=12; $i++) { 
            $rev = isset($revenuesMap[$i]) ? $revenuesMap[$i] : 0;
            $monthly_revenue[] = [
                'month' => $i,
                'revenue' => $rev
            ];
            $grand_total += $rev;
        }

        // 2. Counts
        $total_transactions = $this->reportRepo->getTotalTransactions($year);
        $new_registrations = $this->reportRepo->getNewRegistrations($year);
        $renewals = $this->reportRepo->getRenewals($year);

        // 3. Gender stats
        $genderData = $this->reportRepo->getGenderStats();
        $gender_stats = ["Male" => 0, "Female" => 0];
        foreach ($genderData as $g) {
            if ($g['gender'] == 'Male') $gender_stats['Male'] = (int)$g['count'];
            if ($g['gender'] == 'Female') $gender_stats['Female'] = (int)$g['count'];
        }

        // 4. Package stats
        $packageData = $this->reportRepo->getPackageStats();
        $package_stats = [];
        foreach ($packageData as $p) {
            $package_stats[] = [
                'name' => $p['package_name'],
                'count' => (int)$p['count']
            ];
        }

        // 5. Top spenders
        $topSpenders = $this->reportRepo->getTopSpenders($year, 5);

        // 6. Recent transactions
        $recentTransactions = $this->reportRepo->getRecentDetailedTransactions($year, 5);

        return [
            'total_revenue' => $grand_total,
            'total_transactions' => $total_transactions,
            'new_registrations' => $new_registrations,
            'renewals' => $renewals,
            'monthly_revenue' => $monthly_revenue,
            'gender_stats' => $gender_stats,
            'package_stats' => $package_stats,
            'top_spenders' => $topSpenders,
            'recent_transactions' => $recentTransactions
        ];
    }
}
?>
