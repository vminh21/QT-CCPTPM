FROM node:20-alpine

WORKDIR /app

# Cài đặt thư viện trước để tận dụng cache của Docker
COPY package.json ./
RUN rm -rf package-lock.json node_modules && npm install

# Môi trường dev sẽ nối code vào đây bằng Volumes, 
# nên không cần COPY toàn bộ code vào image ngay lúc build.
