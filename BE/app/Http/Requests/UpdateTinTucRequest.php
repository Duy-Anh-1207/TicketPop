<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTinTucRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }    public function rules(): array
    {
       $tinTucId = $this->route('tin_tuc')->id;

            return [
                'tieu_de' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('tin_tuc')->ignore($tinTucId),
                ],
                'noi_dung' => 'required|string',
                'hinh_anh' => 'nullable|string|max:255',
            ];
    }
}
