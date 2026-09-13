<?php

return [

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'whatsapp' => [
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID', ''),
        'access_token' => env('WHATSAPP_ACCESS_TOKEN', ''),
        'verify_token' => env('WHATSAPP_VERIFY_TOKEN', 'jawebni_webhook_secret_2026'),
        'app_secret' => env('WHATSAPP_APP_SECRET', ''),
        'api_version' => env('WHATSAPP_API_VERSION', 'v20.0'),
    ],

    'ai' => [
        'openai_key' => env('OPENAI_API_KEY', ''),
        'claude_key' => env('CLAUDE_API_KEY', ''),
        'gemini_key' => env('GEMINI_API_KEY', ''),
        'default_provider' => env('AI_DEFAULT_PROVIDER', 'openai'),
    ],

    'billing' => [
        'bank_name' => env('BANK_NAME', 'Attijariwafa Bank'),
        'account_holder' => env('BANK_ACCOUNT_HOLDER', 'JAWEBNI SARL AU'),
        'rib' => env('BANK_RIB', '007 780 0001234567890123 45'),
        'iban' => env('BANK_IBAN', 'MA64 007 780 0001234567890123 45'),
        'swift' => env('BANK_SWIFT', 'BCMAMAMC'),
    ],

];
