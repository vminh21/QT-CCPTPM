# Cẩm Nang Triển Khai Docker Lên Ubuntu (Từ A đến Z)

Tài liệu này ghi chú lại toàn bộ quy trình đẩy mã nguồn Backend + Database từ máy Mac nội bộ lên máy chủ Ubuntu bằng kiến trúc **Docker Decoupled Architecture**.

---

## BƯỚC 1: Đóng gói mã nguồn (Thực hiện trên Mac)

Trong môi trường Production, ta cần nhúng chặt code vào bên trong Image của Docker thay vì nối Volume như lúc lập trình.

1. Đảm bảo bạn đã có file `Dockerfile.prod` (copy code vào `/var/www/html/backend`).
2. Đảm bảo bạn đã có file `docker-compose.prod.yml` (chỉ chứa DB và Backend, mở cổng 80).
3. Mở Terminal máy Mac, di chuyển vào thư mục dự án và nén các file cần thiết:
```bash
cd "/Applications/XAMPP/xamppfiles/htdocs/BTLWeb(PC)"
zip -r backend_deploy.zip backend/ docker-compose.prod.yml GymManagement_export.sql .dockerignore
```

---

## BƯỚC 2: Truyền file sang Ubuntu (Thực hiện trên Mac)

Vẫn tại Terminal của máy Mac, bắn file zip vừa nén sang máy ảo Ubuntu (nhớ thay đổi IP và Username nếu cần):

```bash
scp "/Applications/XAMPP/xamppfiles/htdocs/BTLWeb(PC)/backend_deploy.zip" vanminh@192.168.64.16:~/
```
*(Nếu Terminal hỏi mật khẩu thì nhập mật khẩu máy tính Ubuntu vào).*

---

## BƯỚC 3: Dọn dẹp môi trường cũ (Thực hiện trên Ubuntu)

Bây giờ bạn dùng Terminal (hoặc SSH) để đăng nhập vào con Ubuntu. Nếu máy ảo Ubuntu từng cài chay Apache hoặc MySQL, bạn bắt buộc phải **nhổ cỏ tận gốc** chúng để giải phóng cổng mạng (Port 80 và 3306) cho Docker.

Chạy lần lượt 3 lệnh dọn rác sau:
```bash
# 1. Gỡ cài đặt tận gốc Apache và MySQL
sudo apt-get purge -y apache2 mysql-server mysql-client mysql-common mysql-server-core-* mysql-client-core-*

# 2. Xóa các thư viện thừa thãi
sudo apt-get autoremove -y

# 3. Xóa luôn 3 thư mục dữ liệu cũ để dọn trống ổ cứng
sudo rm -rf /etc/apache2 /etc/mysql /var/lib/mysql /var/www/html
```

---

## BƯỚC 4: Cài đặt Docker và Giải nén (Thực hiện trên Ubuntu)

Vẫn trên Terminal của máy Ubuntu, chạy lệnh cài đặt nền tảng Docker:

```bash
# Cập nhật danh sách gói phần mềm
sudo apt-get update

# Cài đặt Docker, Docker Compose và Unzip
sudo apt-get install -y docker.io docker-compose unzip
```

Sau khi cài xong, giải nén file mã nguồn mà bạn vừa bắn từ máy Mac sang:
```bash
unzip backend_deploy.zip -d backend_deploy
cd backend_deploy
```

---

## BƯỚC 5: Khởi động hệ thống Docker (Thực hiện trên Ubuntu)

Đứng bên trong thư mục `backend_deploy` vừa giải nén, gõ câu lệnh "phép thuật" để dựng toàn bộ hệ thống lên:

```bash
sudo docker-compose -f docker-compose.prod.yml up -d --build
```

**Hoàn tất!**
- Lệnh `--build` sẽ tự động tải Image MySQL và Image PHP, cài đặt các tiện ích (PDO MySQL) và nhúng code của bạn vào trong.
- Lệnh `-d` giúp hệ thống chạy ngầm để bạn có thể tắt Terminal mà web không bị sập.

**Kiểm tra:**
Bạn có thể mở trình duyệt hoặc JMeter và truy cập trực tiếp vào `http://192.168.64.16/backend/api/auth/login`. Mọi thứ đã sẵn sàng phục vụ theo chuẩn Production!
