## [2026-08-15] — Phát hiện nguyên nhân gốc lỗi mật khẩu

### 🔴 BUG NGHIÊM TRỌNG phát hiện trong Google Apps Script

**Vấn đề:** Hàm đọc dữ liệu đang bị đặt tên là `OLD_doGet` thay vì `doGet`.

**Hậu quả:** Khi app gọi `fetch(SCRIPT_URL)` (GET request), Google Apps Script không tìm thấy hàm `doGet()` → trả về lỗi hoặc rỗng → `systemData.baoCao` rỗng → **tất cả nhân viên buộc phải dùng MK mặc định** (dù đã đổi MK).

**Kiến trúc thực tế của backend (Google Apps Script):**

```
doPost (POST) → Lưu vào Sheets/Docs
  ├── loai === 'Đổi Mật Khẩu' → Sheet "DoiMatKhau" (cột A: thời gian, B: tên, C: MK mới)
  └── loai khác (Tuần/Tháng)  → Sheet báo cáo + Google Doc

doGet  (GET)  → Đọc & trả JSON cho App
  ├── Sheet ThongBao → thongBaoList (chữ chạy, công văn)
  ├── Sheet LoiNhan  → loiNhanList  (lời nhắn cá nhân)
  ├── Sheet baoCao   → baoCaoList   (báo cáo tuần/tháng)
  └── Sheet DoiMatKhau → gộp vào baoCaoList với loai='Đổi Mật Khẩu'
```

**Cách sửa:** Vào script.google.com → mở project → đổi tên `OLD_doGet` → `doGet` → Triển khai → Cập nhật version mới.

**File code GAS đã lưu tại:** `google-apps-script.js` (đã sửa sẵn tên đúng)

---
# 📝 CHANGELOG — Lịch sử thay đổi App

> **Cách dùng:** Mỗi lần sửa app, ghi vào đây: ngày, sửa gì, ở đâu (dòng bao nhiêu).  
> Sang máy mới / nhờ AI sửa tiếp → chỉ cần đọc file này, không cần đọc lại toàn bộ code.

---

## [2026-08-15] — Tối ưu & sửa bug lần 1

### 🐛 Sửa bug: Đổi mật khẩu không hoạt động

**Vấn đề:** Khi mở modal "Đổi mật khẩu", app không fetch lại data từ Sheets → MK đã đổi không được nhận ra → báo "Mật khẩu cũ không đúng".

**Sửa tại:** `index.html` — hàm `openPasswordModal()` (khoảng dòng 2192)
```javascript
// THÊM 1 dòng:
function openPasswordModal() {
    passwordModal.classList.remove('hidden');
    fetchSystemData(); // ← THÊM ĐÂY để load MK mới nhất từ Sheets
}
```

---

### 🐛 Sửa bug: Race condition — đăng nhập trước khi data load xong

**Vấn đề:** `fetchSystemData()` là async. Nếu người dùng nhấn Đăng nhập ngay khi trang vừa mở (trước khi Sheets load xong), `systemData.baoCao` còn rỗng → app dùng MK mặc định → **ai đã đổi MK sẽ bị báo sai**.

**Sửa tại:** 2 chỗ trong `index.html`

1. **Nút Đăng nhập** (dòng ~214) — thêm `id="login-btn"` và trạng thái `disabled` ban đầu:
```html
<button id="login-btn" type="submit" disabled ...>
    <svg class="animate-spin ...">...</svg>
    Đang tải dữ liệu...
</button>
```

2. **Hàm `fetchSystemData()`** (dòng ~754) — thêm `finally` để mở khóa nút sau khi load xong:
```javascript
} finally {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Đăng nhập';
    }
}
```

---

### 🚧 Tính năng mới: Chế độ bảo trì (Maintenance Mode)

**Mục đích:** Admin bật khi cần cập nhật app — nhân viên thấy trang "Hệ thống đang nâng cấp" đẹp, không vào được. Admin vẫn đăng nhập bình thường.

**Cách bật/tắt:** Tìm dòng này trong `index.html` (~dòng 728):
```javascript
const MAINTENANCE_MODE = false; // ← đổi thành true để bật
```

**Thêm vào `index.html`:**
- CSS trang bảo trì (trong `<style>`, ~dòng 66): animation float, gradient tối, progress bar
- HTML trang bảo trì (trước `<div id="app">`, ~dòng 162): màn hình toàn trang
- Hàm `checkMaintenanceMode()` (dòng ~783): đọc flag và ẩn/hiện app
- Gọi `checkMaintenanceMode()` trong `fetchSystemData()` sau khi data load

---

### 📋 Cập nhật tài liệu

- **`README.md`** — viết lại hoàn chỉnh: tài khoản MK, kiến trúc hệ thống, biến quan trọng, chế độ bảo trì, cấu trúc thư mục, nơi lưu dữ liệu, cách deploy, lỗi thường gặp, danh sách nhân viên.

---

## [Trước 2026-08-15] — Phiên bản gốc

- App nộp báo cáo tuần/tháng cho 8 nhân viên + 1 admin
- Kết nối Google Sheets qua Google Apps Script (`SCRIPT_URL`)
- PWA (Progressive Web App) — cài được trên điện thoại
- Admin dashboard: xem trạng thái nộp báo cáo, xem MK nhân viên, biên bản họp
- Nhân viên: nộp báo cáo, lưu nháp, đổi MK cá nhân
- Chữ chạy thông báo, công văn từ Google Sheets

---

## 📌 QUY TRÌNH AI SỬA CODE — ĐỌC TRƯỚC KHI LÀM BẤT CỨ GÌ

### Bước 1 — AI phải đọc file này (CHANGELOG.md) trước

Khi người dùng yêu cầu thay đổi bất cứ gì, AI **PHẢI**:
1. Đọc `CHANGELOG.md` → biết đã làm gì, ở dòng nào
2. Đọc `google-apps-script.js` nếu liên quan đến backend
3. **Chỉ tìm đúng hàm/dòng cần sửa** — không đọc lại toàn bộ file

### Bước 2 — Tìm chính xác vị trí cần sửa

```powershell
# Tìm nhanh hàm trong index.html (thay "tenHam" bằng tên hàm):
Select-String -Path "index.html" -Pattern "tenHam"

# Xem nội dung xung quanh dòng tìm được:
# → view_file từ dòng (X-5) đến (X+20)
```

### Bước 3 — Sửa có mục tiêu (surgical edit)

- **CHỈ sửa đúng đoạn liên quan** — không đụng vào các hàm khác
- Dùng `multi_replace_file_content` với `StartLine` và `EndLine` chính xác
- Sau khi sửa: **ghi thêm vào CHANGELOG này**

### Bước 4 — Ghi CHANGELOG sau mỗi lần sửa

```markdown
## [YYYY-MM-DD] — Tên thay đổi

### Vấn đề
[Mô tả ngắn vấn đề]

### Sửa tại
- File: `index.html` dòng ~XXX
- Hàm: `tenHam()`
- Thay đổi: [1 câu mô tả]
```

---

## 📂 Bản đồ các hàm quan trọng trong `index.html`

| Hàm / Khu vực | Dòng ~ | Mô tả |
|---|---|---|
| `const employees = [...]` | 707 | Danh sách nhân viên |
| `const DEFAULT_PASSWORD` | 719 | MK mặc định nhân viên |
| `const SCRIPT_URL` | 720 | URL Google Apps Script |
| `const MAINTENANCE_MODE` | 728 | Bật/tắt trang bảo trì |
| `fetchSystemData()` | 760 | Fetch data từ Sheets |
| `checkMaintenanceMode()` | 783 | Kiểm tra bảo trì |
| `init()` | 1162 | Khởi tạo app |
| `loginForm.addEventListener` | 1229 | Xử lý đăng nhập |
| `showAdminSection()` | 1454 | Hiện trang admin |
| `loadAdminData()` | 1877 | Load data admin panel |
| `openPasswordModal()` | ~2192 | Mở modal đổi MK |
| `showPasswords()` | ~2280 | Admin xem MK nhân viên |
| `#login-btn` | ~214 | Nút đăng nhập (HTML) |
| `#maintenance-screen` | ~162 | Trang bảo trì (HTML) |
