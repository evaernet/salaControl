<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Control extends Model
{
    protected $table = 'controles';

    protected $fillable = ['temperatura', 'observacion', 'fecha', 'user_id'];

    protected $casts = [
        'temperatura' => 'float',
        'fecha' => 'datetime:Y-m-d H:i',
    ];

    // Quién lo registró.
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
