# GPA FPT University (GPA_FPTuniversity)

<p align="center">
  <img src="icons/icon128.png" alt="Logo" width="100"/>
</p>

<p align="center">
  <strong>Giải pháp phân tích điểm số GPA và phân phối tín chỉ toàn diện dành cho sinh viên Đại học FPT.</strong>
</p>

<p align="center">
  <a href="https://github.com/MinhHK68/GPA_FPTuniversity/tags"><img src="https://img.shields.io/github/v/tag/MinhHK68/GPA_FPTuniversity?label=Version" alt="Version"></a>
  <img src="https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge%20%7C%20Brave-orange" alt="Platform">
  <img src="https://img.shields.io/badge/License-Proprietary-red" alt="License">
</p>

---

## 🌟 Giới thiệu tổng quan
**GPA FPT University** (tên cũ: `FAP GPA Analyzer Pro`) là một tiện ích mở rộng (Chrome Extension) mạnh mẽ, an toàn và trực quan được thiết kế dành riêng cho sinh viên Đại học FPT. 

Tiện ích này giúp tự động hóa quá trình cào dữ liệu điểm từ trang bảng điểm cá nhân trên hệ thống **FAP (FPT Academic Portal)**, tự động lọc và tính toán điểm trung bình tích lũy (GPA) theo thang điểm 10 và các chỉ số học thuật chi tiết qua từng học kỳ mà không cần tính toán thủ công.

---

## ✨ Các tính năng nổi bật
* **Tự động trích xuất điểm số:** Tự động phát hiện và cào chính xác bảng điểm trên hệ thống FAP (`fap.fpt.edu.vn`).
* **Lọc dữ liệu học thuật thông minh:**
  * Tự động loại bỏ các môn học chuẩn bị Tiếng Anh (`TERM <= 0`).
  * Loại bỏ các môn học chưa có điểm hoặc trạng thái đang học (`Studying`), học lại (`Failed`), hoặc miễn giảm (`Exempt`).
  * Chỉ tính toán dựa trên các môn đã đạt (`Passed`) và có tín chỉ hợp lệ để phản ánh đúng điểm số thực tế.
* **Bảng điều khiển Analytics trực quan:**
  * Hiển thị điểm GPA trung bình tích lũy của toàn bộ các kỳ học.
  * Phân tích GPA và tổng số tín chỉ tích lũy chi tiết của từng học kỳ.
  * Giao diện thiết kế theo phong cách tối giản, hiện đại và hỗ trợ trải nghiệm người dùng tối đa.
* **Bảo mật tuyệt đối:** Tiện ích hoạt động hoàn toàn cục bộ trên trình duyệt của bạn. Không lưu trữ thông tin đăng nhập, không gửi dữ liệu điểm số ra bất kỳ máy chủ bên thứ ba nào.

---

## 🛠️ Hướng dẫn cài đặt chi tiết (Developer Mode)

Vì đây là tiện ích bảo mật nội bộ và tối ưu hiệu năng, bạn có thể dễ dàng cài đặt trực tiếp vào trình duyệt của mình bằng chế độ nhà phát triển (Developer Mode):

### Bước 1: Tải mã nguồn về máy
1. Nhấn vào nút xanh **Code** ở góc trên bên phải của trang GitHub này.
2. Chọn **Download ZIP**.
3. Giải nén tệp tin vừa tải về vào một thư mục cố định trên máy tính của bạn (ví dụ: `C:\GPA_FPTuniversity`).

### Bước 2: Kích hoạt Developer Mode trên trình duyệt
1. Mở trình duyệt Chrome (hoặc bất kỳ trình duyệt nhân Chromium nào như Microsoft Edge, Cốc Cốc, Brave).
2. Truy cập vào trang quản lý tiện ích bằng cách sao chép và dán đường dẫn sau vào thanh địa chỉ:
   * **Chrome:** `chrome://extensions/`
   * **Edge:** `edge://extensions/`
3. Kích hoạt tính năng **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải màn hình.

### Bước 3: Nạp tiện ích vào trình duyệt
1. Nhấp vào nút **Tải tiện ích đã giải nén (Load unpacked)** ở góc trên bên trái.
2. Chọn đúng thư mục chứa dự án mà bạn đã giải nén ở **Bước 1** (thư mục chứa tệp `manifest.json`).
3. Tiện ích **GPA FPT University** sẽ ngay lập tức xuất hiện trong danh sách tiện ích của bạn!

---

## 📖 Hướng dẫn sử dụng
1. Đăng nhập vào trang hệ thống **FAP** của Đại học FPT (`fap.fpt.edu.vn`).
2. Điều hướng đến trang **Student Transcript** (Xem bảng điểm cá nhân) của bạn.
3. Nhấp vào biểu tượng **Mảnh ghép tiện ích (Extensions)** ở góc trên bên phải trình duyệt và ghim tiện ích **GPA FPT University** lên thanh công cụ.
4. Nhấp vào biểu tượng tiện ích. Tiện ích sẽ tự động nhận diện bảng điểm, tính toán và hiển thị bảng phân tích GPA thông minh ngay tức thì trên màn hình popup!

---

## 🛡️ Chính sách bảo mật & Bản quyền (License & Security)

### Bảo mật mã nguồn
Mã nguồn này được thiết kế và bảo vệ nghiêm ngặt:
* **Tác quyền:** Bản quyền thuộc sở hữu độc quyền của **MinhHK68**.
* **Phân phối:** Nghiêm cấm mọi hành vi sao chép, phân phối, sửa đổi hoặc đăng tải lại mã nguồn này lên các cửa hàng tiện ích (Chrome Web Store) hoặc các nền tảng chia sẻ mã nguồn công khai khác mà không có sự đồng ý bằng văn bản của tác giả.
* **Mã hóa bảo vệ (Code Obfuscation):** Nhằm ngăn chặn các hành vi sao chép trái phép và dịch ngược mã nguồn (reverse-engineering), toàn bộ tệp JavaScript thực thi của tiện ích đã được mã hóa bảo mật tối đa trước khi đưa vào môi trường phân phối.

---
*Phát triển và duy trì bởi [MinhHK68](https://github.com/MinhHK68).*
