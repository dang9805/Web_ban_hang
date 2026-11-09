/**
 * ==============================================================================
 * SHOPEE EDU-MARKETPLACE - CORE DATA & STORAGE SERVICE
 * Đề tài: Sàn thương mại điện tử Đồ dùng học tập & Đời sống sinh viên
 * Lưu trữ: Web Storage API (localStorage & sessionStorage)
 * ==============================================================================
 */

// Danh sách Danh mục chuẩn của Hệ thống
const MOCK_CATEGORIES = [
  {
    id: "DungCuHocTap",
    ten: "Dụng Cụ Học Tập",
    icon: "fa-solid fa-pen-ruler",
    hinhAnh: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=200&auto=format&fit=crop&q=80",
    moTa: "Bút, vở kẻ ngang, thước kẻ, compa, tài liệu học tập"
  },
  {
    id: "SachGiaoTrinh",
    ten: "Sách & Giáo Trình",
    icon: "fa-solid fa-book-open",
    hinhAnh: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80",
    moTa: "Giáo trình đại cương, sách chuyên ngành, ngoại ngữ, đồ án"
  },
  {
    id: "ThietBiDienTu",
    ten: "Thiết Bị Điện Tử",
    icon: "fa-solid fa-calculator",
    hinhAnh: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&auto=format&fit=crop&q=80",
    moTa: "Máy tính Casio, chuột silent, tai nghe học tập, hub USB"
  },
  {
    id: "BaloTuiXach",
    ten: "Balo & Túi Xách",
    icon: "fa-solid fa-bag-shopping",
    hinhAnh: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&auto=format&fit=crop&q=80",
    moTa: "Balo laptop chống sốc, túi tote vải canvas, túi đeo chéo"
  },
  {
    id: "TienIchPhongTro",
    ten: "Tiện Ích Phòng Trọ",
    icon: "fa-solid fa-house-laptop",
    hinhAnh: "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=200&auto=format&fit=crop&q=80",
    moTa: "Đèn bàn chống cận, bình giữ nhiệt, bàn gấp gọn, nồi mini"
  }
];

// Danh sách Tài khoản mẫu ban đầu
const MOCK_USERS = [
  {
    id: "user_shop1",
    username: "sinhvienpro",
    password: "123", // Mật khẩu mẫu đơn giản tiện cho việc chấm bài
    hoTen: "Nguyễn Văn An",
    email: "an.nguyen@sinhvien.edu.vn",
    sdt: "0987654321",
    mssv: "20210001",
    viTraSau: 500000, // Hạn mức ví trả sau SpayLater giả lập (VNĐ)
    tenShop: "Cửa Hàng Văn Phòng Phẩm Minh Trí",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "user_shop2",
    username: "bachkhoastore",
    password: "123",
    hoTen: "Trần Thị Mai",
    email: "mai.tran@sinhvien.edu.vn",
    sdt: "0912345678",
    mssv: "20210002",
    viTraSau: 800000,
    tenShop: "Nhà Sách Sinh Viên Bách Khoa",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "user_buyer1",
    username: "hocsinhchamchi",
    password: "123",
    hoTen: "Lê Hoàng Nam",
    email: "nam.le@sinhvien.edu.vn",
    sdt: "0934567890",
    mssv: "20221234",
    viTraSau: 600000,
    tenShop: "Tiệm Đồ Cũ Sinh Viên",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80"
  }
];

// Danh sách Sản phẩm mẫu đầy đủ và chân thực
const MOCK_PRODUCTS = [
  {
    id: "SP01",
    ten: "Máy Tính Khoa Học Casio fx-580VN X Chính Hãng Bitex (521 Tính Năng)",
    danhMuc: "ThietBiDienTu",
    gia: 650000,
    giaGoc: 750000,
    soLuongTon: 8,
    daBan: 142,
    anhChinh: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop1",
    tenShop: "Cửa Hàng Văn Phòng Phẩm Minh Trí",
    thuongHieu: "Casio",
    xuatXu: "Thái Lan",
    tinhTrang: "Mới 100%",
    moTa: "Máy tính cầm tay Casio fx-580VN X thuộc dòng ClassWiz sở hữu màn hình LCD độ phân giải cao 192 x 63 điểm, nhanh gấp 4 lần dòng ES Plus. Có 521 tính năng vượt trội, hỗ trợ giải phương trình bậc 4, bất phương trình bậc 4, hệ phương trình 4 ẩn, ma trận 4x4. Cho phép mang vào phòng thi tốt nghiệp THPT và kỳ thi đại học.",
    ngayDang: "2026-10-15",
    diaDiem: "Ký túc xá Khu B ĐHQG"
  },
  {
    id: "SP02",
    ten: "Combo 10 Cuốn Tập Vở Kẻ Ngang Campus Klong B5 120 Trang Chống Lóa Mắt",
    danhMuc: "DungCuHocTap",
    gia: 95000,
    giaGoc: 120000,
    soLuongTon: 45,
    daBan: 520,
    anhChinh: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop1",
    tenShop: "Cửa Hàng Văn Phòng Phẩm Minh Trí",
    thuongHieu: "Campus",
    xuatXu: "Việt Nam",
    tinhTrang: "Mới 100%",
    moTa: "Vở kẻ ngang B5 Campus với chất giấy định lượng 70gsm siêu mịn, bám mực tốt, không nhòe kể cả viết bút mực gel. Bìa in hoạ tiết pastel phong cách học sinh sinh viên hiện đại, có gáy ép keo đa lớp bền chắc.",
    ngayDang: "2026-10-18",
    diaDiem: "Quận Cầu Giấy, Hà Nội"
  },
  {
    id: "SP03",
    ten: "Hộp 20 Bút Bi Bấm Gel Deli Ngòi 0.5mm Mực Đen Nhanh Khô Chuyên Ghi Chép",
    danhMuc: "DungCuHocTap",
    gia: 55000,
    giaGoc: 70000,
    soLuongTon: 60,
    daBan: 980,
    anhChinh: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop1",
    tenShop: "Cửa Hàng Văn Phòng Phẩm Minh Trí",
    thuongHieu: "Deli",
    xuatXu: "Trung Quốc",
    tinhTrang: "Mới 100%",
    moTa: "Bút gel Deli ngòi 0.5mm êm ái, cấu trúc bi vonfram bền bỉ giúp nét chữ thanh thoát đều mực. Đệm cao su êm tay không gây mỏi khi chép bài liên tục trong các buổi học dài trên giảng đường.",
    ngayDang: "2026-10-20",
    diaDiem: "Quận 10, TP.HCM"
  },
  {
    id: "SP04",
    ten: "Balo Laptop Sinh Viên Chống Nước Chống Rạch Có Cổng Sạc USB Thông Minh",
    danhMuc: "BaloTuiXach",
    gia: 289000,
    giaGoc: 380000,
    soLuongTon: 18,
    daBan: 215,
    anhChinh: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop2",
    tenShop: "Nhà Sách Sinh Viên Bách Khoa",
    thuongHieu: "Arctic Hunter",
    xuatXu: "Việt Nam",
    tinhTrang: "Mới 100%",
    moTa: "Balo thiết kế chuyên dụng cho sinh viên Đại học: Ngăn chứa laptop 15.6 inch bọc nhung chống sốc, vải Oxford chống thấm nước đi mưa không lo ướt sách vở. Tích hợp cổng USB nối sạc dự phòng tiện lợi.",
    ngayDang: "2026-10-12",
    diaDiem: "Bách Khoa - Hà Nội"
  },
  {
    id: "SP05",
    ten: "Đèn Học Sinh Viên LED Chống Cận 3 Chế Độ Sáng Cảm Ứng Tích Hợp Giá Đỡ ĐT",
    danhMuc: "TienIchPhongTro",
    gia: 145000,
    giaGoc: 190000,
    soLuongTon: 15,
    daBan: 310,
    anhChinh: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop2",
    tenShop: "Nhà Sách Sinh Viên Bách Khoa",
    thuongHieu: "Sunhouse",
    xuatXu: "Việt Nam",
    tinhTrang: "Mới 100%",
    moTa: "Đèn bàn học công nghệ LED dải sáng quang phổ đầy đủ, không gây mỏi mắt, không chớp nháy. Nút cảm ứng chuyển 3 màu sáng: Trắng, Trung tính, Vàng ấm. Chân đèn có khay cắm bút và khe dựng điện thoại tiện lợi.",
    ngayDang: "2026-10-10",
    diaDiem: "Quận Thủ Đức, TP.HCM"
  },
  {
    id: "SP06",
    ten: "Bình Giữ Nhiệt Inox 304 Dung Tích 800ml Giữ Nóng Lạnh 24h Cho Sinh Viên",
    danhMuc: "TienIchPhongTro",
    gia: 125000,
    giaGoc: 160000,
    soLuongTon: 22,
    daBan: 450,
    anhChinh: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop1",
    tenShop: "Cửa Hàng Văn Phòng Phẩm Minh Trí",
    thuongHieu: "Lock&Lock Style",
    xuatXu: "Việt Nam",
    tinhTrang: "Mới 100%",
    moTa: "Bình giữ nhiệt chất liệu Inox 304 cao cấp 2 lớp cách nhiệt chân không, nắp xoay chống tràn 100% để an tâm cho vào balo cùng laptop. Giữ nước đá lạnh đến 24h hoặc trà ấm 12h suốt ngày dài trên trường.",
    ngayDang: "2026-10-22",
    diaDiem: "Ký túc xá Khu A ĐHQG"
  },
  {
    id: "SP07",
    ten: "Giá Đỡ Laptop Hợp Kim Nhôm Tản Nhiệt Xếp Gọn 6 Cấp Độ Điều Chỉnh Tư Thế",
    danhMuc: "ThietBiDienTu",
    gia: 89000,
    giaGoc: 130000,
    soLuongTon: 2, // Sắp hết hàng để kiểm tra cảnh báo KPI Kênh Người Bán
    daBan: 670,
    anhChinh: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop1",
    tenShop: "Cửa Hàng Văn Phòng Phẩm Minh Trí",
    thuongHieu: "Orico",
    xuatXu: "Trung Quốc",
    tinhTrang: "Mới 100%",
    moTa: "Giá đỡ laptop làm từ hợp kim nhôm đúc nguyên khối chống rung lắc, đệm silicon chống xước máy. 6 nấc điều chỉnh độ cao giúp chống gù lưng, mỏi cổ khi làm đồ án, học online nhiều giờ.",
    ngayDang: "2026-10-05",
    diaDiem: "Quận Bình Thạnh, TP.HCM"
  },
  {
    id: "SP08",
    ten: "Bàn Học Gấp Gọn Đa Năng Có Khe Để iPad Và Khay Ly Nước Dành Cho Phòng Trọ",
    danhMuc: "TienIchPhongTro",
    gia: 79000,
    giaGoc: 110000,
    soLuongTon: 28,
    daBan: 820,
    anhChinh: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop2",
    tenShop: "Nhà Sách Sinh Viên Bách Khoa",
    thuongHieu: "No Brand",
    xuatXu: "Việt Nam",
    tinhTrang: "Mới 100%",
    moTa: "Bàn học sinh viên mặt gỗ MDF chống ẩm bo tròn an toàn, chân sắt bọc mút xốp chống trượt. Kích thước 60x40x28cm cực kỳ tiết kiệm diện tích cho phòng trọ sinh viên, gấp gọn cất dưới gầm giường.",
    ngayDang: "2026-10-14",
    diaDiem: "Quận Hai Bà Trưng, Hà Nội"
  },
  {
    id: "SP09",
    ten: "Giáo Trình Hệ Thống & Công Nghệ Web (HTML5, CSS3, JavaScript, Full-stack)",
    danhMuc: "SachGiaoTrinh",
    gia: 85000,
    giaGoc: 115000,
    soLuongTon: 34,
    daBan: 180,
    anhChinh: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop2",
    tenShop: "Nhà Sách Sinh Viên Bách Khoa",
    thuongHieu: "NXB Đại Học Quốc Gia",
    xuatXu: "Việt Nam",
    tinhTrang: "Mới 99% (Thanh lý)",
    moTa: "Giáo trình chuẩn môn học Công nghệ Web, trình bày chi tiết kiến trúc client-server, lập trình giao diện Responsive, DOM Manipulation, Web Storage API và xử lý dữ liệu bất đồng bộ. Sách bìa mềm in sắc nét.",
    ngayDang: "2026-10-19",
    diaDiem: "Đại học Bách Khoa"
  },
  {
    id: "SP10",
    ten: "Giáo Trình Toán Cao Cấp & Giải Tích 1-2 Cho Khối Kỹ Thuật (Bản Đầy Đủ)",
    danhMuc: "SachGiaoTrinh",
    gia: 60000,
    giaGoc: 90000,
    soLuongTon: 19,
    daBan: 340,
    anhChinh: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop2",
    tenShop: "Nhà Sách Sinh Viên Bách Khoa",
    thuongHieu: "NXB Giáo Dục",
    xuatXu: "Việt Nam",
    tinhTrang: "Mới 95%",
    moTa: "Bộ tài liệu học tập Toán cao cấp giải bài tập mẫu, ma trận, tích phân đa lớp, chuỗi số Fourier. Đầy đủ các dạng đề thi trắc nghiệm và tự luận có lời giải chi tiết giúp qua môn điểm cao.",
    ngayDang: "2026-10-11",
    diaDiem: "Quận Nam Từ Liêm, Hà Nội"
  },
  {
    id: "SP11",
    ten: "Chuột Không Dây Silent Logitech M220 Click Không Tiếng Động (Êm Phòng Tự Học)",
    danhMuc: "ThietBiDienTu",
    gia: 249000,
    giaGoc: 299000,
    soLuongTon: 12,
    daBan: 412,
    anhChinh: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop1",
    tenShop: "Cửa Hàng Văn Phòng Phẩm Minh Trí",
    thuongHieu: "Logitech",
    xuatXu: "Thụy Sĩ",
    tinhTrang: "Mới 100%",
    moTa: "Chuột không dây Logitech M220 trang bị công nghệ SilentTouch giảm 90% tiếng ồn click chuột, hoàn toàn phù hợp khi ngồi học trong thư viện hoặc phòng tự học ban đêm. Pin dùng lên đến 18 tháng.",
    ngayDang: "2026-10-16",
    diaDiem: "Quận Đống Đa, Hà Nội"
  },
  {
    id: "SP12",
    ten: "Nồi Nấu Lẩu Điện Mini 1.8L Đa Năng Kèm Xửng Hấp Cho Sinh Viên Nấu Phòng Trọ",
    danhMuc: "TienIchPhongTro",
    gia: 159000,
    giaGoc: 210000,
    soLuongTon: 0, // Tồn kho = 0 để kiểm tra hiển thị trạng thái HẾT HÀNG
    daBan: 530,
    anhChinh: "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop2",
    tenShop: "Nhà Sách Sinh Viên Bách Khoa",
    thuongHieu: "Bear",
    xuatXu: "Trung Quốc",
    tinhTrang: "Mới 100%",
    moTa: "Nồi lẩu mini lòng tráng men ceramic chống dính an toàn sức khỏe. Công suất 600W tiết kiệm điện cho phòng trọ sinh viên, nấu mì cay, luộc trứng, nấu canh hay hấp bánh bao nhanh chóng.",
    ngayDang: "2026-10-01",
    diaDiem: "Quận Hoàng Mai, Hà Nội"
  },
  {
    id: "SP13",
    ten: "Túi Vải Canvas Tote Đeo Chéo Đi Học Khóa Kéo Nhiều Ngăn Phong Cách Unisex",
    danhMuc: "BaloTuiXach",
    gia: 65000,
    giaGoc: 89000,
    soLuongTon: 40,
    daBan: 320,
    anhChinh: "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop1",
    tenShop: "Cửa Hàng Văn Phòng Phẩm Minh Trí",
    thuongHieu: "Levents Style",
    xuatXu: "Việt Nam",
    tinhTrang: "Mới 100%",
    moTa: "Túi tote vải bố canvas dày dặn in hình tối giản, có khóa kéo miệng túi chống rơi đồ và ngăn phụ bên trong đựng vừa khổ A4, tài liệu học và máy tính bảng iPad.",
    ngayDang: "2026-10-24",
    diaDiem: "Quận Phú Nhuận, TP.HCM"
  },
  {
    id: "SP14",
    ten: "Bộ Dụng Cụ Vẽ Kỹ Thuật Com-pa & Thước Kẻ Đa Năng Deli Dành Cho Sinh Viên Xây Dựng",
    danhMuc: "DungCuHocTap",
    gia: 48000,
    giaGoc: 65000,
    soLuongTon: 30,
    daBan: 195,
    anhChinh: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80",
    anhPhu: [
      "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80"
    ],
    nguoiBanId: "user_shop1",
    tenShop: "Cửa Hàng Văn Phòng Phẩm Minh Trí",
    thuongHieu: "Deli",
    xuatXu: "Trung Quốc",
    tinhTrang: "Mới 100%",
    moTa: "Hộp kim loại đựng 7 món: compa kim loại chắc chắn, bút chì bấm, gôm tẩy, thước kẻ 15cm, 2 thước e-ke góc và 1 thước đo độ. Độ chính xác vạch chia cao chuẩn mực cho đồ án kỹ thuật.",
    ngayDang: "2026-10-21",
    diaDiem: "Quận 1, TP.HCM"
  }
];

// Danh sách Đơn hàng mẫu ban đầu
const MOCK_ORDERS = [
  {
    orderId: "ORD-202601",
    buyerId: "user_shop1",
    tenNguoiNhan: "Nguyễn Văn An",
    sdt: "0987654321",
    diaChi: "Phòng 402, KTX Khu B Đại học Quốc gia, TP. Thủ Đức",
    items: [
      {
        productId: "SP01",
        ten: "Máy Tính Khoa Học Casio fx-580VN X Chính Hãng Bitex (521 Tính Năng)",
        soLuong: 1,
        donGia: 650000,
        anhChinh: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
        shopId: "user_shop1"
      },
      {
        productId: "SP02",
        ten: "Combo 10 Cuốn Tập Vở Kẻ Ngang Campus Klong B5 120 Trang Chống Lóa Mắt",
        soLuong: 2,
        donGia: 95000,
        anhChinh: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        shopId: "user_shop1"
      }
    ],
    tongTien: 840000,
    giamGia: 20000,
    phuongThucThanhToan: "QR", // "COD", "QR", "SPayLater"
    trangThai: "DangGiao", // "ChoXacNhan", "DangChuanBi", "DangGiao", "DaGiao", "DaHuy"
    ngayDat: "2026-10-28 14:30"
  },
  {
    orderId: "ORD-202602",
    buyerId: "user_shop1",
    tenNguoiNhan: "Nguyễn Văn An",
    sdt: "0987654321",
    diaChi: "Phòng 402, KTX Khu B Đại học Quốc gia, TP. Thủ Đức",
    items: [
      {
        productId: "SP04",
        ten: "Balo Laptop Sinh Viên Chống Nước Chống Rạch Có Cổng Sạc USB Thông Minh",
        soLuong: 1,
        donGia: 289000,
        anhChinh: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
        shopId: "user_shop2"
      }
    ],
    tongTien: 289000,
    giamGia: 15000,
    phuongThucThanhToan: "SPayLater",
    trangThai: "ChoXacNhan",
    ngayDat: "2026-11-02 09:15"
  },
  {
    orderId: "ORD-202603",
    buyerId: "user_shop2",
    tenNguoiNhan: "Trần Thị Mai",
    sdt: "0912345678",
    diaChi: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    items: [
      {
        productId: "SP07",
        ten: "Giá Đỡ Laptop Hợp Kim Nhôm Tản Nhiệt Xếp Gọn 6 Cấp Độ Điều Chỉnh Tư Thế",
        soLuong: 1,
        donGia: 89000,
        anhChinh: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
        shopId: "user_shop1"
      }
    ],
    tongTien: 89000,
    giamGia: 0,
    phuongThucThanhToan: "COD",
    trangThai: "DaGiao",
    ngayDat: "2026-10-20 16:45"
  }
];

// Danh sách Đánh giá mẫu ban đầu
const MOCK_REVIEWS = [
  {
    productId: "SP01",
    userId: "user_shop2",
    userName: "Trần Thị Mai",
    soSao: 5,
    binhLuan: "Máy tính bấm rất nhạy, hàng chính hãng có tem Bitex chuẩn đét. Dùng giải phương trình bậc 4 trong môn Toán cao cấp siêu tiện!",
    ngayDanhGia: "2026-10-22"
  },
  {
    productId: "SP01",
    userId: "user_buyer1",
    userName: "Lê Hoàng Nam",
    soSao: 5,
    binhLuan: "Giao hàng nhanh, đóng gói cẩn thận bọc xốp chống sốc dày. Máy tính mới tinh 100% kèm sổ bảo hành.",
    ngayDanhGia: "2026-10-25"
  },
  {
    productId: "SP02",
    userId: "user_buyer1",
    userName: "Lê Hoàng Nam",
    soSao: 5,
    binhLuan: "Giấy viết rất thích, không bị lem mực sang trang sau. Bìa pastel nhìn siêu xinh cho góc học tập.",
    ngayDanhGia: "2026-10-24"
  },
  {
    productId: "SP04",
    userId: "user_shop1",
    userName: "Nguyễn Văn An",
    soSao: 4,
    binhLuan: "Balo rộng, để vừa con laptop Gaming 15.6 inch của mình và 4 cuốn giáo trình. Vải chống nước ổn.",
    ngayDanhGia: "2026-10-26"
  }
];

// Giỏ hàng mẫu ban đầu
const MOCK_CART = [
  {
    productId: "SP02",
    soLuong: 2,
    donGia: 95000,
    shopId: "user_shop1"
  },
  {
    productId: "SP05",
    soLuong: 1,
    donGia: 145000,
    shopId: "user_shop2"
  }
];

// Danh sách Yêu thích ban đầu
const MOCK_WISHLIST = ["SP01", "SP04", "SP07"];
