<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Entrada Compartida</title>
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
        .highlight {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class="header">
        @if(isset($logoEmbed))
            <img src="{{ $logoEmbed }}" alt="Eventix Logo" style="max-width: 200px; height: auto; margin-bottom: 10px;">
            <h2 style="margin-top: 15px; font-size: 1.5em;">Te han compartido una entrada</h2>
        @else
            <h1>Te han compartido una entrada!</h1>
        @endif
    </div>
    
    <div class="content">
        <p>Hola,</p>
        
        <div class="highlight">
            <p><strong>{{ $buyer->name }}</strong> te ha compartido una entrada para:</p>
        </div>
        
        <div class="ticket-info">
            <h2 style="margin-top: 0;">{{ $event->title }}</h2>
            
            <div class="info-row">
                <span class="info-label">Fecha:</span>
                <span class="info-value">{{ $event->date->format('d/m/Y') }}</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Hora:</span>
                <span class="info-value">{{ substr($event->time, 0, 5) }}</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Ubicación:</span>
                <span class="info-value">{{ $event->location }}</span>
            </div>
        </div>
        
        <div class="qr-container">
            <h3>Código QR</h3>
            <p>Esta entrada compartida te permite acceder al evento. Presenta el código QR a la entrada.</p>
            <div class="qr-code">
                <img src="data:image/png;base64,{{ base64_encode($qrCodeImage) }}" alt="QR Code" style="width: 100%; max-width: 300px;">
            </div>
            <p style="margin-top: 15px; font-size: 12px; color: #666;">
                Código: <strong>{{ $ticket->qr_code }}</strong>
            </p>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
            <strong>¡Disfruta del evento!</strong>
        </p>
    </div>
    
    <div class="footer">
        <p>Este es un email automático, por favor no respondas.</p>
        <p>&copy; {{ date('Y') }} Plataforma de Eventos. Todos los derechos reservados.</p>
    </div>
</body>
</html>

