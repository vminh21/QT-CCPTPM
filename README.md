# FitPhysique - Hệ Thống Quản Lý Phòng Gym Hiện Đại 🏋️‍♂️

![FitPhysique Banner](https://img.shields.io/badge/Architecture-Microservices-blue)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20PHP%20%7C%20MariaDB-orange)
![Deployment](https://img.shields.io/badge/Deploy-Docker%20%7C%20Vercel%20%7C%20DigitalOcean-brightgreen)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-red)

Dự án **FitPhysique** là một ứng dụng quản lý phòng tập Gym chuyên nghiệp. Hệ thống được thiết kế theo tư tưởng Microservices tách biệt hoàn toàn giữa Frontend (React/Vite) và Backend (PHP RESTful API), đồng thời áp dụng chuẩn công nghiệp tự động hóa triển khai bằng Docker và GitHub Actions.

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
*   **Đăng Ký Gói Tập:** Hệ thống thanh toán và đăng ký gói tập trực tuyến.

---

## 🛠️ Kiến Trúc Hệ Thống & Triển Khai (Cloud Deployment)

Hệ thống được thiết kế để vận hành hoàn hảo trên môi trường Cloud:
1.  **Frontend (Presentation):** React.js (Vite) + Tailwind CSS. Triển khai tự động (Auto-deploy) lên nền tảng đám mây siêu tốc **Vercel**.
2.  **Backend (API Server):** PHP 8.2 xử lý logic nghiệp vụ, Validation, JWT Handling. Đóng gói bằng **Docker** (Containerized) và chạy trên máy chủ vật lý **DigitalOcean**.
3.  **Database:** **MariaDB 10.4** cấu hình Volume chống mất dữ liệu, giao tiếp trong mạng ảo nội bộ (Docker Network).
4.  **Tự động hóa CI/CD:** Sử dụng **GitHub Actions** để tự động kiểm duyệt cú pháp mã nguồn và triển khai bản cập nhật mới nhất (Continuous Deployment) lên máy chủ mà không cần thao tác thủ công.

---

## ⚙️ Hướng Dẫn Khởi Chạy (Môi trường Dev)

### 1. Khởi động Backend & Database (Bằng Docker)
Hệ thống sử dụng Docker để đồng bộ môi trường. Bạn **không cần** cài đặt XAMPP hay MySQL trên máy cá nhân.
1. Mở Terminal tại thư mục gốc của dự án.
2. Chạy lệnh xây dựng và khởi động cụm Server ngầm:
   ```bash
   docker-compose up -d --build
   ```
3. Docker sẽ tự động tải PHP, MariaDB và nạp dữ liệu mồi từ file `GymManagement_export.sql`. API Backend sẽ hoạt động tại cổng `80` (hoặc cấu hình tùy chỉnh).

### 2. Khởi động Frontend (React)
1. Truy cập thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt thư viện:
   ```bash
   npm install
   ```
3. Chạy môi trường phát triển:
   ```bash
   npm run dev
   ```

---

## 👥 Phân Công Thành Viên

| STT | Họ và tên | Chức vụ | Nhiệm vụ chi tiết |
| :-- | :--- | :--- | :--- |
| 1 | **Nguyễn Văn Minh** | Nhóm trưởng | Phân tích nghiệp vụ, thiết kế kiến trúc hệ thống, thuyết trình, PowerPoint, Module (Đăng nhập, đăng ký, phân quyền, quản lý lịch tập, giáo trình, Thiết lập hệ thống CI/CD & Docker Cloud) |
| 2 | **Nhữ Tùng Lâm** | Thành viên | Thiết kế hệ thống, Báo cáo, Phân tích nghiệp vụ, Module (Làm giao diện và chức năng trang người dùng, lịch sử giao dịch, thanh toán) |
| 3 | **Hồ Minh Nhật** | Thành viên | Thiết kế hệ thống, Báo cáo, Vẽ sơ đồ UML, Module (Làm giao diện và chức năng trang tổng quan (dashboard), quản lý users) |
| 4 | **Nguyễn Hoàng Hiệp** | Thành viên | Thiết kế hệ thống, Thiết kế kiến trúc hệ thống, PowerPoint, Vẽ sơ đồ UML, Module (Làm giao diện và chức năng trang quản lý thông báo, quản lý tin tức, tính BMI) |
| 5 | **Nguyễn Anh Tuấn** | Thành viên | Thiết kế hệ thống, Báo cáo, Module (Làm giao diện và chức năng trang bodybuilding, cardio, fitness, crossfit, thống kê doanh thu, quản lý nhân sự) |

---

## 📞 Liên Hệ
*   **Kho lưu trữ:** [https://github.com/vminh21/QT-CCPTPM](https://github.com/vminh21/QT-CCPTPM)
*   **Giảng viên hướng dẫn:** Thầy Nguyễn Văn Cường

---
<p align="center">Made with ❤️ by FitPhysique Team</p>
