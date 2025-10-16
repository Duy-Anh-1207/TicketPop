<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePhienBanRequest;
use App\Http\Requests\UpdatePhienBanRequest;
use App\Models\PhienBan;
use Illuminate\Http\JsonResponse;

class PhienBanController extends Controller
{
    public function index(): JsonResponse
    {
        $data = PhienBan::orderBy('id', 'asc')->get();

        return response()->json([
            'data' => $data
        ]);
    }

    public function store(StorePhienBanRequest $request): JsonResponse
    {
        $phienBan = PhienBan::create($request->validated());

        return response()->json([
            'message' => 'Tạo phiên bản thành công!',
            'data' => $phienBan
        ], 201);
    }

    public function show(PhienBan $phienBan): JsonResponse
    {
        return response()->json([
            'data' => $phienBan
        ]);
    }

    public function update(UpdatePhienBanRequest $request, PhienBan $phienBan): JsonResponse
    {
        $phienBan->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật phiên bản thành công!',
            'data' => $phienBan
        ]);
    }

    public function destroy(PhienBan $phienBan): JsonResponse
    {
        $phienBan->delete();

        return response()->json([
            'message' => 'Xóa phiên bản thành công!'
        ], 200);
    }
}
