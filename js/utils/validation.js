const ValidationUtil = {
    // Check if string is empty or whitespace
    isEmpty(value) {
        return value === undefined || value === null || value.trim() === '';
    },

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate phone number format
    isValidPhone(phone) {
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        return phoneRegex.test(phone.replace(/[\s-]/g, ''));
    },

    // Validate driver's license number (basic format)
    isValidDriversLicense(license) {
        // Most driver's license numbers are 5-20 alphanumeric characters
        return /^[a-zA-Z0-9]{5,20}$/.test(license);
    },

    // Validate date format (YYYY-MM-DD)
    isValidDate(dateString) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;

        const date = new Date(dateString);
        return !isNaN(date.getTime());
    },

    // Check if date is in the future
    isFutureDate(dateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const date = new Date(dateString);
        return date >= today;
    },

    // Validate rental period (positive integer)
    isValidRentalPeriod(period) {
        return Number.isInteger(Number(period)) && Number(period) > 0;
    },
};

export default ValidationUtil;
