import { useState, useEffect } from 'react';
import { checklistApi } from '../api';
import { ApiClientError } from '../api/client';
import type { Checklist, ListChecklistsParams } from '../types/api.types';
import { ChecklistCard } from './ChecklistCard';
import { ChecklistFilters } from './ChecklistFilters';
import './ChecklistList.css';

export function ChecklistList() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListChecklistsParams>({
    limit: 10,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    hasMore: false,
  });

  useEffect(() => {
    fetchChecklists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function fetchChecklists() {
    try {
      setLoading(true);
      setError(null);
      const response = await checklistApi.list(filters);
      setChecklists(response.data);
      setPagination({
        total: response.pagination.total,
        hasMore: response.pagination.hasMore,
      });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to load checklists');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(newFilters: Partial<ListChecklistsParams>) {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: 0, // Reset to first page when filters change
    }));
  }

  function handleNextPage() {
    if (pagination.hasMore) {
      setFilters(prev => ({
        ...prev,
        offset: (prev.offset || 0) + (prev.limit || 10),
      }));
    }
  }

  function handlePreviousPage() {
    setFilters(prev => ({
      ...prev,
      offset: Math.max(0, (prev.offset || 0) - (prev.limit || 10)),
    }));
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this checklist?')) {
      return;
    }

    try {
      await checklistApi.delete(id);
      // Refresh the list after successful deletion
      fetchChecklists();
    } catch (err) {
      if (err instanceof ApiClientError) {
        alert(`Failed to delete: ${err.message}`);
      } else {
        alert('Failed to delete checklist');
      }
    }
  }

  if (loading && checklists.length === 0) {
    return (
      <div className="checklist-list">
        <div className="checklist-list__loading">
          <div className="spinner" />
          <p>Loading checklists...</p>
        </div>
      </div>
    );
  }

  if (error && checklists.length === 0) {
    return (
      <div className="checklist-list">
        <div className="checklist-list__error">
          <p className="error-message">{error}</p>
          <button onClick={fetchChecklists} className="btn btn--secondary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checklist-list">
      <header className="checklist-list__header">
        <h2>Customer Health Checklists</h2>
        <p className="checklist-list__count">
          Showing {checklists.length} of {pagination.total} checklists
        </p>
      </header>

      <ChecklistFilters filters={filters} onChange={handleFilterChange} />

      {checklists.length === 0 ? (
        <div className="checklist-list__empty">
          <p>No checklists found matching your filters.</p>
          <button
            onClick={() => setFilters({ limit: 10, offset: 0 })}
            className="btn btn--secondary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="checklist-list__grid">
            {checklists.map(checklist => (
              <ChecklistCard key={checklist.id} checklist={checklist} onDelete={handleDelete} />
            ))}
          </div>

          {pagination.total > (filters.limit || 10) && (
            <div className="checklist-list__pagination">
              <button
                onClick={handlePreviousPage}
                disabled={filters.offset === 0}
                className="btn btn--secondary"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1}
                {' of '}
                {Math.ceil(pagination.total / (filters.limit || 10))}
              </span>
              <button
                onClick={handleNextPage}
                disabled={!pagination.hasMore}
                className="btn btn--secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {loading && checklists.length > 0 && (
        <div className="checklist-list__loading-overlay">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
}
