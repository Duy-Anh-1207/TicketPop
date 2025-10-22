<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GiaVe;
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
        'phien_ban_id' => 'nullable|string',
        'gio_chieu' => 'required|date',
        'gio_ket_thuc' => 'nullable|date',
         'gia_ve' => 'required|array', // FE gửi mảng giá vé [90000, 120000,...]
        'gia_ve.*' => 'required|numeric|min:0',
    ]);

    $phim = Phim::findOrFail($request->phim_id);

    // Lấy giờ chiếu
    $gioChieu = Carbon::parse($request->gio_chieu, 'Asia/Ho_Chi_Minh');

    // Kiểm tra lịch chiếu trước đó
    $lichCu = LichChieu::where('phong_id', $request->phong_id)
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

    if ($gioChieu->lt(Carbon::now('Asia/Ho_Chi_Minh'))) {
        return response()->json([
            'error' => 'Không thể tạo lịch chiếu trong quá khứ!'
        ], 422);
    }

    // ✅ Tính giờ kết thúc (phim + 15p dọn phòng)
    $gioKetThuc = $gioChieu->copy()->addMinutes($phim->thoi_luong + 15);
     
    // ✅ Lấy mảng phiên bản từ phim
    $phienBanArr = is_string($phim->phien_ban_id)
        ? json_decode($phim->phien_ban_id, true)
        : $phim->phien_ban_id;

    // ✅ Nếu frontend gửi phiên bản cụ thể (ví dụ chọn 1 trong số đó)
    $phienBanId = $request->phien_ban_id ?? ($phienBanArr[1] ?? null);

    $lichChieu = LichChieu::create([
        'phim_id'       => $request->phim_id,
        'phong_id'      => $request->phong_id,
        'phien_ban_id'  => $phienBanArr ? json_encode([$phienBanId]) : null,
        'gio_chieu'     => $gioChieu,
        'gio_ket_thuc'  => $gioKetThuc,
    ]);

    // Tạo giá vé mặc định loại ghế id = 1
    foreach ($request->gia_ve as $gia) {
        GiaVe::create([
            'lich_chieu_id' => $lichChieu->id,
            'loai_ghe_id' => 1, // mặc định
            'gia_ve' => $gia,
        ]);
    }

    return response()->json([
        'message' => 'Thêm lịch chiếu và giá vé thành công',
        'data' => $lichChieu->load('giaVe')
    ], 201);
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
            'phien_ban_id' => 'nullable|string',
            'gio_chieu' => 'sometimes|date',
            'gio_ket_thuc' => 'nullable',
            
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
