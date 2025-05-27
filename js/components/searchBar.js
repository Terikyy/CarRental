// js/components/searchBar.js
import CarService from '../api/carService.js';

const SearchBar = {
    searchInput: null,
    searchButton: null,
    suggestionsContainer: null,
    debounceTimeout: null,
    selectedKeyword: '',

    init() {
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-btn');
        this.suggestionsContainer = document.getElementById('search-suggestions');

        if (!this.searchInput || !this.searchButton || !this.suggestionsContainer) {
            console.error('Search elements not found');
            return;
        }

        // Disable browser's built-in autocomplete
        this.searchInput.setAttribute('autocomplete', 'off');

        this.setupEventListeners();
    },

    setupEventListeners() {
        // Input event for real-time suggestions
        this.searchInput.addEventListener('input', () => this.handleInput());

        // Search button click
        this.searchButton.addEventListener('click', () => this.performSearch());

        // Enter key in search box
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Click outside to close suggestions
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    },

    handleInput() {
        const keyword = this.searchInput.value.trim();

        // Clear previous timeout
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        if (keyword.length < 2) {
            this.hideSuggestions();
            return;
        }

        // Debounce API calls to avoid too many requests
        this.debounceTimeout = setTimeout(() => {
            this.fetchSuggestions(keyword);
        }, 300);
    },

    async fetchSuggestions(keyword) {
        try {
            const suggestions = await CarService.getSearchSuggestions(keyword);
            this.renderSuggestions(suggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            this.hideSuggestions();
        }
    },

    renderSuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.suggestionsContainer.innerHTML = '';

        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';

            let displayText = suggestion.value;
            let prefixIcon = '<span class="suggestion-icon">🚘</span>';

            item.innerHTML = `${prefixIcon} ${displayText}`;

            // Set click handler
            item.addEventListener('click', () => {
                this.selectSuggestion(suggestion.value);
            });

            this.suggestionsContainer.appendChild(item);
        });

        this.showSuggestions();
    },

    selectSuggestion(value) {
        this.searchInput.value = value;
        this.selectedKeyword = value;
        this.hideSuggestions();
        this.performSearch();
    },

    performSearch() {
        const keyword = this.searchInput.value.trim();
        if (keyword.length === 0) return;

        // Trigger search event for other components to listen to
        const searchEvent = new CustomEvent('car-search', {
            detail: { keyword }
        });
        document.dispatchEvent(searchEvent);
    },

    showSuggestions() {
        // First remove the hidden class completely
        this.suggestionsContainer.classList.remove('hidden');
        // Use a small timeout to ensure DOM updates before adding the show class
        // This helps the CSS transition work properly
        setTimeout(() => {
            this.suggestionsContainer.classList.add('show');
        }, 10);
    },

    hideSuggestions() {
        // First remove the show class to trigger the fade out
        this.suggestionsContainer.classList.remove('show');
        // Add hidden class after the transition completes
        setTimeout(() => {
            this.suggestionsContainer.classList.add('hidden');
        }, 200); // Match this to your CSS transition duration
    }
};

export default SearchBar;
