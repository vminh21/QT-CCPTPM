<?php
require_once __DIR__ . '/../DAL/TransactionRepository.php';
require_once __DIR__ . '/../DAL/SubscriptionRepository.php';
require_once __DIR__ . '/../DAL/MemberRepository.php';

class TransactionService {
    private $transRepo;
    private $subRepo;
    private $memberRepo;

    public function __construct() {
        $this->transRepo = new TransactionRepository();
        $this->subRepo = new SubscriptionRepository();
        $this->memberRepo = new MemberRepository();
    }

    public function createTransaction($member_id, $amount, $type, $method, $new_member_name = null) {
        $has_sub = false;
        if ($member_id !== "new_member") {
            $has_sub = $this->subRepo->checkSubscriptionExists($member_id);
        }

        if ($member_id === "new_member" && $type === "Renewal") {
            return "error_renewal_new";
        }
        if ($has_sub && $type === "Registration") {
            return "error_reg_exists";
        }
        if (!$has_sub && $member_id !== "new_member" && $type === "Renewal") {
            return "error_renewal_not_found";
        }

        $months_to_add = 1;
        $package_id = 1;
        if ($amount == "1350000") { $package_id = 2; $months_to_add = 3; }
        elseif ($amount == "5000000") { $package_id = 3; $months_to_add = 12; }

        try {
            $this->transRepo->beginTransaction();

            if ($member_id === "new_member") {
                $fake_email = "user_" . time() . "@gym.com";
                // Create new member via MemberRepository
                $member_id = $this->memberRepo->createMember($new_member_name, $fake_email, '123456');
                $type = "Registration";
            }

            // Create Transaction
            $this->transRepo->createTransaction($member_id, $amount, $method, $type);

            // Update Subscription
            $today = new DateTime();
            $sub = $this->subRepo->getSubscriptionByMember($member_id);
            
            if ($sub) {
                $current_end_date = new DateTime($sub['end_date']);
                $start_calc = ($current_end_date > $today) ? $current_end_date : $today;
                $start_calc->modify("+$months_to_add month");
                $new_end_date = $start_calc->format('Y-m-d');

                $this->subRepo->updateSubscription($member_id, $package_id, $new_end_date);
            } else {
                $new_date = clone $today;
                $new_date->modify("+$months_to_add month");
                $new_end_date = $new_date->format('Y-m-d');
                $today_str = $today->format('Y-m-d');

                $this->subRepo->createSubscription($member_id, $package_id, $today_str, $new_end_date);
            }

            $this->transRepo->commit();
            return "success";
        } catch (Exception $e) {
            $this->transRepo->rollBack();
            return "error";
        }
    }

    public function updateTransaction($t_id, $m_id, $amount, $type, $method, $end_date) {
        if ($type === 'Registration') {
            if ($this->transRepo->checkMultipleRegistrations($m_id, $t_id)) {
                return "error_multiple_reg";
            }
        }

        try {
            $this->transRepo->beginTransaction();

            $this->transRepo->updateTransaction($t_id, $amount, $method, $type);
            $this->subRepo->updateSubscription($m_id, 1, $end_date); // Note: package_id should be properly set, default 1 for now

            $this->transRepo->commit();
            return "updated";
        } catch (Exception $e) {
            $this->transRepo->rollBack();
            return "error";
        }
    }

    public function deleteTransaction($t_id) {
        $trans = $this->transRepo->getTransactionById($t_id);
        if (!$trans) return "error";

        $m_id = $trans['member_id'];
        
        try {
            $this->transRepo->beginTransaction();
            $this->transRepo->deleteTransaction($t_id);
            
            $remaining = $this->transRepo->getMemberTransactionsAsc($m_id);

            if (count($remaining) > 0) {
                $calc_date = null;
                $first_trans = true;
                $last_package_id = 1;

                foreach ($remaining as $row) {
                    $amt = $row['amount'];
                    $months = 1; $current_pkg_id = 1;
                    if ($amt == "1350000") { $months = 3; $current_pkg_id = 2; }
                    elseif ($amt == "5000000") { $months = 12; $current_pkg_id = 3; }

                    if ($first_trans) {
                        $calc_date = new DateTime($row['transaction_date']);
                        $first_trans = false;
                    }
                    $calc_date->modify("+$months month");
                    $last_package_id = $current_pkg_id;
                }
                
                $new_expiry = $calc_date->format('Y-m-d');
                $new_status = (new DateTime($new_expiry) >= new DateTime()) ? 'Active' : 'Expired';

                $this->subRepo->updateSubscription($m_id, $last_package_id, $new_expiry, $new_status);
            } else {
                $this->subRepo->deleteSubscription($m_id);
                // Also delete member if no transactions left
                $this->memberRepo->deleteMember($m_id);
            }

            $this->transRepo->commit();
            return "deleted";
        } catch (Exception $e) {
            $this->transRepo->rollBack();
            return "error";
        }
    }
}
?>
