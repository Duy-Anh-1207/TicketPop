<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePhimRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
{
    return [
        'ten_phim' => 'required|string|max:255',
        'mo_ta' => 'nullable|string',
        'thoi_luong' => 'required|integer',
        'trailer' => 'nullable|string|max:255',
        'ngon_ngu' => 'required|string|max:100',
        'quoc_gia' => 'required|string|max:100',
        'anh_poster' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:6000',
        'ngay_cong_chieu' => 'required|date',
        'ngay_ket_thuc' => 'nullable|date',
        'do_tuoi_gioi_han' => 'required|string|max:50',
        'loai_suat_chieu' => 'required|in:Thường,Đặc biệt,Sớm',
        // thay json => array
        'phien_ban_id' => 'nullable|array',
        'phien_ban_id.*' => 'integer',
        'the_loai_id' => 'nullable|array',
        'the_loai_id.*' => 'integer',
    ];
}

}