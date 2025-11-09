<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DonDoAn;
use App\Models\DoAn;
use App\Models\DatVe;
use Illuminate\Http\Request;

class DonDoAnController extends Controller
{
    public function index()
    {
        $data = DonDoAn::with([
            'datVe.nguoiDung:id,ten,email',
            'doAn:id,ten_do_an,image',
        ])->latest()->get();
        return response()->json([
            'message' => 'Danh Sách Đơn Đồ Ăn',
            'data' => $data
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'dat_ve_id' => 'required|exists:dat_ve,id',
            'do_an_id' => 'required|exists:do_an,id',
            'so_luong' => 'required|integer|min:1'
        ]);
        $doAn = DoAn::findOrFail($request->do_an_id);
        $donDoAn = DonDoAn::create([
            'dat_ve_id' => $request->dat_ve_id,
            'do_an_id' => $request->do_an_id,
            'gia_ban' => $doAn->gia_ban,
            'so_luong' => $request->so_luong,
        ]);
        return response()->json([
            'message' => 'Tạo đơn đồ ăn thành công',
            'data' => $donDoAn->load('doAn','datVe')
        ],201);
    }
    public function show($id){
        $donDoAn = DonDoAn::with(['datVe','doAn'])->find($id);
        if(!$donDoAn){
            return response()->json([
                'messege' => 'Không tìm thấy đơn đồ ăn',
            ],404);
        }
        return response()->json([
            'message' => 'Chi tiết đơn đồ ăn',
            'data' => $donDoAn
        ]);
    }
}
