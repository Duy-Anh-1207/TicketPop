<?php

namespace App\Http\Controllers\Client;


use App\Models\CheckGhe;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Jobs\UpdateGheJob;
use Exception;
use Illuminate\Support\Facades\Log;

class CheckGheController extends Controller
{


    //LẤY DANH SÁCH GHẾ THEO LỊCH CHIẾU
    //ID LỊCH CHIẾU
    public function show(string $id)
    {
        $dataGhe = CheckGhe::with('Ghe')->where('lich_chieu_id', $id)->get();
        return response()->json([
            'message' => 'Lấy danh sách ghế thành công',
            'data' => $dataGhe
        ]);
    }


    //LẤY DANH SÁCH CHECK GHẾ THEO ID GHẾ
    //ID GHẾ
    public function showAllCheckGhe(string $id)
    {
        $dataGhe = CheckGhe::where('ghe_id', $id)->get();
        return response()->json([
            'message' => 'Lấy danh sách check ghế thành công',
            'data' => $dataGhe
        ]);
    }

    public function getGheByLichChieu($lichChieuId)
    {
        try {
            $checkGheList = CheckGhe::with('ghe:id,so_ghe,hang,cot,loai_ghe_id')
                ->where('lich_chieu_id', $lichChieuId)
                ->get();

            if ($checkGheList->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Chưa có ghế cho lịch chiếu này!'
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $checkGheList
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy ghế',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    //CẬP NHẬT TRẠNG THÁI GHẾ
    //ID CỦA BẢN GHI CHECK_GHE
    public function update(Request $request, string $id)
    {
        $dataGhe = CheckGhe::find($id);
        UpdateGheJob::dispatch($id)->delay(now()->addMinutes(5));
        if (!$dataGhe) {
            return response()->json([
                'message' => 'Ghế không tồn tại'
            ], 404);
        }

        if (
            $dataGhe->nguoi_dung_id !== null &&
            (int) $dataGhe->nguoi_dung_id !== (int) $request->input('nguoi_dung_id') &&
            (int) $dataGhe->id === (int) $id
        ) {
            return response()->json([
                'message' => 'Ghế đã có người chọn'
            ], 422);
        }



        $dataGhe->update([
            'trang_thai' => $request->trang_thai,
        ]);



        if ($request->trang_thai === 'trong') {
            $dataGhe->update(['nguoi_dung_id' => null]);
        } else {
            $dataGhe->update(['nguoi_dung_id' => $request->nguoi_dung_id]);
        }

        return response()->json([
            'message' => 'Lấy danh sách ghế thành công',
            'data' => $dataGhe
        ]);
    }


    //CẬP NHẬT KHI OUT TRANG
    public function bulkUpdate(Request $request)
    {
        // $data = $request->all();
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        try {
            foreach ($data['data'] as $value) {
                $ghe = CheckGhe::find($value['id']);
                if (!$ghe) {
                    return response()->json([
                        'message' => 'Ghế không tồn tại: ' . $value['id']
                    ], 404);
                }

                $ghe->update([
                    'trang_thai' => 'trong',
                    'nguoi_dung_id' => null,
                ]);
            }

            return response()->json([
                'message' => 'Cập nhật trạng thái ghế thành công',
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'ERROR',
            ], 422);
        }
    }


    //ID LỊCH CHIẾU
    public function destroy(string $id)
    {
        $dataGhe = CheckGhe::where('lich_chieu_id', $id)->get();
        if ($dataGhe->isEmpty()) {
            return response()->json([
                'message' => 'Không có ghế nào để xóa'
            ], 404);
        }
        foreach ($dataGhe as $ghe) {
            $ghe->delete();
        }
    }
}
