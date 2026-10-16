# TÍCH HỢP UC04 CỦA HÀ MY VÀO HỆ THỐNG TỔNG

## Phạm vi
- Nguồn tổng: BA-main.zip do nhóm xuất từ GitHub.
- Nguồn thay đổi: Web prototype cho công nợ (Community).zip của My.
- Giữ nguyên các module UC01/UC02/UC03/UC05 và dữ liệu chung. App.tsx chỉ chỉnh đúng một chỗ: truyền callback thoát UC04 để quay về UC01.
- src/Notifications.tsx trở thành adapter mở UC04 mới của My từ menu gốc.
- Mã My đặt riêng dưới src/uc04/ (không đè src/ui.tsx, src/store.ts hay CSS gốc).
- src/uc04/styles.css đã được giới hạn vào .uc04-module để tránh thay đổi giao diện UC khác.

## Tình trạng liên thông
- UC04 đọc dữ liệu khoản phải thu còn số dư từ src/store.ts, bao gồm các thay đổi hợp lệ do UC01/UC02 cập nhật. Chỉ đọc, không tự hạch toán.
- UC04 chỉ xác định quá hạn khi dữ liệu chung có hạn thanh toán; không tự suy diễn hạn.
- Danh mục kịch bản, hàng đợi và lịch sử UC04 giữ logic demo của My, lưu localStorage riêng. Không đồng bộ với lịch sử/kịch bản UC04 cũ trong store gốc.
- Chưa gửi Zalo/SMS/Email thực, chưa có job scheduler/backend. “Đã gửi” chỉ là mô phỏng.
- Vì dữ liệu chung khác bộ dữ liệu mẫu riêng của My, số lượng thông báo đủ điều kiện quét và danh sách chờ có thể khác so với bản My độc lập. Đây là hành vi có chủ đích.
- Trường "số ngày không phát sinh đơn mới" chưa thể xác minh từ dữ liệu nguồn nên được đặt 0 trong adapter; không trình bày là dữ liệu thật.
- Chức năng "In/Lưu PDF" sử dụng lệnh in trình duyệt; "Xuất Excel" vẫn là Excel XML (.xml) theo bản My, không phải .xlsx.

## Kiểm tra trước khi nộp
1. UC01: ghi tăng một chứng từ và kiểm tra danh sách, chống ghi trùng.
2. UC02: ghi giảm/phân bổ, kiểm tra số còn phải thu.
3. UC03: kiểm tra 3 nhóm đối chiếu còn mở được.
4. UC04: mở 4 thẻ Lập thông báo, Kịch bản nhắc nợ, Chờ duyệt gửi, Lịch sử; xem trước, lưu, xuất.
5. UC05: xem/in/xuất báo cáo. Kiểm tra mobile và không có lỗi console.

## Đưa lên GitHub
- Tạo bản sao repo hoặc commit backup trước.
- Giải nén ZIP toàn bộ hệ thống, kéo nội dung đúng cấu trúc vào GitHub, không upload ZIP như một file dữ liệu.
- Các tệp thực sự thay đổi ngoài tài liệu này: src/App.tsx (một chỗ gọi), src/Notifications.tsx và thư mục src/uc04/.
- Nếu muốn cập nhật ít nhất, chỉ chép ba đường dẫn đó vào repo hiện có (bản PATCH đi kèm).
- Vercel auto-deploy khi push lên branch liên kết; kiểm tra build log và site sau khi Ready.
