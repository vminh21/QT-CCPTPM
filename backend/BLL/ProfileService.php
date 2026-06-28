<?php
require_once __DIR__ . '/../DAL/MemberRepository.php';
require_once __DIR__ . '/../DAL/SubscriptionRepository.php';
require_once __DIR__ . '/../DAL/TransactionRepository.php';
require_once __DIR__ . '/../DAL/PackageRepository.php';
require_once __DIR__ . '/../DAL/NotificationRepository.php';

class ProfileService {
    private $memberRepo;
    private $subRepo;
    private $transRepo;
    private $pkgRepo;
    private $notifRepo;

    public function __construct() {
        $this->memberRepo = new MemberRepository();
        $this->subRepo    = new SubscriptionRepository();
        $this->transRepo  = new TransactionRepository();
        $this->pkgRepo    = new PackageRepository();
        $this->notifRepo  = new NotificationRepository();
    }

    public function getProfileData($member_id) {
        $member = $this->memberRepo->getMemberById($member_id);

        // Tự động expire gói đã hết hạn theo ngày nhưng chưa được cập nhật status
        $this->subRepo->autoExpireStaleSubscriptions($member_id);

        $active_sub = $this->subRepo->getActiveSubscriptionDetails($member_id);
        
        $days_left = 0;
        if ($active_sub && isset($active_sub['end_date'])) {
            $today = new DateTime();
            $expiry = new DateTime($active_sub['end_date']);
            if ($expiry >= $today) {
                $days_left = $today->diff($expiry)->days + 1;
            }
        }

        $packages = $this->pkgRepo->getAllPackages();
        $transactions = $this->transRepo->getTransactionsByMemberDesc($member_id);

        return [
            'member'       => $member,
            'active_sub'   => $active_sub,
            'days_left'    => $days_left,
            'packages'     => $packages,
            'transactions' => $transactions
        ];
    }

    public function updateProfile($member_id, $name, $email, $address, $gender, $password) {
        return $this->memberRepo->updateProfile($member_id, $name, $email, $address, $gender, $password);
    }

    // ====== HỦY GÓI TẬP ======
    public function cancelSubscription($member_id) {
        return $this->subRepo->cancelActiveSubscription($member_id);
    }

    // ====== THÔNG BÁO CÁ NHÂN ======
    public function getPersonalNotifications($member_id) {
        return $this->notifRepo->getNotificationsByMember($member_id);
    }
}
?>
