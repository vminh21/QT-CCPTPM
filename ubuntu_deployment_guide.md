# Hướng Dẫn Triển Khai Backend BTLWeb(PC) Lên Máy Ảo Ubuntu

Tài liệu này tổng hợp chi tiết các bước, từ việc chuyển file trên Mac đến cấu hình toàn diện máy ảo Ubuntu. Tài liệu được viết theo chuẩn để tránh tối đa các lỗi 404 và sự cố về Database.

## Môi trường chuẩn bị
- **Máy host:** macOS (nơi chứa code).
- **Máy đích:** Ubuntu Server/Desktop (đã chạy, có IP ví dụ `192.168.64.16`). Đã được cài SSH Server.

---

## Bước 1: Đẩy mã nguồn từ Mac sang Ubuntu

> [!NOTE]
> Các lệnh trong phần này được chạy trên **Terminal của máy Mac**.
> Nhớ thay `tên_user_ubuntu@192.168.64.16` bằng thông tin thực tế của bạn.

1. **Đẩy file Database SQL:**
```bash
scp GymManagement_export.sql tên_user_ubuntu@192.168.64.16:~/
```

2. **Đẩy toàn bộ thư mục Backend:**
```bash
scp -r backend tên_user_ubuntu@192.168.64.16:~/
```
*(Chờ chạy đủ 100% là xong).*

---

## Bước 2: Cài đặt máy chủ Web và Database (LAMP)

> [!IMPORTANT]
> Từ bước này trở đi, mọi lệnh đều được chạy trên **Terminal của máy ảo Ubuntu**.

1. **Cập nhật hệ thống:**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Cài đặt các dịch vụ thiết yếu:**
```bash
sudo apt install apache2 mysql-server php libapache2-mod-php php-mysql php-cli php-curl php-json php-mbstring -y
```

---

## Bước 3: Đưa Code lên Web và Cấp quyền

1. **Di chuyển thư mục backend vào thư mục web mặc định (`/var/www/html/`):**
```bash
sudo mv ~/backend /var/www/html/
```

2. **Cấp quyền sở hữu cho Apache (`www-data`):**
```bash
sudo chown -R www-data:www-data /var/www/html/backend
```

3. **Cấp quyền ghi cho thư mục uploads (để người dùng up ảnh):**
```bash
sudo chmod -R 775 /var/www/html/backend/uploads
```

---

## Bước 4: Cấu hình Định tuyến (Routing) cho Apache

Backend sử dụng file `.htaccess` để điều hướng API. Nếu không làm kỹ bước này sẽ luôn gặp lỗi 404.

### 4.1. Bật module Rewrite của Apache
```bash
sudo a2enmod rewrite
```

### 4.2. Khắc phục đường dẫn trong `.htaccess`
Lúc làm trên XAMPP, thư mục là `BTLWeb(PC)`, nhưng trên Ubuntu nó đã được tối giản. Cần phải sửa lại:
```bash
sudo nano /var/www/html/backend/api/.htaccess
```
Sửa dòng `RewriteBase` thành như sau (xóa phần `BTLWeb(PC)`):
```apache
RewriteBase /backend/api/
```
*(Bấm `Ctrl + O` để lưu -> `Enter` -> `Ctrl + X` để thoát).*

### 4.3. Cho phép Apache đọc `.htaccess`
Mở cấu hình Virtual Host của Apache:
```bash
sudo nano /etc/apache2/sites-available/000-default.conf
```
Thêm ngay bên dưới dòng `DocumentRoot /var/www/html` đoạn mã sau:
```apache
<Directory /var/www/html>
    AllowOverride All
</Directory>
```
*(Bấm `Ctrl + O` để lưu -> `Enter` -> `Ctrl + X` để thoát).*

### 4.4. Khởi động lại Apache
```bash
sudo systemctl restart apache2
```

---

## Bước 5: Cài đặt và Phục hồi Cơ sở dữ liệu

1. **Đặt mật khẩu cho MySQL trên Ubuntu (để tránh lỗi Access Denied 1698):**
```bash
sudo mysql
```
Chạy các lệnh SQL sau:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';
FLUSH PRIVILEGES;
EXIT;
```

2. **Tạo Database:** 
```bash
mysql -u root -p
# Nhập pass: 123456
```
```sql
CREATE DATABASE gymmanagement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

3. **Import dữ liệu vào Database:**
```bash
mysql -u root -p gymmanagement < ~/GymManagement_export.sql
```

4. **Đồng bộ Config Database của Code:**
Cập nhật file `Database.php` để khớp mật khẩu `123456`
```bash
sudo nano /var/www/html/backend/Config/Database.php
```
Đổi `$pass = '';` thành `$pass = '123456';`

---

## Bước 6: Kiểm tra kết quả

Trên máy Mac, bạn mở trình duyệt hoặc **Postman** và gõ đường dẫn:
```text
http://192.168.64.16/backend/api/packages
```

> [!TIP]
> - Trả về JSON: Thành công mỹ mãn.
> - Trả về `404 Not Found`: Kiểm tra lại Bước 4.2 và Bước 4.3.
> - Trả về lỗi Database (hoặc HTTP 500): Kiểm tra lại file `Database.php` và MySQL.
