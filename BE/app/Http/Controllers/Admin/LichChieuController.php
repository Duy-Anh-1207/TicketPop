<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GiaVe;

use App\Models\LichChieu;
use App\Models\PhienBan;
use App\Models\Phim;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

use Illuminate\Support\Facades\DB;

class LichChieuController extends Controller
{
    // Lấy danh sách lịch chiếu
    public function index(Request $request)
    {
        try {
            $phimId = $request->query('phim_id');
            $ngayChieu = $request->query('ngay_chieu');

            $query = LichChieu::with(['phim', 'phong', 'phienBan'])
                ->orderBy('gio_chieu', 'asc');

            if ($phimId) {
                $query->where('phim_id', $phimId);
            }

            if ($ngayChieu) {
                $query->whereDate('gio_chieu', $ngayChieu);
            }

            $lichChieu = $query->get();

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

    // Thêm 1 hoặc nhiều lịch chiếu
    public function store(Request $request)
    {
        $request->validate([
            'lich_chieu' => 'required|array|min:1',
            'lich_chieu.*.phim_id' => 'required|integer|exists:phim,id',
            'lich_chieu.*.phong_id' => [
                'required',
                'integer',
                Rule::exists('phong_chieu', 'id')->where('trang_thai', 1),
            ],
            'lich_chieu.*.gio_chieu' => 'required|date',
            'lich_chieu.*.gia_ve_thuong' => 'required|numeric|min:0',
            'lich_chieu.*.gia_ve_vip' => 'nullable|numeric|min:0',
            'lich_chieu.*.phien_ban_id' => 'nullable' // thêm trường này
        ]);

        DB::beginTransaction();
        try {
            $created = [];

            foreach ($request->lich_chieu as $item) {
                $phim = Phim::findOrFail($item['phim_id']);

                $gioChieu = Carbon::parse($item['gio_chieu'], 'Asia/Ho_Chi_Minh');
                $gioKetThuc = $gioChieu->copy()->addMinutes($phim->thoi_luong + 15);

                // 🚫 Không cho phép lịch chiếu trong quá khứ
                if ($gioChieu->lt(Carbon::now('Asia/Ho_Chi_Minh'))) {
                    throw new \Exception('Không thể tạo lịch chiếu trong quá khứ!');
                }

                // 🚫 Kiểm tra trùng lịch trong cùng phòng
                $trungLich = LichChieu::where('phong_id', $item['phong_id'])
                    ->where(function ($query) use ($gioChieu, $gioKetThuc) {
                        $query->where('gio_chieu', '<', $gioKetThuc)
                            ->where('gio_ket_thuc', '>', $gioChieu);
                    })
                    ->exists();

                if ($trungLich) {
                    throw new \Exception("Phòng ID {$item['phong_id']} đã có lịch chiếu trùng thời gian.");
                }

                // ✅ Lấy phien_ban_id
                $phienBanId = $item['phien_ban_id'] ?? null;

                // Nếu không truyền thì lấy từ phim
                if (!$phienBanId) {
                    $phienBanIds = $phim->phien_ban_id;

                    if (is_string($phienBanIds)) {
                        $decoded = json_decode($phienBanIds, true);
                        $phienBanIds = is_array($decoded) ? $decoded : explode(',', $phienBanIds);
                    }

                    // lấy phần tử đầu tiên (nếu phim có nhiều phiên bản)
                    $phienBanId = is_array($phienBanIds) && count($phienBanIds) > 0 ? $phienBanIds[0] : null;
                }

                // ✅ Tạo lịch chiếu
                $lichChieu = LichChieu::create([
                    'phim_id' => $item['phim_id'],
                    'phong_id' => $item['phong_id'],
                    'phien_ban_id' => $phienBanId,
                    'gio_chieu' => $gioChieu,
                    'gio_ket_thuc' => $gioKetThuc,
                ]);

                // ✅ Giá vé
                $giaVeThuong = $item['gia_ve_thuong'];
                $giaVeVip = $item['gia_ve_vip'] ?? $giaVeThuong * 1.3;

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

                $created[] = $lichChieu;
            }

            DB::commit();

            return response()->json([
                'message' => 'Thêm nhiều lịch chiếu thành công',
                'data' => $created
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => $e->getMessage()
            ], 422);
        }
    }

    // Lấy chi tiết lịch chiếu
    public function show($id)
    {
        $lichChieu = LichChieu::with(['phim', 'phong', 'giaVe', 'phienBan'])->findOrFail($id);
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
    public function destroy($id)
    {
        $lichChieu = LichChieu::find($id);

        if (!$lichChieu) {
            return response()->json(['error' => 'Lịch chiếu không tồn tại!'], 404);
        }

        $lichChieu->delete(); // 👈 xóa mềm

        return response()->json(['message' => '🗑️ Xóa lịch chiếu thành công (đã lưu vào thùng rác)!']);
    }
    public function restore($id)
    {
        $lichChieu = LichChieu::withTrashed()->find($id);

        if (!$lichChieu) {
            return response()->json(['error' => 'Không tìm thấy lịch chiếu để khôi phục'], 404);
        }

        $lichChieu->restore(); // 👈 khôi phục lại
        return response()->json(['message' => '✅ Khôi phục lịch chiếu thành công!']);
    }
}
