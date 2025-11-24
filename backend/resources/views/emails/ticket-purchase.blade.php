<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Entrada Confirmada</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .ticket-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: bold;
            color: #666;
        }
        .info-value {
            color: #333;
        }
        .qr-container {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: white;
            border-radius: 8px;
        }
        .qr-code {
            max-width: 300px;
            margin: 0 auto;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        @if(isset($logoEmbed))
            <img src="{{ $logoEmbed }}" alt="Eventix Logo" style="max-width: 200px; height: auto; margin-bottom: 10px;">
        @else
            <h1>EVENTIX - Entrada Confirmada</h1>
        @endif
    </div>
    
    <div class="content">
        <p>Hola <strong>{{ $user->name }}</strong>,</p>
        
        <p>¡Tu entrada para <strong>{{ $event->title }}</strong> ha sido confirmada!</p>
        
        <div class="ticket-info">
            <h2 style="margin-top: 0;">Detalles de tu entrada:</h2>
            
            <div class="info-row">
                <span class="info-label">Evento:</span>
                <span class="info-value">{{ $event->title }}</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Fecha:</span>
                <span class="info-value">{{ $event->date->format('d/m/Y') }}</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Hora:</span>
                <span class="info-value">{{ substr($event->time, 0, 5) }}</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Lugar:</span>
                <span class="info-value">{{ $event->location }}</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Tipo:</span>
                <span class="info-value">{{ $ticket->shared_with ? 'Entrada Compartida' : 'Entrada Singular' }}</span>
            </div>
            
            @if($ticket->shared_with && $ticket->sharedWith)
            <div class="info-row">
                <span class="info-label">Compartida con:</span>
                <span class="info-value">{{ $ticket->sharedWith->email }}</span>
            </div>
            @endif
            
            <div class="info-row">
                <span class="info-label">Precio:</span>
                <span class="info-value">€{{ number_format($ticket->shared_with ? ($event->price * 1.66) : $event->price, 2, ',', '.') }}</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Código QR:</span>
                <span class="info-value">{{ $ticket->qr_code }}</span>
            </div>
        </div>
        
        <div class="qr-container">
            <h3>Código QR</h3>
            <p>Presenta este código QR a la entrada del evento.</p>
            <div class="qr-code">
                <img src="data:image/png;base64,{{ base64_encode($qrCodeImage) }}" alt="QR Code" style="width: 100%; max-width: 300px;">
            </div>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
            <strong>¡Nos vemos allí!</strong>
        </p>
    </div>
    
    <div class="footer">
        <p>Este es un email automático, por favor no respondas.</p>
        <p>&copy; {{ date('Y') }} Eventix. Todos los derechos reservados.</p>
    </div>
</body>
</html>

