<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // Quan trọng: Thêm dòng này

class UpdateTheLoaiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Cho phép request
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Lấy ID của thể loại đang được cập nhật từ route
        $theLoaiId = $this->route('the_loai')->id ?? $this->route('id');

        return [
            'ten_the_loai' => [
                'required',
                'string',
                'max:100',
                // Quy tắc unique: không trùng với các record khác,
                // NHƯNG bỏ qua (ignore) chính record đang được sửa.
                Rule::unique('the_loai')->ignore($theLoaiId),
            ],
        ];
    }
}