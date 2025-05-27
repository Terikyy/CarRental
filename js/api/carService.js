// js/api/carService.js
const API_BASE_URL = 'php/api';

const CarService = {
    // Get all cars with optional filters
    async getCars(filters = {}) {
        const queryParams = new URLSearchParams();

        // Add filters to query params
        if (filters.carType && filters.carType.length > 0) {
            filters.carType.forEach(type => {
                queryParams.append('carType[]', type);
            });
        }

        if (filters.brand && filters.brand.length > 0) {
            filters.brand.forEach(brand => {
                queryParams.append('brand[]', brand);
            });
        }

        if (filters.priceRange && filters.priceRange.length > 0) {
            filters.priceRange.forEach(range => {
                queryParams.append('priceRange[]', range);
            });
        }

        if (filters.available) {
            queryParams.append('available', filters.available);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cars.php?${queryParams}`);
            if (!response.ok) throw new Error('Failed to fetch cars');
            const data = await response.json();
            return data.cars;
        } catch (error) {
            console.error('Error fetching cars:', error);
            throw error;
        }
    },

    // Get car by VIN
    async getCarByVin(vin) {
        try {
            const response = await fetch(`${API_BASE_URL}/cars.php?action=getById&vin=${vin}`);
            if (!response.ok) throw new Error('Failed to fetch car details');
            const data = await response.json();
            return data.car;
        } catch (error) {
            console.error('Error fetching car details:', error);
            throw error;
        }
    },

    // Search cars by keyword
    // Also update searchCars method
    async searchCars(keyword, filters = {}) {
        const queryParams = new URLSearchParams();
        queryParams.append('action', 'search');
        queryParams.append('keyword', keyword);

        // Add filters
        if (filters.carType && filters.carType.length > 0) {
            filters.carType.forEach(type => {
                queryParams.append('carType[]', type);
            });
        }

        if (filters.brand && filters.brand.length > 0) {
            filters.brand.forEach(brand => {
                queryParams.append('brand[]', brand);
            });
        }

        if (filters.priceRange && filters.priceRange.length > 0) {
            filters.priceRange.forEach(range => {
                queryParams.append('priceRange[]', range);
            });
        }

        if (filters.available) {
            queryParams.append('available', filters.available);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cars.php?${queryParams}`);
            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();
            return data.cars;
        } catch (error) {
            console.error('Error searching cars:', error);
            throw error;
        }
    },

    // Get search suggestions
    async getSearchSuggestions(keyword) {
        try {
            const response = await fetch(`${API_BASE_URL}/cars.php?action=getSuggestions&keyword=${keyword}`);
            if (!response.ok) throw new Error('Failed to get suggestions');
            const data = await response.json();
            return data.suggestions;
        } catch (error) {
            console.error('Error getting suggestions:', error);
            return [];
        }
    },

    // Get filter options (car types and brands)
    async getFilterOptions() {
        try {
            const response = await fetch(`${API_BASE_URL}/cars.php?action=getFilters`);
            if (!response.ok) throw new Error('Failed to get filter options');
            return await response.json();
        } catch (error) {
            console.error('Error getting filter options:', error);
            throw error;
        }
    },

    // Check car availability
    async checkAvailability(vin) {
        try {
            const response = await fetch(`${API_BASE_URL}/availability.php?vin=${vin}`);
            if (!response.ok) throw new Error('Failed to check availability');
            const data = await response.json();
            return data.available;
        } catch (error) {
            console.error('Error checking availability:', error);
            return false;
        }
    }
};

export default CarService;
