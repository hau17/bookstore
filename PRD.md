# Product Requirements Document (PRD) v1.0
- **Dự án:** Hệ thống Quản trị và Bán Sách Trực Tuyến (Bookstore Web Application)
- **Phiên bản:** 1.0

---

## 1. Overview & Goals
**Mục tiêu (Goals):**
Xây dựng một nền tảng thương mại điện tử chuyên biệt để bán sách trực tuyến. Cung cấp cho khách hàng trải nghiệm mua sắm mượt mà (tìm kiếm, giỏ hàng, đặt hàng) và trang bị cho bộ máy vận hành nội bộ một hệ thống quản trị tập trung (từ quản lý sản phẩm, kho bãi nhập hàng cho đến xử lý đơn hàng theo luồng trạng thái).

**Tổng quan (Overview):**
Hệ thống được chia thành 2 phân hệ (Portals) độc lập:
- **Client Portal:** Giao diện cho Khách hàng cuối để khám phá và mua sắm.
- **Admin Portal:** Giao diện cho Ban quản trị để theo dõi, vận hành định lượng kho và báo cáo doanh thu.

---

## 2. In-scope / Out-of-scope (MVP)
**In-scope (Trong phạm vi MVP):**
- Quản lý tài khoản và định danh riêng biệt giữa Admin và Client.
- Khách hàng xem danh mục, tìm kiếm và xem chi tiết tồn kho/giá sách.
- Khách hàng thêm sách vào giỏ hàng hoặc mua ngay (Buy Now).
- Khách hàng đặt hàng với phương thức (COD hoặc Chuyển khoản QR code tĩnh).
- Quản trị viên quản lý danh mục dữ liệu cấu thành sản phẩm (Author, Category, Publisher).
- Quản trị viên quản lý kho, lập phiếu nhập hàng mới và tính lại giá vốn trung bình linh động (`avg_import_price`).
- Quản trị viên xử lý đơn hàng theo trạng thái (Pending -> Processing -> Completed / Cancelled).

**Out-of-scope (Ngoài phạm vi MVP - Future Enhancements):**
- Tích hợp cổng thanh toán trực tuyến (VNPAY, MoMo, ZaloPay với IPN/Webhooks).
- Đề xuất sản phẩm tự động dựa theo hành vi (AI Recommendation).
- Email / SMS Notification khi trạng thái đơn hàng thay đổi.
- Ứng dụng di động (Mobile App).
- Hệ thống khuyến mãi, Voucher, mã giảm giá (Coupon).

---

## 3. Personas / Roles
| Role | Phân hệ (Portal) | Mô tả & Quyền hạn |
|---|---|---|
| **Client** (Khách hàng) | Client | Người dùng cuối mua hàng. Có thể quản lý hồ sơ cá nhân, xem và mua sách, theo dõi lịch sử đơn hàng của chính mình. |
| **Admin** (Quản trị viên) | Admin | Toàn quyền kiểm soát hệ thống nội bộ. Đặc quyền: Được phép tạo và quản lý tài khoản nhân sự nội bộ (Manager, Staff), tài khoản Client. |
| **Manager** (Quản lý) | Admin | Quản lý vòng đời sản phẩm, duyệt số liệu kho (nhập hàng) và giám sát doanh thu trên Dashboard. Không quản lý tài khoản nhân sự khác. |
| **Staff** (Nhân viên) | Admin | Chuyên trách thực thi công việc: lên đơn, duyệt trạng thái đơn hàng, tạo phiếu nhập hàng theo chỉ đạo. |

---

## 4. User Stories theo từng module

| Module | Role | User Story (As a... I want to... So that...) |
|---|---|---|
| **Auth** | Client | As a Client, I want to đăng ký/đăng nhập bằng email/password so that tôi có thể quản lý giỏ hàng và đặt hàng. |
| **Auth** | Admin/Staff | As a Staff, I want to đăng nhập vào trang CMS so that tôi có thể làm việc trên hệ thống vận hành. |
| **Product** | Client | As a Client, I want to xem trang chủ, danh sách, tìm kiếm và xem chi tiết sản phẩm so that tôi tìm được cuốn sách mong muốn và biết mức giá, số lượng tồn. |
| **Cart** | Client | As a Client, I want to thêm sách vào giỏ hàng, cập nhật số lượng và xóa sản phẩm so that tôi có thể chuẩn bị thanh toán gộp một lần. |
| **Checkout** | Client | As a Client, I want to nhập thông tin giao hàng và đặt hàng nhanh so that tôi có thể mua sách thành công. |
| **Orders** | Client | As a Client, I want to xem danh sách đơn hàng đã mua và trạng thái đơn so that tôi biết hàng khi nào tới hoặc có bị hủy không. |
| **Orders** | Client | As a Client, I want to hủy các đơn ở trạng thái "Chờ xác nhận" so that tôi có quyền đổi ý khi chưa chốt hàng. |
| **Master Data** | Manager | As a Manager, I want to CRUD danh mục (Category, Author, Publisher) so that tôi có thể phân loại sách trên hệ thống. |
| **Inventory** | Manager/Staff | As a Staff, I want to lập phiếu nhập kho sách mới từ NXB so that hệ thống tự động cộng dồn tồn kho và tính lại giá trung bình. |
| **Order Mgmt** | Staff | As a Staff, I want to đổi trạng thái các đơn đặt hàng (Pending -> Processing...) so that luồng giao hàng được ghi nhận và vận hành trơn tru. |
| **Accounts** | Admin | As an Admin, I want to tạo tài khoản Staff mới hoặc khóa tài khoản Client vi phạm so that hệ thống được bảo mật và an toàn. |

---

## 5. Functional Requirements (FR)

### 5.1 Phân hệ Client (Khách hàng)
- **Account & Auth:** Đăng ký, đăng nhập. Cập nhật thông tin profile cá nhân. Đổi mật khẩu.
- **Home & Catalog:** 
  - Hiển thị sách mới nhất, sách tiêu biểu.
  - Search sách theo tên phân trang.
  - Trang chi tiết sách (Image, Title, Selling Price, Original Price, Stock quantity, Mô tả sách, Author, Publisher).
- **Cart (Giỏ hàng):** 
  - Lưu vào CSDL giỏ hàng (`carts`, `cart_items`) theo Customer ID.
  - Tính tổng số lượng và tạm tính.
- **Checkout & Buy Now:** 
  - `Buy Now`: Mua 1 sản phẩm lập tức, bỏ qua luồng gom giỏ.
  - `Checkout`: Mua toàn bộ giỏ hàng, trừ tồn kho và làm trống giỏ.
  - Validate: Không cho phép mua vượt mức `stock_quantity`. Yêu cầu có địa chỉ, số điện thoại.
  - Gen mã QR: Nếu chọn chuyển khoản, hiển thị QR code thanh toán từ nhà cung cấp VietQR với số tiền tương ứng đơn.
- **Orders:** Quản lý lịch sử khách hàng, xem timeline (history) của order. Hủy đơn khi đang Pending, phục hồi tồn kho.

### 5.2 Phân hệ Admin
- **Dashboard:** Biểu đồ/Thống kê tổng đơn hàng, tổng sản phẩm, tổng doanh thu theo bộ tính.
- **Products Management:** 
  - Tạo sách đi kèm hình ảnh và thuộc tính. 
  - *Cơ chế định giá tự động:* Giá xuất bán (`selling_price`) = Công thức dựa trên `avg_import_price`, kết hợp % Profit (mức LN mong muốn) và % Discount. Tự động tính hiển thị, không nhập tay giá cứng.
- **Imports Management (Nhập kho):**
  - Chức năng mấu chốt để nhập hàng hóa vào tồn kho CSDL.
  - Chọn NXB, nhập số lượng sách và đơn giá nhập từng quyển.
  - *Tự động cập nhật Stock* (`stock_quantity`) + *Tự động tái tính Giá nhập TB* (`avg_import_price`) = Weighted Average Price.
- **Order Management:**
  - View danh sách/chi tiết, update Status (Pending, Confirmed, Shipped, Delivered, Cancelled). Lưu vào bảng lịch sử đơn trạng thái người dùng.
- **Master Data (CRUD):** Quản lý Category, Publisher, Author.
- **User Management (Chỉ Admin Role):** Phân quyền và tạo mới users nội bộ, khóa/mở khách hàng.

---

## 6. Acceptance Criteria (Given-When-Then)

### 6.1 Checkout (Cart) 
| Tiêu chí | Mô tả |
|---|---|
| **Scenario** | Thanh toán thành công từ giỏ hàng hiện tại. |
| **Given** | Người dùng Client đang đăng nhập, giỏ hàng có 2 quyển Sách A (Tồn kho là 10). |
| **When** | Người dùng nhập Đ/C + SDT hợp lệ và bấm "Đặt hàng". |
| **Then** | Hệ thống tạo 1 bản ghi `orders` (tổng tiền chính xác), 2 bản ghi `order_details`. Tồn kho Sách A giảm xuống 8. Giỏ hàng của người dùng trống. Redirect sang Home kèm Toast Notify. |

### 6.2 Checkout (Buy Now Failed - Vượt Tồn kho)
| Tiêu chí | Mô tả |
|---|---|
| **Scenario** | Mua ngay nhưng số lượng lớn hơn trong kho. |
| **Given** | Người dùng chọn mua ngay Sách B, số lượng mua là 5. Trong kho `stock_quantity` của sách B chỉ còn 3. |
| **When** | Người dùng bấm Đặt hàng. |
| **Then** | Hệ thống chặn giao dịch. Hiển thị thông báo Toast lỗi không đủ tồn kho. Không trừ kho cũng như không tạo order nào. |

### 6.3 Nhập Mới Tồn Kho (Import Inventory)
| Tiêu chí | Mô tả |
|---|---|
| **Scenario** | Cập nhật kho và tính lại giá nhập trung bình. |
| **Given** | Quản lý Admin/Staff lập Phiếu nhập hàng mới. Sách C đang có Tồn = 10, Giá TB = 100.000đ. |
| **When** | Nhập mới lô thứ hai gồm 20 quyển Sách C với Giá lô = 130.000đ. |
| **Then** | Tồn kho Sách C tăng thành 30. Giá TB (`avg_import_price`) tự động cập nhật là 120.000đ theo công thức `(10*100.000 + 20*130.000)/30`. |

---

## 7. Non-functional Requirements (NFR)
- **Công nghệ (Tech Stack):** 
  - Backend: Node.js, Express.js. DBMS: MySQL (mysql2 promise).
  - Frontend: Handlebars (SSR), Bootstrap/Tailwind.
- **Xác thực / Phân quyền (Auth & Security):** 
  - Tách biệt hoàn toàn session của Admin và Client để triệt tiêu lỗi phân quyền leo thang.
  - Toàn bộ Mật khẩu mã hóa Hash qua thư viện 1 chiều (`Bcrypt`).
  - Bảo vệ Backend: Route của API và CMS phải dùng middleware phân quyền kiểm tra session. Dành chức năng User Management duy nhất cho `role_id` của Admin.
- **UI/UX & Trạng thái:** 
  - Sử dụng Toastr flash session để trả về thông báo lỗi/thành công mà không chết trang.
  - Layout trên Admin CMS phải tích hợp bảng phân trang, DataTables cho các dữ liệu lớn (Sách, Đơn hàng) để dễ tra cứu.

---

## 8. Data Requirements / Database Schema
Dựa trên kiến trúc ERD, các cấu trúc dữ liệu chính gồm:
1. **Quản trị người dùng:** `users`, `customers`.
2. **Hình khối hàng hóa & Phân loại:** `books`, `categories`, `authors`, `publishers`.
3. **Kinh doanh Thương mại:** `carts`, `cart_items`, `orders`, `order_details`, `payments`.
4. **Vận hành Kho:** `imports`, `import_details`.
5. **Timeline trạng thái:** `order_status`, `order_status_history`.

---

## 9. API Assumptions / Routing Interfaces
Do hệ thống sử dụng SSR Express, các interface endpoints chính giao tiếp qua các phương thức HTTP cơ bản:
- `POST /account/login`: Chuyển payload email, password để setup session `req.session.customer`.
- `POST /admin/auth/login`: Tách biệt session tại `req.session.user`.
- `POST /cart/add`: Add book to cart. Trả về thông báo thành công.
- `POST /checkout`: Gửi formData tạo order từ giỏ.
- `POST /checkout/buy-now/:id`: Tạo đơn direct.
- `POST /admin/imports/create`: Endpoint backend cho thao tác nhồi data nhập kho.
- `PUT/POST /admin/orders/:id/status/update`: Endpoint đổi luồng trạng thái đơn hàng.

---

## 10. Dependencies / Risks
- **Risk:** Hàm tính trung bình giá (Weighted Avg) có thể bị lệch số thập phân trong Javascript (`0.1 + 0.2 = 0.300000004`).
  - *Mitigation:* Ép kiểu/Làm tròn (Math.round) mọi phép tính trước khi ghi xuống Database.
- **Risk:** Cạnh tranh ghi đè (Race Condition) - 2 người dùng Mua hàng cùng lúc khi còn 1 sản phẩm.
  - *Mitigation:* Cấu trúc Database Transactions `START TRANSACTION... FOR UPDATE... COMMIT/ROLLBACK` cần được áp dụng cứng trong Controller thanh toán và Inventory update.
- **Dependency:** Tính năng in mã QR phụ thuộc vào API public của `import.vietqr.io`. Nếu API ngoài down, người dùng không thể lấy được QR. 

---

## 11. Open Questions
- Quy trình thanh toán chuyển khoản thủ công hiện tại chỉ cần lưu `payment_id = 2`. Admin sẽ đối soát giao dịch ngân hàng thủ công rồi mới đổi trạng thái Đơn sang Processing đúng không?
- Phí vận chuyển (Shipping fee) hiện tại đang chốt thiết kế là = 0 đồng trên mọi mặt trận, liệu có kế hoạch tính phí Ship theo số Đỉnh, Khối lượng ở phase cận kế tiếp không? MDB hiện tại đã có cột `shipping_fee` nhưng đang không sử dụng tại API Checkout.
- Ai sẽ là người chủ động Cancel đơn hàng khi Admin phát hiện Khách boom hàng? (Staff hay Manager).
