// ============================================================
// GOOGLE APPS SCRIPT — Backend của App Báo Cáo TYT Tân Thuận Đông
// Dán code này vào: script.google.com → mở project → Code.gs
// Sau khi sửa: Triển khai → Quản lý triển khai → Cập nhật version mới
// ============================================================

// ID CÁC FILE GOOGLE (KHÔNG THAY ĐỔI):
// - Sheet Thông báo + MK: 1Pnf65pRgLj03NGwsPgzmOrYyBM-IAf02569bKQlpxhA
// - Sheet Báo cáo:         1P-SKfaQnfRVXytqQbjsW1nS2IlI1kKq8aGs2hSYsdu8
// - Doc Tháng:             1KyRElS8TmLbv0Q-Hm7gXl0F3GOIf3dvuNjfS_f167Zo
// - Doc Tuần:              1jHeC7qyUeQqWae1pX6Y2r5vcq-bSx1LXXCAVNFV6vRI
// ============================================================

// Danh sách tên nhân viên (dùng cho trigger tự động)
var ALL_EMPLOYEES = [
  'BS Lê Văn Đạm',
  'YS Trần Thái Vinh',
  'YS Cao Thị Bích Trâm',
  'HS Nguyễn Thị Hồng Phượng',
  'ĐD Thái Thị Duyên',
  'DS Nguyễn Hoàng Tâm',
  'CN Nguyễn Thị Hồng Tươi',
  'ĐD Nguyễn Thị Linh'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    var content = e.postData.contents;
    var data;
    try {
      data = JSON.parse(content);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({result: 'error', error: 'Loi dinh dang du lieu'})).setMimeType(ContentService.MimeType.JSON);
    }

    var sheetIdMsg = '1Pnf65pRgLj03NGwsPgzmOrYyBM-IAf02569bKQlpxhA';
    var ssMsg = SpreadsheetApp.openById(sheetIdMsg);

    // ========================================================
    // LUU MAT KHAU VAO SHEET "DoiMatKhau"
    // ========================================================
    if (data.loai === 'Doi Mat Khau' || data.loai === '\u0110\u1ed5i M\u1eadt Kh\u1ea9u') {
      var sheetMatKhau = ssMsg.getSheetByName('DoiMatKhau');
      if (sheetMatKhau) {
        sheetMatKhau.appendRow([data.thoiGian, data.nhanVien, data.noiDung]);
      }
      return ContentService.createTextOutput(JSON.stringify({result: 'success'})).setMimeType(ContentService.MimeType.JSON);
    }

    // ========================================================
    // QUAN LY THONG BAO BROADCAST (Admin gui tu app)
    // ========================================================
    if (data.loai === 'ThongBao') {
      var sheetThongBao = ssMsg.getSheetByName('ThongBao');
      if (!sheetThongBao) {
        sheetThongBao = ssMsg.insertSheet('ThongBao');
        sheetThongBao.appendRow(['loai', 'noiDung', 'link', 'thoiGian', 'id']);
      }
      var tbId = 'TB_' + new Date().getTime();
      sheetThongBao.appendRow([data.tenLoai, data.noiDung, data.link || '', data.thoiGian, tbId]);
      return ContentService.createTextOutput(JSON.stringify({result: 'success', id: tbId})).setMimeType(ContentService.MimeType.JSON);
    }

    // ========================================================
    // XOA THONG BAO (Admin xoa tu app)
    // ========================================================
    if (data.loai === 'XoaThongBao') {
      var sheetTB = ssMsg.getSheetByName('ThongBao');
      if (sheetTB && data.id) {
        var lastRow = sheetTB.getLastRow();
        for (var r = 2; r <= lastRow; r++) {
          var cellId = sheetTB.getRange(r, 5).getValue().toString().trim();
          if (cellId === data.id) {
            sheetTB.deleteRow(r);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({result: 'success'})).setMimeType(ContentService.MimeType.JSON);
    }

    // ========================================================
    // GUI LOI NHAN CA NHAN (Admin gui tu app)
    // ========================================================
    if (data.loai === 'LoiNhan') {
      var sheetLoiNhan = ssMsg.getSheetByName('LoiNhan');
      if (!sheetLoiNhan) {
        sheetLoiNhan = ssMsg.insertSheet('LoiNhan');
        sheetLoiNhan.appendRow(['nhanVien', 'noiDung', 'thoiGian']);
      }
      var found = false;
      var lastRowLN = sheetLoiNhan.getLastRow();
      for (var ln = 2; ln <= lastRowLN; ln++) {
        var tenNV = sheetLoiNhan.getRange(ln, 1).getValue().toString().trim();
        if (tenNV === data.nhanVien) {
          sheetLoiNhan.getRange(ln, 2).setValue(data.noiDung);
          sheetLoiNhan.getRange(ln, 3).setValue(data.thoiGian);
          found = true;
          break;
        }
      }
      if (!found) {
        sheetLoiNhan.appendRow([data.nhanVien, data.noiDung, data.thoiGian]);
      }
      return ContentService.createTextOutput(JSON.stringify({result: 'success'})).setMimeType(ContentService.MimeType.JSON);
    }

    // ========================================================
    // XOA LOI NHAN CA NHAN (Admin xoa tu app)
    // ========================================================
    if (data.loai === 'XoaLoiNhan') {
      var sheetLN2 = ssMsg.getSheetByName('LoiNhan');
      if (sheetLN2 && data.nhanVien) {
        var lastLN2 = sheetLN2.getLastRow();
        for (var lnr = 2; lnr <= lastLN2; lnr++) {
          var tenCheck = sheetLN2.getRange(lnr, 1).getValue().toString().trim();
          if (tenCheck === data.nhanVien) {
            sheetLN2.deleteRow(lnr);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({result: 'success'})).setMimeType(ContentService.MimeType.JSON);
    }

    // ========================================================
    // LUU BAO CAO VAO GOOGLE SHEETS
    // ========================================================
    var reportSheetId = '1P-SKfaQnfRVXytqQbjsW1nS2IlI1kKq8aGs2hSYsdu8';
    var reportSs = SpreadsheetApp.openById(reportSheetId);
    var sheetBaoCao = reportSs.getSheets()[0];

    sheetBaoCao.appendRow([
      data.thoiGian,
      data.loai,
      data.nhanVien,
      data.noiDung,
      data.phuongHuong,
      data.khoKhan
    ]);

    // ========================================================
    // LUU BAO CAO VAO GOOGLE DOCS
    // ========================================================
    var idThang = '1KyRElS8TmLbv0Q-Hm7gXl0F3GOIf3dvuNjfS_f167Zo';
    var idTuan = '1jHeC7qyUeQqWae1pX6Y2r5vcq-bSx1LXXCAVNFV6vRI';

    var targetId = (data.loai === 'Tu\u1ea7n') ? idTuan : idThang;
    var doc = DocumentApp.openById(targetId);
    var body = doc.getBody();

    var cleanText = data.rawText
      .replace(/\[LOAI:TUAN\]/g, '')
      .replace(/\[LOAI:THANG\]/g, '')
      .trim();

    body.insertParagraph(0, cleanText + '\n\n');
    DocumentApp.flush();

    return ContentService
      .createTextOutput(JSON.stringify({result: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({result: 'error', error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}


// ============================================================
// doGet — Doc du lieu tu Google Sheets
// ============================================================
function doGet(e) {
  var sheetIdMsg = '1Pnf65pRgLj03NGwsPgzmOrYyBM-IAf02569bKQlpxhA';
  var sheetIdReport = '1P-SKfaQnfRVXytqQbjsW1nS2IlI1kKq8aGs2hSYsdu8';

  try {
    var ssMsg = SpreadsheetApp.openById(sheetIdMsg);

    // 1. Doc Thong bao chung & Cong van (sheet ThongBao)
    var sheetThongBao = ssMsg.getSheetByName('ThongBao');
    var dataThongBao = sheetThongBao ? sheetThongBao.getDataRange().getValues() : [];
    var thongBaoList = [];
    for (var i = 1; i < dataThongBao.length; i++) {
      if (dataThongBao[i][0]) {
        thongBaoList.push({
          loai: dataThongBao[i][0].toString().trim(),
          noiDung: dataThongBao[i][1].toString().trim(),
          link: dataThongBao[i][2] ? dataThongBao[i][2].toString().trim() : '',
          thoiGian: dataThongBao[i][3] ? dataThongBao[i][3].toString().trim() : '',
          id: dataThongBao[i][4] ? dataThongBao[i][4].toString().trim() : ''
        });
      }
    }

    // 2. Doc Loi nhan ca nhan (sheet LoiNhan)
    var sheetLoiNhan = ssMsg.getSheetByName('LoiNhan');
    var dataLoiNhan = sheetLoiNhan ? sheetLoiNhan.getDataRange().getValues() : [];
    var loiNhanList = {};
    for (var j = 1; j < dataLoiNhan.length; j++) {
      if (dataLoiNhan[j][0]) {
        var ten = dataLoiNhan[j][0].toString().trim();
        var nhan = dataLoiNhan[j][1].toString().trim();
        loiNhanList[ten] = nhan;
      }
    }

    // 3. Doc bao cao
    var ssReport = SpreadsheetApp.openById(sheetIdReport);
    var sheetBaoCao = ssReport.getSheets()[0];
    var dataBaoCao = sheetBaoCao.getDataRange().getValues();
    var baoCaoList = [];
    for (var k = 1; k < dataBaoCao.length; k++) {
      if (dataBaoCao[k][2]) {
        baoCaoList.push({
          thoiGian: dataBaoCao[k][0].toString(),
          loai: dataBaoCao[k][1].toString(),
          nhanVien: dataBaoCao[k][2].toString(),
          noiDung: dataBaoCao[k][3].toString(),
          phuongHuong: dataBaoCao[k][4].toString(),
          khoKhan: dataBaoCao[k][5].toString()
        });
      }
    }

    // 4. Doc lich su doi mat khau
    var sheetMatKhau = ssMsg.getSheetByName('DoiMatKhau');
    var dataMatKhau = sheetMatKhau ? sheetMatKhau.getDataRange().getValues() : [];
    for (var m = 1; m < dataMatKhau.length; m++) {
      if (dataMatKhau[m][1]) {
        baoCaoList.push({
          thoiGian: dataMatKhau[m][0].toString(),
          loai: '\u0110\u1ed5i M\u1eadt Kh\u1ea9u',
          nhanVien: dataMatKhau[m][1].toString(),
          noiDung: dataMatKhau[m][2].toString(),
          phuongHuong: '',
          khoKhan: ''
        });
      }
    }

    var result = {
      thongBao: thongBaoList,
      loiNhan: loiNhanList,
      baoCao: baoCaoList
    };

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// TRIGGER TU DONG — THONG BAO NHAC NOP BAO CAO
// ============================================================

// Trigger 1: Thu 5 luc 16:00 — nhac nop bao cao tuan
function autoWeeklyReminder() {
  var sheetIdMsg = '1Pnf65pRgLj03NGwsPgzmOrYyBM-IAf02569bKQlpxhA';
  var ssMsg = SpreadsheetApp.openById(sheetIdMsg);
  var sheet = _getOrCreateLoiNhanSheet(ssMsg);

  var now = new Date();
  var thoiGian = Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');
  var noiDung = '\u23f0 NH\u1eaec NH\u1ede: Ng\u00e0y mai (Th\u1ee9 6) l\u00e0 h\u1ea1n n\u1ed9p b\u00e1o c\u00e1o tu\u1ea7n! Vui l\u00f2ng ho\u00e0n th\u00e0nh n\u1ed9i dung v\u00e0 n\u1ed9p tr\u01b0\u1edbc 17:00. \u2014 H\u1ec7 th\u1ed1ng t\u1ef1 \u0111\u1ed9ng';

  for (var i = 0; i < ALL_EMPLOYEES.length; i++) {
    _writeLoiNhan(sheet, ALL_EMPLOYEES[i], noiDung, thoiGian);
  }
  Logger.log('[autoWeeklyReminder] Done at ' + thoiGian);
}

// Trigger 2: Thu 6 luc 17:00 — canh bao ai chua nop
function autoWeeklyUrgent() {
  var sheetIdMsg = '1Pnf65pRgLj03NGwsPgzmOrYyBM-IAf02569bKQlpxhA';
  var sheetIdReport = '1P-SKfaQnfRVXytqQbjsW1nS2IlI1kKq8aGs2hSYsdu8';
  var ssMsg = SpreadsheetApp.openById(sheetIdMsg);
  var ssReport = SpreadsheetApp.openById(sheetIdReport);

  var sheetBaoCao = ssReport.getSheets()[0];
  var dataBaoCao = sheetBaoCao.getDataRange().getValues();
  var sheetLoiNhan = _getOrCreateLoiNhanSheet(ssMsg);

  var now = new Date();
  var thoiGian = Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');

  // Xac dinh tuan hien tai (T2 -> CN)
  var day = now.getDay();
  var mondayOffset = (day === 0) ? -6 : 1 - day;
  var startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + mondayOffset);
  startOfWeek.setHours(0, 0, 0, 0);
  var endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Lay danh sach da nop tuan nay
  var submittedNames = [];
  for (var k = 1; k < dataBaoCao.length; k++) {
    var row = dataBaoCao[k];
    if (!row[2]) continue;
    var loai = row[1] ? row[1].toString() : '';
    if (loai.toLowerCase().indexOf('tu\u1ea7n') === -1) continue;
    var reportDate = _parseDate(row[0] ? row[0].toString() : '');
    if (!reportDate) continue;
    if (reportDate >= startOfWeek && reportDate <= endOfWeek) {
      var name = row[2].toString().trim();
      if (submittedNames.indexOf(name) === -1) submittedNames.push(name);
    }
  }

  // Ghi loi nhan khan cho nguoi chua nop
  for (var n = 0; n < ALL_EMPLOYEES.length; n++) {
    if (submittedNames.indexOf(ALL_EMPLOYEES[n]) === -1) {
      var urgentMsg = '\ud83d\udea8 KH\u1ea8N: B\u1ea1n CH\u01af\u0102 N\u1ed8P b\u00e1o c\u00e1o tu\u1ea7n n\u00e0y! H\u1ec7 th\u1ed1ng s\u1ebd kh\u00f3a s\u1ed5 l\u00fac 12:00 tr\u01b0a Th\u1ee9 2. Vui l\u00f2ng n\u1ed9p ngay! \u2014 H\u1ec7 th\u1ed1ng t\u1ef1 \u0111\u1ed9ng';
      _writeLoiNhan(sheetLoiNhan, ALL_EMPLOYEES[n], urgentMsg, thoiGian);
    }
  }
  Logger.log('[autoWeeklyUrgent] Done. Submitted: ' + submittedNames.join(', '));
}

// Trigger 3 wrapper: Hang ngay 8h, tu kiem tra ngay 24
function autoMonthlyReminderCheck() {
  var today = new Date();
  if (today.getDate() === 24) {
    autoMonthlyReminder();
  }
}

function autoMonthlyReminder() {
  var sheetIdMsg = '1Pnf65pRgLj03NGwsPgzmOrYyBM-IAf02569bKQlpxhA';
  var ssMsg = SpreadsheetApp.openById(sheetIdMsg);
  var sheet = _getOrCreateLoiNhanSheet(ssMsg);

  var now = new Date();
  var thang = now.getMonth() + 1;
  var nam = now.getFullYear();
  var thoiGian = Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');
  var noiDung = '\ud83d\udccb NH\u1eaec: Ng\u00e0y mai (25/' + thang + '/' + nam + ') l\u00e0 h\u1ea1n n\u1ed9p b\u00e1o c\u00e1o th\u00e1ng ' + thang + '! Vui l\u00f2ng chu\u1ea9n b\u1ecb n\u1ed9i dung v\u00e0 n\u1ed9p tr\u01b0\u1edbc 17:00. \u2014 H\u1ec7 th\u1ed1ng t\u1ef1 \u0111\u1ed9ng';

  for (var i = 0; i < ALL_EMPLOYEES.length; i++) {
    _writeLoiNhan(sheet, ALL_EMPLOYEES[i], noiDung, thoiGian);
  }
  Logger.log('[autoMonthlyReminder] Thang ' + thang + '/' + nam + ' done.');
}

// Helper: lay hoac tao sheet LoiNhan
function _getOrCreateLoiNhanSheet(ss) {
  var sheet = ss.getSheetByName('LoiNhan');
  if (!sheet) {
    sheet = ss.insertSheet('LoiNhan');
    sheet.appendRow(['nhanVien', 'noiDung', 'thoiGian']);
  }
  return sheet;
}

// Helper: ghi/cap nhat loi nhan cho mot nhan vien
function _writeLoiNhan(sheet, tenNV, noiDung, thoiGian) {
  var lastRow = sheet.getLastRow();
  for (var r = 2; r <= lastRow; r++) {
    var ten = sheet.getRange(r, 1).getValue().toString().trim();
    if (ten === tenNV) {
      sheet.getRange(r, 2).setValue(noiDung);
      sheet.getRange(r, 3).setValue(thoiGian);
      return;
    }
  }
  sheet.appendRow([tenNV, noiDung, thoiGian]);
}

// Helper: parse chuoi ngay DD/MM/YYYY HH:mm
function _parseDate(dateStr) {
  if (!dateStr) return null;
  var trimmed = dateStr.trim();
  if (trimmed.indexOf('/') !== -1 && !/[a-zA-Z]/.test(trimmed)) {
    var parts = trimmed.split(' ');
    var dateParts = parts[0].split('/');
    if (dateParts.length < 3) return null;
    var d = parseInt(dateParts[0], 10);
    var mo = parseInt(dateParts[1], 10) - 1;
    var y = parseInt(dateParts[2], 10);
    var h = 0, mi = 0;
    if (parts.length > 1) {
      var tp = parts[1].split(':');
      if (tp.length >= 2) { h = parseInt(tp[0], 10); mi = parseInt(tp[1], 10); }
    }
    return new Date(y, mo, d, h, mi);
  }
  var p = new Date(trimmed);
  return isNaN(p.getTime()) ? null : p;
}

// ============================================================
// CAI DAT TAT CA TRIGGER — Chay ham nay 1 LAN DUY NHAT
// GAS Editor → chon ham setupAllTriggers → Run
// ============================================================
function setupAllTriggers() {
  // Xoa trigger cu de tranh trung lap
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var fn = triggers[i].getHandlerFunction();
    if (fn === 'autoWeeklyReminder' || fn === 'autoWeeklyUrgent' || fn === 'autoMonthlyReminderCheck') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Trigger 1: Thu 5 luc 16:00-17:00
  ScriptApp.newTrigger('autoWeeklyReminder')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.THURSDAY)
    .atHour(16)
    .create();

  // Trigger 2: Thu 6 luc 17:00-18:00
  ScriptApp.newTrigger('autoWeeklyUrgent')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(17)
    .create();

  // Trigger 3: Hang ngay 08:00-09:00 (tu loc ngay 24 ben trong)
  ScriptApp.newTrigger('autoMonthlyReminderCheck')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  Logger.log('Da cai dat 3 trigger thanh cong!');
  Logger.log('  - Thu 5 luc 16h: autoWeeklyReminder');
  Logger.log('  - Thu 6 luc 17h: autoWeeklyUrgent');
  Logger.log('  - Hang ngay 8h: autoMonthlyReminderCheck (loc ngay 24)');
}
