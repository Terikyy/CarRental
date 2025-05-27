<?php
// php/api/availability.php
// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// File paths
$carsFilePath = '../../data/cars.json';
$ordersFilePath = '../../data/orders.json';

// Check if files exist
if (!file_exists($carsFilePath) || !file_exists($ordersFilePath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Data files not found']);
    exit;
}

// Read and decode cars JSON file
$carsData = json_decode(file_get_contents($carsFilePath), true);
if ($carsData === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to parse car data']);
    exit;
}

// Read and decode orders JSON file
$ordersData = json_decode(file_get_contents($ordersFilePath), true);
if ($ordersData === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to parse order data']);
    exit;
}

// Get request method
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Handle GET request to check car availability
if ($requestMethod === 'GET') {
    if (!isset($_GET['vin'])) {
        http_response_code(400);
        echo json_encode(['error' => 'VIN parameter is required']);
        exit;
    }

    $vin = $_GET['vin'];
    $isAvailable = checkCarAvailability($vin, $carsData['cars']);

    echo json_encode([
        'vin' => $vin,
        'available' => $isAvailable
    ]);
}
// Handle POST request to update car availability
else if ($requestMethod === 'POST') {
    // Get JSON input
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    // Validate input
    if (!isset($input['vin']) || !isset($input['available'])) {
        http_response_code(400);
        echo json_encode(['error' => 'VIN and availability status are required']);
        exit;
    }

    $vin = $input['vin'];
    $available = $input['available'];

    // Update car availability
    $result = updateCarAvailability($vin, $available, $carsFilePath, $carsData);

    if ($result['success']) {
        echo json_encode(['success' => true, 'message' => 'Car availability updated successfully']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => $result['message']]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

// Helper functions

function checkCarAvailability($vin, $cars) {
    foreach ($cars as $car) {
        if ($car['vin'] === $vin) {
            return $car['available'];
        }
    }
    return false;
}

function updateCarAvailability($vin, $available, $filePath, $carsData) {
    $carFound = false;

    // Find and update the car
    foreach ($carsData['cars'] as &$car) {
        if ($car['vin'] === $vin) {
            $car['available'] = $available;
            $carFound = true;
            break;
        }
    }

    if (!$carFound) {
        return ['success' => false, 'message' => 'Car not found'];
    }

    // Save updated data
    $result = file_put_contents($filePath, json_encode($carsData, JSON_PRETTY_PRINT));

    if ($result === false) {
        return ['success' => false, 'message' => 'Failed to update car data'];
    }

    return ['success' => true];
}
?>
