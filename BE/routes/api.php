<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\FoodController;
use App\Http\Controllers\Admin\GheController;
use App\Http\Controllers\Admin\LichChieuController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\PhimController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\TheLoaiController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\VaiTroController;
use App\Http\Controllers\Admin\MaGiamGiaController;
use App\Http\Controllers\Admin\PhienBanController;
use App\Http\Controllers\Admin\TinTucController;
use App\Http\Controllers\Admin\DangKyController;
use App\Http\Controllers\Admin\DangNhapController;

Route::get('/phim', [PhimController::class, 'index']);
Route::get('/phim/{id}', [PhimController::class, 'show']);
Route::post('/phim', [PhimController::class, 'store']);
Route::put('/phim/{id}', [PhimController::class, 'update']);
Route::delete('/phim/{id}', [PhimController::class, 'destroy']);
Route::apiResource('vai_tro', PhimController::class);

//  API Room
Route::get('/room', [RoomController::class, 'index']);
Route::post('/room', [RoomController::class, 'store']);
Route::get('/room/{id}', [RoomController::class, 'show']);
Route::put('/room/{id}', [RoomController::class, 'update']);
Route::delete('/room/{id}', [RoomController::class, 'destroy']);

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
Route::get('/lich-chieu/{id}', [LichChieuController::class, 'show']);
Route::put('/lich-chieu/{id}', [LichChieuController::class, 'update']);
Route::delete('/lich-chieu/{id}', [LichChieuController::class, 'destroy']);

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

Route::get('/foods', [FoodController::class, 'index']);
Route::post('/foods', [FoodController::class, 'store']);
Route::get('/foods/{id}', [FoodController::class, 'show']);
Route::put('/foods/{id}', [FoodController::class, 'update']);
Route::delete('/foods/{id}', [FoodController::class, 'destroy']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::apiResource('ghe', GheController::class);


Route::get('/ma-giam-gia', [MaGiamGiaController::class, 'index']);
Route::post('/ma-giam-gia', [MaGiamGiaController::class, 'store']);
Route::get('/ma-giam-gia/{id}', [MaGiamGiaController::class, 'show']);
Route::put('/ma-giam-gia/{id}', [MaGiamGiaController::class, 'update']);
Route::delete('/ma-giam-gia/{id}', [MaGiamGiaController::class, 'destroy']);


Route::get('/tin-tuc', [TinTucController::class, 'index']);
Route::post('/tin-tucs', [VaiTroController::class, 'store']);
Route::get('/tin-tucs/{id}', [VaiTroController::class, 'show']);
Route::put('/tin-tucs/{id}', [VaiTroController::class, 'update']);
Route::delete('/tin-tucs/{id}', [VaiTroController::class, 'destroy']);

Route::get('/phien-ban', [PhienBanController::class, 'index']);

Route::post('/dang-ky', [DangKyController::class, 'dangKy']);

Route::post('/dang-nhap', [DangNhapController::class, 'dangNhap']);

