<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sala extends Model
{
    protected $fillable = ['nombre'];

    public function camas()
    {
        return $this->hasMany(Cama::class);
    }
}
