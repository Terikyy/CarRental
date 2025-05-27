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

            // Format the suggestion based on type
            let displayText = suggestion.value;
            let prefixIcon = '';

            switch (suggestion.type) {
                case 'carType':
                    prefixIcon = '<span class="suggestion-icon">🚗</span>';
                    break;
                case 'brand':
                    prefixIcon = '<span class="suggestion-icon">🏢</span>';
                    break;
                case 'model':
                    prefixIcon = '<span class="suggestion-icon">📋</span>';
                    break;
            }

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
        this.suggestionsContainer.classList.remove('hidden');
    },

    hideSuggestions() {
        this.suggestionsContainer.classList.add('hidden');
    }
};

export default SearchBar;
