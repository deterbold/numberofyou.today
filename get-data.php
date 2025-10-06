<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Data file path
$dataFile = 'data/sessions.json';

// Check if data file exists
if (!file_exists($dataFile)) {
    echo json_encode([
        'totalSessions' => 0,
        'sessions' => [],
        'lastUpdated' => null,
        'aggregated' => [
            'byDay' => [],
            'byHour' => [],
            'byMood' => [],
            'byAge' => [],
            'sentimentStats' => []
        ]
    ]);
    exit;
}

// Load data
$jsonData = file_get_contents($dataFile);
$data = json_decode($jsonData, true);

if (!$data || !isset($data['sessions'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid data format']);
    exit;
}

$sessions = $data['sessions'];

// Optional: Filter by date range if provided
$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;

if ($startDate || $endDate) {
    $sessions = array_filter($sessions, function($session) use ($startDate, $endDate) {
        $sessionDate = strtotime($session['timestamp']);
        
        if ($startDate && $sessionDate < strtotime($startDate)) {
            return false;
        }
        
        if ($endDate && $sessionDate > strtotime($endDate . ' 23:59:59')) {
            return false;
        }
        
        return true;
    });
    
    // Reindex array
    $sessions = array_values($sessions);
}

// Aggregate data for analytics
$aggregated = [
    'byDay' => [],
    'byHour' => [],
    'byMood' => [],
    'byAge' => [],
    'byGender' => [],
    'byHumor' => [],
    'sentimentStats' => [],
    'colorStats' => [],
    'dataCompletenessStats' => []
];

// Process sessions for aggregation
foreach ($sessions as $session) {
    $timestamp = strtotime($session['timestamp']);
    $date = date('Y-m-d', $timestamp);
    $hour = (int)date('H', $timestamp);
    
    // By day
    if (!isset($aggregated['byDay'][$date])) {
        $aggregated['byDay'][$date] = [
            'date' => $date,
            'count' => 0,
            'avgRandomNumber' => 0,
            'avgSentiment' => 0,
            'numbers' => []
        ];
    }
    $aggregated['byDay'][$date]['count']++;
    $aggregated['byDay'][$date]['numbers'][] = $session['randomNumber'] ?? 0;
    
    // By hour
    if (!isset($aggregated['byHour'][$hour])) {
        $aggregated['byHour'][$hour] = 0;
    }
    $aggregated['byHour'][$hour]++;
    
    // By mood
    if (isset($session['mood']) && $session['mood']) {
        if (!isset($aggregated['byMood'][$session['mood']])) {
            $aggregated['byMood'][$session['mood']] = 0;
        }
        $aggregated['byMood'][$session['mood']]++;
    }
    
    // By age groups
    if (isset($session['age']) && $session['age'] > 0) {
        $ageGroup = '';
        $age = $session['age'];
        if ($age <= 20) $ageGroup = '0-20';
        elseif ($age <= 30) $ageGroup = '21-30';
        elseif ($age <= 40) $ageGroup = '31-40';
        elseif ($age <= 50) $ageGroup = '41-50';
        elseif ($age <= 60) $ageGroup = '51-60';
        else $ageGroup = '60+';
        
        if (!isset($aggregated['byAge'][$ageGroup])) {
            $aggregated['byAge'][$ageGroup] = 0;
        }
        $aggregated['byAge'][$ageGroup]++;
    }
    
    // By gender
    if (isset($session['gender']) && $session['gender']) {
        if (!isset($aggregated['byGender'][$session['gender']])) {
            $aggregated['byGender'][$session['gender']] = 0;
        }
        $aggregated['byGender'][$session['gender']]++;
    }
    
    // By humor type
    if (isset($session['humor']) && $session['humor']) {
        if (!isset($aggregated['byHumor'][$session['humor']])) {
            $aggregated['byHumor'][$session['humor']] = 0;
        }
        $aggregated['byHumor'][$session['humor']]++;
    }
    
    // Sentiment statistics
    if (isset($session['sentimentScore']) && is_numeric($session['sentimentScore'])) {
        $score = (float)$session['sentimentScore'];
        $range = '';
        if ($score < 0.2) $range = 'very_negative';
        elseif ($score < 0.4) $range = 'negative';
        elseif ($score < 0.6) $range = 'neutral';
        elseif ($score < 0.8) $range = 'positive';
        else $range = 'very_positive';
        
        if (!isset($aggregated['sentimentStats'][$range])) {
            $aggregated['sentimentStats'][$range] = 0;
        }
        $aggregated['sentimentStats'][$range]++;
    }
    
    // Color statistics
    if (isset($session['colorRGB'])) {
        $colorKey = sprintf('%d,%d,%d', 
            $session['colorRGB']['red'] ?? 0,
            $session['colorRGB']['green'] ?? 0,
            $session['colorRGB']['blue'] ?? 0
        );
        
        if (!isset($aggregated['colorStats'][$colorKey])) {
            $aggregated['colorStats'][$colorKey] = [
                'rgb' => $session['colorRGB'],
                'count' => 0
            ];
        }
        $aggregated['colorStats'][$colorKey]['count']++;
    }
    
    // Data completeness statistics
    if (isset($session['dataCompleteness'])) {
        $completeness = $session['dataCompleteness'];
        $cameraOk = $completeness['camera'] ?? false;
        $voiceOk = $completeness['voice'] ?? false;
        $locationOk = $completeness['location'] ?? false;
        
        $completeCount = ($cameraOk ? 1 : 0) + ($voiceOk ? 1 : 0) + ($locationOk ? 1 : 0);
        $key = $completeCount . '_of_3';
        
        if (!isset($aggregated['dataCompletenessStats'][$key])) {
            $aggregated['dataCompletenessStats'][$key] = 0;
        }
        $aggregated['dataCompletenessStats'][$key]++;
    }
}

// Calculate averages for daily data
foreach ($aggregated['byDay'] as &$dayData) {
    if ($dayData['count'] > 0) {
        $dayData['avgRandomNumber'] = array_sum($dayData['numbers']) / count($dayData['numbers']);
    }
    unset($dayData['numbers']); // Remove the raw numbers array
}

// Convert associative arrays to indexed arrays for easier frontend consumption
$aggregated['byDay'] = array_values($aggregated['byDay']);

// Sort daily data by date
usort($aggregated['byDay'], function($a, $b) {
    return strcmp($a['date'], $b['date']);
});

// Calculate overall statistics
$totalSessions = count($sessions);
$avgRandomNumber = 0;
$avgAge = 0;
$avgSentiment = 0;

if ($totalSessions > 0) {
    $randomNumbers = array_filter(array_column($sessions, 'randomNumber'), function($n) { return is_numeric($n); });
    $ages = array_filter(array_column($sessions, 'age'), function($a) { return is_numeric($a) && $a > 0; });
    $sentiments = array_filter(array_column($sessions, 'sentimentScore'), function($s) { return is_numeric($s); });
    
    $avgRandomNumber = count($randomNumbers) > 0 ? array_sum($randomNumbers) / count($randomNumbers) : 0;
    $avgAge = count($ages) > 0 ? array_sum($ages) / count($ages) : 0;
    $avgSentiment = count($sentiments) > 0 ? array_sum($sentiments) / count($sentiments) : 0;
}

// Prepare response
$response = [
    'success' => true,
    'totalSessions' => $totalSessions,
    'lastUpdated' => $data['lastUpdated'] ?? null,
    'dateRange' => [
        'start' => $startDate,
        'end' => $endDate
    ],
    'overallStats' => [
        'avgRandomNumber' => round($avgRandomNumber, 2),
        'avgAge' => round($avgAge, 1),
        'avgSentiment' => round($avgSentiment, 3)
    ],
    'sessions' => $sessions,
    'aggregated' => $aggregated
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>