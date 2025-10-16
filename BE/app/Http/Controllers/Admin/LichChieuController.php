<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LichChieu;
use App\Models\Phim;
use Carbon\Carbon as CarbonCarbon;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class LichChieuController extends Controller
{
    // Lấy danh sách lịch chiếu
    public function index()
    {
        $lichChieu = LichChieu::with(['phim', 'phong', 'phienBan'])->get();
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
            'gio_ket_thuc' => 'prohibited',

        ]);
        // Lấy phim tương ứng
        $phim = Phim::findOrFail($request->phim_id);


        //Convert giờ chiếu sang múi giờ Việt Nam để so sánh chính xác
        $gioChieu = Carbon::parse($request->gio_chieu, 'Asia/Ho_Chi_Minh');
        $lichCu = LichChieu::where('phong_id', $request->phong_id)
    ->orderBy('gio_ket_thuc', 'desc')
    ->first();

if ($lichCu) {
    $gioKetThucCu = Carbon::parse($lichCu->gio_ket_thuc, 'Asia/Ho_Chi_Minh')->addMinutes(15);

    // Nếu giờ chiếu mới nhỏ hơn giờ kết thúc cũ + 15 phút → báo lỗi
    if ($gioChieu->lt($gioKetThucCu)) {
        return response()->json([
            'error' => 'Phòng này chưa sẵn sàng! Giờ chiếu mới phải sau suất trước ít nhất 15 phút.'
        ], 422);
    }
}

        // Nếu giờ chiếu < thời điểm hiện tại => báo lỗi
        if ($gioChieu->lt(Carbon::now('Asia/Ho_Chi_Minh'))) {
            return response()->json([
                'error' => 'Không thể tạo lịch chiếu trong quá khứ!'
            ], 422);
        }
        $gioKetThuc = $gioChieu->copy()->addMinutes($phim->thoi_luong + 15);
        $phienBanId = $phim->phien_ban_id ?? null;
        $lichChieu = LichChieu::create([
            'phim_id'       => $request->phim_id,
            'phong_id'      => $request->phong_id,
            'phien_ban_id'  => $phienBanId,
            'gio_chieu'     => $gioChieu,
            'gio_ket_thuc'  => $gioKetThuc,
        ]);
        return response()->json(['message' => 'Thêm lịch chiếu thành công', 'data' => $lichChieu], 201);
    }

    // Lấy chi tiết lịch chiếu theo ID
    public function show($id)
    {
        $lichChieu = LichChieu::with(['phim', 'phong', 'phienBan'])->findOrFail($id);
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
            'gio_ket_thuc' => 'prohibited',
        ]);

        $phim = Phim::findOrFail($request->phim_id ?? $lichChieu->phim_id);

        if ($request->has('gio_chieu')) {
            $gioChieu = Carbon::parse($request->gio_chieu, 'Asia/Ho_Chi_Minh');


            if ($gioChieu->lt(Carbon::now('Asia/Ho_Chi_Minh'))) {
                return response()->json([
                    'error' => 'Không thể đổi lịch chiếu sang thời gian trong quá khứ!'
                ], 422);
            }
        } else {

            $gioChieu = Carbon::parse($lichChieu->gio_chieu, 'Asia/Ho_Chi_Minh');
        }


        $gioKetThuc = $gioChieu->copy()->addMinutes($phim->thoi_luong + 15);
        $lichCu = LichChieu::where('phong_id', $request->phong_id ?? $lichChieu->phong_id)
    ->where('id', '!=', $id)
    ->orderBy('gio_ket_thuc', 'desc')
    ->first();

if ($lichCu) {
    $gioKetThucCu = Carbon::parse($lichCu->gio_ket_thuc, 'Asia/Ho_Chi_Minh')->addMinutes(15);

    if ($gioChieu->lt($gioKetThucCu)) {
        return response()->json([
            'error' => 'Phòng này chưa sẵn sàng! Giờ chiếu mới phải sau suất trước ít nhất 15 phút.'
        ], 422);
    }
}

        $phienBanId = $phim->phien_ban_id ?? null;

        $lichChieu->update([
            'phim_id' => $request->phim_id ?? $lichChieu->phim_id,
            'phong_id' => $request->phong_id ?? $lichChieu->phong_id,
            'phien_ban_id' => $phienBanId,
            'gio_chieu' => $gioChieu,
            'gio_ket_thuc' => $gioKetThuc,
        ]);

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
