import { useState } from 'react';
import type { ListChecklistsParams } from '../types/api.types';
import './ChecklistFilters.css';

interface ChecklistFiltersProps {
  filters: ListChecklistsParams;
  onChange: (filters: Partial<ListChecklistsParams>) => void;
}

export function ChecklistFilters({ filters, onChange }: ChecklistFiltersProps) {
  const [customerId, setCustomerId] = useState(filters.customerId || '');
  const [minScore, setMinScore] = useState(filters.minScore?.toString() || '');
  const [maxScore, setMaxScore] = useState(filters.maxScore?.toString() || '');
  const [showFilters, setShowFilters] = useState(false);

  function handleApply() {
    onChange({
      customerId: customerId || undefined,
      minScore: minScore ? parseInt(minScore, 10) : undefined,
      maxScore: maxScore ? parseInt(maxScore, 10) : undefined,
    });
  }

  function handleClear() {
    setCustomerId('');
    setMinScore('');
    setMaxScore('');
    onChange({
      customerId: undefined,
      minScore: undefined,
      maxScore: undefined,
    });
  }

  function handleSortChange(sortBy: 'createdAt' | 'updatedAt' | 'score') {
    onChange({ sortBy });
  }

  function handleSortOrderChange(sortOrder: 'asc' | 'desc') {
    onChange({ sortOrder });
  }

  const hasActiveFilters = customerId || minScore || maxScore;

  return (
    <div className="checklist-filters">
      <div className="checklist-filters__header">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn--secondary checklist-filters__toggle"
        >
          {showFilters ? 'Hide' : 'Show'} Filters
          {hasActiveFilters && <span className="filter-badge">Active</span>}
        </button>

        <div className="checklist-filters__sort">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={filters.sortBy || 'createdAt'}
            onChange={(e) =>
              handleSortChange(e.target.value as 'createdAt' | 'updatedAt' | 'score')
            }
          >
            <option value="createdAt">Created Date</option>
            <option value="updatedAt">Updated Date</option>
            <option value="score">Score</option>
          </select>

          <select
            value={filters.sortOrder || 'desc'}
            onChange={(e) => handleSortOrderChange(e.target.value as 'asc' | 'desc')}
            aria-label="Sort order"
          >
            <option value="desc">↓ Descending</option>
            <option value="asc">↑ Ascending</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="checklist-filters__panel">
          <div className="checklist-filters__row">
            <div className="form-group">
              <label htmlFor="filter-customer-id">Customer ID</label>
              <input
                id="filter-customer-id"
                type="text"
                placeholder="Filter by customer ID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="checklist-filters__row">
            <div className="form-group">
              <label htmlFor="filter-min-score">Min Score</label>
              <input
                id="filter-min-score"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="filter-max-score">Max Score</label>
              <input
                id="filter-max-score"
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="checklist-filters__actions">
            <button onClick={handleApply} className="btn btn--primary">
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button onClick={handleClear} className="btn btn--secondary">
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
