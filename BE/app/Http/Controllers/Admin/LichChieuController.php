<?php

namespace App\Http\Controllers\Admin;

use App\Events\LichChieuMoi;
use App\Http\Controllers\Controller;
use App\Jobs\TangGiaVeTheoNgayJob;
use App\Models\Ghe;
use App\Models\GiaVe;

use App\Models\LichChieu;
use App\Models\PhienBan;
use App\Models\Phim;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

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

            $this->autoSoftDeleteLichChieuHetHan();
            $lichChieu = $query->get();

            return response()->json([
                'status' => true,
                'message' => 'Danh sách lịch chiếu',
                'data' => $lichChieu
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách lịch chiếu',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function autoSoftDeleteLichChieuHetHan()
    {
        $now = Carbon::now('Asia/Ho_Chi_Minh');

        LichChieu::where('gio_ket_thuc', '<', $now->subDays(5))
            ->whereNull('deleted_at')
            ->delete(); // xoá mềm
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
                $this->validateThoiGianTrongPhamViPhim(
                    $phim,
                    $gioChieu,
                    $gioKetThuc
                );

                // 🚫 Không cho phép lịch chiếu trong quá khứ
                if ($gioChieu->lt(Carbon::now('Asia/Ho_Chi_Minh'))) {
                    throw new Exception('Không thể tạo lịch chiếu trong quá khứ!');
                }
                // 🚫 Kiểm tra trùng lịch trong cùng phòng
                $trungLich = LichChieu::where('phong_id', $item['phong_id'])
                    ->where(function ($query) use ($gioChieu, $gioKetThuc) {
                        $query->where('gio_chieu', '<', $gioKetThuc)
                            ->where('gio_ket_thuc', '>', $gioChieu);
                    })
                    ->exists();

                if ($trungLich) {
                    throw new Exception("Phòng ID {$item['phong_id']} đã có lịch chiếu trùng thời gian.");
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
                event(new LichChieuMoi(
                    $lichChieu->load(['phim', 'phong', 'phienBan'])
                ));

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
            $gheList = Ghe::where('phong_id', $item['phong_id'])->get(['id']);
            if ($gheList->isNotEmpty()) {
                $checkGheData = $gheList->map(function ($ghe) use ($lichChieu) {
                    return [
                        'lich_chieu_id' => $lichChieu->id,
                        'nguoi_dung_id' => null,
                        'ghe_id' => $ghe->id,
                        'trang_thai' => 'trong',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                })->toArray();

                DB::table('check_ghe')->insert($checkGheData);
            }

            DB::commit();
            dispatch(new TangGiaVeTheoNgayJob());

            return response()->json([
                'message' => 'Thêm nhiều lịch chiếu thành công',
                'data' => $created
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => $e->getMessage()
            ], 422);
        }
    }
    // ✅ Thêm lịch chiếu tự động cho 1 ngày trong 1 phòng
    public function storeAutoOneDay(Request $request)
    {
        $request->validate([
            'phim_id' => 'required|integer|exists:phim,id',
            'phong_id' => [
                'required',
                'integer',
                Rule::exists('phong_chieu', 'id')->where('trang_thai', 1),
            ],
            'phien_ban_id' => 'nullable',

            'ngay_chieu' => 'required|date_format:Y-m-d',   // ví dụ: 2025-11-21
            'gio_bat_dau' => 'required|date_format:H:i',    // ví dụ: 08:00

            'gia_ve_thuong' => 'required|numeric|min:0',
            'gia_ve_vip' => 'nullable|numeric|min:0',

            // tùy chọn: giờ kết thúc tối đa, mặc định 03:00 sáng hôm sau
            'gio_ket_thuc_toi_da' => 'nullable|date_format:H:i',
            // tùy chọn: phút nghỉ thêm giữa 2 suất, mặc định 0
            'khoang_nghi' => 'nullable|integer|min:0',
        ]);

        DB::beginTransaction();

        try {
            $phim = Phim::findOrFail($request->phim_id);

            if (!$phim->thoi_luong) {
                throw new Exception('Phim chưa cấu hình thời lượng, không thể tạo lịch tự động.');
            }

            $phongId   = $request->phong_id;
            $phienBanId = $request->phien_ban_id ?: null;

            // Nếu không truyền phien_ban_id thì lấy giống logic store()
            if (!$phienBanId) {
                $phienBanIds = $phim->phien_ban_id;

                if (is_string($phienBanIds)) {
                    $decoded = json_decode($phienBanIds, true);
                    $phienBanIds = is_array($decoded) ? $decoded : explode(',', $phienBanIds);
                }

                $phienBanId = is_array($phienBanIds) && count($phienBanIds) > 0 ? $phienBanIds[0] : null;
            }

            $ngayChieu = $request->ngay_chieu;          // Y-m-d
            $gioBatDau = $request->gio_bat_dau;        // H:i

            $baseStart = Carbon::createFromFormat('Y-m-d H:i', $ngayChieu . ' ' . $gioBatDau, 'Asia/Ho_Chi_Minh');

            // không cho tạo lịch tự động bắt đầu trong quá khứ
            if ($baseStart->lt(Carbon::now('Asia/Ho_Chi_Minh'))) {
                throw new Exception('Giờ bắt đầu đang nằm trong quá khứ, vui lòng chọn lại.');
            }

            // Giới hạn tối đa: mặc định 03:00 sáng hôm sau
            $gioKetThucToiDa = $request->gio_ket_thuc_toi_da ?: '03:00';
            $limitEnd = Carbon::createFromFormat('Y-m-d H:i', $ngayChieu . ' ' . $gioKetThucToiDa, 'Asia/Ho_Chi_Minh')
                ->addDay(); // 👉 03:00 ngày hôm sau

            $khoangNghi = $request->khoang_nghi ?? 0;

            $giaVeThuong = $request->gia_ve_thuong;
            $giaVeVip    = $request->gia_ve_vip ?: $giaVeThuong * 1.3;

            $created = [];

            // Thời điểm bắt đầu suất đầu tiên
            $currentStart = $baseStart;

            while (true) {
                $gioChieu   = $currentStart->copy();
                $gioKetThuc = $gioChieu->copy()->addMinutes($phim->thoi_luong + 15); // +15p dọn phòng
                $this->validateThoiGianTrongPhamViPhim(
                    $phim,
                    $gioChieu,
                    $gioKetThuc
                );


                // nếu suất này kết thúc sau giới hạn thì dừng
                if ($gioKetThuc->gt($limitEnd)) {
                    break;
                }

                // 🚫 Check trùng với lịch đã có trong DB (cùng phòng)
                $trungLich = LichChieu::where('phong_id', $phongId)
                    ->where(function ($query) use ($gioChieu, $gioKetThuc) {
                        $query->where('gio_chieu', '<', $gioKetThuc)
                            ->where('gio_ket_thuc', '>', $gioChieu);
                    })
                    ->exists();

                if ($trungLich) {
                    throw new Exception(
                        "Phòng ID {$phongId} đã có lịch chiếu trùng trong khoảng " .
                            $gioChieu->format('d/m/Y H:i') . " - " . $gioKetThuc->format('d/m/Y H:i') .
                            ". Không thể tạo lịch tự động ngoài khoảng 8h Sáng đến 3h sáng hôm sau."
                    );
                }

                // ✅ Tạo lịch chiếu
                $lichChieu = LichChieu::create([
                    'phim_id'      => $phim->id,
                    'phong_id'     => $phongId,
                    'phien_ban_id' => $phienBanId,
                    'gio_chieu'    => $gioChieu,
                    'gio_ket_thuc' => $gioKetThuc,
                ]);
                event(new \App\Events\LichChieuMoi(
                    $lichChieu->load(['phim', 'phong', 'phienBan'])
                ));

                // ✅ Tạo giá vé (giống store)
                GiaVe::create([
                    'lich_chieu_id' => $lichChieu->id,
                    'loai_ghe_id'   => 1,
                    'gia_ve'        => $giaVeThuong,
                ]);
                GiaVe::create([
                    'lich_chieu_id' => $lichChieu->id,
                    'loai_ghe_id'   => 2,
                    'gia_ve'        => $giaVeVip,
                ]);

                // ✅ Tạo check_ghe cho tất cả ghế của phòng này
                $gheList = Ghe::where('phong_id', $phongId)->get(['id']);
                if ($gheList->isNotEmpty()) {
                    $checkGheData = $gheList->map(function ($ghe) use ($lichChieu) {
                        return [
                            'lich_chieu_id' => $lichChieu->id,
                            'nguoi_dung_id' => null,
                            'ghe_id'        => $ghe->id,
                            'trang_thai'    => 'trong',
                            'created_at'    => now(),
                            'updated_at'    => now(),
                        ];
                    })->toArray();

                    DB::table('check_ghe')->insert($checkGheData);
                }

                $created[] = $lichChieu;

                // 👉 Cập nhật giờ bắt đầu cho suất tiếp theo
                $currentStart = $gioKetThuc->copy()->addMinutes($khoangNghi);
            }

            if (empty($created)) {
                throw new Exception('Không tạo được suất chiếu nào trong khoảng thời gian yêu cầu.');
            }

            DB::commit();
            dispatch(new TangGiaVeTheoNgayJob());

            return response()->json([
                'message' => 'Tạo lịch chiếu tự động cho 1 ngày thành công',
                'so_suat' => count($created),
                'data'    => $created,
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage(),
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
    // ✅ Thêm lịch chiếu tự động cho nhiều ngày trong 1 phòng
    public function copyLichChieuByDateRange(Request $request)
    {
        $request->validate([
            'ngay_mau'        => 'required|date_format:Y-m-d',
            'ngay_bat_dau'    => 'required|date_format:Y-m-d',
            'ngay_ket_thuc'   => 'required|date_format:Y-m-d|after_or_equal:ngay_bat_dau',
            'bo_qua_suat_bi_trung' => 'sometimes|boolean',
        ]);

        DB::beginTransaction();
        try {
            $ngayMau      = Carbon::createFromFormat('Y-m-d', $request->ngay_mau)->startOfDay();
            $batDau       = Carbon::createFromFormat('Y-m-d', $request->ngay_bat_dau)->startOfDay();
            $ketThuc      = Carbon::createFromFormat('Y-m-d', $request->ngay_ket_thuc)->startOfDay();
            $skipConflict = $request->boolean('bo_qua_suat_bi_trung', true);

            // Lấy toàn bộ lịch chiếu ngày mẫu
            $lichMau = LichChieu::whereDate('gio_chieu', $ngayMau)->get();

            if ($lichMau->isEmpty()) {
                throw new Exception("Không có lịch chiếu nào trong ngày mẫu {$ngayMau->format('d/m/Y')}");
            }

            $createdCount = 0;

            for ($day = $batDau->copy(); $day->lte($ketThuc); $day->addDay()) {
                foreach ($lichMau as $mau) {

                    // ✅ Giữ nguyên giờ, đổi ngày
                    $gioMau = Carbon::parse($mau->gio_chieu);
                    $ketMau = Carbon::parse($mau->gio_ket_thuc);

                    // ✅ duration để xử lý suất qua 00:00 (kết thúc ngày hôm sau)
                    $durationMinutes = $gioMau->diffInMinutes($ketMau);

                    $gioMoi = $gioMau->copy()->setDate($day->year, $day->month, $day->day);
                    $ketThucMoi = $gioMoi->copy()->addMinutes($durationMinutes);
                    $this->validateThoiGianTrongPhamViPhim(
                        $mau->phim,   // đã load quan hệ
                        $gioMoi,
                        $ketThucMoi
                    );

                    // 🚫 check trùng lịch theo khoảng thời gian
                    $trung = LichChieu::where('phong_id', $mau->phong_id)
                        ->where('gio_chieu', '<', $ketThucMoi)
                        ->where('gio_ket_thuc', '>', $gioMoi)
                        ->exists();

                    if ($trung) {
                        if ($skipConflict) continue;
                        throw new Exception("Trùng lịch phòng {$mau->phong_id} ngày {$day->format('d/m/Y')}");
                    }

                    // ✅ tạo lịch mới
                    $new = LichChieu::create([
                        'phim_id'      => $mau->phim_id,
                        'phong_id'     => $mau->phong_id,
                        'phien_ban_id' => $mau->phien_ban_id,
                        'gio_chieu'    => $gioMoi,
                        'gio_ket_thuc' => $ketThucMoi,
                    ]);
                    event(new \App\Events\LichChieuMoi(
                        $new->load(['phim', 'phong', 'phienBan'])
                    ));

                    // ✅ copy giá vé (KHÔNG dùng $mau->giaVe nữa)
                    $giaVeMau = GiaVe::where('lich_chieu_id', $mau->id)->get();
                    foreach ($giaVeMau as $gv) {
                        GiaVe::create([
                            'lich_chieu_id' => $new->id,
                            'loai_ghe_id'   => $gv->loai_ghe_id,
                            'gia_ve'        => $gv->gia_ve,
                        ]);
                    }

                    // ✅ tạo check_ghe
                    $gheList = Ghe::where('phong_id', $mau->phong_id)->get();
                    if ($gheList->isNotEmpty()) {
                        DB::table('check_ghe')->insert(
                            $gheList->map(fn($ghe) => [
                                'lich_chieu_id' => $new->id,
                                'ghe_id'        => $ghe->id,
                                'trang_thai'    => 'trong',
                                'created_at'    => now(),
                                'updated_at'    => now(),
                            ])->toArray()
                        );
                    }

                    $createdCount++;
                }
            }

            DB::commit();
            dispatch(new TangGiaVeTheoNgayJob());

            return response()->json([
                'message' => 'Copy lịch chiếu theo khoảng ngày thành công',
                'so_suat' => $createdCount,
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
        }
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

        // ❌ Bỏ dòng xóa giá vé
        // $lichChieu->giaVe()->delete();

        // ✅ Xóa mềm lịch chiếu
        $lichChieu->delete();

        return response()->json([
            'message' => '🗑️ Xóa lịch chiếu thành công (đã lưu vào thùng rác)!'
        ]);
    }

    /**
     * ♻️ Khôi phục lịch chiếu
     */
    public function restore($id)
    {
        $lichChieu = LichChieu::withTrashed()->find($id);

        if (!$lichChieu) {
            return response()->json(['error' => 'Không tìm thấy lịch chiếu để khôi phục'], 404);
        }

        $lichChieu->restore();

        return response()->json([
            'message' => '✅ Khôi phục lịch chiếu thành công!'
        ]);
    }

    /**
     * 🗂️ Lấy danh sách lịch chiếu đã xóa mềm
     */
    public function deleted()
    {
        $lichChieu = LichChieu::onlyTrashed()
            ->with(['phim', 'phong', 'phienBan'])
            ->orderBy('deleted_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Danh sách lịch chiếu đã xóa mềm',
            'data' => $lichChieu,
        ]);
    }

    /**
     * 🚮 Xóa vĩnh viễn lịch chiếu
     */
    public function forceDelete($id)
    {
        $lichChieu = LichChieu::withTrashed()->find($id);

        if (!$lichChieu) {
            return response()->json(['error' => 'Không tìm thấy lịch chiếu!'], 404);
        }

        // ❌ Bỏ dòng xóa giá vé
        // GiaVe::where('lich_chieu_id', $lichChieu->id)->delete();

        $lichChieu->forceDelete();

        return response()->json([
            'message' => '🧹 Đã xóa vĩnh viễn lịch chiếu!'
        ]);
    }

    public function getGiaVeByLichChieu($lichChieuId)
    {
        try {

            // Lấy danh sách giá vé
            $giaVes = GiaVe::where('lich_chieu_id', $lichChieuId)
                ->with('loaiGhe:id,ten_loai_ghe')
                ->get(['id', 'lich_chieu_id', 'loai_ghe_id', 'gia_ve']);

            // Nếu không có dữ liệu
            if ($giaVes->isEmpty()) {
                Log::warning('⚠️ Không tìm thấy giá vé cho lịch chiếu ID: ' . $lichChieuId);
            }

            return response()->json([
                'success' => true,
                'data' => $giaVes
            ]);
        } catch (Exception $e) {
            // Ghi log chi tiết lỗi
            Log::error('❌ Lỗi khi lấy giá vé cho lịch chiếu ID: ' . $lichChieuId, [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            // Trả JSON thông báo lỗi ra frontend
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi lấy giá vé!',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getLichTheoPhong($id)
    {
        $lichTheoPhong = LichChieu::with(['phim', 'phong'])
            ->where('phong_id', $id)
            ->orderBy('gio_chieu', 'asc')
            ->get();

        return response()->json([
            'room' => $id,
            'total' => $lichTheoPhong->count(),
            'data' => $lichTheoPhong
        ]);
    }
    private function validateThoiGianTrongPhamViPhim(
        Phim $phim,
        Carbon $gioChieu,
        Carbon $gioKetThuc
    ) {
        $batDauPhim = Carbon::parse($phim->ngay_cong_chieu)->startOfDay();
        $ketThucPhim = Carbon::parse($phim->ngay_ket_thuc)->endOfDay();

        if ($gioChieu->lt($batDauPhim)) {
            throw new Exception(
                "❌ Giờ chiếu ({$gioChieu->format('d/m/Y H:i')}) 
            sớm hơn ngày công chiếu của phim ({$batDauPhim->format('d/m/Y')})"
            );
        }

        if ($gioKetThuc->gt($ketThucPhim)) {
            throw new Exception(
                "❌ Giờ kết thúc ({$gioKetThuc->format('d/m/Y H:i')}) 
            vượt quá ngày kết thúc phim ({$ketThucPhim->format('d/m/Y')})"
            );
        }
    }
}
