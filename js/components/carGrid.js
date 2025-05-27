// js/components/carGrid.js
import CarService from '../api/carService.js';

const CarGrid = {
    gridElement: null,
    loadingElement: null,
    errorElement: null,
    noResultsElement: null,
    resultsCountElement: null,

    init() {
        this.gridElement = document.getElementById('car-grid');
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('error-message');
        this.noResultsElement = document.getElementById('no-results');
        this.resultsCountElement = document.getElementById('results-count');

        // Set retry button event listener
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadCars());
        }
    },

    async loadCars(filters = {}) {
        this.showLoading();

        try {
            const cars = await CarService.getCars(filters);
            this.renderCars(cars);
        } catch (error) {
            this.showError();
        }
    },

    async searchCars(keyword, filters = {}) {
        this.showLoading();

        try {
            const cars = await CarService.searchCars(keyword, filters);
            this.renderCars(cars);
        } catch (error) {
            this.showError();
        }
    },

    renderCars(cars) {
        this.hideLoading();
        this.hideError();

        if (!cars || cars.length === 0) {
            this.showNoResults();
            return;
        }

        this.hideNoResults();
        this.updateResultsCount(cars.length);

        // Clear existing cars
        this.gridElement.innerHTML = '';

        // Add each car to the grid
        cars.forEach(car => {
            const carCard = this.createCarCard(car);
            this.gridElement.appendChild(carCard);
        });
    },

    createCarCard(car) {
        const card = document.createElement('div');
        card.className = 'car-card';

        const isAvailable = car.available;

        card.innerHTML = `
      <div class="car-image">
        <img src="${car.image}" alt="${car.brand} ${car.carModel}">
        <div class="availability-badge ${isAvailable ? 'available' : 'unavailable'}">
          ${isAvailable ? 'Available' : 'Unavailable'}
        </div>
      </div>
      <div class="car-details">
        <div class="car-header">
          <div class="car-title">
            <div class="car-brand">${car.brand}</div>
            <div class="car-model">${car.carModel}</div>
            <div class="car-type">${car.carType}</div>
          </div>
          <div class="car-price">
            <span class="price-amount">$${car.pricePerDay}</span>
            <span class="price-period">per day</span>
          </div>
        </div>
        <div class="car-specs">
          <div class="spec-item">
            <span class="spec-label">Year:</span>
            <span class="spec-value">${car.yearOfManufacture}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Mileage:</span>
            <span class="spec-value">${car.mileage}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Fuel:</span>
            <span class="spec-value">${car.fuelType}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Seats:</span>
            <span class="spec-value">${car.seats}</span>
          </div>
        </div>
        <p class="car-description">${car.description}</p>
        <div class="car-actions">
          <a href="reservation.html?vin=${car.vin}" class="action-btn book-btn" ${!isAvailable ? 'disabled' : ''}>
            ${isAvailable ? 'Rent This Car' : 'Not Available'}
          </a>
        </div>
      </div>
    `;

        // Disable click event if car is unavailable
        const bookBtn = card.querySelector('.book-btn');
        if (!isAvailable) {
            bookBtn.addEventListener('click', e => e.preventDefault());
            bookBtn.style.opacity = '0.6';
            bookBtn.style.cursor = 'not-allowed';
            bookBtn.style.background = '#999';
        }

        return card;
    },

    showLoading() {
        this.gridElement.innerHTML = '';
        this.loadingElement.classList.remove('hidden');
        this.errorElement.classList.add('hidden');
        this.noResultsElement.classList.add('hidden');
    },

    hideLoading() {
        this.loadingElement.classList.add('hidden');
    },

    showError() {
        this.hideLoading();
        this.errorElement.classList.remove('hidden');
        this.gridElement.innerHTML = '';
    },

    hideError() {
        this.errorElement.classList.add('hidden');
    },

    showNoResults() {
        this.noResultsElement.classList.remove('hidden');
        this.updateResultsCount(0);
    },

    hideNoResults() {
        this.noResultsElement.classList.add('hidden');
    },

    updateResultsCount(count) {
        this.resultsCountElement.textContent = `${count} car${count !== 1 ? 's' : ''} found`;
    }
};

export default CarGrid;
