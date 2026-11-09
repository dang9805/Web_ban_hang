# EduMarket

Đồ án môn học Hệ thống & Công nghệ Web. Đây là ứng dụng front end tĩnh dùng HTML, CSS và JavaScript thuần; dữ liệu mô phỏng được lưu trong `localStorage` để chạy trực tiếp hoặc trên GitHub Pages.

Xem mô tả nghiệp vụ tại [BAOCAO_TOMTAT_DOAN.md](BAOCAO_TOMTAT_DOAN.md).

## Cài đặt và chạy

EduMarket là website tĩnh, không cần cài package hay cấu hình backend.

1. Tải hoặc clone mã nguồn về máy.
2. Mở thư mục dự án.
3. Mở `trangchu.html` bằng trình duyệt. `index.html` cũng tự chuyển đến trang chủ.

Nếu muốn chạy qua web server cục bộ, mở terminal tại thư mục dự án và chạy:

```bash
python -m http.server 8000
```

Sau đó truy cập [http://localhost:8000](http://localhost:8000). Nếu máy chưa cài Python, có thể dùng VS Code với tiện ích Live Server.

## Triển khai GitHub Pages

1. Đẩy thư mục dự án lên một repository GitHub.
2. Trong repository, vào **Settings → Pages**.
3. Chọn nhánh chứa mã nguồn và thư mục gốc (`/root`), rồi lưu.
4. Mở URL GitHub Pages được hiển thị ở phần Pages.

Ứng dụng dùng HTML/CSS/JavaScript thuần, không cần bước build. Dữ liệu demo được lưu trong `localStorage` của trình duyệt.
## Kiến trúc module và MVC

Mỗi tính năng nằm trong `js/modules/<module>/` và có các lớp `model`, `view`, `controller` phù hợp. HTML cung cấp cấu trúc trang; các View module chịu trách nhiệm render/cập nhật DOM, còn Controller điều phối nghiệp vụ và sự kiện. Phần dùng chung nằm trong `core` và `modules/shared`.

```text
js/
├── core/
│   ├── model/                  # Dữ liệu mẫu, localStorage, format helper
│   └── view/                   # Toast dùng chung
└── modules/
    ├── auth/{model,view,controller}/
    ├── cart/{model,view,controller}/
    ├── catalog/{model,view,controller}/
    ├── home/{view,controller}/
    ├── orders/{model,view,controller}/
    ├── product-detail/{model,view,controller}/
    ├── seller/{view,controller}/
    ├── wishlist/{model,view,controller}/
    └── shared/{view,controller}/ # Product card và header
```

Các model nghiệp vụ nằm cạnh controller của module tương ứng. Trang HTML nạp lần lượt model nền tảng, model tính năng cần dùng, view dùng chung, controller dùng chung và controller/view riêng của trang. Script thường được giữ để hỗ trợ mở HTML trực tiếp và GitHub Pages.