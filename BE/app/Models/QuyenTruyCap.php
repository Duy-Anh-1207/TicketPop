<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuyenTruyCap extends Model
{
    protected $table = 'quyen_truy_cap';
    protected $fillable = [
        'vai_tro_id',
        'menu_id',
        'function'
    ];
    protected function getFunctionAttribute($value)
    {
        return $value ? explode(',', $value) : [];
    }
    protected function setFunctionAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['function'] = implode(',', $value);
        } else {
            $this->attributes['function'] = $value;
        }
    }
    public function vaiTro()
    {
        return $this->belongsTo(VaiTro::class, 'vai_tro_id');
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }
}
