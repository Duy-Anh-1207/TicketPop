<?php

use App\Http\Controllers\BannerController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PhimController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\V1\TheLoaiController;
use Illuminate\Http\Request;
Route::get('/phim', [PhimController::class, 'index']);
Route::get('/phim/{id}', [PhimController::class, 'show']);
Route::post('/phim', [PhimController::class, 'store']);
Route::put('/phim/{id}', [PhimController::class, 'update']);
Route::delete('/phim/{id}', [PhimController::class, 'destroy']);
Route::apiResource('vai_tro', PhimController::class);

Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::post('/users', [UserController::class, 'store']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::patch('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
Route::patch('/users/{id}/role', [UserController::class, 'assignRole']);
Route::patch('/users/{id}/reset-password', [UserController::class, 'resetPassword']);


Route::get('/banners', [BannerController::class, 'index']);
Route::post('/banners', [BannerController::class, 'store']);
Route::get('/banners/{id}', [BannerController::class, 'show']);
Route::put('/banners/{id}', [BannerController::class, 'update']);
Route::delete('/banners/{id}', [BannerController::class, 'destroy']);




Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('v1')->group(function () {
    Route::apiResource('the-loai', TheLoaiController::class);
});