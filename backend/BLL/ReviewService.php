<?php
require_once __DIR__ . '/../DAL/ReviewRepository.php';

class ReviewService {
    private $reviewRepo;

    public function __construct() {
        $this->reviewRepo = new ReviewRepository();
    }

    public function submitReview($trainer_id, $member_id, $rating, $comment) {
        if ($rating < 1 || $rating > 5) {
            return "Điểm đánh giá phải từ 1 đến 5.";
        }
        $success = $this->reviewRepo->addOrUpdateReview($trainer_id, $member_id, $rating, $comment);
        return $success ? "Cảm ơn bạn đã gửi đánh giá!" : "Có lỗi xảy ra khi lưu đánh giá.";
    }

    public function getReviewByMemberAndTrainer($member_id, $trainer_id) {
        return $this->reviewRepo->getReviewByMemberAndTrainer($member_id, $trainer_id);
    }

    public function getReviewsByTrainer($trainer_id) {
        return $this->reviewRepo->getReviewsByTrainer($trainer_id);
    }
}
?>
