// Update in js/components/filters.js
const Filters = {
    filters: {
        carType: [],
        brand: [],
        priceRange: [],
        available: ''
    },

    init() {
        // Initialize filter elements
        this.setupFilterListeners();
        this.setupClearButton();
    },

    setupFilterListeners() {
        // Car type filters
        const carTypeFilters = document.querySelectorAll('input[name="carType"]');
        carTypeFilters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                this.handleFilterChange(e, carTypeFilters, 'carType');
            });
        });

        // Brand filters
        const brandFilters = document.querySelectorAll('input[name="brand"]');
        brandFilters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                this.handleFilterChange(e, brandFilters, 'brand');
            });
        });

        // Price range filters
        const priceRangeFilters = document.querySelectorAll('input[name="priceRange"]');
        priceRangeFilters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                this.handleFilterChange(e, priceRangeFilters, 'priceRange');
            });
        });

        // Availability filters
        const availabilityFilters = document.querySelectorAll('input[name="availability"]');
        availabilityFilters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                this.handleFilterChange(e, availabilityFilters, 'available');
            });
        });
    },

    setupClearButton() {
        const clearButton = document.getElementById('clear-filters');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearAllFilters());
        }
    },

    handleFilterChange(event, filterElements, filterType) {
        const target = event.target;
        const value = target.value;

        if (filterType === 'available') {
            // Handle availability filter (special case)
            // Only one option can be selected at a time
            filterElements.forEach(el => {
                if (el !== target) el.checked = false;
            });

            // If "all" is selected or the current selection is unchecked
            if (value === 'all' || !target.checked) {
                this.filters[filterType] = '';
            } else {
                // If "available" is selected and checked
                this.filters[filterType] = 'true';
            }

            // Ensure at least one option is always selected
            if (!Array.from(filterElements).some(el => el.checked)) {
                const allOption = Array.from(filterElements).find(el => el.value === 'all');
                if (allOption) {
                    allOption.checked = true;
                    this.filters[filterType] = '';
                }
            }
        } else {
            // Handle multi-select filters (carType, brand, priceRange)
            if (value === 'all') {
                // If "All" is selected, clear all other selections
                filterElements.forEach(el => {
                    if (el.value !== 'all') el.checked = false;
                });
                this.filters[filterType] = [];
            } else {
                // Uncheck "All" option
                const allOption = Array.from(filterElements).find(el => el.value === 'all');
                if (allOption) allOption.checked = false;

                // Update array of selected values
                if (target.checked) {
                    // Add value to array if checked
                    if (!this.filters[filterType].includes(value)) {
                        this.filters[filterType].push(value);
                    }
                } else {
                    // Remove value from array if unchecked
                    this.filters[filterType] = this.filters[filterType].filter(item => item !== value);
                }

                // If nothing is selected, check the "All" option
                if (this.filters[filterType].length === 0 && allOption) {
                    allOption.checked = true;
                }
            }
        }

        this.notifyFilterChange();
    },

    clearAllFilters() {
        // Reset all filters to default
        document.querySelector('input[name="carType"][value="all"]').checked = true;
        document.querySelector('input[name="brand"][value="all"]').checked = true;
        document.querySelector('input[name="priceRange"][value="all"]').checked = true;
        document.querySelector('input[name="availability"][value="all"]').checked = true;

        // Uncheck all other filters
        document.querySelectorAll('input[name="carType"]:not([value="all"])').forEach(el => el.checked = false);
        document.querySelectorAll('input[name="brand"]:not([value="all"])').forEach(el => el.checked = false);
        document.querySelectorAll('input[name="priceRange"]:not([value="all"])').forEach(el => el.checked = false);
        document.querySelectorAll('input[name="availability"]:not([value="all"])').forEach(el => el.checked = false);

        this.filters = {
            carType: [],
            brand: [],
            priceRange: [],
            available: ''
        };

        this.notifyFilterChange();
    },

    notifyFilterChange() {
        // Dispatch filter change event
        const filterEvent = new CustomEvent('filter-change', {
            detail: { filters: this.filters }
        });
        document.dispatchEvent(filterEvent);
    },

    getFilters() {
        return this.filters;
    }
};

export default Filters;
