<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVaiTroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ten_vai_tro' => 'required|string|max:50|unique:vai_tro,ten_vai_tro',
            'mo_ta' => 'nullable|string',
            // 'permissions' => 'nullable|array',
            // 'permissions.*.menu_id' => 'required|integer|exists:menu,id',
            // 'permissions.*.function' => 'required|array|min:1',
            // 'permissions.*.function.*' => 'integer|between:1,4',
        ];
    }

    public function messages(): array
    {
        return [
            'permissions.*.menu_id.exists' => 'Menu ID không tồn tại',
            'permissions.*.function.required' => 'Vui lòng cung cấp danh sách quyền',
            'permissions.*.function.*.integer' => 'Giá trị quyền phải là số nguyên',
        ];
    }

    // Trả JSON khi validation fail
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        $response = response()->json([
            'message' => 'Validation thất bại',
            'errors' => $validator->errors(),
        ], 422);

        throw new \Illuminate\Validation\ValidationException($validator, $response);
    }
}
