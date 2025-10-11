<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVaiTroRequest extends FormRequest
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
        return [

            'ten_vai_tro' => 'required|string|max:50|unique:vai_tro,ten_vai_tro',
            'mo_ta' => 'nullable|string',
            'quyen_han_ids' => 'present|array',
            'quyen_han_ids.*' => 'integer|exists:quyen_han,id',
        ];
    }
}

