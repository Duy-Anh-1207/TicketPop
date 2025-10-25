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
        $data = TinTuc::whereNull('deleted_at')->latest()->paginate(10);
        return response()->json($data);
    }

    public function store(StoreTinTucRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('hinh_anh')) {
            $file = $request->file('hinh_anh');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/tin-tuc'), $fileName);
            $data['hinh_anh'] = '/uploads/tin-tuc/' . $fileName;
        }

        $tinTuc = TinTuc::create($data);

        return response()->json([
            'message' => 'Tạo tin tức thành công!',
            'data' => $tinTuc,
        ], 201);
    }


    public function show($id): JsonResponse
    {
        $tinTuc = TinTuc::find($id);

        if (!$tinTuc) {
            return response()->json([
                'message' => 'Không tìm thấy tin tức với ID: ' . $id,
            ], 404);
        }

        return response()->json([
            'data' => $tinTuc,
        ]);
    }


        public function update(UpdateTinTucRequest $request, $id): JsonResponse
        {
            $tinTuc = TinTuc::find($id);

            if (!$tinTuc) {
                return response()->json([
                    'message' => 'Không tìm thấy tin tức.'
                ], 404);
            }

            $data = $request->validated();

            // Xử lý file ảnh nếu có
            if ($request->hasFile('hinh_anh')) {
                $file = $request->file('hinh_anh');
                $filePath = $file->store('uploads/tin_tuc', 'public');
                $data['hinh_anh'] = '/storage/' . $filePath;
            }

            $tinTuc->update($data);

            return response()->json([
                'message' => 'Cập nhật tin tức thành công!',
                'data' => $tinTuc
            ]);
        }


    public function destroy($id): JsonResponse
    {
        $tinTuc = TinTuc::findOrFail($id);
        $tinTuc->delete();

        return response()->json([
            'message' => 'Xóa tin tức thành công!',
        ], 200);
    }

}
