// js/reservation.js
import StorageUtil from './utils/storage.js';
import ValidationUtil from './utils/validation.js';
import CarService from './api/carService.js';
import OrderService from './api/orderService.js';

document.addEventListener('DOMContentLoaded', async () => {
    // DOM elements
    const reservationCard = document.getElementById('reservation-card');
    const noCarMessage = document.getElementById('no-car-message');
    const carUnavailable = document.getElementById('car-unavailable');
    const orderSuccess = document.getElementById('order-success');
    const orderError = document.getElementById('order-error');

    // Form elements
    const form = document.getElementById('reservation-form');
    const customerName = document.getElementById('customer-name');
    const customerPhone = document.getElementById('customer-phone');
    const customerEmail = document.getElementById('customer-email');
    const customerLicense = document.getElementById('customer-license');
    const rentalStart = document.getElementById('rental-start');
    const rentalPeriod = document.getElementById('rental-period');
    const dailyRate = document.getElementById('daily-rate');
    const daysCount = document.getElementById('days-count');
    const totalPrice = document.getElementById('total-price');
    const submitBtn = document.getElementById('submit-reservation-btn');
    const clearFormBtn = document.getElementById('clear-form-btn');

    // Car details elements
    const carImage = document.getElementById('car-image');
    const carTitle = document.getElementById('car-title');
    const carType = document.getElementById('car-type');
    const carYear = document.getElementById('car-year');
    const carMileage = document.getElementById('car-mileage');
    const carFuel = document.getElementById('car-fuel');
    const carSeats = document.getElementById('car-seats');
    const carPrice = document.getElementById('car-price');
    const carDescriptionText = document.getElementById('car-description-text');

    // Validation message elements
    const nameValidation = document.getElementById('name-validation');
    const phoneValidation = document.getElementById('phone-validation');
    const emailValidation = document.getElementById('email-validation');
    const licenseValidation = document.getElementById('license-validation');
    const startDateValidation = document.getElementById('start-date-validation');
    const periodValidation = document.getElementById('rental-period-validation');

    // Selected car data
    let selectedCar = null;

    // Flag to track if reservation was completed
    let reservationCompleted = false;
    // Flag to track if cancel was clicked
    let cancelClicked = false;

    // Find the cancel button in the header
    const cancelButton = document.querySelector('.cancel-button');

    // Add event listener to clear data when canceling
    cancelButton.addEventListener('click', () => {
        // Set the flag to indicate cancel was clicked
        cancelClicked = true;

        // Clear saved form data and selected car
        StorageUtil.remove('reservationFormData');
        StorageUtil.remove('selectedCarVin');

        // Allow the normal navigation to continue
    });

    // Initialize page
    initializePage();

    // Attach event listeners
    form.addEventListener('submit', handleFormSubmit);
    clearFormBtn.addEventListener('click', clearForm);

    // Validation event listeners
    customerName.addEventListener('input', validateName);
    customerPhone.addEventListener('input', validatePhone);
    customerEmail.addEventListener('input', validateEmail);
    customerLicense.addEventListener('input', validateLicense);
    rentalStart.addEventListener('change', validateStartDate);
    rentalPeriod.addEventListener('input', validateRentalPeriod);
    rentalPeriod.addEventListener('input', updateTotalPrice);

    // Save form data when user leaves page
    window.addEventListener('beforeunload', saveFormData);

    // Functions
    async function initializePage() {
        // Get selected car VIN from localStorage
        const selectedCarVin = StorageUtil.get('selectedCarVin');

        if (!selectedCarVin) {
            // No car selected
            showNoCarMessage();
            return;
        }

        try {
            // Get car details from API
            const car = await CarService.getCarByVin(selectedCarVin);

            if (!car) {
                showNoCarMessage();
                return;
            }

            if (!car.available) {
                showCarUnavailable();
                return;
            }

            // Car is available, show reservation form
            selectedCar = car;
            populateCarDetails();
            setupDateConstraints();
            loadSavedFormData();
            showReservationForm();
            updateTotalPrice();
        } catch (error) {
            console.error('Error loading car details:', error);
            showOrderError('Failed to load car details. Please try again.');
        }
    }

    function showNoCarMessage() {
        noCarMessage.classList.remove('hidden');
        reservationCard.classList.add('hidden');
        carUnavailable.classList.add('hidden');
        orderSuccess.classList.add('hidden');
        orderError.classList.add('hidden');
    }

    function showCarUnavailable() {
        carUnavailable.classList.remove('hidden');
        reservationCard.classList.add('hidden');
        noCarMessage.classList.add('hidden');
        orderSuccess.classList.add('hidden');
        orderError.classList.add('hidden');
    }

    function showReservationForm() {
        reservationCard.classList.remove('hidden');
        noCarMessage.classList.add('hidden');
        carUnavailable.classList.add('hidden');
        orderSuccess.classList.add('hidden');
        orderError.classList.add('hidden');
    }

    function showOrderSuccess() {
        orderSuccess.classList.remove('hidden');
        reservationCard.classList.add('hidden');
        noCarMessage.classList.add('hidden');
        carUnavailable.classList.add('hidden');
        orderError.classList.add('hidden');

        // Update success message details
        document.getElementById('confirm-email').textContent = customerEmail.value;
        document.getElementById('confirm-date').textContent = rentalStart.value;
        document.getElementById('confirm-days').textContent = rentalPeriod.value;
    }

    function showOrderError(message) {
        orderError.classList.remove('hidden');
        document.getElementById('error-message-text').textContent = message;
        reservationCard.classList.add('hidden');
        noCarMessage.classList.add('hidden');
        carUnavailable.classList.add('hidden');
        orderSuccess.classList.add('hidden');
    }

    function populateCarDetails() {
        carImage.src = selectedCar.image;
        carImage.alt = `${selectedCar.brand} ${selectedCar.carModel}`;
        carTitle.textContent = `${selectedCar.brand} ${selectedCar.carModel}`;
        carType.textContent = selectedCar.carType;
        carYear.textContent = selectedCar.yearOfManufacture;
        carMileage.textContent = selectedCar.mileage;
        carFuel.textContent = selectedCar.fuelType;
        carSeats.textContent = selectedCar.seats || 'N/A';
        carPrice.textContent = `$${selectedCar.pricePerDay}/day`;
        carDescriptionText.textContent = selectedCar.description;

        // Set daily rate for price calculation
        dailyRate.textContent = `$${selectedCar.pricePerDay}`;
    }

    function setupDateConstraints() {
        // Set min date to today
        const today = new Date();
        rentalStart.min = today.toISOString().split('T')[0];

        // Default to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        rentalStart.value = tomorrow.toISOString().split('T')[0];
    }

    function loadSavedFormData() {
        const savedData = StorageUtil.get('reservationFormData');
        if (!savedData) return;

        // Populate form with saved data
        if (savedData.name) customerName.value = savedData.name;
        if (savedData.phone) customerPhone.value = savedData.phone;
        if (savedData.email) customerEmail.value = savedData.email;
        if (savedData.license) customerLicense.value = savedData.license;
        if (savedData.period) rentalPeriod.value = savedData.period;
    }

    function saveFormData() {
        // Don't save if reservation was completed
        if (reservationCompleted || cancelClicked) return;

        // Only save if user has entered something
        if (customerName.value || customerPhone.value || customerEmail.value ||
            customerLicense.value || rentalPeriod.value !== '1') {

            StorageUtil.save('reservationFormData', {
                name: customerName.value,
                phone: customerPhone.value,
                email: customerEmail.value,
                license: customerLicense.value,
                period: rentalPeriod.value
            });
        }
    }

    function clearForm() {
        form.reset();
        setupDateConstraints();
        updateTotalPrice();
        clearValidationMessages();
        StorageUtil.remove('reservationFormData');
    }

    function clearValidationMessages() {
        nameValidation.textContent = '';
        phoneValidation.textContent = '';
        emailValidation.textContent = '';
        licenseValidation.textContent = '';
        startDateValidation.textContent = '';
        periodValidation.textContent = '';
    }

    function updateTotalPrice() {
        const days = parseInt(rentalPeriod.value) || 0;
        const rate = parseFloat(selectedCar.pricePerDay) || 0;
        const total = days * rate;

        daysCount.textContent = days;
        totalPrice.textContent = `$${total.toFixed(2)}`;

        validateForm();
    }

    // Validation functions
    function validateName() {
        if (ValidationUtil.isEmpty(customerName.value)) {
            nameValidation.textContent = 'Name is required';
            return false;
        }
        nameValidation.textContent = '';
        validateForm();
        return true;
    }

    function validatePhone() {
        if (ValidationUtil.isEmpty(customerPhone.value)) {
            phoneValidation.textContent = 'Phone number is required';
            return false;
        }
        if (!ValidationUtil.isValidPhone(customerPhone.value)) {
            phoneValidation.textContent = 'Please enter a valid phone number';
            return false;
        }
        phoneValidation.textContent = '';
        validateForm();
        return true;
    }

    function validateEmail() {
        if (ValidationUtil.isEmpty(customerEmail.value)) {
            emailValidation.textContent = 'Email is required';
            return false;
        }
        if (!ValidationUtil.isValidEmail(customerEmail.value)) {
            emailValidation.textContent = 'Please enter a valid email address';
            return false;
        }
        emailValidation.textContent = '';
        validateForm();
        return true;
    }

    function validateLicense() {
        if (ValidationUtil.isEmpty(customerLicense.value)) {
            licenseValidation.textContent = 'Driver\'s license is required';
            return false;
        }
        if (!ValidationUtil.isValidDriversLicense(customerLicense.value)) {
            licenseValidation.textContent = 'Please enter a valid driver\'s license number';
            return false;
        }
        licenseValidation.textContent = '';
        validateForm();
        return true;
    }

    function validateStartDate() {
        if (ValidationUtil.isEmpty(rentalStart.value)) {
            startDateValidation.textContent = 'Start date is required';
            return false;
        }
        if (!ValidationUtil.isValidDate(rentalStart.value)) {
            startDateValidation.textContent = 'Please enter a valid date';
            return false;
        }
        if (!ValidationUtil.isFutureDate(rentalStart.value)) {
            startDateValidation.textContent = 'Start date must be in the future';
            return false;
        }
        startDateValidation.textContent = '';
        validateForm();
        return true;
    }

    function validateRentalPeriod() {
        if (ValidationUtil.isEmpty(rentalPeriod.value)) {
            periodValidation.textContent = 'Rental period is required';
            return false;
        }
        if (!ValidationUtil.isValidRentalPeriod(rentalPeriod.value)) {
            periodValidation.textContent = 'Please enter a valid rental period';
            return false;
        }
        periodValidation.textContent = '';
        validateForm();
        return true;
    }

    function validateForm() {
        // Enable submit button only if all validations pass
        const isValid =
            !ValidationUtil.isEmpty(customerName.value) &&
            !ValidationUtil.isEmpty(customerPhone.value) && ValidationUtil.isValidPhone(customerPhone.value) &&
            !ValidationUtil.isEmpty(customerEmail.value) && ValidationUtil.isValidEmail(customerEmail.value) &&
            !ValidationUtil.isEmpty(customerLicense.value) && ValidationUtil.isValidDriversLicense(customerLicense.value) &&
            !ValidationUtil.isEmpty(rentalStart.value) && ValidationUtil.isFutureDate(rentalStart.value) &&
            !ValidationUtil.isEmpty(rentalPeriod.value) && ValidationUtil.isValidRentalPeriod(rentalPeriod.value);

        submitBtn.disabled = !isValid;
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        if (submitBtn.disabled) return;

        try {
            // First check if the car is still available
            const latestCarData = await CarService.getCarByVin(selectedCar.vin);

            if (!latestCarData || !latestCarData.available) {
                showOrderError('Sorry, this car is no longer available for rental. Please select another car.');
                return;
            }

            // Create order object
            const orderData = {
                car: {
                    vin: selectedCar.vin,
                    brand: selectedCar.brand,
                    model: selectedCar.carModel  // Correctly using carModel from the JSON
                },
                customer: {
                    name: customerName.value,
                    phoneNumber: customerPhone.value,  // Adjusted to match API expectations
                    email: customerEmail.value,
                    driversLicenseNumber: customerLicense.value  // Adjusted to match API expectations
                },
                rental: {
                    startDate: rentalStart.value,
                    rentalPeriod: parseInt(rentalPeriod.value),
                    totalPrice: parseFloat(totalPrice.textContent.replace('$', ''))
                }
            };

            // Submit order to API
            const response = await OrderService.createOrder(orderData);

            if (response.success) {
                // Set the flag to prevent re-saving
                reservationCompleted = true;

                // Clear saved form data and selected car
                StorageUtil.remove('reservationFormData');
                StorageUtil.remove('selectedCarVin');
                showOrderSuccess();
            } else {
                showOrderError(response.error || 'Failed to create reservation');
            }
        } catch (error) {
            console.error('Error submitting reservation:', error);
            showOrderError('An error occurred. Please try again later.');
        }
    }
});