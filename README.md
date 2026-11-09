# EduMarket

Sàn thương mại điện tử sinh viên, xây dựng bằng HTML/CSS/JavaScript và Node.js. Dữ liệu được lưu trên backend vào SQLite, không còn phụ thuộc vào `localStorage` làm nguồn dữ liệu chính. Trình duyệt giữ một bản cache để giao diện phản hồi nhanh.

## Yêu cầu

- Node.js 22.13 trở lên (SQLite tích hợp `node:sqlite`).
- Không cần cài package bên ngoài.

## Cài đặt và chạy

1. Clone hoặc tải repository về máy.
2. Mở terminal tại thư mục dự án.
3. Chạy `npm start` (hoặc `node server/index.js`).
4. Mở [http://localhost:3000](http://localhost:3000).

Lần chạy đầu tiên tự tạo `server/data/edumarket.sqlite` và nạp dữ liệu mẫu. SQLite database nằm trong thư mục bị Git ignore để dữ liệu cá nhân không bị push lên repository. Các tài khoản mẫu có thể xem trong trang Đăng nhập; dữ liệu mật khẩu trên máy chủ được băm bằng scrypt.

## Deploy

GitHub Pages chỉ phục vụ file tĩnh, không chạy được Node API hay SQLite. Để dùng DB thật, deploy toàn bộ ứng dụng trên một host chạy Node.js với persistent disk. Nếu frontend và API chạy ở hai domain khác nhau, sửa `window.EDUMARKET_API_URL` trong `js/core/model/api-config.js` thành URL API và đặt `EDUMARKET_ALLOWED_ORIGIN` trên backend thành origin frontend được phép.

## Database và API

Backend dùng SQLite qua API tích hợp `node:sqlite`. SQLite có các bảng `users`, `categories`, `products`, `orders`, `order_items`, `cart_items`, `reviews` và `wishlist_items`. Dữ liệu chi tiết được lưu kèm payload JSON để giữ nguyên hợp đồng hiện tại của frontend; backend nạp dữ liệu mẫu lần đầu, hỗ trợ đọc/ghi collection, đăng ký/đăng nhập và cập nhật ví. Các endpoint chính:

- `GET /api/health`
- `GET /api/state`
- `PUT /api/state/:collection`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/users/:id/wallet`

Cấu trúc frontend tiếp tục theo module MVC trong `js/modules`; lớp `Storage` đồng bộ cache với backend, các service nghiệp vụ dùng API cho tài khoản và SQLite cho dữ liệu marketplace.