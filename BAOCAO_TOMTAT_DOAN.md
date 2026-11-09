# 📚 BÁO CÁO TÓM TẮT ĐỒ ÁN MÔN HỌC
## MÔN: HỆ THỐNG & CÔNG NGHỆ WEB
### ĐỀ TÀI: SÀN THƯƠNG MẠI ĐIỆN TỬ ĐỒ DÙNG HỌC TẬP & ĐỜI SỐNG SINH VIÊN (EDUMARKET)

---

## I. MỤC ĐÍCH, VAI TRÒ VÀ Ý NGHĨA ĐỀ TÀI

### 1. Mục đích đề tài
* **Về mặt công nghệ & học thuật:**
  * Vận dụng toàn diện các chuẩn công nghệ Web Front-end hiện đại: **HTML5 Semantic, CSS3 (Modern Blue Theme, Responsive Flexbox/Grid) và JavaScript ES6+**.
  * Xây dựng kiến trúc quản trị trạng thái và dữ liệu máy khách (Client-side Data Architecture) thông qua **Web Storage API (`localStorage` & `sessionStorage`)**, mô phỏng trọn vẹn mô hình sàn thương mại điện tử đa người bán (Multi-seller Marketplace) hoạt động độc lập không cần server backend.
  * Sử dụng toàn bộ đường dẫn tương đối (relative paths), tối ưu hiệu năng để hệ thống **sẵn sàng deploy trực tiếp lên GitHub Pages**.
* **Về mặt nghiệp vụ thực tế:**
  * Giải quyết bài toán mua sắm, tìm kiếm đồ dùng học tập, thiết bị điện tử phục vụ đồ án (máy tính Casio, chuột silent, balo laptop, đèn học chống cận, giá đỡ tản nhiệt) và trao đổi/thanh lý giáo trình cũ giữa các thế hệ sinh viên trong các khuôn viên đại học và ký túc xá.

### 2. Vai trò của hệ thống
* **Nền tảng kết nối trực tiếp (Campus Marketplace Platform):** Đóng vai trò là cầu nối thương mại ngang hàng (C2C / P2P) giữa sinh viên có nhu cầu sang nhượng đồ dùng và sinh viên cần mua đồ giá rẻ, tiết kiệm.
* **Tích hợp hai chiều trên cùng một tài khoản (Dual-Role User):** Mỗi người dùng vừa là **Người mua (Buyer)** tham gia tìm kiếm, đặt hàng, đánh giá sản phẩm; vừa là **Người bán (Seller)** sở hữu riêng một Kênh Người Bán để đăng tải sản phẩm, quản lý kho và duyệt đơn hàng của khách.

### 3. Ý nghĩa thực tiễn
* **Kinh tế:** Giúp sinh viên tiết kiệm từ 50% đến 70% chi phí mua sách vở, giáo trình và tiện ích sinh hoạt so với thị trường; đồng thời giúp người bán thu hồi một phần chi phí học tập từ việc thanh lý đồ dùng không còn nhu cầu sử dụng.
* **Môi trường & Xã hội:** Thúc đẩy mô hình kinh tế tuần hoàn (Circular Economy), kéo dài vòng đời sử dụng của sản phẩm, giảm lãng phí giấy in và rác thải học đường.
* **Giáo dục & Kỹ năng:** Tạo môi trường mua sắm văn minh với các cơ chế đặc thù: xác thực ưu đãi Mã số sinh viên (MSSV), phương thức thanh toán linh hoạt (COD, chuyển khoản VietQR, ví trả sau học đường), và địa điểm giao nhận ngay tại cổng trường/KTX.

---

## II. HỆ THỐNG CHỨC NĂNG CỦA WEBSITE

### 1. Các chức năng chính (Core Features)

| STT | Chức năng | Mô tả chi tiết |
|:---:|---|---|
| **1** | **Khám phá & Bộ lọc đa tiêu chí** | • Hiển thị danh mục trực quan theo biểu tượng.<br>• Tìm kiếm từ khóa thời gian thực (realtime search theo tên, mô tả, thương hiệu).<br>• Bộ lọc kết hợp: Checkbox danh mục, lọc theo khoảng giá tùy chỉnh (Từ ... Đến ... VNĐ).<br>• Sắp xếp kết quả linh hoạt: Phổ biến, Mới nhất, Bán chạy, Giá tăng/giảm dần. |
| **2** | **Chi tiết sản phẩm & Quản trị tồn kho** | • Bộ sưu tập ảnh (Gallery): Xem ảnh lớn và click đổi nhanh các thumbnail.<br>• Bộ chọn số lượng mua thông minh: Ràng buộc $\ge 1$ và không vượt quá số lượng tồn kho (`soLuongTon`).<br>• Tự động hiển thị nhãn **HẾT HÀNG** và vô hiệu hóa nút mua khi tồn kho bằng 0.<br>• Bảng thông số kỹ thuật chi tiết và thông tin gian hàng người bán. |
| **3** | **Giỏ hàng & Đặt hàng** | • Quản lý món đồ đã thêm: Chọn từng món hoặc chọn tất cả, tăng/giảm số lượng, xóa món.<br>• Tự động tính toán tổng tiền hàng, tiền giảm giá và tổng thanh toán theo thời gian thực.<br>• Tự động trừ tồn kho sản phẩm khi đơn hàng được thiết lập thành công. |
| **4** | **Ưu đãi & Xác thực Mã sinh viên (MSSV)** | • Ứng dụng Regex kiểm tra định dạng MSSV hợp lệ (7-10 chữ số).<br>• Tự động trừ ngay **20.000 VNĐ** vào tổng đơn hàng khi sinh viên nhập đúng MSSV.<br>• Hỗ trợ các mã voucher sự kiện (`SINHVIEN2026`, `FREESHIP`). |
| **5** | **Thanh toán đa phương thức** | • **COD:** Thanh toán tiền mặt trực tiếp khi nhận hàng.<br>• **VietQR:** Mở Pop-up Modal hiển thị mã QR có chứa đúng số tiền đơn hàng và nội dung chuyển khoản.<br>• **Ví trả sau sinh viên (SPayLater):** Hạn mức khởi tạo 500.000 VNĐ; tự động kiểm tra số dư và trừ tiền vào ví khi đặt hàng. |
| **6** | **Theo dõi đơn mua (Timeline Vận chuyển)** | • Trực quan hóa tiến trình qua 4 chặng:<br>$$\text{[Đã đặt hàng]} \longrightarrow \text{[Shop xác nhận]} \longrightarrow \text{[Đang giao hàng]} \longrightarrow \text{[Đã nhận đồ]}$$<br>• **Cơ chế Hủy đơn hàng:** Cho phép hủy khi ở trạng thái "Chờ xác nhận" $\rightarrow$ Hệ thống tự động hoàn trả số lượng hàng về kho của shop và hoàn tiền vào ví SPayLater (nếu thanh toán qua ví). |
| **7** | **Kênh Người Bán (Shopee Seller Centre)** | • **Dashboard KPI 4 chỉ số:** Tổng doanh thu (VNĐ), Đơn hàng mới cần xử lý, Tổng sản phẩm đang bán, Cảnh báo sắp hết hàng (tồn kho $\le 2$).<br>• **Đăng bán sản phẩm mới:** Form đầy đủ trường; sản phẩm vừa đăng lập tức xuất hiện trên sàn chung.<br>• **Quản lý kho:** Sửa nhanh số lượng tồn kho trực tiếp tại bảng, xóa sản phẩm.<br>• **Duyệt đơn bán:** Chuyển trạng thái đơn (`Xác nhận` $\rightarrow$ `Giao hàng` $\rightarrow$ `Hoàn tất`), tự động đồng bộ sang trang Đơn mua của người mua. |

### 2. Các chức năng phụ (Supporting Features)

* **Quản lý phiên & Xác thực tài khoản (Auth Session):**
  * Form Đăng ký / Đăng nhập có kiểm tra hợp lệ bằng Regex: Email chuẩn RFC, Số điện thoại (10 chữ số bắt đầu bằng 0), MSSV, Mật khẩu $\ge 6$ ký tự.
  * Tích hợp 3 tài khoản mẫu kiểm thử nhanh (Click là tự điền thông tin).
  * Menu dropdown tài khoản dạng **Click Toggle**: Ấn vào thì mở và giữ cố định, ấn lại hoặc ấn ra ngoài màn hình thì đóng lại.
* **Hệ thống Đánh giá & Xếp hạng sao (Reviews & Rating):**
  * Tự động tính điểm sao trung bình của sản phẩm.
  * Bộ lọc nhận xét theo số sao (Tất cả, 5 sao, 4 sao, 3 sao, 2 sao, 1 sao).
  * Form gửi nhận xét kèm chọn sao trực quan; lưu và hiển thị bình luận mới ngay lập tức.
* **Món đồ đã lưu (Wishlist):**
  * Bấm biểu tượng trái tim để lưu lại xem sau; quản lý danh sách yêu thích tại trang riêng.
* **Mini-Cart Popover:**
  * Di chuột vào icon giỏ hàng trên thanh header để xem nhanh 5 sản phẩm mới thêm và số lượng.
* **Hệ thống Thông Báo Toast UI Tự Động:**
  * Thay thế hoàn toàn cho lệnh `alert()` mặc định bằng các thông báo trượt góc trên bên phải màn hình (Xanh lá: Thành công, Đỏ: Lỗi, Vàng: Cảnh báo, Xanh dương: Thông tin) kèm thanh đếm ngược tự co lại.
* **Thông tin Đồ án & Sơ đồ liên kết (Sitemap):**
  * Trang giới thiệu đồ án và danh sách thành viên nhóm.
  * Sơ đồ cây trực quan liên kết tất cả các trang web trong hệ sinh thái EduMarket.

---

## III. GỢI Ý ĐỊNH HƯỚNG MỞ RỘNG (FUTURE EXTENSIONS)

### 1. Về mặt kiến trúc & công nghệ
1. **Chuyển đổi Backend & Cơ sở dữ liệu thực tế:**
   * Thay thế Web Storage API bằng hệ thống Backend RESTful API hoặc GraphQL viết bằng **Node.js (NestJS / Express)** hoặc **Python (FastAPI / Django)** kết hợp cơ sở dữ liệu quan hệ **PostgreSQL / MySQL**.
2. **Xác thực bảo mật SSO & OAuth2:**
   * Tích hợp đăng nhập một chạm thông qua tài khoản Google hoặc hệ thống tài khoản sinh viên của nhà trường (`@...edu.vn`).
3. **Nhắn tin trực tiếp thời gian thực (Realtime Chatbox):**
   * Sử dụng công nghệ **WebSockets / Socket.IO / Firebase** giúp người mua và người bán trao đổi trực tiếp tình trạng đồ, hình ảnh thực tế và hẹn điểm nhận hàng ngay trên website.

### 2. Về mặt nghiệp vụ học đường
1. **Tích hợp Bản đồ Campus Map & Điểm hẹn KTX:**
   * Sử dụng Leaflet / Google Maps API đánh dấu sẵn các vị trí nhận hàng quen thuộc: *Cổng KTX Khu A/B, sảnh thư viện, căng-tin giảng đường* để người mua chọn điểm hẹn giao đồ miễn phí.
2. **Sàn Đấu Giá Học Đường (Campus Auction):**
   * Hỗ trợ chức năng mở phiên đấu giá có thời hạn cho các tài liệu độc lạ, đề cương ôn thi hay máy móc đồ án kỹ thuật.
3. **Mục Tìm Đồ Thất Lạc (Lost & Found):**
   * Bổ sung chuyên mục hỗ trợ sinh viên đăng tin tìm đồ đánh rơi hoặc thông báo nhặt được thẻ sinh viên, ví tiền, chìa khóa xe trong khuôn viên trường.
4. **Hệ thống Gợi ý Cá nhân hóa (AI Recommendation):**
   * Dựa vào MSSV và ngành học đã đăng ký để tự động đề xuất danh sách giáo trình các môn học kỳ tiếp theo cho sinh viên.

---

## IV. CẤU TRÚC TỆP TIN & HƯỚNG DẪN TRIỂN KHAI

### 1. Cấu trúc thư mục
```text
/
├── css/
│   ├── style.css          # CSS toàn trang, biến màu xanh, layout, header, footer, toast
│   ├── home.css           # CSS danh mục, lưới sản phẩm, nút xem thêm
│   ├── product.css        # CSS danh sách tìm kiếm, chi tiết sản phẩm 2 nửa, đánh giá
│   ├── cart.css           # CSS giỏ hàng, 3 hình thức thanh toán, modal QR, timeline
│   └── seller.css         # CSS Kênh người bán, dashboard 4 KPI, bảng duyệt đơn
├── js/
│   ├── core/                 # Model và view dùng chung của ứng dụng
│   └── modules/              # Mỗi tính năng tổ chức theo MVC: model, view, controller
│       ├── auth/
│       ├── cart/
│       ├── catalog/
│       ├── home/
│       ├── orders/
│       ├── product-detail/
│       ├── seller/
│       ├── wishlist/
│       └── shared/├── index.html             # Chuyển hướng tự động vào trang chủ trên GitHub Pages
├── trangchu.html          # Trang chủ hệ thống EduMarket
├── danhsachsanpham.html   # Trang danh sách sản phẩm & bộ lọc tìm kiếm
├── chitietsanpham.html    # Trang chi tiết sản phẩm & gửi đánh giá
├── giohang.html           # Trang giỏ hàng, mã giảm giá & thanh toán
├── donmua.html            # Trang lịch sử đơn mua & timeline tiến trình
├── yeuthich.html          # Trang danh sách món đồ đã lưu
├── kenhnguoiban.html      # Trang Kênh Người Bán (Shopee Seller Centre)
├── dangky.html            # Trang đăng ký tài khoản sinh viên
├── dangnhap.html          # Trang đăng nhập kèm tài khoản mẫu
├── gioithieu_website_thanhvien.html # Trang thông tin đề tài & nhóm sinh viên
└── sitemap.html           # Sơ đồ cây liên kết toàn bộ website
```

### 2. Hướng dẫn chạy & triển khai
* **Chạy cục bộ trên máy tính:** Mở trực tiếp file `trangchu.html` hoặc `index.html` bằng bất kỳ trình duyệt web hiện đại nào (Google Chrome, Microsoft Edge, Mozilla Firefox).
* **Deploy lên GitHub Pages:**
  1. Khởi tạo kho Git và commit toàn bộ thư mục:
     ```bash
     git init
     git add .
     git commit -m "Init EduMarket Campus Marketplace Project"
     ```
  2. Tạo repository trên GitHub và đẩy mã nguồn lên.
  3. Vào **Settings ➔ Pages ➔ Build and deployment**: chọn nhánh `main` và thư mục `/ (root)`.
  4. Hệ thống sẽ tự động xuất bản website trực tuyến mà không cần cài đặt thêm bất kỳ môi trường máy chủ nào.

