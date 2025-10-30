<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DatVe;
use App\Models\DatVeChiTiet;
use App\Models\Ghe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DatVeController extends Controller
{
    public function datVe(Request $request)
    {
        $request->validate([
            'lich_chieu_id' => 'required|exists:lich_chieu,id',
            'ghe' => 'required|array|min:1',
            'ghe.*' => 'exists:ghe,id',
        ]);
        $user = Auth::user() ?? \App\Models\NguoiDung::first();
        return DB::transaction(function () use ($request, $user) {
            // lấy thông tin ghế và tính tổng tiền
            $gheList = Ghe::whereIn('id', $request->ghe)->lockForUpdate()->get(); //->where('trang_thai', 'trong')
            // if ($gheList->count() !== count($request->ghe)) {
            //     return response()->json([
            //         'mesage: Một số ghế đã được đặt, vui lòng chọn lại.'
            //     ], 409);
            // }
            $tongTien = $gheList->sum('gia_ve');
            // tạo đơn đặt vé
            $datVe = DatVe::create([
                'nguoi_dung_id' => $user->id,
                'lich_chieu_id' => $request->lich_chieu_id,
                'tong_tien' => $tongTien,
            ]);
            // Tạo chi tiết vé
            foreach ($gheList as $ghe) {
                DatVeChiTiet::create([
                    'dat_ve_id' => $datVe->id,
                    'ghe_id' => $ghe->id,
                    'gia_ve' => $ghe->gia_ve,
                ]);
                $ghe->update(['trang_thai' => 'da_dat']);
            }
            return response()->json([
                'message' => 'Đặt vé thành công',
                'dat_ve' => $datVe->load('chiTiet.ghe'),
            ], 201);
        });
    }
}
