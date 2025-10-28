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
        try {
            // Lấy danh sách lịch chiếu cùng thông tin liên quan
            $lichChieu = LichChieu::with(['phim', 'phong', 'phienBan'])
                ->orderBy('gio_chieu', 'asc')
                ->get();

            return response()->json([
                'status' => true,
                'message' => 'Danh sách lịch chiếu',
                'data' => $lichChieu
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách lịch chiếu',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // 🟢 Thêm lịch chiếu mới
    public function store(Request $request)
    {
        $request->validate([
            'phim_id' => 'required|integer|exists:phim,id',
            'phong_id' => 'required|integer|exists:phong_chieu,id',
            'gio_chieu' => 'required|date',
            'gio_ket_thuc' => 'required|date|after:gio_chieu',
            'gia_ve_thuong' => 'required|numeric|min:0',
            'gia_ve_vip' => 'required|numeric|min:0',
        ]);

        // ✅ Lấy thông tin phim
        $phim = Phim::findOrFail($request->phim_id);

        // ✅ Lấy danh sách phiên bản từ phim (phim.phien_ban_id là JSON)
        $phienBanRaw = $phim->phien_ban_id;

        // Nếu là chuỗi JSON thì decode, nếu đã là mảng thì dùng luôn
        if (is_string($phienBanRaw)) {
            $phienBanIds = json_decode($phienBanRaw, true) ?? [];
        } elseif (is_array($phienBanRaw)) {
            $phienBanIds = $phienBanRaw;
        } else {
            $phienBanIds = [];
        }


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
        $giaVeThuong = $request->gia_ve_thuong;
        $giaVeVip = $request->gia_ve_vip ?? $giaVeThuong * 1.3;

        GiaVe::create([
            'lich_chieu_id' => $lichChieu->id,
            'loai_ghe_id' => 1,
            'gia_ve' => $giaVeThuong,
        ]);
        GiaVe::create([
            'lich_chieu_id' => $lichChieu->id,
            'loai_ghe_id' => 2,
            'gia_ve' => $giaVeVip,
        ]);



        return response()->json([
            'message' => 'Thêm lịch chiếu thành công',
            'data' => $lichChieu
        ], 201);
    }

    // 🟢 Lấy chi tiết lịch chiếu
    public function show($id)
    {
        $lichChieu = LichChieu::with(['phim', 'phong','giaVe','phienBan'])->findOrFail($id);
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
        GiaVe::create([
            'lich_chieu_id' => $lichChieu->id,
            'loai_ghe_id' => 1,
            'gia_ve' => $request->gia_ve_thuong,
        ]);

        GiaVe::create([
            'lich_chieu_id' => $lichChieu->id,
            'loai_ghe_id' => 2,
            'gia_ve' => $request->gia_ve_vip,
        ]);

        return response()->json([
            'message' => '✅ Cập nhật lịch chiếu thành công!',
            'data' => $lichChieu,
        ], 200);
    }
    public function getPhienBanTheoPhimId($id)
    {
        $phim = Phim::find($id);

        if (!$phim) {
            return response()->json(['error' => 'Không tìm thấy phim'], 404);
        }

        // Lấy danh sách ID phiên bản (có thể dạng JSON hoặc chuỗi)
        $phienBanIds = $phim->phien_ban_id;

        if (is_string($phienBanIds)) {
            $decoded = json_decode($phienBanIds, true);
            $phienBanIds = is_array($decoded) ? $decoded : explode(',', $phienBanIds);
        }

        if (empty($phienBanIds)) {
            return response()->json([
                'phim_id' => $phim->id,
                'ten_phim' => $phim->ten_phim,
                'phien_ban' => []
            ]);
        }

        $phienBans = PhienBan::whereIn('id', $phienBanIds)
            ->get(['id', 'the_loai']);

        return response()->json([
            'phim_id' => $phim->id,
            'ten_phim' => $phim->ten_phim,
            'phien_ban' => $phienBans
        ]);
    }
    public function findNextAvailableTime(Request $request)
    {
        $phongId = $request->phong_id;
        $thoiLuongPhim = $request->thoi_luong ?? 120; // phút, mặc định 120 phút

        if (!$phongId) {
            return response()->json(['error' => 'Thiếu phong_id'], 400);
        }

        // Lấy tất cả lịch chiếu trong tương lai của phòng này
        $lichChieu = LichChieu::where('phong_id', $phongId)
            ->where('gio_ket_thuc', '>', now())
            ->orderBy('gio_chieu', 'asc')
            ->get();

        $now = now()->addMinutes(30); // bắt đầu tìm sau 30 phút từ hiện tại
        $duration = now()->copy()->addMinutes($thoiLuongPhim);

        // Nếu chưa có lịch nào thì trả về khung giờ sớm nhất
        if ($lichChieu->isEmpty()) {
            return response()->json([
                'gio_chieu' => $now->format('Y-m-d H:i:s'),
                'gio_ket_thuc' => $duration->format('Y-m-d H:i:s')
            ]);
        }

        // Duyệt qua từng lịch để tìm khoảng trống
        $availableStart = $now;
        foreach ($lichChieu as $item) {
            $gioChieu = \Carbon\Carbon::parse($item->gio_chieu);
            $gioKetThuc = \Carbon\Carbon::parse($item->gio_ket_thuc);

            // Nếu khoảng trống giữa availableStart và lịch chiếu tiếp theo đủ dài
            if ($availableStart->lt($gioChieu) && $availableStart->copy()->addMinutes($thoiLuongPhim)->lte($gioChieu)) {
                return response()->json([
                    'gio_chieu' => $availableStart->format('Y-m-d H:i:s'),
                    'gio_ket_thuc' => $availableStart->copy()->addMinutes($thoiLuongPhim)->format('Y-m-d H:i:s')
                ]);
            }

            // Cập nhật thời điểm bắt đầu kiểm tra tiếp theo
            if ($gioKetThuc->gt($availableStart)) {
                $availableStart = $gioKetThuc->copy()->addMinutes(10); // nghỉ 10 phút giữa hai suất
            }
        }

        // Nếu không tìm được khoảng trống trong danh sách => gợi ý sau suất cuối
        return response()->json([
            'gio_chieu' => $availableStart->format('Y-m-d H:i:s'),
            'gio_ket_thuc' => $availableStart->copy()->addMinutes($thoiLuongPhim)->format('Y-m-d H:i:s')
        ]);
    }
}
