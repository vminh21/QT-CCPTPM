# FitPhysique - Hệ Thống Quản Lý Phòng Gym Hiện Đại 🏋️‍♂️

![FitPhysique Banner](https://img.shields.io/badge/Architecture-3--Layer-blue)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20PHP%20%7C%20MySQL-orange)
![Auth](https://img.shields.io/badge/Security-JWT-green)

Dự án **FitPhysique** là một ứng dụng quản lý phòng tập Gym chuyên nghiệp, được xây dựng với kiến trúc tách biệt hoàn toàn giữa Frontend (React) và Backend (PHP RESTful API). Hệ thống hỗ trợ đa vai trò (Admin, PT, Member) với trải nghiệm người dùng mượt mà và bảo mật cao.

---

## 🌟 Tính Năng Nổi Bật

### 🔐 Bảo Mật & Xác Thực
*   **JWT Authentication:** Sử dụng JSON Web Token để quản lý phiên làm việc không trạng thái (Stateless).
*   **Role-based Authorization:** Phân quyền nghiêm ngặt giữa Admin, Huấn luyện viên (PT) và Hội viên.
*   **Bcrypt Hashing:** Tự động nâng cấp mật khẩu từ văn bản thuần sang mã hóa Bcrypt bảo mật cao.

### 👨‍🏫 Module Huấn Luyện Viên (PT)
*   **Lịch Dạy Thông Minh:** Quản lý lịch tuần thông qua giao diện **FullCalendar** trực quan.
*   **Quản Lý Học Viên:** Theo dõi danh sách học viên đang theo tập.
*   **Dashboard PT:** Thống kê nhanh các buổi tập sắp tới và số lượng học viên.

### 👤 Module Hội Viên (Member)
*   **Hồ Sơ Cá Nhân:** Quản lý thông tin, đổi mật khẩu và xem hạng Membership.
*   **Lịch Tập Luyện:** Theo dõi và xác nhận lịch tập với PT.
*   **Bảng Tin & Kiến Thức:** Xem các bài viết mới nhất về sức khỏe và bài tập.
*   **Đăng Ký Gói Tập:** Hệ thống thanh toán và đăng ký gói tập trực tuyến.

---

## 🛠️ Kiến Trúc Hệ Thống (3-Tier Architecture)

Dự án tuân thủ nghiêm ngặt mô hình 3 lớp để đảm bảo tính mở rộng:
1.  **Presentation Tier:** React.js (Vite) + Tailwind CSS + Axios.
2.  **Business Logic Tier (BLL):** PHP xử lý logic nghiệp vụ, Validation, JWT Handling.
3.  **Data Access Tier (DAL):** Sử dụng PDO và Singleton Pattern để tối ưu hóa kết nối Database.

---

## ⚙️ Hướng Dẫn Cài Đặt

### 1. Backend (PHP & MySQL)
1. Copy thư mục `backend` vào `C:/xampp/htdocs/BTLWeb(PC)/`.
2. Mở **phpMyAdmin**, tạo database tên `gymmanagement`.
3. Import file SQL trong thư mục `database/gymmanagement.sql`.
4. Cấu hình tại `backend/Config/Database.php`.

### 2. Frontend (React)
1. Truy cập thư mục `frontend`.
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Chạy môi trường phát triển:
   ```bash
   npm run dev
   ```

---

## 👥 Phân Công Thành Viên (Nhóm 9)

| STT | Họ và tên | Chức vụ | Điểm tự đánh giá | Nhiệm vụ chi tiết |
| :-- | :--- | :--- | :---: | :--- |
| 1 | **Nguyễn Văn Minh** | Nhóm trưởng | 9 | Phân tích nghiệp vụ, thiết kế kiến trúc hệ thống, thuyết trình, PowerPoint, Module (Đăng nhập, đăng ký, quên mật khẩu, phân quyền, quản lý lịch tập, giáo trình, dashboard PT) |
| 2 | **Nhữ Tùng Lâm** | Thành viên | 9 | Thiết kế hệ thống, Báo cáo, Phân tích nghiệp vụ, Module (Làm giao diện và chức năng trang người dùng, lịch sử giao dịch, thanh toán) |
| 3 | **Hồ Minh Nhật** | Thành viên | 9 | Thiết kế hệ thống, Báo cáo, Vẽ sơ đồ UML, Module (Làm giao diện và chức năng trang tổng quan (dashboard), quản lý users) |
| 4 | **Nguyễn Hoàng Hiệp** | Thành viên | 9 | Thiết kế hệ thống, Thiết kế kiến trúc hệ thống, PowerPoint, Vẽ sơ đồ UML, Module (Làm giao diện và chức năng trang quản lý thông báo, quản lý tin tức, tính BMI) |
| 5 | **Nguyễn Anh Tuấn** | Thành viên | 9 | Thiết kế hệ thống, Báo cáo, Module (Làm giao diện và chức năng trang bodybuilding, cardio, fitness, crossfit, thống kê doanh thu, quản lý nhân sự) |
| 6 | **Đàm Đình Long** | Thành viên | 9 | Thiết kế hệ thống, Báo cáo, Phân tích nghiệp vụ, Module (Quản lý PT, quản lý máy tập) |

---

## 📞 Liên Hệ
*   **Repo:** [https://github.com/vminh21/Gymweb.git](https://github.com/vminh21/Gymweb.git)
*   **Giảng viên hướng dẫn:** Thầy Trần Đức Thắng

---
<p align="center">Made with ❤️ by Group 4</p>
