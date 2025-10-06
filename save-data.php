<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Data file path
$dataFile = 'data/sessions.json';
$dataDir = 'data';

// Create data directory if it doesn't exist
if (!file_exists($dataDir)) {
    if (!mkdir($dataDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not create data directory']);
        exit;
    }
}

// Add timestamp and unique ID if not present
if (!isset($data['timestamp'])) {
    $data['timestamp'] = date('c'); // ISO 8601 format
}
if (!isset($data['id'])) {
    $data['id'] = uniqid('session_', true);
}

// Load existing data
$sessions = [];
if (file_exists($dataFile)) {
    $existingData = file_get_contents($dataFile);
    $decoded = json_decode($existingData, true);
    if ($decoded && isset($decoded['sessions'])) {
        $sessions = $decoded['sessions'];
    }
}

// Add new session
$sessions[] = $data;

// Prepare data structure
$allData = [
    'lastUpdated' => date('c'),
    'totalSessions' => count($sessions),
    'sessions' => $sessions
];

// Save to file with proper error handling
$jsonData = json_encode($allData, JSON_PRETTY_PRINT);
if ($jsonData === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to encode data']);
    exit;
}

// Use file locking to prevent corruption
$lockFile = $dataFile . '.lock';
$lockHandle = fopen($lockFile, 'w');
if (!$lockHandle || !flock($lockHandle, LOCK_EX)) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not acquire file lock']);
    exit;
}

$result = file_put_contents($dataFile, $jsonData, LOCK_EX);

// Release lock
flock($lockHandle, LOCK_UN);
fclose($lockHandle);
unlink($lockFile);

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save data']);
    exit;
}

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Data saved successfully',
    'sessionId' => $data['id'],
    'totalSessions' => count($sessions)
]);
?>