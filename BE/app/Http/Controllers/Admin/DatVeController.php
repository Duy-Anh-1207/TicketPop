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
        // ✅ Bước 1: Validate dữ liệu đầu vào
        $request->validate([
            'lich_chieu_id' => 'required|exists:lich_chieu,id',
            'ghe' => 'required|array|min:1',
            'ghe.*' => 'exists:ghe,id',
        ]);

        // ✅ Bước 2: Lấy thông tin user hiện tại (hoặc user đầu tiên nếu chưa có auth)
        $user = Auth::user() ?? \App\Models\NguoiDung::first();

        try {
            // ✅ Bước 3: Mở transaction để đảm bảo toàn vẹn dữ liệu
            DB::beginTransaction();

            // ✅ Bước 4: Lấy danh sách ghế và khóa hàng (tránh double booking)
            $gheList = Ghe::whereIn('id', $request->ghe)
                ->lockForUpdate()
                ->get();

            if ($gheList->count() !== count($request->ghe)) {
                return response()->json([
                    'message' => 'Một số ghế không tồn tại hoặc đã bị khóa.',
                ], 400);
            }

            // ✅ Bước 5: Tính tổng tiền dựa trên bảng `gia_ve`
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

            // ✅ Bước 6: Tạo đơn đặt vé chính
            $datVe = DatVe::create([
                'nguoi_dung_id' => $user->id,
                'lich_chieu_id' => $request->lich_chieu_id,
                'tong_tien' => $tongTien,
            ]);

            // ✅ Bước 7: Tạo chi tiết đặt vé
            foreach ($gheList as $ghe) {
                DatVeChiTiet::create([
                    'dat_ve_id' => $datVe->id,
                    'ghe_id' => $ghe->id,
                    'gia_ve' => $giaVeTheoGhe[$ghe->id],
                ]);

                // cập nhật trạng thái ghế (false = đã đặt)
                $ghe->update(['trang_thai' => false]);
            }

            // ✅ Bước 8: Commit transaction
            DB::commit();

            return response()->json([
                'message' => 'Đặt vé thành công',
                'dat_ve' => $datVe->load('chiTiet.ghe'),
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
}
