<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
class UpdateVaiTroRequest extends FormRequest
{
    public function authorize(): bool
    {
       
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $vaiTroId = $this->route('vai_tro')->id;

        return [
            'ten_vai_tro' => [
                'required',
                'string',
                'max:50',
                Rule::unique('vai_tro')->ignore($vaiTroId),
            ],
            'mo_ta' => 'nullable|string',
            'quyen_han_ids' => 'present|array',
            'quyen_han_ids.*' => 'integer|exists:quyen_han,id',
        ];
    }
}

