FROM php:8.2-apache

# Cài đặt các extension bắt buộc cho kết nối DB
RUN docker-php-ext-install pdo pdo_mysql

# Bật mod_rewrite cho API (y hệt trên Ubuntu)
RUN a2enmod rewrite

# Cấp quyền cho Apache được phép đọc file .htaccess (y hệt bước sửa file 000-default.conf)
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Thiết lập thư mục làm việc mặc định
WORKDIR /var/www/html/backend
