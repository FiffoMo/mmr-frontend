<?php
// cron-trigger.php - Version PRODUCTION
// À placer dans le dossier public de votre site O2Switch

// Configuration PRODUCTION
$apiUrl = 'https://ma-maison-rapporte.com/api/cron/process-alerts';
$cronSecret = 'prod-super-secret-key-2025'; // CHANGEZ cette clé !

// Vérification que le script est appelé par cron (sécurité)
if (!empty($_SERVER['HTTP_HOST']) && php_sapi_name() !== 'cli') {
    http_response_code(403);
    die('Accès refusé - Script réservé au cron');
}

// Headers pour l'authentification
$headers = [
    'Content-Type: application/json',
    'x-cron-auth: true',
    'x-cron-secret: ' . $cronSecret,
    'User-Agent: O2Switch-Cron/1.0'
];

// Configuration cURL pour production
$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode([
        'source' => 'cron-php-production',
        'timestamp' => date('c')
    ]),
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_TIMEOUT => 300, // 5 minutes max
    CURLOPT_CONNECTTIMEOUT => 30,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_USERAGENT => 'O2Switch-Cron/1.0'
]);

// Exécuter la requête
$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
$error = curl_error($curl);
$info = curl_getinfo($curl);

curl_close($curl);

// Configuration des logs
$logFile = __DIR__ . '/cron-alerts.log';
$maxLogSize = 1024 * 1024; // 1MB max
$timestamp = date('Y-m-d H:i:s');

// Rotation des logs si trop volumineux
if (file_exists($logFile) && filesize($logFile) > $maxLogSize) {
    rename($logFile, $logFile . '.old');
}

// Gestion des erreurs
if ($error) {
    $logMessage = "[$timestamp] ERREUR CURL: $error (Code: $httpCode)\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
    
    // Email d'alerte critique (optionnel)
    if (function_exists('mail')) {
        mail(
            'contact@ma-maison-rapporte.com',
            'ALERTE: Erreur Cron Alertes',
            "Erreur lors de l'exécution du cron d'alertes:\n\n$error\n\nTimestamp: $timestamp",
            'From: no-reply@ma-maison-rapporte.com'
        );
    }
    
    exit(1);
}

if ($httpCode !== 200) {
    $logMessage = "[$timestamp] ERREUR HTTP $httpCode: " . substr($response, 0, 500) . "\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
    
    // Email d'alerte pour erreurs HTTP critiques
    if ($httpCode >= 500 && function_exists('mail')) {
        mail(
            'contact@ma-maison-rapporte.com',
            'ALERTE: Erreur HTTP Cron',
            "Erreur HTTP $httpCode lors du cron d'alertes:\n\n$response\n\nTimestamp: $timestamp",
            'From: no-reply@ma-maison-rapporte.com'
        );
    }
    
    exit(1);
}

// Succès - Parser la réponse
$result = json_decode($response, true);
if ($result) {
    $processed = $result['processed'] ?? 0;
    $newListings = $result['newListings'] ?? 0;
    $duration = $result['duration'] ?? 0;
    $errors = $result['errors'] ?? 0;
    
    $logMessage = "[$timestamp] SUCCÈS: $newListings nouvelles annonces, $processed traitées, $errors erreurs, {$duration}ms\n";
    
    // Log détaillé si des erreurs
    if ($errors > 0 && isset($result['details']['errorDetails'])) {
        $logMessage .= "         Détails erreurs: " . json_encode($result['details']['errorDetails']) . "\n";
    }
} else {
    $logMessage = "[$timestamp] SUCCÈS: Réponse reçue mais format inattendu\n";
}

file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);

// Output pour le cron (sera dans les logs cPanel si configuré)
echo "Cron alertes exécuté avec succès - $timestamp\n";
if (isset($processed, $newListings)) {
    echo "Résultat: $processed/$newListings annonces traitées\n";
}

exit(0);
?>