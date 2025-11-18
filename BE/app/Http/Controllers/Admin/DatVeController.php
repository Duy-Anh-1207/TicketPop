<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\XoaDonHang;
use App\Models\CheckGhe;
use App\Models\DatVe;
use App\Models\DatVeChiTiet;
use App\Models\Ghe;
use App\Models\GiaVe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\DonDoAn;
use App\Models\NguoiDung;
use App\Models\ThanhToan;
use Exception;

class DatVeController extends Controller
{
    public function datVe(Request $request)
    {
        $request->validate([
            'lich_chieu_id' => 'required|exists:lich_chieu,id',
            'ghe' => 'required|array|min:1',
            'ghe.*' => 'exists:ghe,id',
            'do_an' => 'nullable|array',
            'do_an.*.do_an_id' => 'required_with:do_an|exists:do_an,id',
            'do_an.*.so_luong' => 'required_with:do_an|integer|min:1',
        ]);

        $user = Auth::user() ?? NguoiDung::first();

        try {
            DB::beginTransaction();

            // ====== Xử lý ghế ======
            $gheList = Ghe::whereIn('id', $request->ghe)
                ->lockForUpdate()
                ->get();

            if ($gheList->count() !== count($request->ghe)) {
                return response()->json([
                    'message' => 'Một số ghế không tồn tại hoặc đã bị khóa.',
                ], 400);
            }

            $tongTien = 0;
            $giaVeTheoGhe = [];

            foreach ($gheList as $ghe) {
                $giaVe = GiaVe::where('lich_chieu_id', $request->lich_chieu_id)
                    ->where('loai_ghe_id', $ghe->loai_ghe_id)
                    ->value('gia_ve');

                if (!$giaVe) {
                    throw new Exception("Không tìm thấy giá vé cho ghế ID {$ghe->id}");
                }

                $giaVeTheoGhe[$ghe->id] = $giaVe;
                $tongTien += $giaVe;
            }

            // ====== Tạo đơn đặt vé ======
            $datVe = DatVe::create([
                'nguoi_dung_id' => $user->id,
                'lich_chieu_id' => $request->lich_chieu_id,
                'tong_tien' => $tongTien,
            ]);

            // ====== Chi tiết ghế ======
            foreach ($gheList as $ghe) {
                DatVeChiTiet::create([
                    'dat_ve_id' => $datVe->id,
                    'ghe_id' => $ghe->id,
                    'gia_ve' => $giaVeTheoGhe[$ghe->id],
                ]);

                // Cập nhật trạng thái trong check_ghe
                CheckGhe::where('lich_chieu_id', $request->lich_chieu_id)
                    ->where('ghe_id', $ghe->id)
                    ->update([
                        'trang_thai' => 'da_dat',
                        'nguoi_dung_id' => $user->id,
                        'expires_at' => now()->addMinutes(10),
                    ]);
            }

            // ====== Xử lý đồ ăn ======
            if ($request->has('do_an') && count($request->do_an) > 0) {
                foreach ($request->do_an as $item) {
                    $doAn = \App\Models\DoAn::find($item['do_an_id']);
                    if (!$doAn) continue;

                    $giaBan = $doAn->gia_ban ?? 0;
                    $soLuong = $item['so_luong'];
                    $tongTien += $giaBan * $soLuong;

                    DonDoAn::create([
                        'dat_ve_id' => $datVe->id,
                        'do_an_id' => $doAn->id,
                        'gia_ban' => $giaBan,
                        'so_luong' => $soLuong,
                    ]);
                }

                $datVe->update(['tong_tien' => $tongTien]);
            }

            XoaDonHang::dispatch($datVe->id)->delay(now()->addMinutes(10));

            DB::commit();

            return response()->json([
                'message' => 'Đặt vé thành công',
                'dat_ve' => $datVe->load([
                    'nguoiDung:id,ten,so_dien_thoai,email',
                    'lichChieu:id,gio_chieu,phim_id,phong_id',
                    'lichChieu.phim:id,ten_phim,thoi_luong',
                    'lichChieu.phong:id,ten_phong',
                    'chiTiet.ghe:id,so_ghe,loai_ghe_id',
                    'donDoAn.doAn:id,ten_do_an,gia_ban'
                ]),
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Đặt vé thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function danhSachDatVe()
    {
        $user = Auth::user() ?? NguoiDung::first();

        $thanhToan = ThanhToan::with([
            'datVe.lichChieu:id,gio_chieu,phim_id,phong_id',
            'datVe.lichChieu.phim:id,ten_phim',
            'datVe.lichChieu.phong:id,ten_phong',
            'phuongThucThanhToan:id,ten',
        ])
            ->where('nguoi_dung_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($item) {
                return [
                    'ma_don_hang' => $item->ma_giao_dich,
                    'email' => $item->email,
                    'phim' => $item->datVe->lichChieu->phim->ten_phim ?? null,
                    'ngay_dat' => $item->created_at->format('d/m/Y'),
                    'thanh_toan' => $item->phuongThucThanhToan->ten ?? 'Không rõ',
                    'tong_tien' => number_format($item->tong_tien_goc, 0, ',', '.') . ' đ',
                ];
            });

        return response()->json([
            'message' => 'Danh sách vé đã thanh toán',
            'data' => $thanhToan
        ]);
    }



    public function inVe($id)
    {
        try {
            $datVe = DatVe::with([
                'nguoiDung:id,ten,so_dien_thoai,email',
                'lichChieu:id,gio_chieu,gio_ket_thuc,phim_id,phong_id',
                'lichChieu.phim:id,ten_phim,thoi_luong,anh_poster',
                'lichChieu.phong:id,ten_phong',
                'chiTiet.ghe:id,so_ghe,loai_ghe_id',
            ])->find($id);

            if (!$datVe) {
                return response()->json([
                    'message' => 'Không tìm thấy vé.'
                ], 404);
            }
            return response()->json([
                'message' => 'Thông tin vé chi tiết',
                'data' => [
                    'ma_ve' => 'V' . str_pad($datVe->id, 6, '0', STR_PAD_LEFT),
                    'ten_khach_hang' => $datVe->nguoiDung->ten ?? 'Không rõ',
                    'so_dien_thoai' => $datVe->nguoiDung->so_dien_thoai ?? '',
                    'phim' => $datVe->lichChieu->phim->ten_phim ?? '',
                    'thoi_luong' => $datVe->lichChieu->phim->thoi_luong ?? '',
                    // 'rap' => $datVe->lichChieu->phong->rap->ten_rap ?? '',
                    'phong' => $datVe->lichChieu->phong->ten_phong ?? '',
                    'gio_chieu' => $datVe->lichChieu->gio_chieu->format('H:i d/m/Y'),
                    'gio_ket_thuc' => $datVe->lichChieu->gio_ket_thuc->format('H:i d/m/Y'),
                    'tong_tien' => number_format($datVe->tong_tien, 0, ',', '.') . 'đ',
                    'danh_sach_ghe' => $datVe->chiTiet->map(function ($ct) {
                        return [
                            'so_ghe' => $ct->ghe->so_ghe,
                            'loai_ghe' => $ct->ghe->loai_ghe_id,
                            'gia_ve' => number_format($ct->gia_ve, 0, ',', '.') . 'đ',
                        ];
                    }),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy vé',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

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
                return response()->json([
                    'message' => 'Không tìm thấy vé này!',
                ], 404);
            }

            // Đổi tên để frontend dễ dùng hơn
            $datVe->do_an = $datVe->donDoAn->map(function ($item) {
                return [
                    'id' => $item->id,
                    'ten_do_an' => $item->doAn?->ten_do_an ?? 'Đồ ăn',
                    'anh_do_an' => $item->doAn?->image,
                    'gia_ban' => $item->gia_ban,
                    'quantity' => $item->so_luong,
                ];
            });

            unset($datVe->donDoAn);

            return response()->json([
                'message' => 'Lấy chi tiết vé thành công!',
                'data' => $datVe,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy chi tiết vé!',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
