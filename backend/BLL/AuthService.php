<?php
require_once __DIR__ . '/../DAL/AuthRepository.php';

class AuthService {
    private $authRepo;

    public function __construct() {
        $this->authRepo = new AuthRepository();
    }

    /**
     * Authenticate User (Admin or Member)
     * Returns an array with status, user details and redirect URL
     * or an error message.
     */
    public function authenticate($email, $password) {
        // 1. Validate Input
        if (empty($email) && empty($password)) {
            return ['status' => false, 'error' => "Vui lòng nhập đầy đủ Tài khoản và Mật khẩu!"];
        } elseif (empty($email)) {
            return ['status' => false, 'error' => "Vui lòng nhập Email"];
        } elseif (empty($password)) {
            return ['status' => false, 'error' => "Vui lòng nhập Mật khẩu!"];
        }

        // 2. Data Access Layer checks
        // A. Check Admin
        $admin = $this->authRepo->getAdminByCredentials($email, $password);
        if ($admin) {
            return [
                'status' => true,
                'role' => 'admin',
                'user' => [
                    'id' => $admin['admin_id'],
                    'full_name' => $admin['full_name'],
                    'position' => $admin['position']
                ],
                'redirect_url' => '../QL_Members/admin_dashboard.php'
            ];
        }

        // B. Check Trainer (Personal Trainer)
        $trainer = $this->authRepo->getTrainerByCredentials($email, $password);
        if ($trainer) {
            return [
                'status' => true,
                'role' => 'pt',
                'user' => [
                    'id' => $trainer['trainer_id'],
                    'full_name' => $trainer['full_name'],
                ],
                'redirect_url' => '../PT_Dashboard/pt_dashboard.php'
            ];
        }

        // C. Check Member
        $member = $this->authRepo->getMemberByCredentials($email, $password);
        if ($member) {
            return [
                'status' => true,
                'role' => 'member',
                'user' => [
                    'id' => $member['member_id'],
                    'full_name' => $member['full_name'],
                ],
                'redirect_url' => '../index.php'
            ];
        }

        // C. Neither found
        return ['status' => false, 'error' => "Tài khoản hoặc mật khẩu không chính xác!"];
    }

    /**
     * Register new member
     */
    public function register($fullName, $email, $phone, $address, $gender, $password, $confirmPassword) {
        $errors = [];

        if (empty($fullName)) {
            $errors['full_name'] = "Vui lòng nhập họ tên.";
        } elseif (strlen($fullName) < 5) {
            $errors['full_name'] = "Tên hiển thị phải có ít nhất 5 ký tự!";
        }

        if (empty($email)) {
            $errors['email'] = "Vui lòng nhập email.";
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = "Định dạng Email không hợp lệ!";
        } elseif ($this->authRepo->checkMemberExists($email)) {
            $errors['email'] = "Email này đã được đăng ký!";
        }

        if (empty($phone)) {
            $errors['phone'] = "Vui lòng nhập số điện thoại.";
        } elseif (!preg_match('/^[0-9]{10,}$/', $phone)) {
            $errors['phone'] = "Số điện thoại không hợp lệ (ít nhất 10 số)!";
        }

        if (empty($address)) {
            $errors['address'] = "Vui lòng chọn địa chỉ.";
        }

        if (empty($gender)) {
            $errors['gender'] = "Vui lòng chọn giới tính.";
        }

        if (empty($password)) {
            $errors['password'] = "Vui lòng nhập mật khẩu.";
        } elseif (strlen($password) < 8 || !preg_match('/[a-zA-Z]/', $password) || !preg_match('/[0-9]/', $password)) {
            $errors['password'] = "Mật khẩu yếu! Cần ít nhất 8 ký tự, gồm cả chữ và số.";
        }

        if (empty($confirmPassword)) {
            $errors['confirm_pass'] = "Vui lòng xác nhận mật khẩu.";
        } elseif ($password !== $confirmPassword) {
            $errors['confirm_pass'] = "Mật khẩu nhập lại không khớp!";
        }

        if (!empty($errors)) {
            return ['status' => false, 'errors' => $errors];
        }

        // Insert DB
        $result = $this->authRepo->createMember($fullName, $email, $password, $phone, $address, $gender);
        if ($result) {
            return ['status' => true, 'message' => "Đăng ký thành công!"];
        } else {
            return ['status' => false, 'error' => "Lỗi hệ thống khi đăng ký!"];
        }
    }

    /**
     * Check if email exists
     */
    public function checkEmailExists($email) {
        return $this->authRepo->checkMemberExists($email);
    }

    /**
     * Change Password
     */
    public function changePassword($email, $userOTP, $serverOTP, $newPass, $confirmPass) {
        if (empty($userOTP) || empty($newPass) || empty($confirmPass)) {
            return ['status' => false, 'error' => "Vui lòng nhập đầy đủ tất cả các trường."];
        } 
        if ($userOTP != $serverOTP) {
            return ['status' => false, 'error' => "Mã xác thực (OTP) không chính xác."];
        } 
        if (strlen($newPass) < 6) {
            return ['status' => false, 'error' => "Mật khẩu mới phải có ít nhất 6 ký tự."];
        }
        if ($newPass !== $confirmPass) {
            return ['status' => false, 'error' => "Mật khẩu xác nhận không trùng khớp."];
        }

        $result = $this->authRepo->updatePassword($email, $newPass);
        if ($result) {
            return ['status' => true];
        }
        return ['status' => false, 'error' => "Đã xảy ra lỗi trong quá trình cập nhật. Vui lòng thử lại."];
    }

    /**
     * Tìm kiếm Role của user bằng email
     */
    public function findUserRoleByEmail($email) {
        return $this->authRepo->findUserRoleByEmail($email);
    }

    /**
     * Đổi mật khẩu dựa trên role
     */
    public function resetPassword($email, $role, $newPassword) {
        return $this->authRepo->updatePasswordByRole($email, $role, $newPassword);
    }
}
?>
