<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DonDoAn;
use App\Models\DoAn;
use App\Models\DatVe;
use Illuminate\Http\Request;

class DonDoAnController extends Controller
{
    // ✅ Lấy danh sách đơn đồ ăn
    public function index()
    {
        $data = DonDoAn::with(['datVe.nguoiDung:id,ten,email', 'doAn:id,ten_do_an,image'])
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Danh sách đơn đồ ăn',
            'data' => $data
        ]);
    }

    // ✅ Tạo đơn đồ ăn mới
    public function store(Request $request)
    {
        $request->validate([
            'dat_ve_id' => 'required|exists:dat_ve,id',
            'do_an_id' => 'required|exists:do_an,id',
            'so_luong' => 'required|integer|min:1',
        ]);

        $doAn = DoAn::findOrFail($request->do_an_id);

        $donDoAn = DonDoAn::create([
            'dat_ve_id' => $request->dat_ve_id,
            'do_an_id' => $request->do_an_id,
            'gia_ban' => $doAn->gia_ban,
            'so_luong' => $request->so_luong,
        ]);

        return response()->json([
            'message' => 'Tạo đơn đồ ăn thành công',
            'data' => $donDoAn->load('doAn', 'datVe')
        ], 201);
    }

    // ✅ Xem chi tiết đơn đồ ăn
    public function show($id)
    {
        $donDoAn = DonDoAn::with(['datVe', 'doAn'])->find($id);

        if (!$donDoAn) {
            return response()->json(['message' => 'Không tìm thấy đơn đồ ăn'], 404);
        }

        return response()->json([
            'message' => 'Chi tiết đơn đồ ăn',
            'data' => $donDoAn
        ]);
    }

    // ✅ Cập nhật đơn đồ ăn
    public function update(Request $request, $id)
    {
        $donDoAn = DonDoAn::find($id);
        if (!$donDoAn) {
            return response()->json(['message' => 'Không tìm thấy đơn đồ ăn'], 404);
        }

        $request->validate([
            'so_luong' => 'sometimes|integer|min:1',
        ]);

        $donDoAn->update($request->only('so_luong'));

        return response()->json([
            'message' => 'Cập nhật đơn đồ ăn thành công',
            'data' => $donDoAn->load('doAn', 'datVe')
        ]);
    }

    // ✅ Xóa đơn đồ ăn
    public function destroy($id)
    {
        $donDoAn = DonDoAn::find($id);

        if (!$donDoAn) {
            return response()->json(['message' => 'Không tìm thấy đơn đồ ăn'], 404);
        }

        $donDoAn->delete();

        return response()->json(['message' => 'Xóa đơn đồ ăn thành công']);
    }
}
