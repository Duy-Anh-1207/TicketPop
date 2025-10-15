<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTheLoaiRequest;
use App\Http\Requests\UpdateTheLoaiRequest;
use App\Models\TheLoai;
use Illuminate\Http\JsonResponse;

class TheLoaiController extends Controller
{

    public function index(): JsonResponse
    {
       $data = TheLoai::orderBy('id', 'asc')->get();
        return response()->json([
            'data' => $data
        ]);
    }

   
    public function store(StoreTheLoaiRequest $request): JsonResponse
    {
        $theLoai = TheLoai::create($request->validated());
        return response()->json([
            'message' => 'Tạo thể loại thành công!',
            'data' => $theLoai
        ], 201);
    }

    
    public function show(TheLoai $theLoai): JsonResponse
    {
        return response()->json([
            'data' => $theLoai
        ]);
    }

    
    public function update(UpdateTheLoaiRequest $request, TheLoai $theLoai): JsonResponse
    {
        $theLoai->update($request->validated());
        return response()->json([
            'message' => 'Cập nhật thể loại thành công!',
            'data' => $theLoai
        ]);
    }

   
    public function destroy(TheLoai $theLoai): JsonResponse
    {
        $theLoai->delete();
        return response()->json(null, 204);
    }
}
