<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTheLoaiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ten_the_loai' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'ten_the_loai.required' => 'Vui lòng nhập tên thể loại.',
            'ten_the_loai.string' => 'Tên thể loại phải là chuỗi ký tự.',
            'ten_the_loai.max' => 'Tên thể loại không được vượt quá 255 ký tự.',
        ];
    }
}
