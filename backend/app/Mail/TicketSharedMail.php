<?php

namespace App\Mail;

use App\Models\Ticket;
use App\Models\Event;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TicketSharedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $ticket;
    public $event;
    public $buyer;
    public $qrCodeImage;

    /**
     * Crear un nuevo mensaje
     */
    public function __construct(Ticket $ticket, Event $event, User $buyer, $qrCodeImage)
    {
        $this->ticket = $ticket;
        $this->event = $event;
        $this->buyer = $buyer;
        $this->qrCodeImage = $qrCodeImage;
    }

    /**
     * Estructura del mensaje
     */
    public function build()
    {
        $subject = '🎉 Te han compartido una entrada - ' . $this->event->title;
        
        // Intentar incluir el logo de Eventix (si existe y no hay errores)
        $logoEmbed = null;
        try {
            $logoPath = public_path('images/logoeventixtrans.png');
            if (file_exists($logoPath) && is_readable($logoPath)) {
                $logoEmbed = $this->embed($logoPath);
            }
        } catch (\Exception $e) {
            // Si falla el embed del logo, continuar sin él (no crítico)
            \Log::warning('No se pudo incluir el logo en el email: ' . $e->getMessage());
        }
        
        return $this->subject($subject)
                    ->view('emails.ticket-shared', ['logoEmbed' => $logoEmbed])
                    ->with([
                        'ticket' => $this->ticket,
                        'event' => $this->event,
                        'buyer' => $this->buyer,
                        'user' => $this->ticket->user,
                        'qrCodeImage' => $this->qrCodeImage,
                    ])
                    ->attachData($this->qrCodeImage, 'qr-code.png', [
                        'mime' => 'image/png',
                    ]);
    }
}

