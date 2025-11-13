<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CreateAdminUser extends Command
{
    /**
     * Nombre del comando
     *
     * @var string
     */
    protected $signature = 'user:create-admin';

    /**
     * Descripción del comando
     *
     * @var string
     */
    protected $description = 'Crea un usuario administrador con email admin@eventix.com';

    /**
     * Ejecución del comando
     */
    public function handle()
    {
        $email = 'admin@eventix.com';
        
        // Verificar si el usuario ya existe
        if (User::where('email', $email)->exists()) {
            $this->warn("El usuario con email {$email} ya existe.");
            
            if ($this->confirm('¿Deseas actualizar la contraseña?', false)) {
                $user = User::where('email', $email)->first();
                $user->password = 'victor';
                $user->role = 'admin';
                $user->save();
                $this->info("Usuario actualizado correctamente.");
            }
            
            return 0;
        }

        // Crear el usuario admin
        $user = User::create([
            'name' => 'Grupo Eventix',
            'email' => $email,
            'password' => 'victor',
            'role' => 'admin',
        ]);

        $this->info("Usuario administrador creado exitosamente:");
        $this->line("  ID: {$user->id}");
        $this->line("  Nombre: {$user->name}");
        $this->line("  Email: {$user->email}");
        $this->line("  Rol: {$user->role}");

        return 0;
    }
}