# CarRental

A simple car rental management application that allows users to browse, search, and reserve cars, with a JavaScript frontend and a PHP backend using JSON flat files for persistence.

A demo can be temporarily found at [CarRental Demo](http://rentn.us-east-1.elasticbeanstalk.com/).

---

## Features

- **Browse & Filter Cars**: View available cars and filter by type, brand, price range, and availability.
- **Search**: Keyword search with live suggestions.
- **Car Details**: View detailed information for each car (by VIN).
- **Reservations**: Create new rental orders, update order status, and view past reservations by email.
- **Availability Management**: Check and update car availability.
- **Frontend-Backend Separation**: Modern frontend (JS, CSS) interacts via RESTful PHP APIs.

---

## Tech Stack

- **Frontend**:
    - Vanilla JavaScript (modular, with components)
    - CSS (organized by base, components, layout)
    - HTML (index.html, reservation.html)
- **Backend**:
    - PHP (API endpoints)
    - JSON files (persistent storage for car and order data)
- **Other**:
    - Composer (for PHP dependencies, if needed)
    - Procfile (for deployment on platforms like Heroku)

---

## Project Structure

```
CarRental/
├── css/
│   ├── base/
│   │   ├── reset.css
│   │   └── variables.css
│   ├── components/
│   │   ├── car-tile.css
│   │   ├── header.css
│   │   └── sidebar.css
│   ├── layout/
│   │   └── container.css
│   ├── index.css
│   └── reservation.css
├── data/
│   ├── cars.json
│   └── orders.json
├── images/
├── js/
│   ├── api/
│   │   ├── carService.js
│   │   └── orderService.js
│   ├── components/
│   │   ├── carGrid.js
│   │   ├── filters.js
│   │   └── searchBar.js
│   ├── utils/
│   ├── main.js
│   └── reservation.js
├── php/
│   └── api/
│       ├── availability.php
│       ├── cars.php
│       └── orders.php
├── index.html
├── reservation.html
├── composer.json
├── Procfile
└── README.md
```

---

## API Overview

### Car API (`php/api/cars.php`)
- `GET` all cars: `/php/api/cars.php`
- `GET` by VIN: `/php/api/cars.php?action=getById&vin=VIN`
- `GET` search: `/php/api/cars.php?action=search&keyword=KEYWORD`
- `GET` suggestions: `/php/api/cars.php?action=getSuggestions&keyword=KEYWORD`
- `GET` filter options: `/php/api/cars.php?action=getFilters`
- **Filtering**: Pass filter params as query (e.g., `carType[]`, `brand[]`, `priceRange[]`, `available`)

### Availability API (`php/api/availability.php`)
- `GET` check availability: `/php/api/availability.php?vin=VIN`
- `POST` update availability: `/php/api/availability.php` (JSON body: `{ vin, available }`)

### Orders API (`php/api/orders.php`)
- `GET` all orders: `/php/api/orders.php`
- `GET` by VIN: `/php/api/orders.php?action=getByVin&vin=VIN`
- `GET` by email: `/php/api/orders.php?action=getByEmail&email=EMAIL`
- `POST` create order: `/php/api/orders.php` (JSON body: `{ customer, car, rental }`)
- `PUT` update order: `/php/api/orders.php` (JSON body: `{ email, vin, status }`)

---

## Getting Started

1. **Clone the repository**
2. **Backend**: Deploy the `php/` folder to a PHP-enabled web server.
3. **Data**: Ensure `data/cars.json` and `data/orders.json` exist and are writable.
4. **Frontend**: Open `index.html` or `reservation.html` in your browser, served by a web server (or use Live Server).
5. **Configuration**: If deploying, check your server supports CORS and PHP file permissions.

---

## Example Usage

- **Browse cars**: Visit the main page and filter or search cars.
- **Reserve a car**: Submit the reservation form; order is created and car availability is updated.
- **Admin/Support**: Query, update, or manage orders and cars using the API endpoints.

---

## Notes

- **Demo/Education**: This project is for demonstration and learning. Flat-file JSON storage is not secure or scalable for production.
- **Authentication**: No user authentication is provided.
- **Deployment**: The included `Procfile` is intended for use with platforms like Heroku.
