<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_id',
        'qr_code',
        'status',
        'shared_with',
        'price',
    ];

    /**
     * Usuario propietario del ticket
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Evento asociado
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}