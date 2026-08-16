# 📋 Báo Cáo — Điểm Y Tế Tân Thuận Đông

> Hệ thống nộp báo cáo tuần/tháng cho cán bộ y tế. Dữ liệu lưu trên **Google Sheets**, không cần server riêng.

---

## ⚡ Chạy nhanh (sang máy mới, mở lại dự án)

**Cách 1 — Mở thẳng trình duyệt** (đơn giản nhất):
> Nhấp đúp vào `index.html` → Chrome/Edge mở lên → dùng được ngay

**Cách 2 — Chạy dev server** (nếu cần hot-reload):
```bash
npm install
npm run dev
```
> Truy cập: `http://localhost:5173`

---

## 🔐 Tài khoản đăng nhập

| Tài khoản | Mật khẩu mặc định | Ghi chú |
|-----------|-------------------|---------|
| BS Tâm (Quản lý) — **Admin** | `0939942781` | Vào được trang quản lý |
| Tất cả nhân viên | `123456` | Mỗi người tự đổi MK sau khi đăng nhập |

> **Lưu ý:** Mật khẩu sau khi đổi được lưu trên Google Sheets. Đăng nhập từ máy nào cũng dùng MK mới nhất.

---

## 🏗️ Kiến trúc hệ thống

```
Trình duyệt (index.html)
    │
    ├─ GET  ──► Google Apps Script ──► Đọc Google Sheets
    │           (SCRIPT_URL)              (baoCao, thongBao, loiNhan)
    │
    └─ POST ──► Google Apps Script ──► Ghi Google Sheets
```

**Không có server riêng.** Toàn bộ logic backend nằm trong **Google Apps Script**.

---

## 🔧 Các biến quan trọng trong `index.html`

| Biến | Dòng | Giá trị / Mô tả |
|------|------|-----------------|
| `SCRIPT_URL` | ~644 | URL Google Apps Script (đã cài sẵn) |
| `DEFAULT_PASSWORD` | ~643 | `'123456'` — MK mặc định nhân viên |
| `MAINTENANCE_MODE` | ~647 | `false` = bình thường, `true` = bật bảo trì |
| `employees` | ~625 | Danh sách nhân viên + nhiệm vụ |

---

## 🚧 Chế độ bảo trì

Khi cần cập nhật hoặc chưa muốn chia sẻ app, bật bảo trì bằng cách:

**Mở `index.html`, tìm dòng `MAINTENANCE_MODE`:**
```javascript
// Bật bảo trì → nhân viên thấy trang "Hệ thống đang nâng cấp"
const MAINTENANCE_MODE = true;

// Tắt bảo trì khi xong
const MAINTENANCE_MODE = false;
```
> ✅ **Admin vẫn đăng nhập vào được** dù đang bật bảo trì.

---

## 📁 Cấu trúc thư mục

```
baocaotanthuandong/
├── index.html        ← Toàn bộ app (HTML + CSS + JS trong 1 file)
├── sw.js             ← Service Worker cho PWA (cache offline)
├── manifest.json     ← Cấu hình PWA (icon, tên app, màu)
├── package.json      ← Chỉ dùng nếu chạy dev server (Vite)
├── vite.config.ts    ← Cấu hình Vite
├── push.bat          ← Script push lên GitHub nhanh (Windows)
└── README.md         ← Tài liệu này
```

---

## 📊 Dữ liệu lưu ở đâu?

| Loại dữ liệu | Lưu ở đâu | Ghi chú |
|-------------|----------|---------|
| Báo cáo tuần/tháng | Google Sheets | Cột `baoCao` |
| Mật khẩu đã đổi | Google Sheets | Loại `Đổi Mật Khẩu` |
| Biên bản họp | Google Sheets | Loại `Biên Bản Họp` |
| Thông báo / Chữ chạy | Google Sheets | Cột `thongBao` |
| Lời nhắn cá nhân | Google Sheets | Cột `loiNhan` |
| Nháp báo cáo chưa gửi | `localStorage` trình duyệt | Chỉ trên máy đó, không sync |

---

## 🚀 Deploy / Chia sẻ cho nhân viên

**Dùng GitHub Pages (miễn phí):**
```bash
# Dùng push.bat có sẵn (Windows) — nhấp đúp hoặc:
.\push.bat

# Hoặc thủ công:
git add .
git commit -m "cap nhat"
git push
```
> Link nhân viên dùng: `https://[username].github.io/baocaotanthuandong/`

---

## ❓ Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|-----|-------------|------------|
| Đăng nhập không được | MK đã đổi trước đó | Hỏi Admin xem MK trong "Danh sách MK" |
| Không tải được dữ liệu | Mất mạng hoặc GAS lỗi | Tải lại trang |
| Nháp bị mất | Dùng máy/trình duyệt khác | Nháp lưu local — gõ lại hoặc gửi thẳng |
| Trang bảo trì không tắt | `MAINTENANCE_MODE = true` | Đổi thành `false` rồi lưu |

---

## 👥 Danh sách nhân viên

| ID | Tên | Nhiệm vụ chính |
|----|-----|----------------|
| admin | BS Tâm (Quản lý) | Quản lý, điều hành chung |
| nv1 | BS Lê Văn Đạm | Khám chữa bệnh, HA, ĐTĐ, GDSK |
| nv2 | YS Trần Thái Vinh | SXH, TCM, Lao, Giám sát, Tiêm chủng |
| nv3 | YS Cao Thị Bích Trâm | VSMT, ATVSLĐ, ATTP, Trực tua |
| nv4 | HS Nguyễn Thị Hồng Phượng | HIV, STI, Phong, Sốt rét, Da liễu |
| nv5 | ĐD Thái Thị Duyên | SDD, Kế toán BHYT, KSNK |
| nv6 | DS Nguyễn Hoàng Tâm | Dược, Vật tư, Thống kê, Văn thư |
| nv7 | CN Nguyễn Thị Hồng Tươi | NCT, Khuyết tật, Dân số, TNTT |
| nv8 | ĐD Nguyễn Thị Linh | Chăm sóc BN, TCMR, Y tế học đường |

> Thêm/xóa nhân viên: mở `index.html`, sửa mảng `employees` (dòng ~625).

---

*Cập nhật lần cuối: 2026-08-15*
