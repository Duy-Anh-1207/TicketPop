<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GiaVe;
use App\Models\LichChieu;
use App\Models\PhienBan;
use App\Models\Phim;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class LichChieuController extends Controller
{
    // 🟢 Lấy danh sách lịch chiếu
    public function index()
    {
       // Lấy lịch chiếu cùng phim và phòng
    $lichChieu = LichChieu::with(['phim', 'phong'])->get()->map(function ($item) {
        // Lấy phim liên quan
        $phim = $item->phim;

        // ✅ Lấy danh sách phiên bản từ bảng phim
        $phienBanIds = json_decode($phim->phien_ban_id, true) ?? [];

        if (!empty($phienBanIds)) {
            $phienBans = PhienBan::whereIn('id', $phienBanIds)
                ->pluck('the_loai')
                ->toArray();
            $item->phien_ban = implode(', ', $phienBans);
        } else {
            $item->phien_ban = 'Không có phiên bản';
        }

        // Nếu phòng chiếu bị null
        $item->phong_ten = $item->phong->ten_phong ?? 'Không xác định';

        return $item;
    });

    return response()->json($lichChieu);
    }

    // 🟢 Thêm lịch chiếu mới
    public function store(Request $request)
    {
        $request->validate([
            'phim_id' => 'required|integer|exists:phim,id',
            'phong_id' => 'required|integer|exists:phong_chieu,id',
            'gio_chieu' => 'required|date',
            'gia_ve' => 'required|array',
            'gia_ve.thuong' => 'required|numeric|min:0',
            'gia_ve.vip' => 'required|numeric|min:0',
        ]);

        // ✅ Lấy thông tin phim
        $phim = Phim::findOrFail($request->phim_id);

        // ✅ Lấy danh sách phiên bản từ phim (phim.phien_ban_id là JSON)
        $phienBanIds = json_decode($phim->phien_ban_id, true) ?? [];

        // Nếu frontend gửi thêm 1 phiên bản cụ thể (ví dụ chọn 1 phiên bản)
        $phienBanChon = $request->phien_ban_id ?? $phienBanIds;

 // ✅ Parse giờ chiếu & tính giờ kết thúc (thời lượng + 15 phút dọn phòng)
    $gioChieu = Carbon::parse($request->gio_chieu, 'Asia/Ho_Chi_Minh');
    $gioKetThuc = $gioChieu->copy()->addMinutes($phim->thoi_luong + 15);

    // 🚫 Không cho phép tạo trong quá khứ
    if ($gioChieu->lt(Carbon::now('Asia/Ho_Chi_Minh'))) {
        return response()->json([
            'error' => '❌ Không thể tạo lịch chiếu trong quá khứ!',
        ], 422);
    }

    // ✅ Kiểm tra trùng lịch trong cùng phòng
    $trungLich = LichChieu::where('phong_id', $request->phong_id)
        ->where(function ($query) use ($gioChieu, $gioKetThuc) {
            $query->where('gio_chieu', '<', $gioKetThuc)
                  ->where('gio_ket_thuc', '>', $gioChieu);
        })
        ->exists();

    if ($trungLich) {
        return response()->json([
            'error' => '❌ Phòng này đã có lịch chiếu trong khoảng thời gian đó (bao gồm 15 phút dọn phòng).',
        ], 422);
    }


        // ✅ Tạo mới lịch chiếu
        $lichChieu = LichChieu::create([
            'phim_id'       => $request->phim_id,
            'phong_id'      => $request->phong_id,
            'phien_ban_id'  => json_encode($phienBanChon), // lưu dưới dạng JSON
            'gio_chieu'     => $gioChieu,
            'gio_ket_thuc'  => $gioKetThuc,
        ]);
        // ✅ Lưu giá vé vào bảng gia_ve
    // Giả sử loai_ghe_id = 1 là Thường, 2 là Vip
    GiaVe::create([
        'lich_chieu_id' => $lichChieu->id,
        'loai_ghe_id' => 1,
        'gia_ve' => $request->gia_ve['thuong'],
    ]);

    GiaVe::create([
        'lich_chieu_id' => $lichChieu->id,
        'loai_ghe_id' => 2,
        'gia_ve' => $request->gia_ve['vip'],
    ]);


        return response()->json([
            'message' => 'Thêm lịch chiếu thành công',
            'data' => $lichChieu
        ], 201);
    }

    // 🟢 Lấy chi tiết lịch chiếu
    public function show($id)
    {
        $lichChieu = LichChieu::with(['phim', 'phong'])->findOrFail($id);
        return response()->json($lichChieu);
    }

   public function update(Request $request, $id)
{
    $lichChieu = LichChieu::findOrFail($id);

    $request->validate([
        'phim_id' => 'sometimes|integer|exists:phim,id',
        'phong_id' => 'sometimes|integer|exists:phong_chieu,id',
        'gio_chieu' => 'sometimes|date',
        'phien_ban_id' => 'nullable',
        'gia_ve' => 'sometimes|array',
        'gia_ve.thuong' => 'sometimes|numeric|min:0',
        'gia_ve.vip' => 'sometimes|numeric|min:0',
    ]);

    $phim = Phim::findOrFail($request->phim_id ?? $lichChieu->phim_id);

    // ✅ Tính lại giờ chiếu & kết thúc
    $gioChieu = $request->has('gio_chieu')
        ? Carbon::parse($request->gio_chieu, 'Asia/Ho_Chi_Minh')
        : Carbon::parse($lichChieu->gio_chieu, 'Asia/Ho_Chi_Minh');

    $gioKetThuc = $gioChieu->copy()->addMinutes($phim->thoi_luong + 15);

    // 🚫 Không cho phép chỉnh về quá khứ
    if ($gioChieu->lt(Carbon::now('Asia/Ho_Chi_Minh'))) {
        return response()->json([
            'error' => '❌ Không thể cập nhật lịch chiếu trong quá khứ!',
        ], 422);
    }

    // ✅ Kiểm tra trùng lịch (trừ chính lịch hiện tại)
    $trungLich = LichChieu::where('phong_id', $request->phong_id ?? $lichChieu->phong_id)
        ->where('id', '!=', $id)
        ->where(function ($query) use ($gioChieu, $gioKetThuc) {
            $query->where('gio_chieu', '<', $gioKetThuc)
                  ->where('gio_ket_thuc', '>', $gioChieu);
        })
        ->exists();

    if ($trungLich) {
        return response()->json([
            'error' => '❌ Giờ chiếu bị trùng với lịch khác trong cùng phòng (bao gồm 15 phút dọn phòng).',
        ], 422);
    }

    // ✅ Cập nhật lịch chiếu
    $lichChieu->update([
        'phim_id' => $request->phim_id ?? $lichChieu->phim_id,
        'phong_id' => $request->phong_id ?? $lichChieu->phong_id,
        'phien_ban_id' => json_encode($request->phien_ban_id ? [$request->phien_ban_id] : []),
        'gio_chieu' => $gioChieu,
        'gio_ket_thuc' => $gioKetThuc,
    ]);

    // ✅ Nếu có gửi giá vé mới → cập nhật
    if ($request->has('gia_ve')) {
        GiaVe::where('lich_chieu_id', $lichChieu->id)
            ->where('loai_ghe_id', 1)
            ->update(['gia_ve' => $request->gia_ve['thuong'] ?? 0]);

        GiaVe::where('lich_chieu_id', $lichChieu->id)
            ->where('loai_ghe_id', 2)
            ->update(['gia_ve' => $request->gia_ve['vip'] ?? 0]);
    }

    return response()->json([
        'message' => '✅ Cập nhật lịch chiếu thành công!',
        'data' => $lichChieu,
    ], 200);
}


}
