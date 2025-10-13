<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VaiTro;
use App\Http\Requests\StoreVaiTroRequest;
use App\Http\Requests\UpdateVaiTroRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Exception;

class VaiTroController extends Controller
{
    
    public function index(): JsonResponse
    {
        $data = VaiTro::with('quyenHans')->latest()->paginate(10);
        return response()->json($data);
    }
    public function store(StoreVaiTroRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            // Bắt đầu một transaction để đảm bảo toàn vẹn dữ liệu
            DB::beginTransaction();

            // Tạo vai trò chỉ với các trường của bảng vai_tro
            $vaiTro = VaiTro::create([
                'ten_vai_tro' => $validated['ten_vai_tro'],
                'mo_ta' => $validated['mo_ta'] ?? null,
            ]);

            // Gán các quyền hạn cho vai trò vừa tạo
            $vaiTro->quyenHans()->attach($validated['quyen_han_ids']);

            // Nếu mọi thứ thành công, commit transaction
            DB::commit();

            return response()->json([
                'message' => 'Tạo vai trò thành công!',
                'data' => $vaiTro->load('quyenHans') // Tải lại quan hệ để trả về
            ], 201); // HTTP status 201: Created

        } catch (Exception $e) {
            // Nếu có lỗi, rollback tất cả các thay đổi
            DB::rollBack();
            return response()->json(['message' => 'Đã có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    public function show(VaiTro $vaiTro): JsonResponse
    {
        return response()->json([
            'data' => $vaiTro->load('quyenHans') // Tải quan hệ quyenHans
        ]);
    }

    public function update(UpdateVaiTroRequest $request, VaiTro $vaiTro): JsonResponse
    {
        $validated = $request->validated();
        try {
            DB::beginTransaction();

            // Cập nhật các trường của vai trò
            $vaiTro->update([
                'ten_vai_tro' => $validated['ten_vai_tro'],
                'mo_ta' => $validated['mo_ta'] ?? null,
            ]);

            // sync() sẽ tự động thêm, xóa, hoặc giữ nguyên các quyền hạn
            $vaiTro->quyenHans()->sync($validated['quyen_han_ids']);

            DB::commit();

            return response()->json([
                'message' => 'Cập nhật vai trò thành công!',
                'data' => $vaiTro->load('quyenHans')
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Đã có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }


    public function destroy(VaiTro $vaiTro): JsonResponse
    {
        $vaiTro->delete();

        return response()->json(null, 204);
    }
}
