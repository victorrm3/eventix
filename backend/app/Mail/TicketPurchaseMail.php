<?php

namespace App\Mail;

use App\Models\Ticket;
use App\Models\Event;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TicketPurchaseMail extends Mailable
{
    use Queueable, SerializesModels;

    public $ticket;
    public $event;
    public $qrCodeImage;

    /**
     * Create a new message instance.
     */
    public function __construct(Ticket $ticket, Event $event, $qrCodeImage)
    {
        $this->ticket = $ticket;
        $this->event = $event;
        $this->qrCodeImage = $qrCodeImage;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = '✅ Entrada Confirmada - ' . $this->event->title;
        
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
                    ->view('emails.ticket-purchase', ['logoEmbed' => $logoEmbed])
                    ->with([
                        'ticket' => $this->ticket,
                        'event' => $this->event,
                        'user' => $this->ticket->user,
                        'qrCodeImage' => $this->qrCodeImage,
                    ])
                    ->attachData($this->qrCodeImage, 'qr-code.png', [
                        'mime' => 'image/png',
                    ]);
    }
}

