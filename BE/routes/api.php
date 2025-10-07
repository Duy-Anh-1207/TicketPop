<?php 
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PhimController;
use App\Http\Controllers\RoomController;

Route::get('/phim', [PhimController::class, 'index']);
Route::get('/phim/{id}', [PhimController::class, 'show']);
Route::post('/phim', [PhimController::class, 'store']);
Route::put('/phim/{id}', [PhimController::class, 'update']);
Route::delete('/phim/{id}', [PhimController::class, 'destroy']);
Route::apiResource('vai_tro', PhimController::class);


//  API Room
Route::get('/room', [RoomController::class, 'index']);          
Route::get('/room/{id}', [RoomController::class, 'show']);     
Route::post('/room', [RoomController::class, 'store']);         
Route::put('/room/{id}', [RoomController::class, 'update']);   
Route::delete('/room/{id}', [RoomController::class, 'destroy']); 
