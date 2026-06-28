<?php
require_once __DIR__ . '/../DAL/MemberRepository.php';
require_once __DIR__ . '/../DAL/PackageRepository.php';
require_once __DIR__ . '/../DAL/SubscriptionRepository.php';
require_once __DIR__ . '/../DAL/TransactionRepository.php';

class MemberService {
    private $memberRepo;
    private $packageRepo;
    private $subRepo;
    private $transRepo;

    public function __construct() {
        $this->memberRepo = new MemberRepository();
        $this->packageRepo = new PackageRepository();
        $this->subRepo = new SubscriptionRepository();
        $this->transRepo = new TransactionRepository();
    }

    public function getPackages() {
        return $this->packageRepo->getAllPackages();
    }

    public function searchMembers($search, $filter_package, $filter_status) {
        $this->subRepo->autoExpireALLStaleSubscriptions();
        return $this->memberRepo->searchMembers($search, $filter_package, $filter_status);
    }

    public function saveMember($id, $name, $phone, $address, $status, $package_id = null, $start_date = null, $end_date = null) {
        if (empty($id)) {
            $email    = "mem_" . time() . "@fit.com";
            $password = password_hash("123456", PASSWORD_BCRYPT);

            try {
                $this->transRepo->beginTransaction();

                $new_id = $this->memberRepo->createMember($name, $email, $password, $phone, $address, 'Male', $status);
                
                if (!empty($package_id)) {
                    $this->subRepo->createSubscription($new_id, $package_id, $start_date, $end_date);
                    
                    $packages = $this->getPackages();
                    $amount = 0;
                    foreach ($packages as $pkg) {
                        if ($pkg['package_id'] == $package_id) {
                            $amount = $pkg['price'];
                            break;
                        }
                    }
                    
                    $this->transRepo->createTransaction($new_id, $amount, 'Tiền mặt', 'Registration');
                }
                
                $this->transRepo->commit();
                return "success";
            } catch (Exception $e) {
                $this->transRepo->rollBack();
                return "error";
            }
        } else {
            $success = $this->memberRepo->updateMemberDetails($id, $name, $phone, $address, $status);
            
            // Nếu admin đổi gói tập từ giao diện edit
            if (!empty($package_id) && !empty($start_date) && !empty($end_date)) {
                $activeSub = $this->subRepo->getActiveSubscriptionDetails($id);
                // Nếu khác package hoặc khác end_date thì mới update
                if (!$activeSub || $activeSub['package_id'] != $package_id || $activeSub['end_date'] != $end_date) {
                    // Đánh dấu các gói hiện tại là hết hạn thay vì update đè
                    $this->subRepo->expireActiveSubscriptions($id);
                    // Tạo gói mới
                    $this->subRepo->createSubscription($id, $package_id, $start_date, $end_date);
                }
            }
            
            return $success ? "success" : "error";
        }
    }

    public function toggleMemberStatus($id, $current_status) {
        $new_status = ($current_status == 'Active') ? 'Inactive' : 'Active';
        $success = $this->memberRepo->toggleStatus($id, $new_status);
        return $success ? "updated" : "error";
    }

    public function deleteMember($id) {
        $success = $this->memberRepo->deleteMember($id);
        return $success ? "deleted" : "error";
    }
}
?>
