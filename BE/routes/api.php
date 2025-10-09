<?php

use App\Http\Controllers\BannerController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PhimController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\UserController;

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
    Route::get('/', [UserController::class, 'index']);           // GET /api/users
    Route::get('/{id}', [UserController::class, 'show']);        // GET /api/users/{id}
    Route::post('/', [UserController::class, 'store']);          // POST /api/users
    Route::patch('/{id}', [UserController::class, 'update']);      // PUT /api/users/{id}
    Route::delete('/{id}', [UserController::class, 'destroy']);  // DELETE /api/users/{id}
    Route::patch('/{id}/status', [UserController::class, 'updateStatus']);   // Đổi trạng thái (active/inactive)
    Route::patch('/{id}/role', [UserController::class, 'updateRole']);              // Gán vai trò mới
    Route::patch('/{id}/reset-password', [UserController::class, 'resetPassword']); // Đặt lại mật khẩu
    
});


Route::get('/banners', [BannerController::class, 'index']);
Route::post('/banners', [BannerController::class, 'store']);
Route::get('/banners/{id}', [BannerController::class, 'show']);
Route::put('/banners/{id}', [BannerController::class, 'update']);
Route::delete('/banners/{id}', [BannerController::class, 'destroy']);