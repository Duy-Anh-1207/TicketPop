<?php

namespace App\Http\Controllers\Admin;
use Illuminate\Http\Request;
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
        // Lấy danh sách vai trò, sắp xếp mới nhất, phân trang
        $data = VaiTro::latest()->paginate(10);
        return response()->json($data);
    }

    public function store(StoreVaiTroRequest $request): JsonResponse
    {

        $validated = $request->validated();
        
        try {
            DB::beginTransaction();

            // Tạo vai trò mới (không gán quyền hạn)
            $vaiTro = VaiTro::create([
                'ten_vai_tro' => $validated['ten_vai_tro'],
                'mo_ta' => $validated['mo_ta'] ?? null,
            ]);
            // Thêm quyền
            // if (!empty($validated['permissions'])) {
            //     foreach ($validated['permissions'] as $perm) {
            //         $vaiTro->quyenTruyCaps()->create([
            //             'menu_id'  => $perm['menu_id'],
            //             'function' => $perm['function'], // tự encode JSON
            //         ]);
            //     }
            // }


            DB::commit();

            return response()->json([
                'message' => 'Tạo vai trò thành công!',
                'data' => $vaiTro
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Đã có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    public function show(VaiTro $vaiTro): JsonResponse
    {
        return response()->json([
            'data' => $vaiTro
        ]);
    }

    public function update(UpdateVaiTroRequest $request, VaiTro $vaiTro): JsonResponse
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            // Cập nhật thông tin vai trò (không quyền hạn)
            $vaiTro->update([
                'ten_vai_tro' => $validated['ten_vai_tro'],
                'mo_ta' => $validated['mo_ta'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Cập nhật vai trò thành công!',
                'data' => $vaiTro
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

    public function update_quyen_truy_cap(Request $request, $vai_tro_id): JsonResponse
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*.menu_id' => 'required|integer|exists:menu,id',
            'permissions.*.function' => 'nullable|array'
        ]);

        try {
            DB::beginTransaction();

            $vaiTro = VaiTro::findOrFail($vai_tro_id);
            $currentPermissions = $vaiTro->quyenTruyCaps()->get()->keyBy('menu_id');

            $newPermissions = collect($validated['permissions']);
            $newMenuIds = $newPermissions->pluck('menu_id')->toArray();

            if ($currentPermissions->isEmpty()) {
                foreach ($newPermissions as $perm) {
                    $vaiTro->quyenTruyCaps()->create([
                        'menu_id' => $perm['menu_id'],
                        'function' => implode(',', $perm['function'] ?? [])
                    ]);
                }
            } else {
                $vaiTro->quyenTruyCaps()
                    ->whereNotIn('menu_id', $newMenuIds)
                    ->delete();

                foreach ($newPermissions as $perm) {
                    if (isset($currentPermissions[$perm['menu_id']])) {
                        $currentPermissions[$perm['menu_id']]->update([
                            'function' => implode(',', $perm['function'] ?? [])
                        ]);
                    } else {
                        $vaiTro->quyenTruyCaps()->create([
                            'menu_id' => $perm['menu_id'],
                            'function' => implode(',', $perm['function'] ?? [])
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Cập nhật quyền truy cập thành công!',
                'data' => $vaiTro->load('quyenTruyCaps')
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

}
