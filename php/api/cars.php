<?php
// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Define file path
$jsonFilePath = '../../data/cars.json';

// Check if the file exists
if (!file_exists($jsonFilePath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Car data file not found']);
    exit;
}

// Read and decode JSON file
$jsonData = file_get_contents($jsonFilePath);
$carsData = json_decode($jsonData, true);

// Check if decoding was successful
if ($carsData === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to parse car data']);
    exit;
}

// Get the request method
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Handle only GET requests
if ($requestMethod !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get all cars
$cars = $carsData['cars'];

// Handle specific operations based on query parameters
$action = isset($_GET['action']) ? $_GET['action'] : 'getAll';

switch ($action) {
    case 'getAll':
        // Return all cars, optionally filtered
        $filteredCars = filterCars($cars);
        echo json_encode(['cars' => $filteredCars]);
        break;

    case 'getById':
        // Return a specific car by VIN
        if (!isset($_GET['vin'])) {
            http_response_code(400);
            echo json_encode(['error' => 'VIN parameter is required']);
            exit;
        }

        $vin = $_GET['vin'];
        $car = findCarByVin($cars, $vin);

        if ($car) {
            echo json_encode(['car' => $car]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Car not found']);
        }
        break;

    case 'search':
        // Search cars by keyword
        if (!isset($_GET['keyword'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Keyword parameter is required']);
            exit;
        }

        $keyword = strtolower($_GET['keyword']);
        $searchResults = searchCars($cars, $keyword);
        $filteredResults = filterCars($searchResults);

        echo json_encode(['cars' => $filteredResults]);
        break;

    case 'getSuggestions':
        // Get search suggestions based on keyword
        if (!isset($_GET['keyword'])) {
            echo json_encode(['suggestions' => []]);
            exit;
        }

        $keyword = strtolower($_GET['keyword']);
        $suggestions = getSearchSuggestions($cars, $keyword);

        echo json_encode(['suggestions' => $suggestions]);
        break;

    case 'getFilters':
        // Get available filter options
        $filters = getFilterOptions($cars);
        echo json_encode($filters);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}

// Helper functions

// Update filterCars function in php/api/cars.php
function filterCars($cars) {
    $filteredCars = $cars;

    // Filter by car type
    if (isset($_GET['carType']) && is_array($_GET['carType'])) {
        $carTypes = $_GET['carType'];
        $filteredCars = array_filter($filteredCars, function($car) use ($carTypes) {
            return in_array($car['carType'], $carTypes);
        });
    } else if (isset($_GET['carType']) && $_GET['carType'] !== '') {
        $carType = $_GET['carType'];
        $filteredCars = array_filter($filteredCars, function($car) use ($carType) {
            return $car['carType'] === $carType;
        });
    }

    // Filter by brand
    if (isset($_GET['brand']) && is_array($_GET['brand'])) {
        $brands = $_GET['brand'];
        $filteredCars = array_filter($filteredCars, function($car) use ($brands) {
            return in_array($car['brand'], $brands);
        });
    } else if (isset($_GET['brand']) && $_GET['brand'] !== '') {
        $brand = $_GET['brand'];
        $filteredCars = array_filter($filteredCars, function($car) use ($brand) {
            return $car['brand'] === $brand;
        });
    }

    // Filter by price range
    if (isset($_GET['priceRange']) && is_array($_GET['priceRange'])) {
        $priceRanges = $_GET['priceRange'];
        $filteredCars = array_filter($filteredCars, function($car) use ($priceRanges) {
            $price = (float)$car['pricePerDay'];

            foreach ($priceRanges as $range) {
                switch ($range) {
                    case '0-50':
                        if ($price >= 0 && $price <= 50) return true;
                        break;
                    case '51-100':
                        if ($price > 50 && $price <= 100) return true;
                        break;
                    case '101-150':
                        if ($price > 100 && $price <= 150) return true;
                        break;
                    case '151+':
                        if ($price > 150) return true;
                        break;
                }
            }
            return false;
        });
    } else if (isset($_GET['priceRange']) && $_GET['priceRange'] !== '') {
        $priceRange = $_GET['priceRange'];
        $filteredCars = array_filter($filteredCars, function($car) use ($priceRange) {
            $price = (float)$car['pricePerDay'];

            switch ($priceRange) {
                case '0-50':
                    return $price >= 0 && $price <= 50;
                case '51-100':
                    return $price > 50 && $price <= 100;
                case '101-150':
                    return $price > 100 && $price <= 150;
                case '151+':
                    return $price > 150;
                default:
                    return true;
            }
        });
    }

    // Filter by availability
    if (isset($_GET['available']) && $_GET['available'] !== '') {
        $available = $_GET['available'] === 'true';
        $filteredCars = array_filter($filteredCars, function($car) use ($available) {
            return $car['available'] === $available;
        });
    }

    return array_values($filteredCars); // Reset array keys
}

function findCarByVin($cars, $vin) {
    foreach ($cars as $car) {
        if ($car['vin'] === $vin) {
            return $car;
        }
    }
    return null;
}

function searchCars($cars, $keyword) {
    return array_filter($cars, function($car) use ($keyword) {
        // Search in multiple fields
        $searchableFields = [
            strtolower($car['carType']),
            strtolower($car['brand']),
            strtolower($car['carModel']),
            strtolower($car['description'])
        ];

        foreach ($searchableFields as $field) {
            if (strpos($field, $keyword) !== false) {
                return true;
            }
        }

        return false;
    });
}

function getSearchSuggestions($cars, $keyword) {
    if (empty($keyword)) {
        return [];
    }

    $suggestions = [];
    $types = [];
    $brands = [];
    $models = [];

    foreach ($cars as $car) {
        // Get car type suggestions
        if (strpos(strtolower($car['carType']), $keyword) !== false) {
            $types[$car['carType']] = true;
        }

        // Get brand suggestions
        if (strpos(strtolower($car['brand']), $keyword) !== false) {
            $brands[$car['brand']] = true;
        }

        // Get model suggestions
        if (strpos(strtolower($car['carModel']), $keyword) !== false) {
            $models[$car['brand'] . ' ' . $car['carModel']] = true;
        }
    }

    // Combine suggestions
    foreach (array_keys($types) as $type) {
        $suggestions[] = ['type' => 'carType', 'value' => $type];
    }

    foreach (array_keys($brands) as $brand) {
        $suggestions[] = ['type' => 'brand', 'value' => $brand];
    }

    foreach (array_keys($models) as $model) {
        $suggestions[] = ['type' => 'model', 'value' => $model];
    }

    // Limit suggestions to a reasonable number
    return array_slice($suggestions, 0, 5);
}

function getFilterOptions($cars) {
    $carTypes = [];
    $brands = [];

    foreach ($cars as $car) {
        $carTypes[$car['carType']] = true;
        $brands[$car['brand']] = true;
    }

    return [
        'carTypes' => array_keys($carTypes),
        'brands' => array_keys($brands)
    ];
}
?>

