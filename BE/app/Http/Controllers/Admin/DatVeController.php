<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\Log; // thêm vào đầu file nếu muốn log debug
use App\Models\DoAn;
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

            // ====== 1️⃣ Lock và kiểm tra ghế ======
            $checkGheList = CheckGhe::where('lich_chieu_id', $request->lich_chieu_id)
                ->whereIn('ghe_id', $request->ghe)
                ->where('trang_thai', 'trong')
                ->lockForUpdate() // lock row để tránh race condition
                ->get();

            if ($checkGheList->count() !== count($request->ghe)) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Một số ghế đã được đặt hoặc không tồn tại.',
                ], 400);
            }

            $tongTien = 0;
            $giaVeTheoGhe = [];

            foreach ($checkGheList as $checkGhe) {
                $giaVe = GiaVe::where('lich_chieu_id', $request->lich_chieu_id)
                    ->where('loai_ghe_id', $checkGhe->ghe->loai_ghe_id)
                    ->value('gia_ve');

                if (!$giaVe) {
                    throw new Exception("Không tìm thấy giá vé cho ghế ID {$checkGhe->ghe_id}");
                }

                $giaVeTheoGhe[$checkGhe->ghe_id] = $giaVe;
                $tongTien += $giaVe;
            }

            // ====== 2️⃣ Tạo đơn đặt vé ======
            $datVe = DatVe::create([
                'nguoi_dung_id' => $user->id,
                'lich_chieu_id' => $request->lich_chieu_id,
                'tong_tien' => $tongTien,
            ]);

            // ====== 3️⃣ Cập nhật chi tiết ghế ======
            foreach ($checkGheList as $checkGhe) {
                DatVeChiTiet::create([
                    'dat_ve_id' => $datVe->id,
                    'ghe_id' => $checkGhe->ghe_id,
                    'gia_ve' => $giaVeTheoGhe[$checkGhe->ghe_id],
                ]);

                // Cập nhật trạng thái ghế
                $checkGhe->update([
                    'trang_thai' => 'da_dat',
                    'nguoi_dung_id' => $user->id,
                    'expires_at' => now()->addMinutes(10),
                ]);
            }

            // ====== 4️⃣ Xử lý đồ ăn ======
            $tongTienDoAn = 0;
            $chiTietDoAn = [];

            if ($request->has('do_an') && count($request->do_an) > 0) {
                foreach ($request->do_an as $item) {
                    $doAn = DoAn::lockForUpdate()->find($item['do_an_id']);
                    if (!$doAn) {
                        DB::rollBack();
                        return response()->json([
                            'message' => "Đồ ăn với ID {$item['do_an_id']} không tồn tại."
                        ], 400);
                    }

                    $soLuong = (int)$item['so_luong'];

                    if ($soLuong > $doAn->so_luong_ton) {
                        DB::rollBack();
                        return response()->json([
                            'message' => "Số lượng {$doAn->ten_do_an} không đủ. Hiện chỉ còn {$doAn->so_luong_ton} sản phẩm."
                        ], 400);
                    }

                    // Tạm trừ tồn kho
                    $doAn->decrement('so_luong_ton', $soLuong);

                    $chiTietDoAn[] = [
                        'doAn' => $doAn,
                        'so_luong' => $soLuong,
                        'gia_ban' => $doAn->gia_ban ?? 0,
                    ];

                    $tongTienDoAn += ($doAn->gia_ban ?? 0) * $soLuong;
                }

                // Lưu chi tiết đồ ăn
                foreach ($chiTietDoAn as $item) {
                    DonDoAn::create([
                        'dat_ve_id' => $datVe->id,
                        'do_an_id' => $item['doAn']->id,
                        'gia_ban' => $item['gia_ban'],
                        'so_luong' => $item['so_luong'],
                    ]);
                }

                // Cập nhật tổng tiền tạm
                $datVe->increment('tong_tien', $tongTienDoAn);
            }

            // ====== 5️⃣ Dispatch job hủy vé nếu không thanh toán ======
            XoaDonHang::dispatch($datVe->id)->delay(now()->addMinutes(1));

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

                    'id' => $item->id,
                    'ma_don_hang' => $item->ma_giao_dich,
                    'dat_ve_id' => $item->datVe?->id,
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



    public function inVe($maGiaoDich)
    {
        try {
            $datVe = DatVe::with([
                'nguoiDung:id,ten,so_dien_thoai,email',
                'lichChieu:id,gio_chieu,gio_ket_thuc,phim_id,phong_id',
                'lichChieu.phim:id,ten_phim,thoi_luong,anh_poster',
                'lichChieu.phong:id,ten_phong',
                'chiTiet.ghe:id,so_ghe,loai_ghe_id',
            ])->whereHas('thanhToan', function ($q) use ($maGiaoDich) {
                $q->where('ma_giao_dich', $maGiaoDich);
            })
                ->first();

            if (!$datVe) {
                return response()->json([
                    'message' => 'Không tìm thấy vé với mã giao dịch này.'
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
            ])->where('id', $id)->first();
            // ->whereHas('thanhToan', function ($q) use ($maGiaoDich) {
            //     $q->where('ma_giao_dich', $maGiaoDich);
            // })
            // ->first();

            if (!$datVe) {
                return response()->json([
                    'message' => 'Không tìm thấy vé với mã giao dịch này!',
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
                'data' => array_merge($datVe->toArray(), [
                    'thanh_toan' => optional(ThanhToan::with('phuongThucThanhToan')->where('dat_ve_id', $datVe->id)->first())->phuongThucThanhToan?->ten ?? null,
                ]),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy chi tiết vé!',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function xoaDatVe($id)
    {
        try {
            DB::beginTransaction();

            $datVe = DatVe::with(['chiTiet.ghe', 'donDoAn.doAn', 'thanhToan'])->find($id);

            if (!$datVe) {
                return response()->json([
                    'message' => 'Không tìm thấy đặt vé này.'
                ], 404);
            }

            // Kiểm tra nếu đã thanh toán thì không được xoá
            if ($datVe->thanhToan()->exists()) {
                return response()->json([
                    'message' => 'Đặt vé đã thanh toán, không thể xoá.'
                ], 400);
            }

            // ===== 1️⃣ Trả lại ghế =====
            foreach ($datVe->chiTiet as $ct) {
                if ($ct->ghe) {
                    $ct->ghe->update([
                        'trang_thai' => 'trong',
                        'nguoi_dung_id' => null,
                        'expires_at' => null,
                    ]);
                }
            }

            // ===== 2️⃣ Hoàn lại số lượng đồ ăn =====
            foreach ($datVe->donDoAn as $dd) {
                if ($dd->doAn) {
                    $dd->doAn->increment('so_luong_ton', $dd->so_luong);
                }
            }

            // ===== 3️⃣ Xoá chi tiết ghế và đồ ăn =====
            $datVe->chiTiet()->delete();
            $datVe->donDoAn()->delete();

            // ===== 4️⃣ Xoá bản ghi DatVe =====
            $datVe->delete();

            DB::commit();

            return response()->json([
                'message' => 'Đặt vé đã được xoá, ghế và đồ ăn đã được hoàn lại.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Xoá đặt vé thất bại.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

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
            ])
            ->whereHas('thanhToan', function ($q) use ($maGiaoDich) {
                $q->where('ma_giao_dich', $maGiaoDich);
            })
            ->first();

            if (!$datVe) {
                return response()->json([
                    'message' => 'Không tìm thấy vé với mã giao dịch này!',
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
                'data' => array_merge($datVe->toArray(), [
                    'thanh_toan' => optional(ThanhToan::with('phuongThucThanhToan')->where('dat_ve_id', $datVe->id)->first())->phuongThucThanhToan?->ten ?? null,
                ]),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy chi tiết vé!',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function capNhatTrangThai($id)
    {
        try {
            $thanhToan = ThanhToan::find($id);

            if (!$thanhToan) {
                return response()->json([
                    'message' => 'Không tìm thấy đơn thanh toán này.'
                ], 404);
            }

            // Kiểm tra trạng thái hiện tại
            if ($thanhToan->da_quet) {
                return response()->json([
                    'message' => 'Đơn này đã được quét/đã in vé.'
                ], 400);
            }

            // Cập nhật trạng thái
            $thanhToan->da_quet = 1; // 1 = đã in/quét
            $thanhToan->save();

            return response()->json([
                'message' => 'Cập nhật trạng thái thành công.',
                'data' => $thanhToan
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Cập nhật trạng thái thất bại.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
