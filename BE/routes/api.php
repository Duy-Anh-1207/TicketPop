<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ThongKeController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\FoodController;
use App\Http\Controllers\Admin\GheController;
use App\Http\Controllers\Admin\LichChieuController;
use App\Http\Controllers\Admin\PhienBanController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\PhimController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\TheLoaiController;
use App\Http\Controllers\Admin\UserController;

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\VaiTroController;
use App\Http\Controllers\Admin\MaGiamGiaController;
use App\Http\Controllers\Admin\TinTucController;
use App\Http\Controllers\Admin\DangKyController;
use App\Http\Controllers\Admin\DangNhapController;
use App\Http\Controllers\Admin\DanhGiaController;
use App\Http\Controllers\Admin\DonDoAnController;
use App\Http\Controllers\Client\LocPhimController;
use App\Http\Controllers\Admin\QuyenTruyCapController;
use App\Http\Controllers\Admin\GiaVeController;
use App\Http\Controllers\Client\CheckGheController;
use App\Http\Controllers\Client\MomoController;
use App\Http\Controllers\Client\VnpayController;
use App\Http\Controllers\Admin\QuenMatKhauController;
use App\Http\Controllers\Admin\DatVeController;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;


Route::get('/phim', [PhimController::class, 'index']);
Route::get('/phim/{id}', [PhimController::class, 'show']);
Route::post('/phim', [PhimController::class, 'store']);
Route::put('/phim/{id}', [PhimController::class, 'update']);
Route::delete('/phim/{id}', [PhimController::class, 'destroy']);
Route::middleware('auth:sanctum')->post('/danh-gia', [DanhGiaController::class, 'store']);
Route::get('/danh-gia', [DanhGiaController::class, 'index']);


// Route::apiResource('vai_tro', PhimController::class);

//  API Room
Route::get('/room', [RoomController::class, 'index']);
Route::post('/room', [RoomController::class, 'store']);
Route::get('/room/{id}', [RoomController::class, 'show']);
Route::put('/room/{id}', [RoomController::class, 'update']);
Route::delete('/room/{id}', [RoomController::class, 'destroy']);
Route::put('/room/{id}/change-status', [RoomController::class, 'changeStatus']);

Route::post('/dat-ve/{id}/ap-dung-voucher', [DatVeController::class, 'apDungVoucher']);

Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::put('/{id}', [UserController::class, 'update']);
    Route::patch('/{id}', [UserController::class, 'update']);
    Route::delete('/{id}', [UserController::class, 'destroy']);
    Route::patch('/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    Route::patch('/{id}/role', [UserController::class, 'assignRole']);
    Route::patch('/{id}/reset-password', [UserController::class, 'resetPassword']);
});

Route::prefix('menu')->group(function () {
    Route::get('/',        [MenuController::class, 'index']);
    Route::get('/tree',    [MenuController::class, 'tree']);
    Route::post('/',       [MenuController::class, 'store']);
    Route::get('/{menu}',  [MenuController::class, 'show']);
    Route::match(['put', 'patch'], '/{menu}', [MenuController::class, 'update']);
    Route::delete('/{menu}', [MenuController::class, 'destroy']);
});

Route::get('/lich-chieu', [LichChieuController::class, 'index']);
Route::post('/lich-chieu', [LichChieuController::class, 'store']);
Route::post('/lich-chieu/auto-one-day', [LichChieuController::class, 'storeAutoOneDay']);
Route::get('/lich-chieu/{id}', [LichChieuController::class, 'show']);
Route::put('/lich-chieu/{id}', [LichChieuController::class, 'update']);
Route::delete('/lich-chieu/{id}', [LichChieuController::class, 'destroy']);
Route::get('/lich-chieu/find-next', [LichChieuController::class, 'findNextAvailableTime']);
Route::post('/lich-chieu/copy-by-date-range', [LichChieuController::class, 'copyLichChieuByDateRange']);
Route::delete('/lich-chieu/{id}', [LichChieuController::class, 'destroy']);
Route::post('/lich-chieu/{id}/restore', [LichChieuController::class, 'restore']);
Route::get('/deleted', [LichChieuController::class, 'deleted']);
Route::delete('/force-delete/{id}', [LichChieuController::class, 'forceDelete']);
Route::get('/phim/{id}/phien-ban', [LichChieuController::class, 'getPhienBanTheoPhimId']);
Route::get('/rooms/{id}/lichTheoPhong', [LichChieuController::class, 'getLichTheoPhong']);


//gia ve
Route::get('/gia-ve/{lichChieuId}', [LichChieuController::class, 'getGiaVeByLichChieu']);
// don do an
Route::prefix('don-do-an')->group(function () {
    Route::get('/', [DonDoAnController::class, 'index']);
    Route::post('/', [DonDoAnController::class, 'store']);
    Route::put('/{id}', [DonDoAnController::class, 'update']);
    Route::get('/{id}', [DonDoAnController::class, 'show']);
    Route::delete('/{id}', [DonDoAnController::class, 'destroy']);
});


// dat ve
Route::middleware('auth:sanctum')->post('/dat-ve', [DatVeController::class, 'datVe']);
Route::middleware('auth:sanctum')->get('/dat-ve', [DatVeController::class, 'danhSachDatVe']);
Route::middleware('auth:sanctum')->get('/dat-ve/{id}', [DatVeController::class, 'chiTietVe']);
Route::middleware('auth:sanctum')->get('/dat-ve/ma-giao-dich/{maGiaoDich}', [DatVeController::class, 'ChiTietDonVe']);
Route::middleware('auth:sanctum')->get('/dat-ve/ma-giao-dich/{maGiaoDich}/in-ve', [DatVeController::class, 'inVeTheoMaGD']);
Route::middleware('auth:sanctum')->put('/dat-ve/ma-giao-dich/{maGiaoDich}/cap-nhat-trang-thai', [DatVeController::class, 'capNhatTrangThaiTheoMaGD']);
Route::middleware('auth:sanctum')->delete('/dat-ve/{id}', [DatVeController::class, 'xoaDatVe']);

Route::get('/banners', [BannerController::class, 'index']);

Route::post('/banners', [BannerController::class, 'store']);
Route::get('/banners/{id}', [BannerController::class, 'show']);
Route::put('/banners/{id}', [BannerController::class, 'update']);
Route::delete('/banners/{id}', [BannerController::class, 'destroy']);

Route::get('/the-loai', [TheLoaiController::class, 'index']);
Route::post('/the-loai', [TheLoaiController::class, 'store']);
Route::get('/the-loai/{the_loai}', [TheLoaiController::class, 'show']);
Route::put('/the-loai/{the_loai}', [TheLoaiController::class, 'update']);
Route::delete('/the-loai/{the_loai}', [TheLoaiController::class, 'destroy']);

Route::get('/vai-tro', [VaiTroController::class, 'index']);
Route::post('/vai-tro', [VaiTroController::class, 'store']);
Route::get('/vai-tro/{id}', [VaiTroController::class, 'show']);
Route::put('/vai-tro/{id}', [VaiTroController::class, 'update']);
Route::delete('/vai-tro/{id}', [VaiTroController::class, 'destroy']);

Route::put('/vai-tro/{vai_tro_id}/update_quyen_truy_cap', [VaiTroController::class, 'update_quyen_truy_cap']);

Route::get('/foods', [FoodController::class, 'index']);
Route::post('/foods', [FoodController::class, 'store']);
Route::get('/foods/{id}', [FoodController::class, 'show']);
Route::put('/foods/{id}', [FoodController::class, 'update']);
Route::delete('/foods/{id}', [FoodController::class, 'destroy']);

Route::get('/phien-ban', [PhienBanController::class, 'index']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// GHẾ ĐỂ ADMIN QUẢN LÝ
Route::apiResource('ghe', GheController::class);
Route::put('ghe/{id}/toggle-status', [GheController::class, 'toggleStatus']);

Route::prefix('check-ghe')->group(function () {

    // Lấy toàn bộ check_ghe theo ID ghế
    Route::get('/show-all/{gheId}', [CheckGheController::class, 'showAllCheckGhe']);

    // Lấy danh sách ghế theo lịch chiếu
    Route::get('/lich-chieu/{lichChieuId}', [CheckGheController::class, 'getGheByLichChieu']);

    // Cập nhật trạng thái ghế
    Route::put('/update/{id}', [CheckGheController::class, 'update']);

    // Cập nhật trạng thái ghế hàng loạt (out trang)
    Route::post('/bulk-update', [CheckGheController::class, 'bulkUpdate']);

    // Xóa toàn bộ check_ghe thuộc lịch chiếu
    Route::delete('/destroy/{lichChieuId}', [CheckGheController::class, 'destroy']);
});


Route::get('/ma-giam-gia', [MaGiamGiaController::class, 'index']);
Route::post('/ma-giam-gia', [MaGiamGiaController::class, 'store']);
Route::get('/ma-giam-gia/{id}', [MaGiamGiaController::class, 'show']);
Route::put('/ma-giam-gia/{id}', [MaGiamGiaController::class, 'update']);
Route::delete('/ma-giam-gia/{id}', [MaGiamGiaController::class, 'destroy']);

Route::prefix('dashbroad')->group(function () {
    Route::get('/doanh-thu', [DashboardController::class, 'doanhThu']);
    Route::get('/ve-ban', [DashboardController::class, 'veBan']);
    Route::get('/top-phim', [DashboardController::class, 'topPhim']);
    Route::get('/do-an-ban-ra', [DashboardController::class, 'doAnBanRa']);
    Route::get('/tong-doanh-thu', [DashboardController::class, 'tongDoanhThu']);
    Route::get('/khach-hang-moi', [DashboardController::class, 'khachHangMoi']);
});

Route::prefix('thong-ke')->group(function () {
    // THỐNG KÊ VÉ
    Route::get('/gio-mua-nhieu-nhat', [ThongKeController::class, 'gioMuaNhieuNhat']);
    Route::get('/top-phim-ban-chay', [ThongKeController::class, 'topPhimBanChay']);
    Route::get('/phan-bo-loai-ve', [ThongKeController::class, 'phanBoLoaiVe']);
    Route::get('/ve-theo-gio-hom-nay', [ThongKeController::class, 'veTheoGioHomNay']);
     Route::get('/suat-chieu', [ThongKeController::class, 'thongKeSuatChieu']);


    // THỐNG KÊ DOANH THU
    Route::get('/ghe', [ThongKeController::class, 'ThongKeGhe']);
    Route::get('/doanh-thu-phim', [ThongKeController::class, 'doanhThuPhim']);
    Route::get('/doanh-thu-do-an', [ThongKeController::class, 'doanhThuDoAn']);
    Route::get('/doanh-thu-theo-thang', [ThongKeController::class, 'doanhThuTheoThang']);
});

Route::get('/tin-tucs', [TinTucController::class, 'index']);
Route::post('/tin-tucs', [TinTucController::class, 'store']);
Route::get('/tin-tucs/{id}', [TinTucController::class, 'show']);
Route::put('/tin-tucs/{id}', [TinTucController::class, 'update']);
Route::delete('/tin-tucs/{id}', [TinTucController::class, 'destroy']);

Route::get('/phien-ban', [PhienBanController::class, 'index']);

Route::post('/dang-ky', [DangKyController::class, 'dangKy']);
Route::get('/xac-thuc-email', [DangKyController::class, 'xacThucEmail']);
Route::post('/xac-thuc-email', [DangKyController::class, 'xacThucEmail']);
Route::post('/gui-lai-ma', [DangKyController::class, 'guiLaiMa']);

Route::post('/dang-nhap', [DangNhapController::class, 'dangNhap']);

Route::post('/dang-xuat', [DangNhapController::class, 'dangXuat']);
// Quên mật khẩu
Route::post('/quen-mat-khau', [QuenMatKhauController::class, 'guiYeuCau']);
Route::post('/dat-lai-mat-khau', [QuenMatKhauController::class, 'datLaiMatKhau']);


Route::apiResource('quyen-truy-cap', QuyenTruyCapController::class);


//client
Route::get('/client/loc-phim', [LocPhimController::class, 'index']);



Route::post('/thanhtoan/momo', [MomoController::class, 'create']);
Route::put('/thanh-toan/{id}/cap-nhat-trang-thai', [MomoController::class, 'capNhatTrangThai']);
Route::get('/thanhtoan/momo/return', [MomoController::class, 'return']);
Route::post('/thanhtoan/momo/ipn', [MomoController::class, 'ipn']);
Route::post('/thanhtoan/momo/rollback-ghe', [MomoController::class, 'huyGhe']);
Route::post('thanh-toan/quet-ve', [MomoController::class, 'capNhatTrangThai']);
Route::prefix('vnpay')->group(function () {
    Route::post('/create', [VnpayController::class, 'create']);
    Route::get('/return', [VnpayController::class, 'return']);
    Route::get('/ipn',    [VnpayController::class, 'ipn']);
});
