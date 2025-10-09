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