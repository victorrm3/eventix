<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupMember extends Model
{
    use HasFactory;

    const UPDATED_AT = null; // Solo created_at

    protected $fillable = [
        'group_id',
        'user_id',
    ];

    /**
     * Grupo al que pertenece
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(EventGroup::class, 'group_id');
    }

    /**
     * Usuario miembro
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

