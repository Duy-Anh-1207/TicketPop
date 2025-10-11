<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\FoodController;
use App\Http\Controllers\Admin\LichChieuController;
use App\Http\Controllers\Admin\PhimController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\TheLoaiController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;


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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/the-loai', [TheLoaiController::class, 'index']);
Route::post('/the-loai', [TheLoaiController::class, 'store']);
Route::get('/the-loai/{id}', [TheLoaiController::class, 'show']);
Route::put('/the-loai/{id}', [TheLoaiController::class, 'update']);
Route::delete('/the-loai/{id}', [TheLoaiController::class, 'destroy']);

Route::get('/foods', [FoodController::class, 'index']);
Route::post('/foods', [FoodController::class, 'store']);
Route::get('/foods/{id}', [FoodController::class, 'show']);
Route::put('/foods/{id}', [FoodController::class, 'update']);
Route::delete('/foods/{id}', [FoodController::class, 'destroy']);