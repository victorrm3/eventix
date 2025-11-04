<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Permitir tu frontend en 8080 (y ajustar si usas otros puertos)
    'allowed_origins' => [
        'http://localhost:8080',
        'http://127.0.0.1:8080',
    ],

    'allowed_origins_patterns' => [],

    'allowed_methods' => ['*'],

    // Permitir Authorization y Content-Type
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];