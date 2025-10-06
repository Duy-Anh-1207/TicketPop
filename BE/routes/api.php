<?php 
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PhimController;

Route::get('/phim', [PhimController::class, 'index']);
Route::get('/phim/{id}', [PhimController::class, 'show']);
Route::post('/phim', [PhimController::class, 'store']);
Route::put('/phim/{id}', [PhimController::class, 'update']);
Route::delete('/phim/{id}', [PhimController::class, 'destroy']);
Route::apiResource('vai_tro', PhimController::class);