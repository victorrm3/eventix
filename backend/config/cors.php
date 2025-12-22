<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Permitir frontend en localhost y dominio de producción
    'allowed_origins' => [
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'https://eventixs.es',
        'http://eventixs.es',
    ],

    'allowed_origins_patterns' => [],

    'allowed_methods' => ['*'],

    // Permitir Authorization y Content-Type
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];