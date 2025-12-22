<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventGroup extends Model
{
    use HasFactory;

    // La tabla solo tiene created_at, no updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'event_id',
        'owner_id',
        'name',
        'meeting_point',
        'visibility',
        'invite_code',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    /**
     * Evento asociado
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Usuario propietario del grupo
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Miembros del grupo
     */
    public function members(): HasMany
    {
        return $this->hasMany(GroupMember::class, 'group_id');
    }

    /**
     * Usuarios miembros del grupo
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'group_members', 'group_id', 'user_id')
            ->withPivot('created_at')
            ->withTimestamps(false);
    }

    /**
     * Generar código de invitación único
     */
    public static function generateInviteCode(): string
    {
        do {
            $code = strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
        } while (self::where('invite_code', $code)->exists());
        
        return $code;
    }
}

