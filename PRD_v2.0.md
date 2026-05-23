# Product Requirements Document (PRD) v2.0

**Hệ thống Quản trị và Bán Sách Trực Tuyến (Bookstore Web Application)**

**Phiên bản:** 2.0 (Updated Based on Actual Codebase Implementation)  
**Ngày cập nhật:** May 2026  
**Trạng thái:** PRODUCTION READY (with noted technical debts)

---

## 📝 **Changelog from v1.0 to v2.0**

### **Bổ sung từ code thực tế:**

- ✅ **Chi tiết Pricing Logic**: Công thức tính giá tự động (original_price, selling_price)
- ✅ **Shipping Fee Rules**: Miễn phí shipping khi tổng đơn ≥ 100,000 VND
- ✅ **Payment Methods**: Chỉ hỗ trợ COD & Bank Transfer QR (không có VNPAY, MoMo)
- ✅ **Order Status Transitions**: Luồng chuyển trạng thái có giới hạn
- ✅ **Import Calculation**: Công thức Weighted Average Price
- ✅ **Session Management**: Tách biệt hoàn toàn session Admin và Client
- ✅ **Inventory Validation**: Kiểm tra stock trước khi tạo order (database transaction)
- ✅ **Order Cancellation**: Chỉ hủy được ở trạng thái Pending (status_id=1), tự động hoàn kho
- ✅ **Cart Persistence**: Lưu giỏ hàng vào database (không session)
- ✅ **Product Pagination**: Hỗ trợ phân trang, tìm kiếm, lọc theo danh mục
- ✅ **Order History Tracking**: Lưu timeline trạng thái đơn hàng chi tiết

### **Điều chỉnh từ PRD v1.0:**

- ❌ **REMOVED:** Các tính năng Future Enhancement đã bị loại khỏi scope (Email/SMS, Mobile App, Voucher, AI Recommendation)
- ✅ **CLARIFIED:** User Management chỉ dành cho Admin role (có thể tạo staff, khóa/mở customer)
- ✅ **CLARIFIED:** Dashboard hiện tại chỉ là placeholder (không có thống kê thực tế)

---

## 1. Overview & Goals

**Mục tiêu:**  
Xây dựng nền tảng thương mại điện tử chuyên biệt cho bán sách trực tuyến với hai phân hệ độc lập:

- **Phân hệ Client**: Cho khách hàng tìm kiếm, mua sắp sách
- **Phân hệ Admin**: Cho nhân sự nội bộ quản lý kho, sản phẩm, đơn hàng, khách hàng

**Công nghệ sử dụng:**

- **Backend**: Node.js, Express.js v5.1.0
- **Database**: MySQL (mysql2/promise)
- **Frontend**: Handlebars (SSR), Bootstrap/Tailwind CSS
- **Session Management**: express-session (maxAge: 1 hour)
- **Password Hashing**: bcrypt, bcryptjs
- **File Upload**: multer
- **Validation**: express-validator v7.3.1
- **UI Notifications**: express-flash, Toastr
- **Template Helpers**: handlebars-helpers, moment.js

---

## 2. In-Scope / Out-of-Scope

### **In-Scope (MVP - Implemented)**

- ✅ Quản lý tài khoản tách biệt (Admin / Client)
- ✅ Xem danh mục, tìm kiếm, xem chi tiết sản phẩm (lọc theo danh mục, pagination)
- ✅ Thêm sách vào giỏ hàng, cập nhật số lượng, xóa khỏi giỏ
- ✅ Checkout từ giỏ hàng (multiple items)
- ✅ Mua ngay (single item direct purchase)
- ✅ Thanh toán: COD (Tiền mặt khi nhận) hoặc Chuyển khoản (QR code VietQR)
- ✅ Quản trị: Master data (Author, Category, Publisher)
- ✅ Quản trị: Quản lý sản phẩm (Create, Read, Update, Toggle Status)
- ✅ Quản trị: Nhập hàng (tự động cập nhật stock & avg_import_price)
- ✅ Quản trị: Xử lý đơn hàng (thay đổi trạng thái, theo dõi lịch sử)
- ✅ Client: Quản lý hồ sơ cá nhân, đổi mật khẩu
- ✅ Client: Xem lịch sử đơn hàng chi tiết, hủy đơn (ở trạng thái Pending)

### **Out-of-Scope (Future Enhancements)**

- ❌ Tích hợp thanh toán trực tuyến (VNPAY, MoMo, ZaloPay)
- ❌ Kiến nghị sản phẩm tự động (AI Recommendation)
- ❌ Email / SMS notification
- ❌ Ứng dụng di động (Mobile App)
- ❌ Hệ thống Voucher / Coupon
- ❌ Hệ thống Review & Rating
- ❌ Wishlist
- ❌ Multi-language support

---

## 3. Personas / Roles

| Role                      | Phân hệ | Mô tả & Quyền hạn                                                                          |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| **Customer** (Khách hàng) | Client  | Người dùng cuối. Quản lý profile, xem & mua sách, theo dõi đơn hàng của mình.              |
| **Admin** (Quản trị viên) | Admin   | Toàn quyền kiểm soát hệ thống. Tạo/khóa tài khoản nhân sự (Manager, Staff) và khách hàng.  |
| **Manager** (Quản lý)     | Admin   | Quản lý vòng đời sản phẩm, duyệt nhập kho, giám sát đơn hàng. **KHÔNG** quản lý tài khoản. |
| **Staff** (Nhân viên)     | Admin   | Thực thi: Lập phiếu nhập hàng, xử lý trạng thái đơn.                                       |

---

## 4. Functional Requirements by Module

### **4.1 Phân hệ Client (Khách hàng)**

#### **4.1.1 Account & Authentication**

- **Đăng ký tài khoản:** email, password, fullname, phone_number, address (10-11 chữ số)
- **Đăng nhập:** Sử dụng email + password; lưu session tại `req.session.customer`
- **Logout:** Destroy session, clear cookie
- **Quản lý profile:** Xem/cập nhật fullname, email, phone_number, address
- **Đổi mật khẩu:** Kiểm tra mật khẩu cũ trước khi cập nhật
- **Validation Rules:**
  - Fullname: Không được để trống
  - Email: Phải đúng định dạng email
  - Phone: Phải có 10-11 chữ số
  - Address: Không được để trống
  - Password confirm: Phải khớp với password

#### **4.1.2 Product Browsing & Search**

- **Danh sách sản phẩm:** Hiển thị tất cả sách có `status=1` & `stock_quantity > 0`
  - **Pagination:** 20 items/trang, tuỳ chọn page
  - **Tìm kiếm:** Theo `book_title`, `author_name`, `publisher_name` (LIKE %query%)
  - **Lọc theo danh mục:** Filter `category_id`
- **Xem chi tiết sản phẩm:**
  - Hiển thị: Title, Original Price, Selling Price, Stock, Description, Author, Category, Publisher, Image
  - **Prices là động:** Được tính real-time từ `avg_import_price`, `profit_percentage`, `discount_percentage`

#### **4.1.3 Cart Management**

- **Giỏ hàng:** Lưu ở database (bảng `carts`, `cart_items`), không dùng session
- **Thêm vào giỏ:**
  - Nếu sản phẩm chưa có → Insert `cart_items` với `quantity=1`
  - Nếu đã có → Không tăng quantity (user phải dùng update)
  - **Validation:** Kiểm tra sản phẩm còn stock không
- **Cập nhật số lượng:** Có thể tăng/giảm, nhưng không được vượt quá `stock_quantity`
- **Xóa sản phẩm:** Xóa row khỏi `cart_items`
- **Tính tổng tiền:**
  - `subtotal` = sum(selling_price × quantity)
  - `shippingFee` = 0 if subtotal ≥ 100,000 else 30,000
  - `totalAmount` = subtotal + shippingFee

#### **4.1.4 Checkout & Orders**

- **Checkout từ giỏ hàng:**
  - Input: Address, Phone Number, Payment Method (1=COD / 2=Bank Transfer QR)
  - Validation: Stock phải đủ cho tất cả items trong giỏ
  - **Database Transaction:** Tạo order → Tạo order_details → Trừ stock → Xóa cart_items → Thêm order_status_history
  - Trạng thái mới: status_id=1 (Pending)
  - Nếu payment_id=2 → Redirect tới `/checkout/qr?orderId=X`

- **Mua ngay (Buy Now):**
  - Route: `GET /checkout/buy/:id` → Hiển thị form với product quantity=1
  - `POST /checkout/buy/:id` → Tạo order với 1 sản phẩm
  - Cùng logic transaction như checkout từ giỏ

- **Payment Methods:**
  - **COD (payment_id=1):** Thanh toán khi nhận hàng, redirect về home sau checkout
  - **Bank Transfer QR (payment_id=2):** Hiển thị QR code từ VietQR API
    - Bank: TPB (Techcombank), Account: 00000202511
    - Tạo QR dựa trên `order_id` + `totalAmount`

- **Validation & Error Handling:**
  - ❌ Nếu stock không đủ → Error Toast, không tạo order, không trừ stock
  - ❌ Nếu giỏ trống → Error Toast, redirect
  - ✅ Thành công → Success Toast, redirect

#### **4.1.5 Order Management (Client)**

- **Xem danh sách đơn hàng:** Hiển thị tất cả order của customer
  - Filter theo `status_id` (tuỳ chọn)
  - Sắp xếp: DESC theo order_id
- **Xem chi tiết đơn hàng:**
  - Order header: order_id, created_at, phone, address, total_amount, payment_method, payment_status, status_name
  - Order items: book_title, quantity, price, line_total
  - **Order status history:** Timeline tất cả status changes từ ngày tạo
- **Hủy đơn hàng:**
  - ✅ Chỉ hủy được nếu `status_id=1` (Pending)
  - ❌ Không hủy được nếu đã Processed/Shipped/Delivered/Cancelled
  - Action: Cập nhật status→5, Thêm history, **Restore stock** (cộng lại quantity vào books)
  - **Database Transaction:** Giống order cancellation flow

---

### **4.2 Phân hệ Admin**

#### **4.2.1 Authentication & Authorization**

- **Đăng nhập:** email + password, roles: admin / manager / staff
- **Session:** Lưu ở `req.session.user` (tách biệt với client)
- **Middleware:** `checkUser(req, res, next)` - Kiểm tra `req.session.user` trước khi vào routes
- **Role-based Access:** (⚠️ **HIỆN TẠI CHƯA ĐƯỢC IMPLEMENT** - Tất cả users đã login đều truy cập được tất cả modules)
- **Logout:** Destroy session

#### **4.2.2 Dashboard**

- **Current Status:** Placeholder (không có thống kê thực tế)
- **Future Enhancement:** Biểu đồ doanh thu, số đơn hàng, sản phẩm bán chạy

#### **4.2.3 Product Management**

- **Danh sách sản phẩm:**
  - Filter theo `status` (tất cả / active / inactive)
  - Hiển thị: book_id, title, category, author, publisher, avg_import_price, discount%, profit%, stock, status

- **Thêm sản phẩm:**
  - Form fields: book_title*, category_id*, author_id*, publisher_id*, profit_percentage\*, discount_percentage, stock_quantity, description, image
  - **File upload:** Multer disk storage → `/public/img/products/`
  - **Ràng buộc File Upload (Business Rules):**
    - Giới hạn dung lượng: Tệp không được vượt quá **5MB**
    - Định dạng cho phép (MIME type): chỉ **`image/jpeg`**, **`image/png`**, **`image/webp`**
    - Nếu vi phạm → backend chặn ngay tại Middleware (trước khi lưu file), trả về **Toastr error** rõ ràng, không lưu tệp vào `/public/img/products/`
  - Validation: Các trường \* bắt buộc
  - **Lưu ý:** avg_import_price = 0 lúc tạo (sẽ cập nhật qua import)
  - **Note:** selling_price KHÔNG được lưu, được tính real-time từ formula

- **Cập nhật sản phẩm:**
  - Có thể chỉnh: title, category, author, publisher, discount%, profit%, description, image
  - **Ràng buộc File Upload (áp dụng khi Manager tải ảnh mới):**
    - Giới hạn dung lượng: Tệp không được vượt quá **5MB**
    - Định dạng cho phép (MIME type): chỉ **`image/jpeg`**, **`image/png`**, **`image/webp`**
    - Nếu vi phạm → backend chặn ngay tại Middleware, trả về **Toastr error**, giữ nguyên ảnh cũ
  - **KHÔNG cập nhật trực tiếp:** avg_import_price (chỉ thay đổi qua import), stock (chỉ thay qua import/order)

- **Toggle Status:** Bật/tắt product (status=1 or 0)
  - Status=1 → hiển thị ở client, cho checkout
  - Status=0 → ẩn khỏi client, không cho checkout

#### **4.2.4 Inventory Management (Import)** ⭐ **UPDATED with Approval Workflow**

##### **4.2.4.1 Import Status & Workflow**

**Import Status Values:**

- **0 (Draft):** Phiếu mới tạo, chưa gửi duyệt. Staff có thể chỉnh sửa/xóa.
- **1 (Pending):** Phiếu đã gửi duyệt chờ Manager xét duyệt. Không được chỉnh sửa.
- **2 (Approved):** Phiếu đã được duyệt. **KHI VỀ STATUS=2, MỚI THỰ HIỆN:**
  - Cộng dồn `stock_quantity` vào books
  - Tính lại `avg_import_price` (Weighted Average)
  - **KHÔNG được hủy, xóa hay chỉnh sửa**

##### **4.2.4.2 Permission & Roles**

| Role        | Action                            | Condition        | Expected Outcome                                                                                                                |
| ----------- | --------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Staff**   | Create draft import               | N/A              | Import created with status=0, created_by=staff_id                                                                               |
| **Staff**   | View own drafts & pending imports | status in [0, 1] | List filtered by created_by                                                                                                     |
| **Staff**   | Submit for approval               | status=0         | status → 1, system waits for Manager review                                                                                     |
| **Staff**   | Recall/Cancel submission          | status=1         | status → 0, back to draft (Manager hasn't reviewed yet)                                                                         |
| **Staff**   | Delete import                     | status=0         | Remove entire import + details                                                                                                  |
| **Staff**   | Edit import                       | status=0         | Modify items, quantities, prices in import_details                                                                              |
| **Manager** | View all imports                  | N/A              | List imports in all statuses, show status, created_by, created_at                                                               |
| **Manager** | Approve import                    | status=1         | status → 2, approved_by=manager_id, trigger stock update + avg price recalculation                                              |
| **Manager** | Reject import                     | status=1         | status → 0, fill reject_reason (bắt buộc), notify Staff                                                                         |
| **Manager** | View import details               | Any status       | Show header + import_details + rejection reason (if rejected)                                                                   |
| **Admin**   | View all imports                  | N/A              | Same as Manager                                                                                                                 |
| **Admin**   | Approve import                    | status=1         | **Thực tế trong code:** `canManage = ["manager", "admin"].includes(user.role)` → Admin cũng có quyền Approve/Reject như Manager |
| **Admin**   | Reject import                     | status=1         | Như trên — Admin có full quyền approve/reject, **khác với spec ban đầu**                                                        |

##### **4.2.4.3 Import Workflow & Business Rules**

**Danh sách phiếu nhập:**

- Hiển thị: import_id, status, publisher_name, created_at, created_by, total_quantity, total_cost, approved_by (nếu status=2)
- Filter theo status: All, Draft, Pending, Approved
- Sắp xếp: DESC theo created_at
- **Staff nhìn thấy:** Draft (của mình) + Pending (của mình) + Approved (của mình)
- **Manager nhìn thấy:** Tất cả statuses, tất cả users
- **Admin nhìn thấy:** Tất cả statuses, tất cả users

**Tạo phiếu nhập hàng (Staff):**

- Step 1: Chọn nhà xuất bản (select publisher_id)
- Step 2: Hệ thống hiển thị danh sách tất cả sách thuộc nhà xuất bản đó
- Step 3: Staff chọn sách bằng cách **nhấn vào sản phẩm** trong danh mục:
  - Sản phẩm được chọn → **xuất hiện ngay trong danh sách "Sản phẩm đã chọn"** phía dưới
  - Dòng sản phẩm đó đồng thời hiển thị **ô checkbox đã được tick sẵn** ở đầu dòng
  - Staff nhập `quantity` và `import_price` cho từng sản phẩm trong danh sách đã chọn
  - Để **xóa sản phẩm** khỏi phiếu: Staff **bỏ tick (uncheck) checkbox** → sản phẩm lập tức bị xóa khỏi danh sách
- Step 4: Lưu phiếu → Create record trong `imports` table với **status=0** (Draft)
- **Database Transaction:** Toàn bộ import phải success hoặc rollback
- **Result:** Phiếu lưu ở trạng thái Draft, Staff có thể chỉnh sửa/xóa/gửi duyệt

**Gửi phiếu duyệt (Staff):**

- Trên phiếu Draft, click "Gửi duyệt"
- Update: `imports.status = 1` (Pending)
- **Action:** Phiếu chuyển sang trạng thái chờ Manager duyệt
- **Notification:** (Future) Send notification to Manager

**Duyệt phiếu (Manager):**

- Trên phiếu Pending, click "Duyệt"
- **Backend Processing (TRANSACTION):**
  ```
  1. Kiểm tra status = 1
  2. BEGIN TRANSACTION
  3. FOR EACH book in import_details:
       a. SELECT stock_quantity, avg_import_price FROM books WHERE book_id (FOR UPDATE)
       b. Tính toán new_avg_import_price theo formula:
          NEW_AVG = (OLD_QTY × OLD_AVG + NEW_QTY × NEW_PRICE) / (OLD_QTY + NEW_QTY)
       c. UPDATE books:
          - stock_quantity += quantity
          - avg_import_price = new_avg
  4. UPDATE imports: status = 2, approved_by = manager_id, approved_at = NOW()
  5. COMMIT TRANSACTION
  ```
- **Result:**
  - Phiếu status → 2 (Approved)
  - Tồn kho cộng dồn
  - Giá trung bình cập nhật
  - Phiếu KHÔNG thể chỉnh sửa/xóa/hủy

**Từ chối phiếu (Manager):**

- Trên phiếu Pending, click "Từ chối"
- **Input:** Lý do từ chối (reject_reason) - **BẮT BUỘC**
- **Action:**
  ```
  UPDATE imports:
    - status = 0 (Draft)
    - reject_reason = input_text (sau khi trim())
  ```
- **Result:**
  - Phiếu về Draft
  - Staff thấy reject reason và có thể chỉnh sửa
  - **KHÔNG cộng kho hay tính giá**

---

##### **4.2.4.3.A UI Flow Chi tiết: Hành động Duyệt (Manager/Admin)**

**Điều kiện hiển thị nút "Duyệt phiếu":**

- `canManage = true` (role ∈ {`manager`, `admin`}) **VÀ** `importHeader.status == 1`
- Handlebars: `{{#if canManage}} {{#if (eq importHeader.status 1)}} ... {{/if}} {{/if}}`
- Nếu bất kỳ điều kiện nào sai → nút **không tồn tại trong DOM** (SSR-rendered, không bị ẩn bằng CSS)

**Luồng thao tác từng bước — Click "Duyệt phiếu":**

| Bước | Actor   | Hành động                                                                                        | Kỹ thuật                         |
| ---- | ------- | ------------------------------------------------------------------------------------------------ | -------------------------------- |
| 1    | Manager | Mở trang chi tiết phiếu (status=1, badge vàng "Chờ duyệt")                                       | SSR render                       |
| 2    | Manager | Click nút "✅ Duyệt phiếu" (Bootstrap `btn-success`)                                             | DOM event                        |
| 3    | Browser | Hiển thị **native `confirm()` dialog**: _"Xác nhận duyệt phiếu? Tồn kho sẽ được cập nhật ngay."_ | `onsubmit="return confirm(...)"` |
| 4a   | Manager | Click **Cancel** → dialog đóng, **không gửi request nào**                                        | `confirm()` trả `false`          |
| 4b   | Manager | Click **OK** → Form submit                                                                       | `confirm()` trả `true`           |
| 5    | Browser | `POST /admin/imports/:id/approve?_method=PATCH`                                                  | method-override                  |
| 6    | Server  | Xử lý Transaction → redirect về `/admin/imports/:id`                                             | Toastr success/error             |

**Payload gửi lên:** Không có request body — chỉ có `importId` trong URL param.

---

##### **4.2.4.3.B UI Flow Chi tiết: Hành động Từ chối (Manager/Admin)**

**Điều kiện hiển thị nút "Từ chối" và Modal:**

- Nút "Từ chối": render cùng điều kiện với nút Duyệt (`canManage && status==1`)
- **Modal `#rejectModal`**: được render trong một Handlebars block **riêng biệt** `{{#if (eq importHeader.status 1)}}` — nếu status ≠ 1, modal không tồn tại trong DOM

**Luồng thao tác từng bước — Click "Từ chối":**

| Bước | Actor   | Hành động                                                                                         | Kỹ thuật                   |
| ---- | ------- | ------------------------------------------------------------------------------------------------- | -------------------------- |
| 1    | Manager | Thấy nút "❌ Từ chối" (Bootstrap `btn-danger`) cạnh nút Duyệt                                     | SSR render                 |
| 2    | Manager | Click nút → **Bootstrap Modal `#rejectModal` mở** (không navigate, không submit)                  | `data-bs-toggle="modal"`   |
| 3    | Modal   | Hiển thị: Tiêu đề "Từ chối phiếu nhập #ID", ô `<textarea name="reject_reason" rows="4" required>` | Bootstrap Modal            |
| 4    | Manager | Nhập lý do từ chối                                                                                | Keyboard input             |
| 5a   | Manager | Click "Hủy" hoặc close button → Modal đóng, **không gửi request**                                 | `data-bs-dismiss="modal"`  |
| 5b   | Manager | Để trống lý do, click "Xác nhận từ chối" → **Browser chặn** submit                                | HTML5 `required` attribute |
| 5c   | Manager | Nhập lý do, click "Xác nhận từ chối" → Form submit                                                | Form POST                  |
| 6    | Browser | `POST /admin/imports/:id/reject?_method=PATCH` với body `{ reject_reason: "..." }`                | method-override            |
| 7    | Server  | Validate + UPDATE → redirect về `/admin/imports/:id`                                              | Toastr success/error       |

**Payload gửi lên:** `{ reject_reason: "<nội dung Manager nhập>" }`

**Lớp bảo vệ validate 3 tầng:**

1. **HTML5 `required`** trên `<textarea>` → Browser chặn submit nếu trống (client-side)
2. **Backend Service**: `if (!reason || !reason.trim()) throw new Error("Vui lòng nhập lý do từ chối")` → chặn nếu JS bị disabled hoặc request giả mạo
3. **Status gate**: `if (imp.status !== 1) throw new Error("Chỉ có thể từ chối phiếu ở trạng thái Chờ duyệt")` → chặn nếu phiếu đã bị approve/recall trước đó

---

##### **4.2.4.3.C Hiển thị giao diện sau các hành động Duyệt/Từ chối**

**Sau khi Duyệt thành công (status → 2):**

| Phần giao diện                                 | Trạng thái                                   |
| ---------------------------------------------- | -------------------------------------------- |
| Badge                                          | Xanh lá **"Đã duyệt"** (`bg-success`)        |
| Thông tin Duyệt bởi                            | Hiện tên Manager + `approved_at` (timestamp) |
| Nút "Duyệt phiếu"                              | **Ẩn** (status ≠ 1)                          |
| Nút "Từ chối"                                  | **Ẩn** (status ≠ 1)                          |
| Nút Staff (Gửi duyệt, Chỉnh sửa, Xóa, Hủy gửi) | **Ẩn** (không có điều kiện nào thỏa)         |
| Alert lý do từ chối                            | **Ẩn** (reject_reason = NULL, không truthy)  |

**Sau khi Từ chối thành công (status → 0, reject_reason được lưu):**

| Phần giao diện           | Trạng thái                                                       |
| ------------------------ | ---------------------------------------------------------------- |
| Badge                    | Xám **"Nháp"** (`bg-secondary`)                                  |
| Alert "Lý do bị từ chối" | **Hiển thị** (vàng `alert-warning`) với nội dung `reject_reason` |
| Nút "Duyệt phiếu"        | **Ẩn** (status ≠ 1)                                              |
| Nút "Từ chối"            | **Ẩn** (status ≠ 1)                                              |
| Nút "Gửi duyệt" (Staff)  | **Hiển thị** (status = 0)                                        |
| Nút "Chỉnh sửa" (Staff)  | **Hiển thị** (status = 0)                                        |
| Nút "Xóa phiếu" (Staff)  | **Hiển thị** (status = 0)                                        |

> **Lưu ý hành vi `reject_reason` sau khi Staff submit lại:**  
> Alert `reject_reason` được render dựa trên `{{#if importHeader.reject_reason}}` (truthy), **không phụ thuộc vào status**. Tuy nhiên, khi Staff gọi "Gửi duyệt" (`submitImport`), service thực hiện:  
> `UPDATE imports SET status = 1, reject_reason = NULL WHERE import_id = ?`  
> → Alert biến mất hoàn toàn sau khi gửi lại, không gây nhầm lẫn cho Manager.

---

##### **4.2.4.3.D Backend Transaction Chi tiết: Approve**

```
approveImport(importId, managerId):

1. getConnection() → beginTransaction()
2. SELECT status FROM imports WHERE import_id = ? FOR UPDATE
   → Lock record imports để tránh concurrent approve/reject
3. Validate: imp.status PHẢI = 1, ngược lại throw + rollback
4. SELECT book_id, quantity, import_price FROM import_details WHERE import_id = ?
   (Không cần lock ở bước này — import_details chỉ read, không ai write trong transaction)
5. FOR EACH detail IN import_details:
   a. SELECT stock_quantity, avg_import_price FROM books WHERE book_id = ? FOR UPDATE
      → Lock từng book để tránh race condition với checkout đồng thời
   b. Tính:
      totalQty = oldQty + qty
      newAvg   = (oldAvg × oldQty + importPrice × qty) / totalQty
      Fallback: if (!isFinite(newAvg) || isNaN(newAvg)) → newAvg = importPrice
   c. UPDATE books SET
        stock_quantity = stock_quantity + qty,
        avg_import_price = newAvg
      WHERE book_id = ?
6. UPDATE imports SET
     status = 2,
     approved_by = managerId,
     approved_at = NOW()
   WHERE import_id = ?
7. commit() → connection.release()
8. Bất kỳ lỗi → rollback() → throw Error → Controller set toastr error
```

**Công thức Weighted Average Price (CRITICAL):**

> **`newAvg = (oldAvg × oldQty + importPrice × qty) / (oldQty + qty)`**

**Fallback khi edge case:**

> **`if (!isFinite(newAvg) || Number.isNaN(newAvg)) → newAvg = importPrice`**
> _(Xảy ra khi sách mới toanh: oldQty = 0, oldAvg = 0 → 0/0 = NaN)_

---

##### **4.2.4.3.E Backend Logic Chi tiết: Reject**

```
rejectImport(importId, reason):

1. Validate: !reason || !reason.trim() → throw "Vui lòng nhập lý do từ chối"
2. SELECT status FROM imports WHERE import_id = ?   ← ⚠️ KHÔNG CÓ FOR UPDATE
3. Validate: imp.status PHẢI = 1, ngược lại throw Error
4. UPDATE imports SET
     status = 0,
     reject_reason = reason.trim()
   WHERE import_id = ?
   (Không dùng Transaction — chỉ 1 UPDATE đơn)
```

> ⚠️ **Không lưu thông tin ai đã từ chối:** Service `rejectImport(importId, reason)` **không nhận `managerId`**. Cột `approved_by` chỉ được set khi Approve, không có cột `rejected_by`. Xem Technical Debts section 17.1.

**Hủy/Xóa phiếu (Staff):**

- Chỉ xóa được khi status=0 (Draft)
- Click "Xóa" → Xóa toàn bộ import + import_details
- **KHÔNG thể xóa khi status ≥ 1**

**Hủy gửi duyệt (Staff):**

- Khi phiếu ở status=1 (Pending), Staff có thể "Hủy gửi"
- Update: `status = 0` (quay về Draft)
- **Lưu ý:** Chỉ work nếu Manager chưa duyệt

**Chỉnh sửa phiếu nhập nháp (Staff):** ⭐ **IMPLEMENTED**

> ✅ **Trạng thái code:** Đã được implement đầy đủ. Endpoint `PATCH /admin/imports/:id/edit` có handler trong router (`router.patch("/:id/edit", importController.updateImport)`), controller (`updateImport`) và service (`updateImport`). Xem chi tiết phân tích code bên dưới.

**Điều kiện bắt buộc:**

- Phiếu phải ở trạng thái **Draft (status=0)**
- Chỉ Staff **tạo phiếu** (`created_by = userId`) mới được chỉnh sửa

**UI Flow (Step-by-step):**

- Step 1: Trên trang chi tiết phiếu nhập (status=0), Staff nhấn nút **"Chỉnh sửa"**
- Step 2: Hệ thống render form edit (`GET /admin/imports/:id/edit`) **giống hệt form Tạo phiếu**:
  - Dropdown **Nhà xuất bản** hiển thị và **cho phép thay đổi** (không bị disabled/readonly)
  - Publisher hiện tại được pre-select
  - Danh sách sách của publisher hiện tại được hiển thị
  - Sách đã có trong phiếu → **Checkbox đã tick**, quantity và import_price được pre-populate
  - Sách chưa có trong phiếu → Checkbox chưa tick, Staff có thể thêm vào
- Step 3: Staff thực hiện chỉnh sửa:
  - **Thay đổi Nhà xuất bản (tuỳ chọn):**
    - Staff chọn NXB khác từ dropdown
    - Hệ thống **tự động xóa sạch toàn bộ danh sách sản phẩm** đang có trong phiếu
    - Hiển thị danh sách sách của NXB mới để Staff chọn lại từ đầu
  - **Thay đổi sản phẩm** (khi giữ nguyên NXB):
    - Thay đổi `quantity` hoặc `import_price` của sách đã có
    - Thêm sách mới bằng cách **nhấn vào sản phẩm** trong danh mục → xuất hiện trong danh sách "Sản phẩm đã chọn" với **checkbox đã tick sẵn**
    - Xóa sách khỏi phiếu bằng cách **bỏ tick (uncheck) checkbox** → sản phẩm lập tức bị xóa
- Step 4: Staff nhấn **"Lưu thay đổi"** → `PATCH /admin/imports/:id/edit`
- Step 5: Backend xử lý và redirect về trang chi tiết phiếu với toastr

**Backend Processing (Transaction):**

```
1. SELECT status, created_by, publisher_id FROM imports WHERE import_id = ? FOR UPDATE
2. Validate: status = 0 (chỉ Draft)
3. Validate: created_by = userId (chỉ người tạo)
4. Validate: books list không rỗng (ít nhất 1 sách)
5. Validate từng sách: quantity > 0, import_price > 0
6. BEGIN TRANSACTION
7. UPDATE imports SET publisher_id = new_publisher_id WHERE import_id = ?  -- Cập nhật NXB (nếu thay đổi)
8. DELETE FROM import_details WHERE import_id = ?  -- Xóa toàn bộ chi tiết cũ
9. FOR EACH book in new_books_list:
     INSERT INTO import_details (import_id, book_id, quantity, import_price)
10. COMMIT
11. Redirect → /admin/imports/:id với toastr success
```

**Lý do dùng "xóa-tất-cả-rồi-chèn-lại" (Replace Strategy):**

- Đơn giản hơn diff-based update (không cần so sánh cũ/mới)
- An toàn hơn: không để lại orphan records
- Phù hợp với UI form-based (submit toàn bộ danh sách)
- Trong một transaction nên đảm bảo atomicity

**Validation Rules:**
| Field | Rule | Error Message |
|-------|------|---------------|
| Import status | Phải = 0 | "Chỉ có thể chỉnh sửa phiếu ở trạng thái Nháp" |
| User permission | created_by = userId | "Bạn không có quyền chỉnh sửa phiếu này" |
| publisher_id | Phải là NXB hợp lệ đang active | "Nhà xuất bản không hợp lệ" |
| Books list | Ít nhất 1 sách được chọn | "Phiếu nhập phải có ít nhất một sách" |
| Books consistency | Tất cả sách phải thuộc NXB đã chọn | "Sách không thuộc nhà xuất bản đã chọn" |
| quantity | Số nguyên dương > 0 | "Số lượng phải lớn hơn 0" |
| import_price | Số thực dương > 0 | "Giá nhập phải lớn hơn 0" |

**Result:**

- Phiếu vẫn ở trạng thái **Draft (status=0)**, chưa cộng kho
- `import_details` được cập nhật theo danh sách mới
- Staff thấy toastr success, được redirect về trang chi tiết phiếu
- Staff có thể tiếp tục gửi duyệt sau khi chỉnh sửa xong

**Xem chi tiết phiếu nhập:**

- Hiển thị: Header (import_id, status, publisher, created_by, created_at, approved_by, approved_at, reject_reason)
- Hiển thị: Items (book_id, book_title, quantity, import_price, line_total)
- Hiển thị: Totals (total_quantity, total_cost)
- Hiển thị: Action buttons (dựa trên role & status)

##### **4.2.4.4 Stock Update & Pricing Logic** (CRITICAL)

⭐ **ONLY APPLY WHEN status = 2 (Approved)**

**Weighted Average Price Calculation:**

```
NEW_AVG_IMPORT_PRICE = (OLD_QTY × OLD_AVG + NEW_QTY × NEW_PRICE) / (OLD_QTY + NEW_QTY)
```

**Validation:**

```javascript
if (!isFinite(newAvgImportPrice) || Number.isNaN(newAvgImportPrice)) {
  newAvgImportPrice = importPrice; // Fallback
}
```

**Example:**

- Before: Book "Dune" has stock=10, avg_price=150,000
- Import: qty=20, price=140,000
- After approval:

  ```
  new_avg = (10 × 150,000 + 20 × 140,000) / 30
          = (1,500,000 + 2,800,000) / 30
          = 4,300,000 / 30
          = 143,333

  stock = 10 + 20 = 30
  ```

**Critical Notes:**

- ✅ Update only when status = 2
- ✅ Use database transaction with `FOR UPDATE` lock
- ✅ If update fails, ROLLBACK entire approval
- ❌ NEVER update stock/price when status = 0 or 1
- ⚠️ Race condition risk: Multiple imports approved simultaneously - use locks

#### **4.2.5 Master Data Management**

- **Authors:** CRUD - author_id, author_name, email, description, status
- **Categories:** CRUD - category_id, category_name, description, status
- **Publishers:** CRUD - publisher_id, publisher_name, address, phone_number, email, description, status
- **Customers:** (tạo/khóa bởi Admin role)
- **Filter by status:** Chỉ hiển thị status=1 khi select options

#### **4.2.6 Order Management**

- **Danh sách đơn hàng:**
  - Hiển thị: order_id, customer_fullname, address, created_at, total_amount, payment_status, status_name
  - Filter theo `status_id`
  - Sắp xếp: DESC theo created_at

- **Cập nhật trạng thái đơn hàng:**
  - **Status values:** 1=Pending, 2=Processing, 3=Shipped, 4=Delivered, 5=Cancelled
  - **Transition rules** (HARD-CODED):
    ```
    1 (Pending) → [2 (Processing), 5 (Cancelled)]
    2 (Processing) → [3 (Shipped), 5 (Cancelled)]
    3 (Shipped) → [4 (Delivered)]
    4 (Delivered) → [KHÔNG ĐỔI]
    5 (Cancelled) → [KHÔNG ĐỔI]
    ```
  - **Action:** Update `orders.status_id`, Insert vào `order_status_history`
  - **Special:** Khi chuyển sang status=5 (Cancelled) → Restore stock từ order_details

- **Cập nhật payment status:**
  - Values: '0' (Unpaid), '1' (Paid)
  - Update `orders.payment_status`

- **Xem chi tiết đơn hàng:**
  - Order header + items detail

#### **4.2.7 User Management (Admin role only)**

- **Danh sách users:** Liệt kê tài khoản, roles, status
- **Tạo user:** Email, password, role (manager/staff/customer), fullname
- **Khóa/Mở user:** Toggle `status` (1=active, 0=blocked)
- **Validation:** Kiểm tra email unique

---

## 5. Database Schema (Thực tế)

### **5.1 Users & Authentication**

```sql
users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- bcrypt hash
  fullname VARCHAR(100),
  role ENUM('admin', 'manager', 'staff', 'customer') DEFAULT 'customer',
  phone_number VARCHAR(20),
  address VARCHAR(255),
  status TINYINT DEFAULT 1,  -- 1=active, 0=blocked
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

-- Lưu ý: Bảng customers không tồn tại trong DB thực tế
-- Tất cả customer info được lưu trong users table với role='customer'
```

### **5.2 Product & Catalog**

```sql
categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  status TINYINT DEFAULT 1
)

authors (
  author_id INT PRIMARY KEY AUTO_INCREMENT,
  author_name VARCHAR(100) NOT NULL,
  email VARCHAR(50),
  description TEXT,
  status TINYINT DEFAULT 1
)

publishers (
  publisher_id INT PRIMARY KEY AUTO_INCREMENT,
  publisher_name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  phone_number VARCHAR(20),
  email VARCHAR(255),
  description TEXT,
  status TINYINT DEFAULT 1
)

books (
  book_id INT PRIMARY KEY AUTO_INCREMENT,
  book_title TEXT NOT NULL,
  category_id INT,
  author_id INT,
  publisher_id INT,
  avg_import_price DECIMAL(12,2) DEFAULT 0,      -- Cập nhật bởi import
  discount_percentage DECIMAL(5,2) DEFAULT 0,    -- 0-100
  profit_percentage DECIMAL(5,2) DEFAULT 10,     -- 0-100
  stock_quantity INT DEFAULT 0,
  description TEXT,
  image_path VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TINYINT DEFAULT 0,  -- 0=inactive, 1=active
  FOREIGN KEY (category_id) REFERENCES categories (category_id),
  FOREIGN KEY (author_id) REFERENCES authors (author_id),
  FOREIGN KEY (publisher_id) REFERENCES publishers (publisher_id)
)

-- Lưu ý: selling_price & original_price KHÔNG được lưu
-- Chúng được tính real-time bằng price_calculator.calculatePrice()
```

### **5.3 Inventory & Import** ⭐ **UPDATED with Approval Workflow**

```sql
imports (
  import_id INT PRIMARY KEY AUTO_INCREMENT,
  publisher_id INT NOT NULL,
  status TINYINT DEFAULT 0,  -- 0=Draft, 1=Pending, 2=Approved
  created_by INT NOT NULL,   -- user_id of Staff who created
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_by INT,           -- user_id of Manager who approved (NULL if not approved)
  approved_at DATETIME,      -- Timestamp when approved
  reject_reason TEXT,        -- Reason if rejected (filled when status changed 1→0)
  FOREIGN KEY (publisher_id) REFERENCES publishers (publisher_id),
  FOREIGN KEY (created_by) REFERENCES users (user_id),
  FOREIGN KEY (approved_by) REFERENCES users (user_id)
)

import_details (
  import_detail_id INT PRIMARY KEY AUTO_INCREMENT,
  import_id INT,
  book_id INT,
  quantity INT NOT NULL,
  import_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (import_id) REFERENCES imports (import_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books (book_id) ON DELETE SET NULL
)

-- INDEX for better query performance on status and created_by
CREATE INDEX idx_imports_status_created_by ON imports(status, created_by);
CREATE INDEX idx_imports_status_approved_by ON imports(status, approved_by);
```

**Schema Changes from v1.0:**

- ✅ NEW: `status` (0=Draft, 1=Pending, 2=Approved)
- ✅ NEW: `created_by` (user_id who created)
- ✅ NEW: `approved_by` (user_id who approved)
- ✅ NEW: `approved_at` (timestamp of approval)
- ✅ NEW: `reject_reason` (reason if rejected)
- ✅ NEW: Indexes on (status, created_by) and (status, approved_by)

### **5.4 Cart & Orders**

```sql
carts (
  cart_id INT PRIMARY KEY AUTO_INCREMENT,
  cus_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cus_id) REFERENCES users (user_id) ON DELETE SET NULL
)

cart_items (
  -- NO PRIMARY KEY (tính toàn)
  cart_id INT,
  book_id INT,
  quantity INT NOT NULL,
  FOREIGN KEY (cart_id) REFERENCES carts (cart_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books (book_id) ON DELETE CASCADE
)

payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  payment_name VARCHAR(100)  -- "Tiền mặt", "Chuyển khoản"
)

orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  cus_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  total_quantity INT,
  address VARCHAR(255),
  phone_number VARCHAR(10),
  status_id INT DEFAULT 1,
  payment_id INT,
  payment_status ENUM('0', '1') DEFAULT '0',  -- 0=unpaid, 1=paid
  FOREIGN KEY (cus_id) REFERENCES users (user_id) ON DELETE SET NULL,
  FOREIGN KEY (payment_id) REFERENCES payments (payment_id),
  FOREIGN KEY (status_id) REFERENCES order_status (status_id)
)

order_details (
  order_detail_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT,
  book_id INT,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,    -- selling_price tại thời điểm order
  total_amount DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books (book_id) ON DELETE SET NULL
)

order_status (
  status_id INT PRIMARY KEY AUTO_INCREMENT,
  status_name VARCHAR(100)  -- "Chờ xác nhận", "Đang xử lý", etc.
)

order_status_history (
  history_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT,
  status_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
  FOREIGN KEY (status_id) REFERENCES order_status (status_id)
)
```

---

## 6. API Endpoints Reference

### **6.1 Client Routes (No Prefix, starts from `/`)**

#### **Account Management**

```
GET  /account/login              → Hiển thị trang login
POST /account/login              → Xử lý đăng nhập
GET  /account/register           → Hiển thị form đăng ký
POST /account/register           → Xử lý đăng ký (có validator)
GET  /account/logout             → Logout
GET  /account/                   → Xem profile (require auth)
GET  /account/edit               → Hiển thị form sửa profile (require auth)
POST /account/edit               → Cập nhật profile (require auth, có validator)
GET  /account/change-password    → Hiển thị form đổi mật khẩu (require auth)
POST /account/change-password    → Xử lý đổi mật khẩu (require auth)
```

#### **Products**

```
GET  /products                   → Danh sách (pagination, search, filter)
GET  /products/:id               → Chi tiết sản phẩm
```

#### **Cart**

```
GET  /cart                       → Hiển thị trang giỏ hàng (require auth)
POST /cart/add                   → Thêm vào giỏ (AJAX, JSON response)
POST /cart/update                → Cập nhật số lượng (AJAX)
POST /cart/remove                → Xóa khỏi giỏ (Form submit)
```

#### **Checkout**

```
GET  /checkout/cart              → Form thanh toán từ giỏ (require auth)
POST /checkout/cart              → Xử lý thanh toán giỏ
GET  /checkout/buy/:id           → Form mua ngay (require auth)
POST /checkout/buy/:id           → Xử lý mua ngay
GET  /checkout/qr                → Hiển thị QR code thanh toán
```

#### **Orders (Client)**

```
GET  /account/orders             → Danh sách đơn hàng (require auth)
GET  /account/orders/:id         → Chi tiết đơn hàng (require auth)
PATCH /account/orders/:id/cancel → Hủy đơn hàng (require auth)
```

---

### **6.2 Admin Routes (Prefix `/admin`)**

#### **Authentication**

```
GET  /admin/login                → Hiển thị trang login
POST /admin/login                → Xử lý login
GET  /admin/logout               → Logout
GET  /admin/                     → Dashboard (require checkUser)
```

#### **Products**

```
GET  /admin/products             → Danh sách
GET  /admin/products/add         → Form thêm
POST /admin/products/add         → Xử lý thêm (multer single upload)
GET  /admin/products/:id/edit    → Form sửa
PATCH /admin/products/:id        → Xử lý sửa (multer)
GET  /admin/products/:id         → Chi tiết
PATCH /admin/products/:id/status → Toggle status
```

#### **Authors**

```
GET  /admin/authors              → Danh sách
GET  /admin/authors/add          → Form thêm
POST /admin/authors/add          → Xử lý thêm
GET  /admin/authors/:id/edit     → Form sửa
PUT  /admin/authors/:id          → Xử lý sửa
PATCH /admin/authors/:id/status  → Toggle status
```

#### **Categories**

```
GET  /admin/categories           → Danh sách
GET  /admin/categories/add       → Form thêm
POST /admin/categories/add       → Xử lý thêm
GET  /admin/categories/:id/edit  → Form sửa
PUT  /admin/categories/:id       → Xử lý sửa
PATCH /admin/categories/:id/status → Toggle status
```

#### **Publishers**

```
GET  /admin/publishers           → Danh sách
GET  /admin/publishers/add       → Form thêm
POST /admin/publishers/add       → Xử lý thêm
GET  /admin/publishers/:id/edit  → Form sửa
PUT  /admin/publishers/:id       → Xử lý sửa
PATCH /admin/publishers/:id/status → Toggle status
```

#### **Imports** ⭐ **UPDATED with Approval Workflow**

```
GET  /admin/imports              → Danh sách phiếu nhập (filter by status, created_by)
GET  /admin/imports/new          → Form tạo phiếu nhập (Staff only)
GET  /admin/imports/:id          → Chi tiết phiếu (SSR HTML, không phải JSON) + reject_reason if applicable
POST /admin/imports/add          → Xử lý tạo phiếu (save as Draft, status=0)
PATCH /admin/imports/:id/submit  → Gửi duyệt (Staff: 0 → 1)
PATCH /admin/imports/:id/recall  → Hủy gửi (Staff: 1 → 0)
DELETE /admin/imports/:id        → Xóa phiếu (Staff: only when status=0)
PATCH /admin/imports/:id/edit    → Chỉnh sửa phiếu (Staff: only when status=0)
PATCH /admin/imports/:id/approve → Duyệt phiếu (Manager/Admin: 1 → 2, trigger stock update)
PATCH /admin/imports/:id/reject  → Từ chối duyệt (Manager/Admin: 1 → 0, fill reject_reason)
```

#### **Orders**

```
GET  /admin/orders               → Danh sách đơn hàng (filter by status)
GET  /admin/orders/:id/details   → Chi tiết đơn
POST /admin/orders/:id/status    → Cập nhật trạng thái (JSON response)
POST /admin/orders/:id/payment-status → Cập nhật payment status
```

#### **Users (Admin only)**

```
GET  /admin/users                → Danh sách users
GET  /admin/users/add            → Form thêm user
POST /admin/users/add            → Xử lý thêm user
GET  /admin/users/:id/edit       → Form sửa
PUT  /admin/users/:id            → Xử lý sửa
PATCH /admin/users/:id/status    → Toggle status
```

#### **Customers**

```
GET  /admin/customers            → Danh sách khách hàng
GET  /admin/customers/:id        → Chi tiết
PATCH /admin/customers/:id/status → Khóa/mở
```

#### **Account (Admin)**

```
GET  /admin/account              → Xem profile cá nhân
GET  /admin/account/edit         → Form sửa profile
POST /admin/account/edit         → Xử lý sửa
```

---

## 7. Pricing & Calculation Logic

### **7.1 Dynamic Price Calculation** ⭐ **NEW from CODE**

**File:** `src/utils/price_calculator.js`

```javascript
calculatePrice(avgImportPrice, profitPercent, discountPercent) {
  const avg = Number(avgImportPrice || 0);
  const profit = Number(profitPercent || 0);
  const discount = Number(discountPercent || 0);

  // 1. Original Price = làm tròn lên nghìn
  // = ceil((avg * (1 + profit/100)) / 1000) * 1000
  const original_price = Math.ceil((avg * (1 + profit / 100)) / 1000) * 1000;

  // 2. Selling Price = làm tròn theo nghìn (round, không ceil)
  // = round(original_price * (1 - discount/100) / 1000) * 1000
  const raw_selling_price = original_price * (1 - discount / 100);
  const selling_price = Math.round(raw_selling_price / 1000) * 1000;

  return { original_price, selling_price };
}
```

**Example:**

- avg_import_price = 150,000
- profit_percentage = 10%
- discount_percentage = 5%

```
original_price = ceil((150000 * 1.1) / 1000) * 1000
               = ceil(165000 / 1000) * 1000
               = ceil(165) * 1000
               = 165000

selling_price = round((165000 * 0.95) / 1000) * 1000
              = round(156750 / 1000) * 1000
              = round(156.75) * 1000
              = 157000
```

**Lưu ý:**

- ✅ Giá được tính **REAL-TIME** cho mỗi product trên UI (không lưu trong DB)
- ✅ Khi lấy product trên client cart/checkout, tính lại giá từ formula này
- ❌ **KHÔNG bao giờ lưu trực tiếp `selling_price` vào database**
- ⚠️ Nếu avg_import_price = 0, selling_price = 0

### **7.2 Shipping Fee** ⭐ **NEW from CODE**

```javascript
const shippingFee = grandTotal >= 100000 ? 0 : 30000;
```

**Rules:**

- Nếu tổng đơn ≥ 100,000 VND → **Miễn phí** (0 VND)
- Nếu tổng đơn < 100,000 VND → **30,000 VND**

### **7.3 Weighted Average Price (Import)** ⭐ **NEW from CODE**

**Formula:**

```
NEW_AVG_IMPORT_PRICE = (OLD_QTY × OLD_AVG + NEW_QTY × NEW_PRICE) / (OLD_QTY + NEW_QTY)
```

**Validation:**

```javascript
if (!isFinite(newAvgImportPrice) || Number.isNaN(newAvgImportPrice)) {
  newAvgImportPrice = importPrice; // Fallback nếu NaN hoặc Infinity
}
```

**Example:**

- Current: stock=10, avg_price=100,000
- Import: qty=20, price=130,000

```
new_avg = (10 × 100,000 + 20 × 130,000) / (10 + 20)
        = (1,000,000 + 2,600,000) / 30
        = 3,600,000 / 30
        = 120,000
```

---

## 8. User Stories & Acceptance Criteria

### **8.1 Client Portal**

| #        | User Story                                                                                                                              | Acceptance Criteria (Given-When-Then)                                                                                                                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C1**   | As a new Customer, I want to register with email/password so that I can access my account                                               | **Given:** Registration page is open. **When:** I enter valid fullname, email, phone, address, password and confirm password. **Then:** Account created, auto-login, redirect to account page with success toastr                   |
| **C2**   | As a Customer, I want to login with email/password so that I can access my account                                                      | **Given:** Login page, I have valid account. **When:** I enter email and password. **Then:** Session created, redirect to account page with success toastr                                                                          |
| **C3**   | As a logged-in Customer, I want to view product list with pagination, search, and category filter so that I can find books easily       | **Given:** Products page open, 20 products exist. **When:** I search for "Harry", or filter by category, or go to page 2. **Then:** Results filtered correctly, pagination works, prices are calculated dynamically                 |
| **C4**   | As a Customer, I want to view product detail including image, price, author, publisher, and stock info so that I make purchase decision | **Given:** Product detail page. **When:** I view a book. **Then:** Show book_title, original_price (strikethrough if discount), selling_price, author, publisher, category, stock_quantity, description, image                      |
| **C5**   | As a logged-in Customer, I want to add items to cart so that I can purchase multiple items at once                                      | **Given:** Product page, I am logged in. **When:** I click "Add to cart". **Then:** Item added to cart (if not already there), toastr success, cart count updated                                                                   |
| **C6**   | As a Customer, I want to update quantity in cart so that I can change my purchase plan                                                  | **Given:** Cart page, item exists. **When:** I increase/decrease quantity. **Then:** Quantity updated, but NOT exceeding stock_quantity, totals recalculated                                                                        |
| **C7**   | As a Customer, I want to checkout from cart so that I can purchase multiple books at once                                               | **Given:** Cart has 2 books (A, B with stock ≥ quantities in cart). **When:** I enter address, phone, select payment, click checkout. **Then:** Order created, order_details inserted, stock deducted, cart cleared, toastr success |
| **C7a**  | **Error Case:** Cart checkout fails if stock insufficient                                                                               | **Given:** Cart has Book A (qty=5), stock only 3. **When:** I click checkout. **Then:** Error toastr, NO order created, stock unchanged                                                                                             |
| **C8**   | As a Customer, I want to buy a book immediately (Buy Now) so that I don't go through cart                                               | **Given:** Product detail page. **When:** I enter quantity, address, phone, select payment, click "Buy now". **Then:** Order created directly, stock deducted, redirect to account/orders                                           |
| **C9**   | As a Customer paying via bank transfer, I want to see QR code so that I can pay                                                         | **Given:** After checkout/buy-now with payment_id=2. **When:** Redirected to `/checkout/qr?orderId=X`. **Then:** Display QR code, order details, reference number                                                                   |
| **C10**  | As a Customer, I want to view my orders list so that I can track purchases                                                              | **Given:** Account page, I have 3 orders. **When:** I click "My orders". **Then:** List all orders with status, total, date; can filter by status                                                                                   |
| **C11**  | As a Customer, I want to view order detail including items and status history so that I track package                                   | **Given:** Orders list. **When:** I click order ID. **Then:** Show items (qty, price), timeline of status changes, payment status                                                                                                   |
| **C12**  | As a Customer, I want to cancel a Pending order so that I can change my mind                                                            | **Given:** Order is status=1 (Pending). **When:** I click Cancel. **Then:** Status → Cancelled, stock restored, toastr success                                                                                                      |
| **C12a** | **Error Case:** Cannot cancel non-Pending order                                                                                         | **Given:** Order is status=2 (Processing). **When:** I try to cancel. **Then:** Error toastr "Chỉ có thể hủy đơn hàng ở trạng thái 'Chờ xác nhận'"                                                                                  |
| **C13**  | As a logged-in Customer, I want to edit my profile so that I keep info updated                                                          | **Given:** Account page. **When:** I edit fullname, email, phone, address and click save. **Then:** Profile updated, toastr success. **Validation:** phone must be 10-11 digits                                                     |

---

### **8.2 Admin Portal**

| #            | User Story                                                                                                                 | Acceptance Criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A1**       | As an Admin, I want to login so that I access the system                                                                   | **Given:** Admin login page. **When:** I enter email/password (admin role). **Then:** Session created, redirect to dashboard                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **A2**       | As a Manager, I want to create a new product so that I can add books to catalog                                            | **Given:** Add product form. **When:** I fill title, category, author, publisher, profit%, discount%, stock, upload image, click Save. **Then:** Product created with status=0 (inactive), avg_import_price=0. **Note:** avg_import_price will be set via import                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **A2-err1**  | **Error:** Upload ảnh sản phẩm sai định dạng hoặc vượt dung lượng khi Thêm sản phẩm                                       | **Given:** Form "Thêm sản phẩm". **When:** Manager chọn file không phải ảnh (ví dụ `.pdf`, `.exe`) **hoặc** chọn file ảnh có dung lượng > **5MB**, rồi click Save. **Then:** Multer Middleware chặn request ngay tại Router — file **không được ghi** vào `/public/img/products/`. Controller nhận lỗi từ Middleware, set **Toastr error**: _"Chỉ chấp nhận ảnh JPEG, PNG, WebP và dung lượng không vượt quá 5MB."_ Redirect về form thêm sản phẩm. Không tạo bản ghi sản phẩm mới.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **A3**       | As a Manager, I want to edit a product so that I update info                                                               | **Given:** Edit form. **When:** I modify title, category, author, etc., click Save. **Then:** Product updated. **CANNOT edit:** avg_import_price, stock (these are controlled by import/order)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **A3-err1**  | **Error:** Upload ảnh sản phẩm sai định dạng hoặc vượt dung lượng khi Cập nhật sản phẩm                                   | **Given:** Form "Cập nhật sản phẩm" (đã có ảnh cũ). **When:** Manager chọn file thay thế không phải ảnh (ví dụ `.pdf`, `.exe`) **hoặc** chọn file ảnh > **5MB**, rồi click Save. **Then:** Multer Middleware chặn request tại Router — file mới **không được ghi** vào đĩa. Controller set **Toastr error**: _"Chỉ chấp nhận ảnh JPEG, PNG, WebP và dung lượng không vượt quá 5MB."_ Redirect về form chỉnh sửa. Ảnh cũ của sản phẩm **không bị xóa hoặc thay thế**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **A4**       | As a Manager, I want to toggle product status so that I can activate/deactivate books                                      | **Given:** Products list. **When:** I click toggle status. **Then:** status flipped (1↔0). Status=1: visible to clients, can checkout. Status=0: hidden from clients, cannot checkout                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **A5**       | As a Staff, I want to create draft import invoice so that I can prepare books for approval before applying to inventory    | **Given:** Import form open. **When:** I select a publisher → system loads books of that publisher → I click on a book to add it to the "Sản phẩm đã chọn" list (checkbox auto-ticked) → I enter quantity & import_price → I uncheck a book's checkbox to remove it → I click "Save as Draft". **Then:** Import created with status=0 (Draft), created_by=staff_id, saved to DB. Staff can edit/delete/submit. **NO stock update yet.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **A5a**      | **Validation:** Import must have at least 1 book                                                                           | **Given:** Import form. **When:** I select publisher but NO books, click Submit. **Then:** Error "Vui lòng chọn sách"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **A5b**      | As a Staff, I want to submit draft import for Manager approval so that inventory can be officially updated                 | **Given:** Draft import (status=0). **When:** I click "Submit for Approval". **Then:** status → 1 (Pending), Manager notified. Draft items locked. Staff cannot edit until rejected.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **A5c**      | As a Staff, I want to cancel/recall import submission if Manager hasn't approved yet                                       | **Given:** Import status=1 (Pending). **When:** I click "Recall". **Then:** status → 0 (Draft), back editable, awaits Manager decision rescinded.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **A5d**      | As a Staff, I want to delete draft import that I no longer need                                                            | **Given:** Import status=0 (Draft). **When:** I click "Delete". **Then:** Import + all import_details deleted. Confirmation required.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **A5e**      | As a Manager, I want to approve import invoice so that books are added to inventory and prices updated                     | **Given:** Import status=1 (Pending). **When:** I click "Duyệt phiếu" → browser confirm dialog → click OK. **Then:** Backend Transaction chạy: import locked (`FOR UPDATE`), từng sách locked (`FOR UPDATE`), **`new_avg = (old_qty×old_avg + new_qty×price) / (old_qty+new_qty)`**, `stock_quantity += qty`, status → 2, `approved_by = manager_id`, `approved_at = NOW()`. Commit. Giao diện: badge xanh "Đã duyệt", hiện tên người duyệt + ngày duyệt, tất cả nút action ẩn. Toastr: _"Duyệt phiếu nhập thành công. Tồn kho đã được cập nhật."_                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **A5e-err1** | **Error:** Approve phiếu không ở Pending                                                                                   | **Given:** Import status=0 hoặc status=2. **When:** Có request `PATCH /admin/imports/:id/approve` (ví dụ gửi thẳng bằng tool). **Then:** Service throw `"Chỉ có thể duyệt phiếu ở trạng thái Chờ duyệt"`. Toastr error. Redirect về detail. Không thay đổi DB.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **A5e-err2** | **Error:** Approve nhưng sách trong phiếu đã bị xóa khỏi books table                                                       | **Given:** Import status=1, một `book_id` trong `import_details` không còn trong `books`. **When:** I click "Duyệt". **Then:** Transaction rollback toàn bộ (vì check `if (!currentBook) throw Error`). Toastr error `"Sách ID X không tồn tại"`. Stock không thay đổi.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **A5f**      | As a Manager, I want to reject import with reason so that Staff can fix issues                                             | **Given:** Import status=1 (Pending). **When:** I click "Từ chối" → Modal `#rejectModal` mở → Nhập lý do → Click "Xác nhận từ chối". **Then:** `status → 0` (Draft), `reject_reason = reason.trim()` lưu vào DB. **KHÔNG cộng kho, KHÔNG tính giá.** Giao diện: badge xám "Nháp", alert vàng hiện lý do từ chối, nút Staff xuất hiện. Toastr: _"Đã từ chối phiếu nhập."_ Staff có thể chỉnh sửa và gửi lại.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **A5f-err1** | **Error:** Từ chối nhưng để trống lý do                                                                                    | **Given:** Import status=1 (Pending), Manager mở Modal Từ chối. **When:** Để trống textarea `reject_reason` và click "Xác nhận từ chối". **Then (Lớp 1):** HTML5 `required` → Browser hiển thị validation tooltip, form **không submit**. **Then (Lớp 2 - nếu JS disabled):** Backend throw `"Vui lòng nhập lý do từ chối"`. Toastr error. Không thay đổi DB.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **A5f-err2** | **Error:** Từ chối phiếu không ở Pending                                                                                   | **Given:** Import status=0 hoặc status=2. **When:** Có request `PATCH /admin/imports/:id/reject` với reject_reason. **Then:** Service throw `"Chỉ có thể từ chối phiếu ở trạng thái Chờ duyệt"`. Toastr error. Không thay đổi DB.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **A5g**      | As a Staff, I want to edit a draft import so that I can correct mistakes before submitting for approval ⭐ **IMPLEMENTED** | **Given:** Import status=0 (Draft), created_by=me. **When:** I click "Chỉnh sửa" → form renders identical to Create form with current publisher pre-selected and existing books pre-checked with quantities/prices populated. **Scenario A – Giữ nguyên NXB:** I modify quantities/prices, add books by clicking them (checkbox auto-ticks), remove books by unchecking checkbox, click "Lưu thay đổi". **Then:** publisher_id unchanged, import_details replaced with new list (transaction), import stays at status=0, redirect to detail page with success toastr. **Scenario B – Đổi NXB:** I select a different publisher → system **automatically clears all current books in the list** → I select new books from the new publisher's catalog → click "Lưu thay đổi". **Then:** publisher_id updated, import_details replaced with new list, import stays at status=0. **Lưu ý:** Phải có ít nhất 1 sách. Quantity > 0, import_price > 0. Tất cả sách phải thuộc NXB đã chọn. |
| **A5g-err1** | **Error:** Cannot edit if not owner                                                                                        | **Given:** Import status=0, created_by=other_staff. **When:** I try to edit. **Then:** Error toastr "Bạn không có quyền chỉnh sửa phiếu này", no changes made.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **A5g-err2** | **Error:** Cannot edit non-Draft import                                                                                    | **Given:** Import status=1 (Pending) or status=2 (Approved). **When:** I try to edit. **Then:** Error toastr "Chỉ có thể chỉnh sửa phiếu ở trạng thái Nháp", no changes made.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **A5g-err3** | **Error:** Cannot save empty import                                                                                        | **Given:** Edit form. **When:** I deselect ALL books and click Save. **Then:** Error toastr "Phiếu nhập phải có ít nhất một sách", no changes made.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **A5g-err4** | **Error:** Cannot save books not belonging to selected publisher                                                           | **Given:** Edit form. **When:** Submitted data contains book_ids that don't belong to the selected publisher_id. **Then:** Error toastr "Sách không thuộc nhà xuất bản đã chọn", no changes made.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **A6**       | As a Staff, I want to view import history so that I track inventory changes and approval status                            | **Given:** Imports list. **When:** I load page. **Then:** List filtered by created_by, showing status, import_id, publisher_name, date, total_qty, total_cost, created_by, approved_by. Can filter by status (Draft/Pending/Approved). Click to view details + rejection reason if any.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **A7**       | As a Staff, I want to update order status so that I process orders                                                         | **Given:** Orders list, order status=1 (Pending). **When:** I select new status (Processing/Cancelled) and click Update. **Then:** status_id updated in orders, record inserted in order_status_history. **Transition rules enforced**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **A7a**      | **Status Transition Rules**                                                                                                | 1→[2,5], 2→[3,5], 3→[4], 4→[NO CHANGE], 5→[NO CHANGE]. If invalid → Error                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **A7b**      | **Cancel Order (Admin Side):** If status→5 (Cancelled), auto restore stock from order_details                              | **Given:** Order status=1 (Pending). **When:** I change to status=5 (Cancelled). **Then:** order_status_history added, for each order_detail: books.stock_quantity += quantity                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **A8**       | As an Admin, I want to create/manage Master Data (Authors, Categories, Publishers) so that I maintain catalog structure    | **Given:** CRUD forms. **When:** I add/edit/delete author (or category/publisher). **Then:** Records updated. Status filter available                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **A9**       | As an Admin, I want to manage user accounts so that I create staff or block customers                                      | **Given:** Users management. **When:** I create user with role=staff/customer, or toggle status on existing user. **Then:** User created/status changed, permissions updated                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

---

## 9. Session Management & Authentication Details

### **9.1 Session Configuration** ⭐ **NEW from CODE**

**File:** `src/index.js`

```javascript
app.use(
  session({
    secret: "secret-key-17082004",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
  }),
);
```

**Session Objects:**

- **Admin User:** `req.session.user = { id, email, role }`
- **Client Customer:** `req.session.customer = { id, email, fullname }`
- **Flash Messages:** `req.session.toastr = { type: 'success'|'error', message: '...' }`

**Important:**

- ✅ Session KHÔNG được chia sẻ giữa Admin & Client
- ✅ Tất cả Handlebars templates có access đến `user`, `customer`, `toastr` via `res.locals`
- ✅ Session timeout = 1 hour, auto destroy
- ⚠️ Cookie name = `connect.sid` (default)

### **9.2 Password Hashing**

**Library:** bcryptjs v3.0.3, bcrypt v6.0.0

- Tất cả password được hash trước khi lưu
- Khi login: `bcrypt.compare(inputPassword, hashedPassword)`
- Hash salt rounds: (mặc định từ library)

### **9.3 Flash Messages**

**Flow:**

1. Controller set: `req.session.toastr = { type: '...', message: '...' }`
2. Middleware copy to `res.locals.toastr`
3. View render toastr (Handlebars)
4. Session toastr deleted (chỉ hiển thị 1 lần)

**Types:**

- `'success'` → Green background
- `'error'` → Red background
- `'warning'` → Yellow background
- `'info'` → Blue background

---

## 10. Data Validation Rules

### **10.1 Client Registration**

```javascript
[
  body("fullname").trim().notEmpty().withMessage("Họ tên không được để trống"),
  body("email").trim().isEmail().withMessage("Email không đúng định dạng"),
  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Số điện thoại không được để trống"),
  body("address").trim().notEmpty().withMessage("Địa chỉ không được để trống"),
  body("confirm_password").custom((value, { req }) => {
    if (value !== req.body.password)
      throw new Error("Mật khẩu xác nhận không khớp");
    return true;
  }),
];
```

### **10.2 Client Account Edit**

```javascript
[
  body("fullname").trim().notEmpty().withMessage("Họ tên không được để trống"),
  body("email").trim().isEmail().withMessage("Email không đúng định dạng"),
  body("phone_number")
    .trim()
    .notEmpty()
    .matches(/^[0-9]{10,11}$/)
    .withMessage("Số điện thoại phải có 10-11 chữ số"),
  body("address").trim().notEmpty().withMessage("Địa chỉ không được để trống"),
];
```

### **10.3 Product Management**

- **Required fields:** book_title, category_id, author_id, publisher_id, profit_percentage
- **Optional:** discount_percentage, stock_quantity, description, image
- **Validation:**
  - Image upload: Only store filename, full path = `/img/products/` + filename
  - Profit & discount: Parse as Number, default to 0

### **10.4 Checkout Validation**

- **Required:** address, phoneNumber, paymentId
- **Stock check:** For each item in cart/order: `item.quantity <= book.stock_quantity`
- **Error response:** If any validation fails, throw Error (service), catch in controller, set toastr error, redirect

---

## 11. Error Handling & UI Feedback

### **11.1 Toast Notifications**

**Pattern:**

```javascript
req.session.toastr = { type: "success" | "error", message: "..." };
res.redirect("/...");
```

**Common Scenarios:**

| Scenario                     | Type    | Message                                                      | Redirect                       |
| ---------------------------- | ------- | ------------------------------------------------------------ | ------------------------------ |
| Login success                | success | "Đăng nhập thành công!"                                      | /admin or /account             |
| Login failed                 | error   | "Email hoặc mật khẩu không đúng!"                            | /admin/login or /account/login |
| Add to cart                  | success | "Thêm vào giỏ hàng thành công!"                              | /products or /products/:id     |
| Checkout success (COD)       | success | "Đặt hàng thành công!"                                       | /                              |
| Checkout success (Bank)      | -       | (No toastr, redirect to QR page)                             | /checkout/qr                   |
| Checkout fail (stock)        | error   | "Sản phẩm 'XXX' không đủ hàng. Tồn kho: Y"                   | /cart                          |
| Cancel order                 | success | "Hủy đơn hàng thành công!"                                   | /account/orders                |
| Cancel fail                  | error   | "Chỉ có thể hủy đơn ở trạng thái 'Chờ xác nhận'"             | /account/orders                |
| Import success               | success | "Nhập sách thành công!"                                      | /admin/imports                 |
| Import edit success          | success | "Cập nhật phiếu nhập thành công!"                            | /admin/imports/:id             |
| Import edit fail (perm)      | error   | "Bạn không có quyền chỉnh sửa phiếu này"                     | /admin/imports/:id             |
| Import edit fail (status)    | error   | "Chỉ có thể chỉnh sửa phiếu ở trạng thái Nháp"               | /admin/imports/:id             |
| Import edit fail (empty)     | error   | "Phiếu nhập phải có ít nhất một sách"                        | /admin/imports/:id/edit        |
| **Import approve success**   | success | **"Duyệt phiếu nhập thành công. Tồn kho đã được cập nhật."** | /admin/imports/:id             |
| Import approve fail (status) | error   | "Chỉ có thể duyệt phiếu ở trạng thái Chờ duyệt"              | /admin/imports/:id             |
| Import approve fail (book)   | error   | "Sách ID X không tồn tại" (Transaction rollback)             | /admin/imports/:id             |
| **Import reject success**    | success | **"Đã từ chối phiếu nhập"**                                  | /admin/imports/:id             |
| Import reject fail (reason)  | error   | "Vui lòng nhập lý do từ chối"                                | /admin/imports/:id             |
| Import reject fail (status)  | error   | "Chỉ có thể từ chối phiếu ở trạng thái Chờ duyệt"            | /admin/imports/:id             |
| Import submit success        | success | "Gửi duyệt thành công"                                       | /admin/imports/:id             |
| Import recall success        | success | "Hủy gửi duyệt thành công"                                   | /admin/imports/:id             |
| Profile update               | success | "Cập nhật thông tin thành công!"                             | /account                       |

### **11.2 Error Handling in Service Layer**

```javascript
try {
  // Perform operation
} catch (error) {
  console.error("Error message:", error);
  throw new Error("User-friendly message");
}
```

- Controller catches service error
- Set toastr with error message from service
- Redirect to appropriate page
- **Never expose stack traces to frontend**

### **11.3 Transaction Rollback**

**When errors occur during multi-step operations:**

1. **Checkout Cart:**

   ```javascript
   await connection.beginTransaction();
   try {
     // Multiple operations
     await connection.commit();
   } catch (error) {
     await connection.rollback();
     throw error;
   }
   ```

2. **Import:**

   ```javascript
   // Similar pattern, rollback if any book fails
   ```

3. **Order Cancellation:**
   ```javascript
   // Rollback if stock restore fails
   ```

---

## 12. Database Transactions & Concurrency

### **12.1 Checkout Transaction** ⭐ **IMPLEMENTED**

```javascript
exports.checkoutItems = async (customerId, ...) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get cart items
    // 2. Validate stock
    // 3. Create orders
    // 4. Create order_details
    // 5. UPDATE stock
    // 6. DELETE cart_items
    // 7. INSERT order_status_history

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
```

**Race Condition Prevention:**

- Use `FOR UPDATE` lock when reading stock before purchase
- ⚠️ **CURRENTLY NOT IMPLEMENTED** - Both orders use `SELECT` without lock, potential race condition

### **12.2 Import Transaction** ⭐ **IMPLEMENTED**

```javascript
await connection.beginTransaction();
for (const book of books) {
  // 1. INSERT import_details
  // 2. SELECT stock & avg_price (WITH UPDATE LOCK - MISSING)
  // 3. Calculate new avg
  // 4. UPDATE books
}
await connection.commit();
```

**Issue:** ⚠️ Missing `FOR UPDATE` in book selection

### **12.3 Order Status Update** ⭐ **IMPLEMENTED**

```javascript
const [orderRows] = await db.query(
  "SELECT status_id FROM orders WHERE order_id = ? FOR UPDATE",
  [orderId],
);
// Then apply transition rules
// UPDATE orders
// INSERT history
```

**Good:** Uses `FOR UPDATE` for locking

---

## 13. File Upload & Image Handling

### **13.1 Multer Configuration**

**File:** `src/routers/admin/product_router.js`

```javascript
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/img/products"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận ảnh JPEG, PNG, WebP và dung lượng không vượt quá 5MB."), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

router.post("/add", upload.single("image_path"), productController.add);
router.patch("/:id", upload.single("image_path"), productController.edit);
```

**Rules:**

- Single image per product
- Stored in: `/public/img/products/`
- Filename format: `{timestamp}-{original_name}`
- Accessed via: `/img/products/{filename}`
- ✅ **Giới hạn dung lượng: tối đa **5MB** per upload** (`limits.fileSize`)
- ✅ **Định dạng cho phép: **`image/jpeg`**, **`image/png`**, **`image/webp`**** (kiểm tra qua `fileFilter`)
- ✅ **Nếu vi phạm → Multer throw Error ngay tại Middleware**, file không được ghi vào đĩa; Controller bắt lỗi và trả về **Toastr error**: _"Chỉ chấp nhận ảnh JPEG, PNG, WebP và dung lượng không vượt quá 5MB."_

---

## 14. Order Status Workflow

### **14.1 Status Definitions**

| status_id | status_name  | Description                                     |
| --------- | ------------ | ----------------------------------------------- |
| 1         | Chờ xác nhận | Order just created, awaiting admin confirmation |
| 2         | Đang xử lý   | Admin has confirmed, preparing for shipment     |
| 3         | Đang giao    | Package shipped, in transit                     |
| 4         | Đã giao      | Delivered successfully                          |
| 5         | Đã hủy       | Order cancelled (by admin or customer)          |

### **14.2 Transition Rules** ⭐ **HARD-CODED in CODE**

```javascript
const allowedTransitions = {
  1: [2, 5], // Pending → Processing or Cancelled
  2: [3, 5], // Processing → Shipped or Cancelled
  3: [4], // Shipped → Delivered
  4: [], // Delivered (Terminal)
  5: [], // Cancelled (Terminal)
};
```

**Admin-side Update:** `POST /admin/orders/:id/status`

```javascript
if (!allowedTransitions[currentStatus]?.includes(Number(statusId))) {
  throw new Error("Không được chuyển trạng thái không hợp lệ");
}
```

**Client-side Cancellation:** `PATCH /account/orders/:id/cancel`

```javascript
if (currentStatus !== 1) {
  throw new Error('Chỉ có thể hủy đơn ở trạng thái "Chờ xác nhận"');
}
// Set status_id = 5, restore stock
```

### **14.3 Status History Tracking**

**Every status change:**

1. Update `orders.status_id`
2. Insert into `order_status_history` (order_id, status_id, created_at)
3. Client sees timeline: "2024-11-01 10:30 - Chờ xác nhận → 2024-11-01 11:00 - Đang xử lý 🔄"

---

## 14.4 Import Status Transitions ⭐ **NEW - Approval Workflow**

### **14.4.1 Import Status Definitions**

| status_id | status_name         | Description                             | Stock Update | Price Update |
| --------- | ------------------- | --------------------------------------- | ------------ | ------------ |
| 0         | Draft (Nháp)        | New import, editable by Staff           | ❌ NO        | ❌ NO        |
| 1         | Pending (Chờ duyệt) | Submitted for Manager review, locked    | ❌ NO        | ❌ NO        |
| 2         | Approved (Đã duyệt) | Manager approved, stock & price updated | ✅ **YES**   | ✅ **YES**   |

### **14.4.2 Import State Transition Rules** ⭐ **HARD-CODED**

```javascript
const importStatusTransitions = {
  0: [1, "DELETE"], // Draft → Pending OR Delete
  1: [0, 2], // Pending → Draft (reject) OR Approved
  2: [], // Approved (Terminal - no changes)
};

const allowedActions = {
  0: {
    // Draft
    staff: ["EDIT", "SUBMIT", "DELETE", "RECALL"],
    manager: ["REJECT", "APPROVE"],
    admin: ["REJECT", "APPROVE"],
  },
  1: {
    // Pending
    staff: ["RECALL"],
    manager: ["REJECT", "APPROVE"],
    admin: ["REJECT", "APPROVE"],
  },
  2: {
    // Approved
    staff: [],
    manager: [],
    admin: [],
  },
};
```

### **14.4.3 Import Workflow State Diagram**

```
┌─────────────────────────────────────────────────────────┐
│                    DRAFT (status=0)                      │
│                                                           │
│  Staff Actions:                                           │
│  - EDIT items, quantities, prices                        │
│  - DELETE entire import                                  │
│  - SUBMIT for approval                                   │
│                                                           │
└────────────────┬────────────────────────────────────────┘
                 │ SUBMIT
                 ↓
┌─────────────────────────────────────────────────────────┐
│                   PENDING (status=1)                     │
│                                                           │
│  Staff Actions:                                           │
│  - RECALL (back to Draft)                                │
│                                                           │
│  Manager/Admin Actions:                                  │
│  - REJECT (→ Draft + fill reject_reason)                │
│  - APPROVE (→ Approved + update stock/price)            │
│                                                           │
└────────┬──────────────────┬────────────────────────────┘
         │ REJECT           │ APPROVE
         ↓                  ↓
┌──────────────────┐   ┌────────────────────────────────────┐
│  DRAFT (status=0)│   │  APPROVED (status=2)               │
│  + reject_reason │   │                                    │
│                  │   │  ✅ Stock updated                  │
│  Staff can edit  │   │  ✅ Avg price calculated           │
│  & resubmit      │   │  ❌ NO edits allowed               │
│                  │   │  ❌ NO deletes allowed             │
│                  │   │  ❌ NO cancellations               │
└──────────────────┘   └────────────────────────────────────┘
                              (TERMINAL STATE)
```

### **14.4.4 Database Transaction for Approval**

**CRITICAL: Only execute when status changes 1 → 2**

```sql
START TRANSACTION;

-- Lock the import record
SELECT * FROM imports WHERE import_id = ? FOR UPDATE;

-- For each book in import_details:
FOR EACH row in import_details WHERE import_id = ?:
  -- Lock book record
  SELECT stock_quantity, avg_import_price FROM books WHERE book_id = ? FOR UPDATE;

  -- Calculate new average price
  new_avg = (old_qty * old_avg + new_qty * new_import_price) / (old_qty + new_qty);

  -- Update book
  UPDATE books SET
    stock_quantity = stock_quantity + new_qty,
    avg_import_price = new_avg
  WHERE book_id = ?;

-- Update import status
UPDATE imports SET
  status = 2,
  approved_by = manager_id,
  approved_at = NOW()
WHERE import_id = ?;

COMMIT;
-- On any error: ROLLBACK entire transaction
```

### **14.4.5 Rejection Reason Tracking**

When import is rejected (1 → 0):

```sql
UPDATE imports SET
  status = 0,
  reject_reason = 'Lý do từ chối từ Manager'
WHERE import_id = ?;
```

**Staff sees:**

- List shows import with status=Draft
- Detail view displays reject_reason in alert
- Can edit items based on feedback and resubmit

---

## 15. Payment Methods & Integration

### **15.1 COD (Cash on Delivery)**

- payment_id = 1
- payment_name = "Tiền mặt"
- **Flow:** Order created with payment_status='0' (unpaid) → Customer pays to delivery person
- **Workflow:** After checkout → Redirect to home with success toastr

### **15.2 Bank Transfer (QR Code)**

- payment_id = 2
- payment_name = "Chuyển khoản"
- **Bank Details:**
  - Bank: TPB (Techcombank)
  - Account: 00000202511
- **QR Generation:**
  - Endpoint: `GET /checkout/qr?orderId=X`
  - Calls external API (VietQR): Generate QR for bank transfer
  - **API call in code:**
    ```javascript
    exports.generatePaymentQRCode = async ({ orderId, customerId }) => {
      const bankCode = "TPB";
      const accountNumber = "00000202511";
      // Call VietQR API
      // return qrImg;
    };
    ```
  - ⚠️ **Implementation incomplete** - QR generation code is cut off
  - ⚠️ **No payment confirmation webhook** - payment_status remains '0' (unpaid)

### **15.3 Payment Status Tracking**

```sql
orders.payment_status ENUM('0', '1')
-- '0' = Unpaid (default)
-- '1' = Paid
```

**Admin can manually update:**

```
POST /admin/orders/:id/payment-status
Body: { payment_status: '1' }
```

---

## 16. Handlebars Template Helpers

**File:** `src/helpers/handlebars.js`

```javascript
{
  eq: (a, b) => a == b,
  formatDate: (date) => moment(date).format('DD/MM/YYYY HH:mm:ss'),
  toUpperCase: (str) => (str || '').toUpperCase(),
  formatPrice: (value) => {
    const n = Number(value) || 0;
    return n.toLocaleString('vi-VN');  // 150000 → 150.000
  },
  multiply: (a, b) => Number(a) * Number(b)
}
```

**Usage in templates:**

```handlebars
{{formatPrice product.selling_price}}
→ 157.000
{{formatDate order.created_at}}
→ 01/11/2024 10:30:45
{{#if (eq status_id 1)}} ... {{/if}}
```

---

## 17. Open Questions / Technical Debts ⚠️

### **17.1 Missing Implementations (Code Incomplete)**

| Issue                                                 | Location                                                        | Impact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Priority                        |
| ----------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **`rejectImport` thiếu `FOR UPDATE` lock**            | `import_service.js` L73                                         | Khi đọc `SELECT status FROM imports WHERE import_id = ?` để kiểm tra trước khi reject, **không có `FOR UPDATE`**. Race condition: nếu Manager A đang reject và Manager B đang approve **đồng thời**, cả hai đọc được `status=1`, nhưng cả hai đều pass validation gate. Kết quả: `approveImport` có thể commit xong (status=2, kho đã cộng) trước, rồi `rejectImport` ghi đè status=0 và lưu `reject_reason` — kho đã cộng nhưng phiếu về Draft. **Cần bọc trong Transaction + thêm `FOR UPDATE`**. | **HIGH**                        |
| **`rejectImport` không dùng Transaction**             | `import_service.js` L70–84                                      | Chỉ là 1 `UPDATE` đơn, không có `beginTransaction()`/`commit()`/`rollback()`. Nếu có lỗi DB mid-query, không có cơ chế phục hồi. Rủi ro thấp (1 statement) nhưng không nhất quán với các hàm khác.                                                                                                                                                                                                                                                                                                  | LOW                             |
| **Không lưu thông tin người từ chối (`rejected_by`)** | `import_service.js`, schema `imports`                           | `rejectImport(importId, reason)` không nhận `managerId`. Không có cột `rejected_by` trong bảng `imports`. Khi phiếu bị từ chối, không biết Manager nào đã từ chối. `approved_by` chỉ được ghi khi Approve. **Audit trail thiếu cho hành động Reject.**                                                                                                                                                                                                                                              | MEDIUM                          |
| **Không có lịch sử từ chối (reject history)**         | Schema `imports`                                                | `reject_reason` bị **ghi đè** nếu phiếu bị từ chối nhiều lần. Không có bảng lịch sử tương đương `order_status_history`. Mất thông tin về các lần từ chối trước.                                                                                                                                                                                                                                                                                                                                     | LOW                             |
| **Edit Draft Import Not Implemented**                 | `import_service.js`, `import_controller.js`, `import_router.js` | Endpoint `PATCH /admin/imports/:id/edit` được doc trong PRD nhưng **ĐÃ ĐƯỢC IMPLEMENT** trong codebase hiện tại (xem `updateImport` service và controller). Cần xóa note "PENDING IMPLEMENTATION" trong section 4.2.4.3 và User Story A5g.                                                                                                                                                                                                                                                          | **RESOLVED — cần cập nhật doc** |
| **Dashboard is Placeholder**                          | `home_controller.js`                                            | Admin home page has no real data                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | MEDIUM                          |
| **Role-based Access Control**                         | Routes middleware                                               | `checkUser()` doesn't validate role; all logged-in users can access all admin routes. Lưu ý: PRD table 4.2.4.2 liệt kê Admin chỉ "View all imports", nhưng code `canManage = ["manager", "admin"].includes(user.role)` → **Admin cũng có quyền Approve/Reject**. Cần đồng bộ PRD với code.                                                                                                                                                                                                          | **HIGH**                        |
| **File Upload Validation** ✅ **ĐÃ ĐẶC TẢ — YÊU CẦU IMPLEMENT** | `product_router.js`                                             | ~~No MIME type or size validation on image upload~~ → **ĐÃ ĐƯỢC ĐẶC TẢ trong PRD v2.0** (mục 4.2.3, 8.2, 13.1). Dev cần triển khai `fileFilter` (chỉ cho phép **`image/jpeg`**, **`image/png`**, **`image/webp`**) và `limits.fileSize` = **5MB** vào cấu hình Multer trong `product_router.js`. Khi vi phạm: Multer throw Error → Controller set **Toastr error** → redirect, file không được lưu vào `/public/img/products/`. **Xóa nợ kỹ thuật này khỏi backlog sau khi implement.** | **HIGH** (Security)             |

### **17.2 Race Conditions (Potential)**

| Issue                             | Location                  | Scenario                                            | Mitigation                             |
| --------------------------------- | ------------------------- | --------------------------------------------------- | -------------------------------------- |
| **Concurrent Checkout**           | `checkout_service.js` L10 | 2 users buy last book simultaneously                | ❌ No `FOR UPDATE` lock on stock read  |
| **Import & Order Simultaneously** | DB Transaction            | Stock updated by import while order being processed | ⚠️ Risky, need tighter locking         |
| **Concurrent Status Updates**     | `order_service.js` L103   | 2 admins update same order status                   | ✅ Has `FOR UPDATE` on order selection |

### **17.3 Data Consistency Issues**

| Issue                           | Details                                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Floating Point Calculations** | Price calculator uses Math operations; potential for 0.1 + 0.2 = 0.3000004 issues. Currently rounds to 1000s, should be okay |
| **Stock Becoming Negative**     | No CHECK constraint in DB; race condition could make stock < 0                                                               |
| **Orphaned Cart Items**         | If user deleted before order, cart_items may reference non-existent customer                                                 |

### **17.4 Security Concerns**

| Issue                 | Severity | Details                                                                   |
| --------------------- | -------- | ------------------------------------------------------------------------- |
| **Password Strength** | MEDIUM   | No min length or complexity rules enforced                                |
| **SQL Injection**     | LOW      | Using prepared statements (mysql2 promise), should be safe                |
| **Session Fixation**  | LOW      | Session not regenerated on login (should call `req.session.regenerate()`) |
| **CSRF Protection**   | HIGH     | No CSRF tokens in forms                                                   |
| **Rate Limiting**     | HIGH     | No rate limit on login attempts (brute force risk)                        |

### **17.5 Features Partially Implemented**

| Feature                   | Status         | Notes                                                       |
| ------------------------- | -------------- | ----------------------------------------------------------- |
| **Admin Dashboard**       | 🟡 Placeholder | Page renders but shows no real statistics                   |
| **Bank Transfer QR**      | 🟡 Incomplete  | QR generation code is cut off, VietQR API call not finished |
| **Role-based Access**     | 🟡 Partial     | Session has role, but not validated in route middleware     |
| **Payment Status Update** | 🟡 Works       | Can update payment_status manually, no auto-webhook         |

---

## 18. Dependencies & Tech Stack

### **18.1 Key Dependencies**

```json
{
  "express": "^5.1.0",
  "express-session": "^1.18.2",
  "express-validator": "^7.3.1",
  "express-handlebars": "^8.0.1",
  "mysql2": "^3.14.1",
  "bcrypt": "^6.0.0",
  "bcryptjs": "^3.0.3",
  "multer": "^2.0.0",
  "moment": "^2.30.1",
  "handlebars-helpers": "^0.10.0",
  "method-override": "^3.0.0",
  "connect-flash": "^0.1.1",
  "dotenv": "^16.5.0"
}
```

### **18.2 Environment Variables** (Inferred)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=***
DB_NAME=book_store
NODE_ENV=development
PORT=3000
```

### **18.3 Supported Node.js Version**

- Minimum: Node.js 12+
- Recommended: Node.js 18 LTS+
- Package uses ES6 features (arrow functions, const/let, async/await)

---

## 19. Deployment & Configuration

### **19.1 Start Server**

```bash
npm install
npm start
# Runs: nodemon --inspect src/index.js
# Server listens on http://localhost:3000
```

### **19.2 Environment Setup**

```bash
cp .env.example .env
# Edit .env with DB credentials
```

### **19.3 Database Initialization**

```bash
# Import bansach.sql
mysql -u root -p book_store < bansach.sql
```

### **19.4 Static Files**

```
/public
  /css
    - footer.css, header.css, sidebar.css
    - /admin, /client (subdirectories)
  /img
    - /banner, /products
  /js
    - /admin, /client (DataTables, form validations)
```

**Middleware:** `app.use(express.static(path.join(__dirname, 'public')));`

---

## 20. Comparison: PRD v1.0 vs Actual Implementation

| Aspect                   | PRD v1.0             | Actual Code                               | Status                      |
| ------------------------ | -------------------- | ----------------------------------------- | --------------------------- |
| **Pricing Formula**      | Vague                | Explicit in price_calculator.js           | ✅ Implemented with details |
| **Shipping Fee**         | Not specified        | 0 if ≥100k else 30k                       | ✅ Hardcoded                |
| **Payment Methods**      | VNPAY, MoMo, ZaloPay | COD, Bank Transfer QR only                | ⚠️ Narrower scope           |
| **Role-based Access**    | Mentioned            | Session role exists, routes not validated | 🟡 Partial                  |
| **QR Code**              | VietQR API           | VietQR API call incomplete                | 🟡 Incomplete               |
| **Email Notifications**  | Listed as Future     | Not implemented                           | ❌ Out of scope             |
| **AI Recommendations**   | Listed as Future     | Not implemented                           | ❌ Out of scope             |
| **Weighted Avg Price**   | Mentioned            | Implemented in import_service.js          | ✅ Fully implemented        |
| **Order Status History** | Mentioned            | Fully tracked in order_status_history     | ✅ Fully implemented        |
| **Stock Transactions**   | Mentioned            | Uses MySQL transactions                   | ✅ Implemented              |
| **Pagination**           | Not detailed         | 20 items/page, OFFSET/LIMIT               | ✅ Implemented              |
| **Product Search**       | Basic                | Works on title, author, publisher         | ✅ Implemented              |
| **Dashboard**            | Mentioned            | Placeholder only                          | 🟡 Placeholder              |

---

## 21. Future Roadmap (Post-MVP)

Based on PRD v1.0 out-of-scope items:

1. **Online Payment Gateway Integration**
   - VNPAY with IPN webhook
   - MoMo, ZaloPay
   - Auto update payment_status via webhook

2. **Email & SMS Notifications**
   - Order confirmation
   - Status change notifications
   - Requires: Nodemailer, Twilio

3. **Product Recommendations**
   - Simple: "Customers also bought"
   - Advanced: ML-based recommendations

4. **Voucher & Coupon System**
   - Discount codes, percentage/fixed amount
   - Applicable at checkout

5. **Review & Rating System**
   - 5-star ratings, text reviews
   - Display on product detail

6. **Wishlist Feature**
   - Save for later
   - Price drop notifications

7. **Mobile App**
   - React Native or Flutter
   - Reuse API endpoints

---

## 22. Documentation & Code Quality Notes

### **22.1 Code Organization**

```
src/
├── index.js              ✅ Well-structured, clear middleware order
├── config/db.js          ✅ Pool setup
├── controllers/          ✅ Separated by role
├── services/             ✅ Business logic layer
├── routers/              ✅ API endpoints
├── validators/           ✅ Input validation
├── helpers/              ✅ Handlebars helpers
├── utils/                ✅ Utility functions (price_calculator)
└── public/               ✅ Static files
```

### **22.2 Comments & Readability**

- ✅ `index.js`: Good inline comments explaining middleware
- ✅ `price_calculator.js`: Clear formula
- ✅ `checkout_service.js`: Numbered steps in transaction
- ❌ Some services lack documentation
- ❌ No JSDoc comments on functions

### **22.3 Console Logging**

- ✅ Error logging: `console.error()`
- ⚠️ Debug logging left in code: `console.log("order id ở...")` in order_service.js and checkout_service.js

---

## 23. Summary & Key Takeaways

### **✅ What's Working Well**

1. **Clear MVC Architecture** - Controllers, Services, Models separated
2. **Database Transactions** - Checkout & Order management use transactions
3. **Dynamic Pricing** - Automated price calculation based on formula
4. **Session Isolation** - Admin and Client sessions completely separate
5. **Stock Management** - Inventory tracked with weighted average pricing
6. **Order Status Workflow** - Status transitions enforced with rules
7. **Validation** - Input validation on both client and server side

### **⚠️ Areas Needing Attention**

1. **Race Conditions** - No `FOR UPDATE` lock in checkout, risk of overselling
2. **Security** - Missing CSRF tokens, no rate limiting, session not regenerated on login
3. **Incomplete Features** - QR code generation incomplete, dashboard placeholder
4. **Role-based Access** - Role exists but not validated in middleware
5. **Error Handling** - Some scenarios may expose technical details
6. **File Upload** - No MIME type or size validation

### **❌ Items NOT Implemented (By Design)**

- Email/SMS notifications
- Online payment gateway (only QR stub)
- AI recommendations
- Voucher system
- Review/rating system
- Mobile app

---

## Appendix A: Quick Reference

### **Key Formulas**

**Original Price:**

```
original_price = ceil((avg_import_price * (1 + profit% / 100)) / 1000) * 1000
```

**Selling Price:**

```
selling_price = round((original_price * (1 - discount% / 100)) / 1000) * 1000
```

**Shipping Fee:**

```
shipping_fee = (subtotal >= 100000) ? 0 : 30000
```

**Weighted Average:**

```
new_avg = (old_qty * old_avg + new_qty * new_price) / (old_qty + new_qty)
```

### **Status IDs**

- 1 = Pending (Chờ xác nhận)
- 2 = Processing (Đang xử lý)
- 3 = Shipped (Đang giao)
- 4 = Delivered (Đã giao)
- 5 = Cancelled (Đã hủy)

### **Payment IDs**

- 1 = COD (Tiền mặt)
- 2 = Bank Transfer (Chuyển khoản)

### **Session Properties**

- Admin: `req.session.user = { id, email, role }`
- Client: `req.session.customer = { id, email, fullname }`
- Flash: `req.session.toastr = { type, message }`
- Timeout: 1 hour

---

**Document Version:** 2.0  
**Last Updated:** May 2026  
**Status:** READY FOR DEVELOPMENT REFERENCE ✅
