<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TinTuc;
use App\Http\Requests\StoreTinTucRequest;
use App\Http\Requests\UpdateTinTucRequest;
use Illuminate\Http\JsonResponse;

class TinTucController extends Controller
{
    public function index(): JsonResponse
    {
        $data = TinTuc::latest()->paginate(10);
        return response()->json($data);
    }

    public function store(StoreTinTucRequest $request): JsonResponse
    {
        $tinTuc = TinTuc::create($request->validated());
        return response()->json([
            'message' => 'Tạo tin tức thành công!',
            'data' => $tinTuc
        ], 201);
    }

    public function show(TinTuc $tinTuc): JsonResponse
    {
        return response()->json(['data' => $tinTuc]);
    }

    public function update(UpdateTinTucRequest $request, TinTuc $tinTuc): JsonResponse
    {
        $tinTuc->update($request->validated());
        return response()->json([
            'message' => 'Cập nhật tin tức thành công!',
            'data' => $tinTuc
        ]);
    }

    public function destroy(TinTuc $tinTuc): JsonResponse
    {
        $tinTuc->delete();
        return response()->json(null, 204);
    }
}
