# Kế Hoạch Đóng Gói Dự Án BTLWeb(PC) Bằng Docker

Tài liệu này mô tả chi tiết kiến trúc và các file tôi sẽ tạo/sửa để "Docker hóa" toàn bộ dự án của bạn. 

---

## 1. Kiến Trúc Hệ Thống (Docker Architecture)

Hệ thống sẽ được chia thành **3 Containers (Hộp chứa)** chạy hoàn toàn độc lập nhưng có thể giao tiếp với nhau qua một mạng nội bộ ảo (Docker Network):

1. **Container `db` (Database):**
   - Chạy hệ quản trị cơ sở dữ liệu MySQL 8.0.
   - Tự động lấy file `GymManagement_export.sql` để tạo bảng và nạp dữ liệu mồi khi chạy lần đầu tiên.
   - Lưu trữ dữ liệu ra ngoài máy thật (Volumes) để không bị mất data khi tắt máy.

2. **Container `backend` (API Server):**
   - Chạy máy chủ Apache và PHP 8.2.
   - Tự động cài đặt các tiện ích mở rộng (PDO MySQL, cấu hình mod_rewrite) như ta đã làm trên Ubuntu.
   - Map (nối) thư mục `backend` của máy bạn thẳng vào container để bạn sửa code PHP trên Mac thì trong container cũng cập nhật tức thì.

3. **Container `frontend` (Giao diện React):**
   - Chạy môi trường Node.js.
   - Tự động chạy lệnh `npm install` và `npm run dev` để phục vụ giao diện tại cổng 5173.

---

## 2. Các File Sẽ Được Tạo Mới

Tôi sẽ viết code để tạo ra 3 file quan trọng sau:

- **`docker-compose.yml` (Nằm ở thư mục gốc):** Đây là "bản nhạc trưởng", nơi khai báo cấu hình liên kết cả 3 container (db, backend, frontend) lại với nhau.
- **`backend/Dockerfile`:** Chứa các lệnh cài đặt môi trường cho PHP & Apache (thay thế việc gõ lệnh apt install trên Ubuntu).
- **`frontend/Dockerfile`:** Chứa lệnh cài đặt Node.js và khởi chạy ReactJS.
- **`.dockerignore`:** Danh sách các file rác/nặng không cần cho vào container (VD: file zip, node_modules).

---

## 3. Các File Code Sẽ Bị Thay Đổi Nhẹ

Để các Container giao tiếp được với nhau, tôi sẽ chỉ điều chỉnh nhẹ 2 file cấu hình hiện tại của bạn:

1. **`backend/Config/Database.php`:** 
   - Đổi dòng `$host = 'localhost'` thành `$host = 'db'`. 
   *(Lý do: Trong môi trường Docker, các hệ thống tìm thấy nhau thông qua tên của container thay vì localhost).*

2. **`frontend/vite.config.js`:**
   - Đổi Proxy để nó hướng các API request từ React sang container `backend` thay vì trỏ tới `192.168.64.16` hay `localhost` của XAMPP.

---

## 4. Cách Sử Dụng Sau Khi Tôi Làm Xong

Sau khi tôi tạo xong các file trên, bạn chỉ cần làm 2 bước duy nhất:
1. Mở ứng dụng **Docker Desktop** trên Mac lên.
2. Mở Terminal tại thư mục `BTLWeb(PC)` và gõ:
   ```bash
   docker-compose up --build
   ```
Toàn bộ Frontend, Backend và Database sẽ tự động mọc lên. Bạn chỉ việc vào `http://localhost:5173` để code tiếp!

> [!IMPORTANT]
> **Câu hỏi dành cho bạn trước khi tôi bắt tay vào code:**
> Ở Database MySQL trong Docker này, bạn muốn đặt mật khẩu root là rỗng (`''`) hay là đặt thành (`123456`)? Hãy chốt cho tôi để tôi bắt đầu tạo file nhé!
