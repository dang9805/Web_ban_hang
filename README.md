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

Lần chạy đầu tiên tự tạo `server/data/edumarket.sqlite` và nạp dữ liệu mẫu. SQLite database nằm trong thư mục bị Git ignore để dữ liệu cá nhân không bị push lên repository. Các tài khoản mẫu có thể xem trong trang Đăng nhập; mật khẩu được băm bằng scrypt.

## Xác thực và phân quyền

- Đăng nhập/đăng ký qua API trả JWT HS256 hết hạn sau 60 phút. Frontend giữ access token trong `sessionStorage`; đăng xuất sẽ xóa token.
- Khi chạy production, bắt buộc đặt `JWT_SECRET` thành chuỗi ngẫu nhiên dài tối thiểu 32 byte. Ví dụ PowerShell: `$env:JWT_SECRET = (node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('base64url'))")` rồi chạy `npm start`. Không commit secret vào Git. Môi trường phát triển tự tạo secret tạm; token sẽ mất hiệu lực khi khởi động lại server.
- Tài khoản sinh viên chỉ xem dữ liệu công khai và dữ liệu đơn hàng/giỏ hàng/yêu thích gắn với tài khoản đó. Sản phẩm chỉ chủ shop được sửa; chỉ người mua được hủy đơn đang chờ và người bán liên quan được chuyển trạng thái đơn; ví chỉ chủ tài khoản được cập nhật; danh mục yêu cầu role `admin`.
- Database mới ở production không nạp tài khoản mẫu yếu (`123`); người dùng tạo tài khoản riêng. Role admin cần được cấp trực tiếp bởi người vận hành trong database, không có API tự nâng quyền.
- JWT không thay thế HTTPS. Khi deploy, dùng HTTPS, giữ secret ngoài source control, và cấu hình `EDUMARKET_ALLOWED_ORIGIN` đúng origin frontend. GitHub Pages không chạy backend.

## Deploy

GitHub Pages chỉ phục vụ file tĩnh, không chạy được Node API hay SQLite. Để dùng DB thật, deploy toàn bộ ứng dụng trên một host chạy Node.js với persistent disk. Nếu frontend và API chạy ở hai domain khác nhau, sửa `window.EDUMARKET_API_URL` trong `js/core/model/api-config.js` thành URL API và đặt `EDUMARKET_ALLOWED_ORIGIN` trên backend thành origin frontend được phép.

## Database và API

Backend dùng SQLite qua API tích hợp `node:sqlite`. SQLite có các bảng `users`, `categories`, `products`, `orders`, `order_items`, `cart_items`, `reviews`, `wishlist_items` và `user_state` (giỏ hàng/yêu thích theo từng tài khoản). Dữ liệu chi tiết được lưu kèm payload JSON để giữ nguyên hợp đồng hiện tại của frontend. Các endpoint chính:

- `GET /api/health`
- `GET /api/state` (dữ liệu công khai; dữ liệu riêng cần JWT)
- `PUT /api/state/:collection` (JWT bắt buộc, kiểm tra quyền theo collection; danh mục chỉ admin)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/users/:id/wallet` (JWT bắt buộc, chỉ chủ ví hoặc admin)

Cấu trúc frontend tiếp tục theo module MVC trong `js/modules`; lớp `Storage` đồng bộ cache với backend, các service nghiệp vụ dùng API cho tài khoản và SQLite cho dữ liệu marketplace.
