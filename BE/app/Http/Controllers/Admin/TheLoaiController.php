<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TheLoai;
use App\Http\Requests\StoreTheLoaiRequest;
use App\Http\Requests\UpdateTheLoaiRequest;
use Illuminate\Http\JsonResponse;

class TheLoaiController extends Controller
{
    // Lấy danh sách thể loại
    public function index(): JsonResponse
    {
        $data = TheLoai::latest()->paginate(10);
        return response()->json($data);
    }

    // Tạo thể loại mới
    public function store(StoreTheLoaiRequest $request): JsonResponse
    {
        $theLoai = TheLoai::create($request->validated());
        return response()->json([
            'message' => 'Tạo thể loại thành công!',
            'data' => $theLoai
        ], 201);
    }

    // Xem chi tiết thể loại
    public function show(TheLoai $the_loai): JsonResponse
    {
        return response()->json([
            'data' => $the_loai
        ]);
    }

    // Cập nhật thể loại
    public function update(UpdateTheLoaiRequest $request, TheLoai $the_loai): JsonResponse
    {
        $the_loai->update($request->validated());
        return response()->json([
            'message' => 'Cập nhật thể loại thành công!',
            'data' => $the_loai
        ]);
    }

    // Xoá thể loại
    public function destroy(TheLoai $the_loai): JsonResponse
    {
        $the_loai->delete();
        return response()->json(['message' => 'Xoá thể loại thành công!']);
    }
}