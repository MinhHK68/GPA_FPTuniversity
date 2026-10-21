# GPA FPT University – Extension tính GPA FPT từ FAP

<img src="icons/icon128.png" alt="Biểu tượng GPA FPT University" width="96" height="96">

**Tính GPA FPT hệ 10 và hệ 4 từ bảng điểm FAP, thống kê tín chỉ và giả lập cải thiện điểm.** Tiện ích dành cho sinh viên Đại học FPT, phát triển bởi MinhHK68.

**[Cài miễn phí trên Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/lmcfppbohifkbeahgjcmkgmojijghode)** · **[Website và hướng dẫn](https://minhhk68.github.io/GPA_FPTuniversity/)** · **[Báo lỗi](https://github.com/MinhHK68/GPA_FPTuniversity/issues)**

## Tính năng

- Đọc dữ liệu bảng điểm FAP, giảm nhập từng môn thủ công.
- Xem GPA theo hệ 10 hoặc hệ 4, tất cả học kỳ hoặc một học kỳ.
- Thống kê môn học, tín chỉ và kết quả theo học kỳ.
- Tham khảo gợi ý môn cải thiện và thử điểm dự kiến trong mục Giả lập.
- Xuất báo cáo CSV hoặc JSON để lưu lại.

Kết quả hỗ trợ tham khảo. Hãy đối chiếu bảng điểm chính thức và quy định áp dụng cho khóa/chương trình, nhất là môn điều kiện, học lại, cải thiện và quy đổi hệ 4. Đây là tiện ích độc lập, không phải sản phẩm chính thức của Đại học FPT.

## Cài đặt trên Microsoft Edge

1. Mở [GPA FPT University trên Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/lmcfppbohifkbeahgjcmkgmojijghode) bằng Microsoft Edge.
2. Chọn **Get / Nhận**, đọc quyền truy cập và hoàn tất cài đặt.
3. Ghim biểu tượng tiện ích nếu muốn truy cập nhanh.
4. Đăng nhập [FAP](https://fap.fpt.edu.vn/) và mở **Student Transcript / Transcript**.
5. Mở tiện ích. Nếu chưa có dữ liệu, dùng nút đi tới bảng điểm và làm mới dữ liệu.

## Hướng dẫn sử dụng và tính GPA

- [Cách cài extension GPA FPT và xem điểm trên FAP](https://minhhk68.github.io/GPA_FPTuniversity/huong-dan-cai-dat.html)
- [Cách tính GPA FPT theo tín chỉ: công thức, ví dụ và công cụ minh họa](https://minhhk68.github.io/GPA_FPTuniversity/cach-tinh-gpa-fpt.html)
- [Cải thiện GPA và tính điểm mục tiêu](https://minhhk68.github.io/GPA_FPTuniversity/cai-thien-gpa.html)
- [Không hiện GPA trên FAP: cách kiểm tra](https://minhhk68.github.io/GPA_FPTuniversity/khac-phuc-loi.html)

## Cài thủ công cho trình duyệt Chromium

Dành cho người hiểu chế độ nhà phát triển; bản này không tự cập nhật từ Edge Add-ons.

1. Chọn **Code → Download ZIP**, giải nén mã nguồn từ repository này.
2. Mở `chrome://extensions/` trên Chrome/Brave hoặc `edge://extensions/` trên Edge.
3. Bật **Developer mode**, chọn **Load unpacked**.
4. Chọn thư mục có `manifest.json`, sau đó mở bảng điểm FAP.

## Quyền truy cập và hỗ trợ

Manifest khai báo `activeTab`, `storage`, `scripting` và host `https://fap.fpt.edu.vn/*`. Xem công bố dữ liệu và chính sách được liên kết trong mục Privacy của [bản phát hành trên Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/lmcfppbohifkbeahgjcmkgmojijghode) trước khi sử dụng.

Khi [báo lỗi](https://github.com/MinhHK68/GPA_FPTuniversity/issues), ghi phiên bản tiện ích, trình duyệt và thao tác gây lỗi. Che thông tin cá nhân trong ảnh; không đăng mật khẩu, cookie, token, mã sinh viên hoặc toàn bộ bảng điểm vào issue công khai.

## Phát hành website miễn phí

Website tĩnh nằm trong `docs/`, dùng GitHub Pages với nguồn `main` → `/docs`. Không cần cài gói phụ thuộc hoặc mua tên miền. Sitemap: `https://minhhk68.github.io/GPA_FPTuniversity/sitemap.xml`.

## 🛡️ Chính sách bảo quyền (License)

* **Tác quyền:** Bản quyền thuộc sở hữu độc quyền của **MinhHK68**.
* **Phân phối:** Nghiêm cấm mọi hành vi sao chép, phân phối, sửa đổi hoặc đăng tải lại mã nguồn này lên các cửa hàng tiện ích (Chrome Web Store) hoặc các nền tảng chia sẻ mã nguồn công khai khác khi chưa có sự đồng ý bằng văn bản từ tác giả.

---
*Phát triển và duy trì bởi [MinhHK68](https://github.com/MinhHK68).*
