<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
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
    'momo' => [
    'method_id'  => env('MOMO_METHOD_ID', 2), // id trong bảng phuong_thuc_thanh_toan ứng với MoMo
    'partner_code' => env('MOMO_PARTNER_CODE'),
    'access_key'   => env('MOMO_ACCESS_KEY'),
    'secret_key'   => env('MOMO_SECRET_KEY'),
    'endpoint'     => env('MOMO_ENDPOINT','https://test-payment.momo.vn/v2/gateway/api/create'),
    'return_url'   => env('MOMO_RETURN_URL','http://127.0.0.1:8000/api/thanhtoan/momo/return'),
    'ipn_url'      => env('MOMO_IPN_URL','http://127.0.0.1:8000/api/thanhtoan/momo/ipn'),
    'front_result_url' => env('MOMO_FRONT_RESULT_URL','http://localhost:5173/ket-qua-thanh-toan'),
],

];
