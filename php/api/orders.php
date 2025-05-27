<?php
// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

// File paths
$ordersFilePath = '../../data/orders.json';
$carsFilePath = '../../data/cars.json';

// Check if files exist
if (!file_exists($ordersFilePath) || !file_exists($carsFilePath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Data files not found']);
    exit;
}

// Read and decode orders JSON file
$ordersData = json_decode(file_get_contents($ordersFilePath), true);
if ($ordersData === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to parse order data']);
    exit;
}

// Read and decode cars JSON file
$carsData = json_decode(file_get_contents($carsFilePath), true);
if ($carsData === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to parse car data']);
    exit;
}

// Get request method
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Handle preflight OPTIONS request
if ($requestMethod === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Handle GET request to retrieve orders
if ($requestMethod === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : 'getAll';

    switch ($action) {
        case 'getAll':
            echo json_encode(['orders' => $ordersData['orders']]);
            break;

        case 'getByVin':
            if (!isset($_GET['vin'])) {
                http_response_code(400);
                echo json_encode(['error' => 'VIN parameter is required']);
                exit;
            }

            $vin = $_GET['vin'];
            $orders = getOrdersByVin($vin, $ordersData['orders']);
            echo json_encode(['orders' => $orders]);
            break;

        case 'getByEmail':
            if (!isset($_GET['email'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Email parameter is required']);
                exit;
            }

            $email = $_GET['email'];
            $orders = getOrdersByEmail($email, $ordersData['orders']);
            echo json_encode(['orders' => $orders]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
}
// Handle POST request to create a new order
else if ($requestMethod === 'POST') {
    // Get JSON input
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    // Validate input
    if (!validateOrderInput($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid order data']);
        exit;
    }

    // Check if car is available
    $vin = $input['car']['vin'];
    $isAvailable = checkCarAvailability($vin, $carsData['cars']);

    if (!$isAvailable) {
        http_response_code(409);
        echo json_encode(['error' => 'Car is not available for rental']);
        exit;
    }

    // Create new order with pending status
    $newOrder = [
        'customer' => $input['customer'],
        'car' => $input['car'],
        'rental' => [
            'startDate' => $input['rental']['startDate'],
            'rentalPeriod' => $input['rental']['rentalPeriod'],
            'totalPrice' => $input['rental']['totalPrice'],
            'orderDate' => date('Y-m-d'),
            'status' => 'pending'
        ]
    ];

    // Add order to orders data
    $ordersData['orders'][] = $newOrder;

    // Save updated orders data
    $result = file_put_contents($ordersFilePath, json_encode($ordersData, JSON_PRETTY_PRINT));

    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save order data']);
        exit;
    }

    // Update car availability
    updateCarAvailability($vin, false, $carsFilePath, $carsData);

    echo json_encode([
        'success' => true,
        'message' => 'Order created successfully',
        'order' => $newOrder
    ]);
}
// Handle PUT request to update order status
else if ($requestMethod === 'PUT') {
    // Get JSON input
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    // Validate input
    if (!isset($input['email']) || !isset($input['vin']) || !isset($input['status'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email, VIN and status are required']);
        exit;
    }

    $email = $input['email'];
    $vin = $input['vin'];
    $status = $input['status'];

    // Update order status
    $result = updateOrderStatus($email, $vin, $status, $ordersData, $ordersFilePath, $carsData, $carsFilePath);

    if ($result['success']) {
        echo json_encode([
            'success' => true,
            'message' => 'Order status updated successfully'
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => $result['message']]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

// Helper functions

function validateOrderInput($input) {
    // Check if all required fields are present
    if (!isset($input['customer']) || !isset($input['car']) || !isset($input['rental'])) {
        return false;
    }

    // Check customer data
    $customer = $input['customer'];
    if (!isset($customer['name']) || !isset($customer['phoneNumber']) ||
        !isset($customer['email']) || !isset($customer['driversLicenseNumber'])) {
        return false;
    }

    // Check car data
    if (!isset($input['car']['vin'])) {
        return false;
    }

    // Check rental data
    $rental = $input['rental'];
    if (!isset($rental['startDate']) || !isset($rental['rentalPeriod']) || !isset($rental['totalPrice'])) {
        return false;
    }

    return true;
}

function getOrdersByVin($vin, $orders) {
    return array_filter($orders, function($order) use ($vin) {
        return $order['car']['vin'] === $vin;
    });
}

function getOrdersByEmail($email, $orders) {
    return array_filter($orders, function($order) use ($email) {
        return $order['customer']['email'] === $email;
    });
}

function checkCarAvailability($vin, $cars) {
    foreach ($cars as $car) {
        if ($car['vin'] === $vin) {
            return $car['available'];
        }
    }
    return false;
}

function updateCarAvailability($vin, $available, $filePath, $carsData) {
    // Find and update the car
    foreach ($carsData['cars'] as &$car) {
        if ($car['vin'] === $vin) {
            $car['available'] = $available;
            break;
        }
    }

    // Save updated data
    file_put_contents($filePath, json_encode($carsData, JSON_PRETTY_PRINT));
}

function updateOrderStatus($email, $vin, $status, $ordersData, $ordersFilePath, $carsData, $carsFilePath) {
    $orderFound = false;

    // Find and update the order
    foreach ($ordersData['orders'] as &$order) {
        if ($order['car']['vin'] === $vin && $order['customer']['email'] === $email) {
            $order['rental']['status'] = $status;
            $orderFound = true;
            break;
        }
    }

    if (!$orderFound) {
        return ['success' => false, 'message' => 'Order not found'];
    }

    // Save updated orders data
    $result = file_put_contents($ordersFilePath, json_encode($ordersData, JSON_PRETTY_PRINT));

    if ($result === false) {
        return ['success' => false, 'message' => 'Failed to update order data'];
    }

    // If status is 'cancelled', make the car available again
    if ($status === 'cancelled') {
        foreach ($carsData['cars'] as &$car) {
            if ($car['vin'] === $vin) {
                $car['available'] = true;
                break;
            }
        }

        // Save updated cars data
        file_put_contents($carsFilePath, json_encode($carsData, JSON_PRETTY_PRINT));
    }

    return ['success' => true];
}
?>