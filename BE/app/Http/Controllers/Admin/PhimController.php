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

        $anhPosterPath = null;
        if ($request->hasFile('anh_poster')) {
            $anhPosterPath = $request->file('anh_poster')->store('posters', 'public');
        }

        // Chuyển "1,2" -> [1, 2]
        $phienBanIds = array_filter(explode(',', $request->input('phien_ban')));
        $theLoaiIds = array_filter(explode(',', $request->input('the_loai')));

        $phim = Phim::create([
            'ten_phim' => $request->ten_phim,
            'phien_ban_id' => $phienBanIds,
            'the_loai_id' => $theLoaiIds,
            'thoi_luong' => $request->thoi_luong,
            'do_tuoi_gioi_han' => $request->do_tuoi_gioi_han,
            'loai_suat_chieu' => $request->loai_suat_chieu,
            'ngay_cong_chieu' => $request->ngay_cong_chieu,
            'ngay_ket_thuc' => $request->ngay_ket_thuc,
            'trailer' => $request->trailer,
            'quoc_gia' => $request->quoc_gia,
            'ngon_ngu' => $request->ngon_ngu,
            'mo_ta' => $request->mo_ta,
            'anh_poster' => $anhPosterPath,
        ]);

        return response()->json([
            'message' => 'Thêm phim thành công',
            'data' => $phim
        ]);
    }



    public function update(Request $request, $id)
    {
        // Chuyển mảng -> chuỗi để tránh lỗi validate
        if (is_array($request->phien_ban)) {
            $request->merge(['phien_ban' => implode(',', $request->phien_ban)]);
        }
        if (is_array($request->the_loai)) {
            $request->merge(['the_loai' => implode(',', $request->the_loai)]);
        }

        $validated = $request->validate([
            'ten_phim' => 'required|string|max:255',
            'phien_ban' => 'nullable|string',
            'the_loai' => 'nullable|string',
            // các field khác...
        ]);

        $phim = Phim::findOrFail($id);

        // Xử lý ảnh
        $anhPosterPath = $phim->anh_poster;
        if ($request->hasFile('anh_poster')) {
            $anhPosterPath = $request->file('anh_poster')->store('posters', 'public');
        }

        // Xử lý phiên bản & thể loại
        $phienBanIds = array_filter(explode(',', $request->input('phien_ban')));
        $theLoaiIds = array_filter(explode(',', $request->input('the_loai')));

        $phim->update([
            'ten_phim' => $request->ten_phim,
            'phien_ban_id' => $phienBanIds,
            'the_loai_id' => $theLoaiIds,
            'thoi_luong' => $request->thoi_luong,
            'do_tuoi_gioi_han' => $request->do_tuoi_gioi_han,
            'loai_suat_chieu' => $request->loai_suat_chieu,
            'ngay_cong_chieu' => $request->ngay_cong_chieu,
            'ngay_ket_thuc' => $request->ngay_ket_thuc,
            'trailer' => $request->trailer,
            'quoc_gia' => $request->quoc_gia,
            'ngon_ngu' => $request->ngon_ngu,
            'mo_ta' => $request->mo_ta,
            'anh_poster' => $anhPosterPath,
        ]);

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

    public function show($id)
    {
        $phim = Phim::find($id);

        if (!$phim) {
            return response()->json(['message' => 'Phim không tồn tại'], 404);
        }

        return response()->json($phim);
    }
}