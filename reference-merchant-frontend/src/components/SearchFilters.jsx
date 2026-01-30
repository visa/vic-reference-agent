/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useState, useEffect } from 'react';

const SearchFilters = ({ onFilter, currentFilters = {} }) => {
  const [searchQuery, setSearchQuery] = useState(currentFilters.query || '');
  const [category, setCategory] = useState(currentFilters.category || '');
  const [minPrice, setMinPrice] = useState(currentFilters.min_price || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.max_price || '');

  useEffect(() => {
    setSearchQuery(currentFilters.query || '');
    setCategory(currentFilters.category || '');
    setMinPrice(currentFilters.min_price || '');
    setMaxPrice(currentFilters.max_price || '');
  }, [currentFilters]);

  const categories = [
    'Electronics',
    'Sports',
    'Kitchen',
    'Home',
    'Books',
  ];

  const applyFilters = () => {
    onFilter({
      query: searchQuery || undefined,
      category: category || undefined,
      min_price: minPrice ? parseFloat(minPrice) : undefined,
      max_price: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onFilter({});
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton}>
          Search
        </button>
      </form>

      <div style={styles.filters}>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          onKeyPress={handleKeyPress}
          style={styles.select}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          onKeyPress={handleKeyPress}
          style={styles.priceInput}
          min="0"
          step="0.01"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          onKeyPress={handleKeyPress}
          style={styles.priceInput}
          min="0"
          step="0.01"
        />

        <button onClick={clearFilters} style={styles.clearButton}>
          Clear Filters
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  searchForm: {
    display: 'flex',
    marginBottom: '1rem',
    gap: '0.5rem',
  },
  searchInput: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  searchButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  filters: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  priceInput: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
    width: '120px',
  },
  clearButton: {
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};

export default SearchFilters;
