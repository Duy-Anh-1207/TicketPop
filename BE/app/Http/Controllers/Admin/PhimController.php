<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Phim;
use Illuminate\Http\Request;
use App\Http\Requests\StorePhimRequest;
use App\Models\PhienBan;
use App\Models\TheLoai;

class PhimController extends Controller
{
    public function index()
    {
        return Phim::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten_phim' => 'required|string|max:255',
            'phien_ban' => 'nullable|string',
            'the_loai' => 'nullable|string',
            // các field khác...
        ]);

        // ✅ Chuyển từ "1,2" -> [1, 2]
        $phienBanIds = array_filter(explode(',', $request->input('phien_ban')));
        $theLoaiIds = array_filter(explode(',', $request->input('the_loai')));

        $phim = Phim::create([
            'ten_phim' => $request->ten_phim,
            'phien_ban_id' => json_encode($phienBanIds),
            'the_loai_id' => json_encode($theLoaiIds),
            'thoi_luong' => $request->thoi_luong,
            'do_tuoi_gioi_han' => $request->do_tuoi_gioi_han,
            'loai_suat_chieu' => $request->loai_suat_chieu,
            'ngay_cong_chieu' => $request->ngay_cong_chieu,
            'ngay_ket_thuc' => $request->ngay_ket_thuc,
            'trailer' => $request->trailer,
            'quoc_gia' => $request->quoc_gia,
            'ngon_ngu' => $request->ngon_ngu,
        ]);

        return response()->json([
            'message' => 'Thêm phim thành công',
            'data' => $phim
        ]);
    }


    public function update(StorePhimRequest $request, $id)
    {
        $phim = Phim::findOrFail($id);
        $data = $request->validated();

        // Xử lý PHIÊN BẢN
        $phienBanInput = $request->input('phien_ban_id');
        if (is_string($phienBanInput)) {
            $phienBanInput = explode(',', $phienBanInput);
        }

        $data['phien_ban_id'] = collect($phienBanInput)
            ->map(function ($id) {
                $phienBan = PhienBan::find($id);
                return $phienBan ? [
                    'id' => $phienBan->id,
                    'ten_phien_ban' => $phienBan->ten_phien_ban,
                ] : null;
            })
            ->filter()
            ->values()
            ->toJson();

        // Xử lý THỂ LOẠI
        $theLoaiInput = $request->input('the_loai_id');
        if (is_string($theLoaiInput)) {
            $theLoaiInput = explode(',', $theLoaiInput);
        }

        $data['the_loai_id'] = collect($theLoaiInput)
            ->map(function ($id) {
                $theLoai = TheLoai::find($id);
                return $theLoai ? [
                    'id' => $theLoai->id,
                    'ten_the_loai' => $theLoai->ten_the_loai,
                ] : null;
            })
            ->filter()
            ->values()
            ->toJson();

        // Xử lý ảnh poster (nếu có upload mới)
        if ($request->hasFile('anh_poster')) {
            $data['anh_poster'] = $request->file('anh_poster')->store('posters', 'public');
        }

        $phim->update($data);

        return response()->json([
            'message' => 'Cập nhật phim thành công',
            'data' => $phim
        ], 200);
    }



    public function destroy($id)
    {
        $phim = Phim::findOrFail($id);
        $phim->delete();
        return response()->json(null, 204);
    }
}
