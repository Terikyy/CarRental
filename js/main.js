// js/main.js
import CarGrid from './components/carGrid.js';
import SearchBar from './components/searchBar.js';
import Filters from './components/filters.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    CarGrid.init();
    SearchBar.init();
    Filters.init();

    // Load initial cars
    CarGrid.loadCars();

    // Listen for search events
    document.addEventListener('car-search', (event) => {
        const { keyword } = event.detail;
        const filters = Filters.getFilters();
        CarGrid.searchCars(keyword, filters);
    });

    // Listen for filter events
    document.addEventListener('filter-change', (event) => {
        const { filters } = event.detail;

        // If search input has a value, search with the new filters
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value.trim()) {
            CarGrid.searchCars(searchInput.value.trim(), filters);
        } else {
            // Otherwise just load cars with filters
            CarGrid.loadCars(filters);
        }
    });

    // Set home link
    const homeLink = document.getElementById('home-link');
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

    // Reset filters button in the "no results" section
    const resetFiltersBtn = document.getElementById('reset-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', async () => {
            // Use the existing clear filters functionality
            Filters.clearAllFilters();

            // Also clear search input
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = '';
            }

            // Reload cars with default filters
            await CarGrid.loadCars();
        });
    }
});
