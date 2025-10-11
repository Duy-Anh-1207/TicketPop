<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TheLoai;
use App\Http\Requests\StoreTheLoaiRequest;
use App\Http\Requests\UpdateTheLoaiRequest;
use Illuminate\Http\JsonResponse;

class TheLoaiController extends Controller
{
    public function index(): JsonResponse
    {
        $data = TheLoai::latest()->paginate(10);
        return response()->json($data);
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
        // SỬA Ở ĐÂY: Thêm key 'data'
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
        // SỬA Ở ĐÂY: Trả về status 204
        return response()->json(null, 204);
    }
}