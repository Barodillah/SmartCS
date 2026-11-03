<?php
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'status' => true,
    'message' => 'SmartCS API Engine Active',
    'timestamp' => date('c')
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

