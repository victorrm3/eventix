<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Event;
use App\Models\User;
use App\Mail\TicketPurchaseMail;
use App\Mail\TicketSharedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use SimpleSoftwareIO\QrCode\Facades\QrCode as QRCode;
use Illuminate\Support\Str;

class TicketController extends Controller
{
    /**
     * Procesar la compra de una entrada
     */
    public function purchase(Request $request)
    {
        try {
            // Validar los datos
            // Nota: ticket_type y total_price son opcionales ya que se calculan en el backend
            $validator = Validator::make($request->all(), [
                'event_id' => 'required|integer|exists:events,id',
                'ticket_type' => 'nullable|string|in:singular,compartida', // Solo informativo del frontend
                'shared_with_email' => 'nullable|email',
                'total_price' => 'nullable|numeric|min:0', // Solo informativo del frontend
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos inválidos',
                    'errors' => $validator->errors()
                ], 400);
            }

            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado. Debes estar autenticado.'
                ], 401);
            }

            $event = Event::find($request->event_id);

            // Verificar que el evento existe
            if (!$event) {
                return response()->json([
                    'success' => false,
                    'message' => 'Evento no encontrado'
                ], 404);
            }

            // Verificar disponibilidad
            $ticketsCount = Ticket::where('event_id', $event->id)->count();
            if ($ticketsCount >= $event->capacity) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay entradas disponibles para este evento'
                ], 409);
            }

            // Determinar si es entrada compartida basándose en shared_with_email
            $isShared = !empty($request->shared_with_email);
            $sharedUser = null;

            if ($isShared) {
                // Validar que el evento permite entrada compartida
                if (!$event->shareable) {
                    return response()->json([
                        'success' => false,
                        'message' => 'El evento no tiene habilitada la opción de entrada compartida (shareable debe ser true)'
                    ], 422);
                }

                // Buscar el usuario por email
                $sharedUser = User::where('email', $request->shared_with_email)->first();
                if (!$sharedUser) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Usuario no encontrado'
                    ], 404);
                }

                // Verificar que no sea el mismo usuario
                if ($sharedUser->id === $user->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No puedes compartir una entrada contigo mismo'
                    ], 400);
                }
            }

            // Generar código QR único
            $qrCode = 'TICKET-' . strtoupper(Str::random(10)) . '-' . time();
            
            // Generar imagen QR como PNG para el email
            try {
                // Generar QR y guardarlo en un archivo temporal para obtener los bytes binarios
                $tempPath = storage_path('app/temp/qr_' . time() . '_' . uniqid() . '.png');
                
                // Asegurar que el directorio existe
                $tempDir = dirname($tempPath);
                if (!file_exists($tempDir)) {
                    mkdir($tempDir, 0755, true);
                }
                
                // Generar el QR y guardarlo en el archivo
                QRCode::size(300)
                    ->errorCorrection('H')
                    ->format('png')
                    ->generate($qrCode, $tempPath);
                
                // Leer el archivo como bytes binarios
                $qrCodeImage = file_get_contents($tempPath);
                
                // Eliminar el archivo temporal
                @unlink($tempPath);
                
            } catch (\Exception $e) {
                // Limpiar archivo temporal si existe
                if (isset($tempPath) && file_exists($tempPath)) {
                    @unlink($tempPath);
                }
                \Log::error('Error generando QR: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Error al generar el código QR: ' . $e->getMessage()
                ], 500);
            }

            // Calcular precio basándose en el tipo (el precio viene del evento)
            // Para compartida: precio_evento * 1.66, para singular: precio_evento
            $ticketPrice = $isShared ? $event->price * 1.66 : $event->price;

            // Crear el ticket (sin guardar price ni ticket_type, solo shared_with si es compartida)
            try {
                $ticket = Ticket::create([
                    'user_id' => $user->id,
                    'event_id' => $event->id,
                    'qr_code' => $qrCode,
                    'status' => 'reserved',
                    'shared_with' => $isShared ? $sharedUser->id : null,
                ]);
            } catch (\Exception $e) {
                \Log::error('Error creando ticket: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Error al crear el ticket: ' . $e->getMessage()
                ], 500);
            }

            // Cargar relaciones necesarias para los emails
            $ticket->load('user', 'sharedWith', 'event');

            // Enviar email al comprador
            try {
                Mail::to($user->email)->send(new TicketPurchaseMail($ticket, $event, $qrCodeImage));
                \Log::info('Email enviado exitosamente al comprador: ' . $user->email);
            } catch (\Exception $e) {
                \Log::error('Error enviando email al comprador: ' . $e->getMessage());
                \Log::error('Stack trace: ' . $e->getTraceAsString());
            }

            // Si es entrada compartida, enviar email al usuario compartido
            if ($isShared && $sharedUser) {
                try {
                    Mail::to($sharedUser->email)->send(new TicketSharedMail($ticket, $event, $user, $qrCodeImage));
                    \Log::info('Email enviado exitosamente al usuario compartido: ' . $sharedUser->email);
                } catch (\Exception $e) {
                    \Log::error('Error enviando email al usuario compartido: ' . $e->getMessage());
                    \Log::error('Stack trace: ' . $e->getTraceAsString());
                }
            }

            // Determinar tipo de entrada basándose en shared_with
            $ticketType = $ticket->shared_with ? 'compartida' : 'singular';

            return response()->json([
                'success' => true,
                'message' => 'Compra procesada exitosamente',
                'ticket' => [
                    'id' => $ticket->id,
                    'event_id' => $ticket->event_id,
                    'user_id' => $ticket->user_id,
                    'ticket_type' => $ticketType, // Calculado, no almacenado
                    'qr_code' => $ticket->qr_code,
                    'price' => (float)$ticketPrice, // Precio calculado
                    'status' => $ticket->status,
                    'shared_with_user_id' => $ticket->shared_with,
                    'created_at' => $ticket->created_at->toIso8601String(),
                ]
            ], 200);
            
        } catch (\Exception $e) {
            \Log::error('Error en purchase: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la compra: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }
}

