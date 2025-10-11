<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LichChieu;
use Illuminate\Http\Request;

class LichChieuController extends Controller
{
   // Lấy danh sách lịch chiếu
    public function index()
    {
        $lichChieu = LichChieu::with(['phim', 'phong','phienBan'])->get();
        return response()->json($lichChieu);
    }

    // Thêm lịch chiếu mới
    public function store(Request $request)
    {
        $request->validate([
            'phim_id' => 'required|integer',
            'phong_id' => 'required|integer',
            'phien_ban_id' => 'nullable|integer',
            'gio_chieu' => 'required|date',
            'gio_ket_thuc' => 'required|date|after:gio_chieu',
        ]);

        $lichChieu = LichChieu::create($request->all());
        return response()->json(['message' => 'Thêm lịch chiếu thành công', 'data' => $lichChieu], 201);
    }

    // Lấy chi tiết lịch chiếu theo ID
    public function show($id)
    {
        $lichChieu = LichChieu::with(['phim', 'phong','phienBan'])->findOrFail($id);
        return response()->json($lichChieu);
    }

    // Cập nhật lịch chiếu
    public function update(Request $request, $id)
    {
        $lichChieu = LichChieu::findOrFail($id);

        $request->validate([
        'phim_id' => 'sometimes|integer|exists:phim,id',
        'phong_id' => 'sometimes|integer|exists:phong_chieu,id',
        'phien_ban_id' => 'nullable|integer|exists:phien_ban,id',
        'gio_chieu' => 'sometimes|date',
        'gio_ket_thuc' => 'sometimes|date|after:gio_chieu',
        ]);

        $lichChieu->update($request->only([
        'phim_id',
        'phong_id',
        'phien_ban_id',
        'gio_chieu',
        'gio_ket_thuc',
    ]));

        return response()->json(['message' => 'Cập nhật lịch chiếu thành công', 'data' => $lichChieu]);
    }

    // Xóa mềm lịch chiếu
    public function destroy($id)
    {
        $lichChieu = LichChieu::findOrFail($id);
        $lichChieu->delete();

        return response()->json(['message' => 'Đã xóa lịch chiếu']);
    }
}
