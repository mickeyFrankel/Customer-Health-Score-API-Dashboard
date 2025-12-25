import { useState, useEffect } from 'react';
import { checklistApi } from '../api';
import { ApiClientError } from '../api/client';
import type { Checklist, CustomerStats } from '../types/api.types';
import './ChecklistDetail.css';

interface ChecklistDetailProps {
  checklistId: string;
  onEdit?: (checklist: Checklist) => void;
  onDelete?: (id: string) => void;
  onClose?: () => void;
}

export function ChecklistDetail({ checklistId, onEdit, onDelete, onClose }: ChecklistDetailProps) {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChecklistAndStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistId]);

  async function fetchChecklistAndStats() {
    try {
      setLoading(true);
      setError(null);

      // Fetch checklist and customer stats in parallel
      const [checklistData] = await Promise.all([
        checklistApi.getById(checklistId),
        checklistApi.getCustomerStats(checklistId).catch(() => null), // Stats might fail if customerId is invalid
      ]);

      setChecklist(checklistData);

      // Fetch stats using the actual customerId from the checklist
      if (checklistData.customerId) {
        try {
          const customerStats = await checklistApi.getCustomerStats(checklistData.customerId);
          setStats(customerStats);
        } catch {
          // Stats fetch failed, continue without stats
          setStats(null);
        }
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to load checklist details');
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="checklist-detail">
        <div className="checklist-detail__loading">
          <div className="spinner" />
          <p>Loading checklist details...</p>
        </div>
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="checklist-detail">
        <div className="checklist-detail__error">
          <p className="error-message">{error || 'Checklist not found'}</p>
          {onClose && (
            <button onClick={onClose} className="btn btn--secondary">
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  const scoreStatus =
    checklist.score >= 80 ? 'excellent' : checklist.score >= 60 ? 'good' : 'needs-attention';

  const formattedDate = new Date(checklist.createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedUpdateDate = new Date(checklist.updatedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="checklist-detail">
      <header className="checklist-detail__header">
        <div>
          <h2>{checklist.customerId}</h2>
          <p className="checklist-detail__id">ID: {checklist.id}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn btn--icon" aria-label="Close">
            ✕
          </button>
        )}
      </header>

      <div className="checklist-detail__score-section">
        <div className={`checklist-detail__score checklist-detail__score--${scoreStatus}`}>
          <span className="score-value">{checklist.score}</span>
          <span className="score-label">/100</span>
        </div>
        <span className={`status-badge status-badge--${scoreStatus} status-badge--large`}>
          {scoreStatus === 'excellent' && '✓ Excellent'}
          {scoreStatus === 'good' && '○ Good'}
          {scoreStatus === 'needs-attention' && '⚠ Needs Attention'}
        </span>
      </div>

      {checklist.notes && (
        <div className="checklist-detail__notes">
          <h3>Notes</h3>
          <p>{checklist.notes}</p>
        </div>
      )}

      <div className="checklist-detail__metadata">
        <div className="metadata-item">
          <span className="metadata-label">Created</span>
          <time dateTime={checklist.createdAt}>{formattedDate}</time>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">Last Updated</span>
          <time dateTime={checklist.updatedAt}>{formattedUpdateDate}</time>
        </div>
      </div>

      {stats && (
        <div className="checklist-detail__stats">
          <h3>Customer Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.totalChecklists}</span>
              <span className="stat-label">Total Checklists</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.averageScore.toFixed(1)}</span>
              <span className="stat-label">Average Score</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {stats.latestScore !== null ? stats.latestScore : 'N/A'}
              </span>
              <span className="stat-label">Latest Score</span>
            </div>
          </div>

          {stats.scoreHistory.length > 0 && (
            <div className="score-history">
              <h4>Score History</h4>
              <div className="score-history-list">
                {stats.scoreHistory.slice(0, 5).map((item, index) => (
                  <div key={index} className="score-history-item">
                    <time>
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                    <div className="score-history-bar">
                      <div
                        className="score-history-fill"
                        style={{
                          width: `${item.score}%`,
                          backgroundColor:
                            item.score >= 80 ? '#10b981' : item.score >= 60 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                    <span className="score-history-value">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="checklist-detail__actions">
        {onEdit && (
          <button onClick={() => onEdit(checklist)} className="btn btn--primary">
            Edit Checklist
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(checklist.id)} className="btn btn--danger">
            Delete Checklist
          </button>
        )}
      </div>
    </div>
  );
}
