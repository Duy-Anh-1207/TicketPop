<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePhienBanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        // route model binding param name: 'phien_ban'
        $pb = $this->route('phien_ban'); // App\Models\PhienBan | null
        $id = $pb?->id;

        return [
            'ten_phien_ban' => 'required|string|max:100|unique:phien_ban,ten_phien_ban,' . $id,
        ];
    }

    public function messages(): array
    {
        return [
            'ten_phien_ban.required' => 'Tên phiên bản là bắt buộc.',
            'ten_phien_ban.max'      => 'Tên phiên bản không được vượt quá 100 ký tự.',
            'ten_phien_ban.unique'   => 'Tên phiên bản đã tồn tại.',
        ];
    }
}
