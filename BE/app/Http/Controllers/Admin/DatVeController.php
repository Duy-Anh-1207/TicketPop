<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DatVe;
use App\Models\DatVeChiTiet;
use App\Models\Ghe;
use App\Models\GiaVe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class DatVeController extends Controller
{
    public function datVe(Request $request)
    {
        // Validate dữ liệu đầu vào
        $request->validate([
            'lich_chieu_id' => 'required|exists:lich_chieu,id',
            'ghe' => 'required|array|min:1',
            'ghe.*' => 'exists:ghe,id',
        ]);

        // Lấy thông tin user hiện tại (hoặc user đầu tiên nếu chưa có auth)
        $user = Auth::user() ?? \App\Models\NguoiDung::first();

        try {
            //  Mở transaction để đảm bảo toàn vẹn dữ liệu
            DB::beginTransaction();

            //  Lấy danh sách ghế và khóa hàng (tránh double booking)
            $gheList = Ghe::whereIn('id', $request->ghe)
                ->lockForUpdate()
                ->get();

            if ($gheList->count() !== count($request->ghe)) {
                return response()->json([
                    'message' => 'Một số ghế không tồn tại hoặc đã bị khóa.',
                ], 400);
            }

            //  Tính tổng tiền dựa trên bảng `gia_ve`
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

            //  Tạo đơn đặt vé chính
            $datVe = DatVe::create([
                'nguoi_dung_id' => $user->id,
                'lich_chieu_id' => $request->lich_chieu_id,
                'tong_tien' => $tongTien,
            ]);

            //  Tạo chi tiết đặt vé
            foreach ($gheList as $ghe) {
                DatVeChiTiet::create([
                    'dat_ve_id' => $datVe->id,
                    'ghe_id' => $ghe->id,
                    'gia_ve' => $giaVeTheoGhe[$ghe->id],
                ]);

                // cập nhật trạng thái ghế (false = đã đặt)
                $ghe->update(['trang_thai' => false]);
            }

            //  Commit transaction
            DB::commit();

            return response()->json([
                'message' => 'Đặt vé thành công',
                'dat_ve' => $datVe->load([
                    'nguoiDung:id,ten,so_dien_thoai,email',
                    'lichChieu:id,gio_chieu,phim_id,phong_id',
                    'lichChieu.phim:id,ten_phim,thoi_luong',
                    'lichChieu.phong:id,ten_phong',
                    // 'lichChieu.phongChieu.rap:id,ten_rap',
                    'chiTiet.ghe:id,so_ghe,loai_ghe_id',
                ]),
            ], 201);
        } catch (Exception $e) {
            // ✅ Rollback nếu có lỗi
            DB::rollBack();
            return response()->json([
                'message' => 'Đặt vé thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function danhSachDatVe()
    {
        $user = Auth::user() ?? \App\Models\NguoiDung::first();

        $datVe = DatVe::with([
            'nguoiDung:email',
            'lichChieu:id,gio_chieu,phim_id,phong_id',
            'lichChieu.phim:ten_phim',
            'lichChieu.phong:id,ten_phong',
        ])
            ->where('nguoi_dung_id', $user->id)
            ->get();

        return response()->json([
            'message' => 'Danh sách vé đã đặt',
            'data' => $datVe
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
                    'rap' => $datVe->lichChieu->phong->rap->ten_rap ?? '',
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
}
