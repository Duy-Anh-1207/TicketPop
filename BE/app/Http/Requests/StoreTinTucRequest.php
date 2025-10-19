<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTinTucRequest extends FormRequest
{
    public function authorize(): bool
    {
       return true;
    }
    public function rules(): array
    {
        return [
                'tieu_de' => 'required|string|max:255|unique:tin_tuc,tieu_de',
                'noi_dung' => 'required|string',
                'hinh_anh' => 'nullable|string|max:255',
            ];
    }
}
