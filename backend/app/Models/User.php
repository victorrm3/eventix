<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;


    /**
     * Atributos editables
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'profile_image',
    ];

    /**
     * Atributos ocultos
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Atributos procesados
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Amigos del usuario (relación bidireccional)
     */
    public function friends()
    {
        return $this->belongsToMany(User::class, 'friends', 'user_id', 'friend_id')
            ->withPivot('created_at')
            ->withTimestamps(false);
    }

    /**
     * Tickets del usuario
     */
    public function tickets()
    {
        return $this->hasMany(\App\Models\Ticket::class);
    }

    /**
     * Solicitudes de amistad enviadas
     */
    public function sentFriendRequests()
    {
        return $this->hasMany(\App\Models\FriendRequest::class, 'sender_id');
    }

    /**
     * Solicitudes de amistad recibidas
     */
    public function receivedFriendRequests()
    {
        return $this->hasMany(\App\Models\FriendRequest::class, 'receiver_id');
    }

    /**
     * Logros del usuario
     */
    public function achievements()
    {
        return $this->hasMany(\App\Models\Achievement::class);
    }

    /**
     * Grupos creados por el usuario
     */
    public function ownedGroups()
    {
        return $this->hasMany(\App\Models\EventGroup::class, 'owner_id');
    }

    /**
     * Grupos a los que pertenece el usuario
     */
    public function groups()
    {
        return $this->belongsToMany(\App\Models\EventGroup::class, 'group_members', 'user_id', 'group_id')
            ->withPivot('created_at')
            ->withTimestamps(false);
    }
}
