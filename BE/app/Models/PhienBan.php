<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhienBan extends Model
{
    use HasFactory;

    protected $table = 'phien_ban';

    protected $fillable = [
        'ten_phien_ban',
    ];

    public function phim()
    {
        return $this->hasMany(Phim::class, 'phien_ban_id');
    }
}
