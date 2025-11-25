<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\XoaDonHang;
use App\Models\CheckGhe;
use App\Models\DatVe;
use App\Models\DatVeChiTiet;
use App\Models\DonDoAn;
use App\Models\DoAn;
use App\Models\Ghe;
use App\Models\GiaVe;
use App\Models\NguoiDung;
use App\Models\ThanhToan;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DatVeController extends Controller
{
    /**
     * Đặt vé (tạm giữ ghế + tạo đơn)
     * Flow:
     *  - Kiểm tra auth
     *  - lock check_ghe rows (forUpdate)
     *  - kiểm tra ghế thuộc phòng của lịch chiếu
     *  - tính tiền, tạo dat_ve + dat_ve_chi_tiet + don_do_an
     *  - dispatch job hủy nếu ko thanh toán
     */
    public function datVe(Request $request)
    {
        $request->validate([
            'lich_chieu_id' => 'required|exists:lich_chieu,id',
            'ghe' => 'required|array|min:1',
            'ghe.*' => 'required|integer|exists:ghe,id',
            'do_an' => 'nullable|array',
            'do_an.*.do_an_id' => 'required_with:do_an|exists:do_an,id',
            'do_an.*.so_luong' => 'required_with:do_an|integer|min:1',
        ]);

        if (!Auth::check()) {
            return response()->json(['message' => 'Bạn cần đăng nhập để đặt vé'], 401);
        }

        $user = Auth::user();

        try {
            DB::beginTransaction();

            // Validate ghế thực sự thuộc cùng phòng của lịch chiếu
            $lichChieu = \App\Models\LichChieu::find($request->lich_chieu_id);
            if (!$lichChieu) {
                DB::rollBack();
                return response()->json(['message' => 'Lịch chiếu không tồn tại'], 400);
            }

            $gheThuocPhongCount = Ghe::whereIn('id', $request->ghe)
                ->where('phong_id', $lichChieu->phong_id)
                ->count();

            if ($gheThuocPhongCount !== count($request->ghe)) {
                DB::rollBack();
                return response()->json(['message' => 'Một hoặc vài ghế không thuộc phòng của lịch chiếu'], 400);
            }

            // Lấy check_ghe và lock rows để tránh race condition
            $checkGheList = CheckGhe::where('lich_chieu_id', $request->lich_chieu_id)
                ->whereIn('ghe_id', $request->ghe)
                ->lockForUpdate()
                ->get();

            // Nếu có ghế chưa có record check_ghe -> create record 'trong' trước rồi fail
            $foundIds = $checkGheList->pluck('ghe_id')->toArray();
            $missing = array_diff($request->ghe, $foundIds);
            if (!empty($missing)) {
                // Tạo các record check_ghe trống để consistent (optional) hoặc trả lỗi
                // Ở đây trả lỗi cho FE biết ghế chưa sẵn sàng
                DB::rollBack();
                return response()->json([
                    'message' => 'Một số ghế chưa được khởi tạo trạng thái.',
                    'ghe_loi' => array_values($missing)
                ], 400);
            }

            // Kiểm tra trạng thái ghế: phải là 'trong' mới đặt được
            $notAvailable = $checkGheList->filter(fn($c) => $c->trang_thai !== 'trong');
            if ($notAvailable->count() > 0) {
                $gheLoi = $notAvailable->pluck('ghe_id')->toArray();
                DB::rollBack();
                return response()->json([
                    'message' => 'Một số ghế không khả dụng.',
                    'ghe_loi' => $gheLoi
                ], 400);
            }

            // Tính tổng tiền theo giá vé từng ghế
            $tongTien = 0;
            $giaVeTheoGhe = [];
            foreach ($checkGheList as $checkGhe) {
                $giaVe = GiaVe::where('lich_chieu_id', $request->lich_chieu_id)
                    ->where('loai_ghe_id', $checkGhe->ghe->loai_ghe_id)
                    ->value('gia_ve');

                if ($giaVe === null) {
                    throw new Exception("Không tìm thấy giá vé cho ghế ID {$checkGhe->ghe_id}");
                }

                $giaVeTheoGhe[$checkGhe->ghe_id] = $giaVe;
                $tongTien += (float)$giaVe;
            }

            // Tạo đơn DatVe
            $datVe = DatVe::create([
                'nguoi_dung_id' => $user->id,
                'lich_chieu_id' => $request->lich_chieu_id,
                'tong_tien' => $tongTien,
            ]);

            // Lưu chi tiết ghế và cập nhật check_ghe -> dang_dat (tạm giữ)
            foreach ($checkGheList as $checkGhe) {
                DatVeChiTiet::create([
                    'dat_ve_id' => $datVe->id,
                    'ghe_id' => $checkGhe->ghe_id,
                    'gia_ve' => $giaVeTheoGhe[$checkGhe->ghe_id],
                ]);

                $checkGhe->update([
                    'trang_thai' => 'dang_dat', // tam giữ
                    'nguoi_dung_id' => (string)$user->id,
                    'expires_at' => now()->addMinutes(10),
                ]);
            }

            // Xử lý đồ ăn (nếu có)
            $tongTienDoAn = 0;
            if ($request->filled('do_an')) {
                foreach ($request->do_an as $item) {
                    $doAn = DoAn::lockForUpdate()->find($item['do_an_id']);
                    if (!$doAn) {
                        DB::rollBack();
                        return response()->json(['message' => "Đồ ăn ID {$item['do_an_id']} không tồn tại."], 400);
                    }

                    $soLuong = (int)$item['so_luong'];
                    if ($soLuong > $doAn->so_luong_ton) {
                        DB::rollBack();
                        return response()->json(['message' => "Số lượng {$doAn->ten_do_an} không đủ. Còn: {$doAn->so_luong_ton}"], 400);
                    }

                    // Trừ tồn kho tạm thời (transaction sẽ rollback khi lỗi)
                    $doAn->decrement('so_luong_ton', $soLuong);

                    DonDoAn::create([
                        'dat_ve_id' => $datVe->id,
                        'do_an_id' => $doAn->id,
                        'gia_ban' => $doAn->gia_ban,
                        'so_luong' => $soLuong,
                    ]);

                    $tongTienDoAn += $doAn->gia_ban * $soLuong;
                }

                // Cập nhật lại tổng tiền chính xác (không dùng increment để tránh cộng trùng)
                $datVe->tong_tien = $datVe->tong_tien + $tongTienDoAn;
                $datVe->save();
            }

            // Dispatch job xóa đơn nếu không thanh toán (delay 10 phút hoặc 1 phút dev)
            // bạn tuỳ chỉnh delay theo yêu cầu. Ở đây mình để 10 phút
            XoaDonHang::dispatch($datVe->id)->delay(now()->addMinutes(10));
            // Lưu job_id nếu muốn (tùy)
            $datVe->job_id = null;
            $datVe->save();

            DB::commit();

            return response()->json([
                'message' => 'Đặt vé thành công (tạm giữ ghế).',
                'dat_ve' => $datVe->load([
                    'nguoiDung:id,ten,so_dien_thoai,email',
                    'lichChieu:id,gio_chieu,gio_ket_thuc,phim_id,phong_id',
                    'chiTiet.ghe:id,so_ghe,loai_ghe_id',
                    'donDoAn.doAn:id,ten_do_an,image'
                ])
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Đặt vé thất bại.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function danhSachDatVe(Request $request)
    {
        $query = ThanhToan::with([
            'datVe.lichChieu:id,gio_chieu,phim_id,phong_id',
            'datVe.lichChieu.phim:id,ten_phim',
            'datVe.lichChieu.phong:id,ten_phong',
            'phuongThucThanhToan:id,ten',
        ]);

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        if ($request->filled('phim_id')) {
            $query->whereHas('datVe.lichChieu', function ($q) use ($request) {
                $q->where('phim_id', $request->phim_id);
            });
        }

        $thanhToan = $query->orderByDesc('created_at')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'ma_don_hang' => $item->ma_giao_dich,
                    'dat_ve_id' => $item->datVe?->id,
                    'email' => $item->email,
                    'phim' => $item->datVe?->lichChieu?->phim?->ten_phim ?? 'Không xác định',
                    'ngay_dat' => $item->created_at->format('d/m/Y H:i'),
                    'thanh_toan' => $item->phuongThucThanhToan?->ten ?? 'Không rõ',
                    'tong_tien' => number_format($item->tong_tien_goc, 0, ',', '.') . ' đ',
                ];
            });

        return response()->json([
            'message' => 'Danh sách vé đã thanh toán',
            'data' => $thanhToan
        ]);
    }

    public function inVe($maGiaoDich)
    {
        try {
            $datVe = DatVe::with([
                'nguoiDung:id,ten,so_dien_thoai,email',
                'lichChieu:id,gio_chieu,gio_ket_thuc,phim_id,phong_id',
                'lichChieu.phim:id,ten_phim,thoi_luong,anh_poster',
                'lichChieu.phong:id,ten_phong',
                'chiTiet.ghe:id,so_ghe,loai_ghe_id',
                'donDoAn.doAn:id,ten_do_an,gia_ban,image'
            ])->whereHas('thanhToan', function ($q) use ($maGiaoDich) {
                $q->where('ma_giao_dich', $maGiaoDich);
            })->first();

            if (!$datVe) {
                return response()->json(['message' => 'Không tìm thấy vé với mã giao dịch này.'], 404);
            }

            $result = [
                'ma_ve' => 'V' . str_pad($datVe->id, 6, '0', STR_PAD_LEFT),
                'ten_khach_hang' => $datVe->nguoiDung->ten ?? '',
                'so_dien_thoai' => $datVe->nguoiDung->so_dien_thoai ?? '',
                'phim' => $datVe->lichChieu->phim->ten_phim ?? '',
                'thoi_luong' => $datVe->lichChieu->phim->thoi_luong ?? '',
                'phong' => $datVe->lichChieu->phong->ten_phong ?? '',
                'gio_chieu' => $datVe->lichChieu->gio_chieu->format('H:i d/m/Y'),
                'gio_ket_thuc' => $datVe->lichChieu->gio_ket_thuc->format('H:i d/m/Y'),
                'tong_tien' => number_format($datVe->tong_tien, 0, ',', '.') . 'đ',
                'danh_sach_ghe' => $datVe->chiTiet->map(fn($ct) => [
                    'so_ghe' => $ct->ghe->so_ghe,
                    'loai_ghe' => $ct->ghe->loai_ghe_id,
                    'gia_ve' => number_format($ct->gia_ve, 0, ',', '.') . 'đ',
                ]),
                'do_an' => $datVe->donDoAn->map(fn($d) => [
                    'ten_do_an' => $d->doAn?->ten_do_an ?? '',
                    'so_luong' => $d->so_luong,
                    'gia_ban' => number_format($d->gia_ban, 0, ',', '.') . 'đ'
                ])
            ];

            return response()->json(['message' => 'Thông tin vé chi tiết', 'data' => $result], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi lấy vé', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Lấy chi tiết vé theo id (dat_ve.id)
     */
    public function chiTietVe($id)
    {
        try {
            $datVe = DatVe::with([
                'chiTiet.ghe.loaiGhe:id,ten_loai_ghe',
                'lichChieu:id,phim_id,phong_id,gio_chieu,gio_ket_thuc',
                'lichChieu.phim:id,ten_phim,anh_poster,thoi_luong',
                'lichChieu.phong:id,ten_phong',
                'nguoiDung:id,ten,email,so_dien_thoai',
                'donDoAn.doAn:id,ten_do_an,image'
            ])->find($id);

            if (!$datVe) {
                return response()->json(['message' => 'Không tìm thấy vé.'], 404);
            }

            // transform đồ ăn
            $doAn = $datVe->donDoAn->map(function ($item) {
                return [
                    'id' => $item->id,
                    'ten_do_an' => $item->doAn?->ten_do_an ?? 'Đồ ăn',
                    'anh_do_an' => $item->doAn?->image ?? null,
                    'gia_ban' => $item->gia_ban,
                    'quantity' => $item->so_luong,
                ];
            });

            $payload = array_merge($datVe->toArray(), [
                'do_an' => $doAn,
                'thanh_toan' => optional(ThanhToan::with('phuongThucThanhToan')->where('dat_ve_id', $datVe->id)->first())->phuongThucThanhToan?->ten ?? null
            ]);

            return response()->json(['message' => 'Lấy chi tiết vé thành công!', 'data' => $payload], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi lấy chi tiết vé!', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Xóa đặt vé (nếu chưa thanh toán) — trả ghế + hoàn lại đồ ăn
     */
    public function xoaDatVe($id)
    {
        try {
            DB::beginTransaction();

            $datVe = DatVe::with(['chiTiet.ghe', 'donDoAn.doAn', 'thanhToan'])->find($id);

            if (!$datVe) {
                DB::rollBack();
                return response()->json(['message' => 'Không tìm thấy đặt vé này.'], 404);
            }

            if ($datVe->thanhToan()->exists()) {
                DB::rollBack();
                return response()->json(['message' => 'Đặt vé đã thanh toán, không thể xoá.'], 400);
            }

            // Trả lại trạng thái check_ghe
            foreach ($datVe->chiTiet as $ct) {
                CheckGhe::where('lich_chieu_id', $datVe->lich_chieu_id)
                    ->where('ghe_id', $ct->ghe_id)
                    ->update([
                        'trang_thai' => 'trong',
                        'nguoi_dung_id' => null,
                        'expires_at' => null,
                    ]);
            }

            // Hoàn lại tồn kho đồ ăn
            foreach ($datVe->donDoAn as $dd) {
                if ($dd->doAn) {
                    $dd->doAn->increment('so_luong_ton', $dd->so_luong);
                }
            }

            // Xóa chi tiết
            $datVe->chiTiet()->delete();
            $datVe->donDoAn()->delete();

            // Xóa dat_ve
            $datVe->delete();

            DB::commit();

            return response()->json(['message' => 'Đặt vé đã được xoá, ghế và đồ ăn đã được hoàn lại.'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Xoá đặt vé thất bại.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Lấy chi tiết vé theo mã giao dịch (ma_giao_dich)
     * Dùng cho FE muốn xem theo mã thanh toán
     */
    /**
     * Lấy chi tiết đơn vé theo mã giao dịch (Dùng chi tiết đơn vé - dat_ve_chi_tiet)
     */
    public function ChiTietDonVe($maGiaoDich)
    {
        try {
            $datVe = DatVe::with([
                'chiTiet.ghe.loaiGhe:id,ten_loai_ghe',
                'lichChieu:id,phim_id,phong_id,gio_chieu,gio_ket_thuc',
                'lichChieu.phim:id,ten_phim,anh_poster,thoi_luong',
                'lichChieu.phong:id,ten_phong',
                'nguoiDung:id,ten,email,so_dien_thoai',
                'donDoAn.doAn:id,ten_do_an,image'
            ])->whereHas('thanhToan', function ($q) use ($maGiaoDich) {
                $q->where('ma_giao_dich', $maGiaoDich);
            })->first();

            if (!$datVe) {
                return response()->json(['message' => 'Không tìm thấy vé với mã giao dịch này!'], 404);
            }

            // ===========================
            // GHÉP CHI TIẾT GHẾ
            // ===========================
            $danhSachGhe = $datVe->chiTiet->map(function ($ct) {
                return [
                    'ghe_id' => $ct->ghe_id,
                    'so_ghe' => $ct->ghe->so_ghe,
                    'loai_ghe' => $ct->ghe->loaiGhe->ten_loai_ghe ?? '',
                    'gia_ve' => $ct->gia_ve,
                ];
            });

            // ===========================
            // GHÉP ĐỒ ĂN
            // ===========================
            $doAn = $datVe->donDoAn->map(function ($item) {
                return [
                    'id' => $item->id,
                    'ten_do_an' => $item->doAn?->ten_do_an ?? 'Đồ ăn',
                    'anh_do_an' => $item->doAn?->image,
                    'gia_ban' => $item->gia_ban,
                    'quantity' => $item->so_luong,
                ];
            });

            // ===========================
            // LẤY PHƯƠNG THỨC THANH TOÁN
            // ===========================
            $thanhtoan = ThanhToan::with('phuongThucThanhToan')
                ->where('dat_ve_id', $datVe->id)
                ->first();

            // ===========================
            // PAYLOAD TRẢ VỀ CHO FE
            // ===========================
            $payload = [
                'ma_don_hang' => $maGiaoDich,
                'dat_ve_id' => $datVe->id,
                'tong_tien' => $datVe->tong_tien,
                'da_quet' => $thanhtoan->da_quet,
                'phim' => [
                    'ten_phim' => $datVe->lichChieu->phim->ten_phim,
                    'poster' => $datVe->lichChieu->phim->anh_poster,
                    'thoi_luong' => $datVe->lichChieu->phim->thoi_luong,
                ],
                'phong' => $datVe->lichChieu->phong->ten_phong,
                'gio_chieu' => $datVe->lichChieu->gio_chieu->format('H:i d/m/Y'),
                'gio_ket_thuc' => $datVe->lichChieu->gio_ket_thuc->format('H:i d/m/Y'),
                'khach_hang' => [
                    'ten' => $datVe->nguoiDung->ten,
                    'email' => $datVe->nguoiDung->email,
                    'so_dien_thoai' => $datVe->nguoiDung->so_dien_thoai,
                ],
                'danh_sach_ghe' => $danhSachGhe,
                'do_an' => $doAn,
                'thanh_toan' => $thanhtoan?->phuongThucThanhToan?->ten,
            ];

            return response()->json(['message' => 'Lấy chi tiết vé thành công!', 'data' => $payload], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi lấy chi tiết vé!', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * In vé theo mã giao dịch (ma_giao_dich)
     */
    public function inVeTheoMaGD($maGiaoDich)
    {
        try {
            $datVe = DatVe::with([
                'nguoiDung:id,ten,email,so_dien_thoai',
                'lichChieu:id,phim_id,phong_id,gio_chieu,gio_ket_thuc',
                'lichChieu.phim:id,ten_phim,thoi_luong,anh_poster',
                'lichChieu.phong:id,ten_phong',
                'chiTiet.ghe:id,so_ghe,loai_ghe_id',
                'chiTiet.ghe.loaiGhe:id,ten_loai_ghe',
                'donDoAn.doAn:id,ten_do_an,gia_ban,image'
            ])->whereHas('thanhToan', function ($q) use ($maGiaoDich) {
                $q->where('ma_giao_dich', $maGiaoDich);
            })->firstOrFail();

            $danhSachGhe = $datVe->chiTiet->map(fn($ct) => [
                'so_ghe' => $ct->ghe->so_ghe,
                'loai_ghe' => $ct->ghe->loaiGhe->ten_loai_ghe ?? '',
                'gia_ve' => $ct->gia_ve,
            ]);

            $doAn = $datVe->donDoAn->map(fn($d) => [
                'ten_do_an' => $d->doAn?->ten_do_an ?? '',
                'so_luong' => $d->so_luong,
                'gia_ban' => $d->gia_ban
            ]);

            $thanhToan = $datVe->thanhToan()->with('phuongThucThanhToan')->first();

            $result = [
                'ma_giao_dich' => $maGiaoDich,
                'dat_ve_id' => $datVe->id,
                'khach_hang' => [
                    'ten' => $datVe->nguoiDung->ten,
                    'email' => $datVe->nguoiDung->email,
                    'so_dien_thoai' => $datVe->nguoiDung->so_dien_thoai,
                ],
                'phim' => [
                    'ten_phim' => $datVe->lichChieu->phim->ten_phim,
                    'poster' => $datVe->lichChieu->phim->anh_poster,
                    'thoi_luong' => $datVe->lichChieu->phim->thoi_luong
                ],
                'phong' => $datVe->lichChieu->phong->ten_phong,
                'gio_chieu' => $datVe->lichChieu->gio_chieu->format('H:i d/m/Y'),
                'gio_ket_thuc' => $datVe->lichChieu->gio_ket_thuc->format('H:i d/m/Y'),
                'danh_sach_ghe' => $danhSachGhe,
                'do_an' => $doAn,
                'thanh_toan' => $thanhToan?->phuongThucThanhToan?->ten ?? null,
                'tong_tien' => $datVe->tong_tien
            ];

            return response()->json(['message' => 'Thông tin vé chi tiết', 'data' => $result], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Không tìm thấy vé với mã giao dịch này!'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi lấy vé', 'error' => $e->getMessage()], 500);
        }
    }

    public function capNhatTrangThaiTheoMaGD(Request $request, $maGiaoDich)
{
    $request->validate([
        'da_quet' => 'required|boolean'
    ]);

    try {
        // Tìm thanh toán theo mã giao dịch
        $thanhToan = ThanhToan::where('ma_giao_dich', $maGiaoDich)->first();

        if (!$thanhToan) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thanh toán với mã giao dịch này'
            ], 404);
        }

        // Cập nhật trạng thái
        $thanhToan->da_quet = $request->da_quet;
        $thanhToan->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'data' => [
                'ma_giao_dich' => $thanhToan->ma_giao_dich,
                'da_quet' => $thanhToan->da_quet,
                'dat_ve_id' => $thanhToan->dat_ve_id
            ]
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Lỗi khi cập nhật trạng thái',
            'error' => $e->getMessage()
        ], 500);
    }
}
}
