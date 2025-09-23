-- --------------------------------------------------------
-- Máy chủ:                      127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Phiên bản:           12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping data for table bookstore.authors: ~0 rows (approximately)
INSERT INTO `authors` (`id_tac_gia`, `ten_tac_gia`, `mo_ta`) VALUES
	(1, 'hau dau', 'tác giả giỏi nhất thế giới');

-- Dumping data for table bookstore.books: ~31 rows (approximately)
INSERT INTO `books` (`id_sach`, `ten_sach`, `id_danh_muc`, `id_tac_gia`, `id_nha_xuat_ban`, `gia`, `phan_tram_khuyen_mai`, `so_luong_ton`, `mo_ta`, `hinh_anh`, `the_loai`, `ngay_tao`, `status`) VALUES
	(1, 'sach 1', 1, 1, 1, 10000.00, 3.00, 20, 'hay', '/img/products/sach1.png', NULL, '2025-05-21 00:00:00', '1'),
	(2, 'Sách mẫu số 1', 1, 1, 1, 13750.00, 1.00, 100, 'Mô tả sách mẫu số 1', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(3, 'Sách mẫu số 2', 1, 1, 1, 32228.00, 25.00, 31, 'Mô tả sách mẫu số 2', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(4, 'Sách mẫu số 3', 1, 1, 1, 37053.00, 3.00, 79, 'Mô tả sách mẫu số 3', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(5, 'Sách mẫu số 4', 1, 1, 1, 24073.00, 16.00, 87, 'Mô tả sách mẫu số 4', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(6, 'Sách mẫu số 5', 1, 1, 1, 55474.00, 10.00, 46, 'Mô tả sách mẫu số 5', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(7, 'Sách mẫu số 6', 1, 1, 1, 17997.00, 35.00, 17, 'Mô tả sách mẫu số 6', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(8, 'Sách mẫu số 7', 1, 1, 1, 22003.00, 48.00, 26, 'Mô tả sách mẫu số 7', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(9, 'Sách mẫu số 8', 1, 1, 1, 54325.00, 47.00, 15, 'Mô tả sách mẫu số 8', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(10, 'Sách mẫu số 9', 1, 1, 1, 31975.00, 1.00, 96, 'Mô tả sách mẫu số 9', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(11, 'Sách mẫu số 10', 1, 1, 1, 21207.00, 25.00, 102, 'Mô tả sách mẫu số 10', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(12, 'Sách mẫu số 11', 1, 1, 1, 13286.00, 27.00, 67, 'Mô tả sách mẫu số 11', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(13, 'Sách mẫu số 12', 1, 1, 1, 20329.00, 15.00, 103, 'Mô tả sách mẫu số 12', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(14, 'Sách mẫu số 13', 1, 1, 1, 47585.00, 47.00, 58, 'Mô tả sách mẫu số 13', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(15, 'Sách mẫu số 14', 1, 1, 1, 37949.00, 17.00, 19, 'Mô tả sách mẫu số 14', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(16, 'Sách mẫu số 15', 1, 1, 1, 31171.00, 41.00, 95, 'Mô tả sách mẫu số 15', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(17, 'Sách mẫu số 16', 1, 1, 1, 49109.00, 17.00, 54, 'Mô tả sách mẫu số 16', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(18, 'Sách mẫu số 17', 1, 1, 1, 17100.00, 19.00, 57, 'Mô tả sách mẫu số 17', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(19, 'Sách mẫu số 18', 1, 1, 1, 22110.00, 39.00, 27, 'Mô tả sách mẫu số 18', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(20, 'Sách mẫu số 19', 1, 1, 1, 37110.00, 9.00, 37, 'Mô tả sách mẫu số 19', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(21, 'Sách mẫu số 20', 1, 1, 1, 51834.00, 17.00, 37, 'Mô tả sách mẫu số 20', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(22, 'Sách mẫu số 21', 1, 1, 1, 24748.00, 32.00, 49, 'Mô tả sách mẫu số 21', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(23, 'Sách mẫu số 22', 1, 1, 1, 10385.00, 42.00, 34, 'Mô tả sách mẫu số 22', '/img/products/sach1.png', 'Văn học', '2025-05-20 23:59:00', '0'),
	(24, 'Sách mẫu số 23', 1, 1, 1, 42611.00, 26.00, 81, 'Mô tả sách mẫu số 23', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(25, 'Sách mẫu số 24', 1, 1, 1, 58479.00, 35.00, 71, 'Mô tả sách mẫu số 24', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(26, 'Sách mẫu số 25', 1, 1, 1, 57888.00, 47.00, 95, 'Mô tả sách mẫu số 25', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(27, 'Sách mẫu số 26', 1, 1, 1, 32130.00, 32.00, 99, 'Mô tả sách mẫu số 26', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(28, 'Sách mẫu số 27', 1, 1, 1, 37430.00, 2.00, 71, 'Mô tả sách mẫu số 27', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(29, 'Sách mẫu số 28', 1, 1, 1, 56897.00, 41.00, 44, 'Mô tả sách mẫu số 28', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(30, 'Sách mẫu số 29', 1, 1, 1, 21190.00, 4.00, 86, 'Mô tả sách mẫu số 29', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(31, 'Sách mẫu số 30', 1, 1, 1, 39016.00, 29.00, 33, 'Mô tả sách mẫu số 30', '/img/products/sach1.png', 'Văn học', '2025-05-21 00:00:00', '0'),
	(32, 'sach 31', 1, 1, 1, 3.00, 3.00, 33, '33', NULL, NULL, '2025-05-26 16:39:52', '1');

-- Dumping data for table bookstore.cart: ~0 rows (approximately)

-- Dumping data for table bookstore.cart_items: ~0 rows (approximately)

-- Dumping data for table bookstore.categories: ~0 rows (approximately)
INSERT INTO `categories` (`id_danh_muc`, `ten_danh_muc`, `mo_ta`) VALUES
	(1, 'thiếu nhi', 'dành cho mọi lứa tuổi');

-- Dumping data for table bookstore.import_details: ~0 rows (approximately)

-- Dumping data for table bookstore.import_notes: ~0 rows (approximately)

-- Dumping data for table bookstore.orders: ~0 rows (approximately)

-- Dumping data for table bookstore.order_details: ~0 rows (approximately)

-- Dumping data for table bookstore.order_status: ~4 rows (approximately)
INSERT INTO `order_status` (`id_trang_thai`, `ten_trang_thai`) VALUES
	(1, 'Chờ xác nhận'),
	(2, 'Đang chuẩn bị hàng'),
	(3, 'Đang giao'),
	(4, 'Đã giao');

-- Dumping data for table bookstore.order_status_history: ~0 rows (approximately)

-- Dumping data for table bookstore.payment_methods: ~3 rows (approximately)
INSERT INTO `payment_methods` (`id_phuong_thuc`, `ten_phuong_thuc`) VALUES
	(1, 'COD'),
	(2, 'Chuyển khoản'),
	(3, 'Ví điện tử');

-- Dumping data for table bookstore.publishers: ~0 rows (approximately)
INSERT INTO `publishers` (`id_nha_xuat_ban`, `ten_nha_xuat_ban`, `dia_chi`, `so_dien_thoai`, `mo_ta`) VALUES
	(1, 'nhà xuất bản con cò', '41, ấp L', '0334', 'pro');

-- Dumping data for table bookstore.users: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
