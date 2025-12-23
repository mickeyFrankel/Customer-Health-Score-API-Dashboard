import type { Checklist } from '../types/api.types';
import './ChecklistCard.css';

interface ChecklistCardProps {
  checklist: Checklist;
  onDelete: (id: string) => void;
  onEdit?: (checklist: Checklist) => void;
}

export function ChecklistCard({ checklist, onDelete, onEdit }: ChecklistCardProps) {
  const formattedDate = new Date(checklist.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = new Date(checklist.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine score status for styling
  const scoreStatus =
    checklist.score >= 80 ? 'excellent' : checklist.score >= 60 ? 'good' : 'needs-attention';

  return (
    <article className={`checklist-card checklist-card--${scoreStatus}`}>
      <div className="checklist-card__header">
        <div>
          <h3 className="checklist-card__customer">{checklist.customerId}</h3>
          <time className="checklist-card__date" dateTime={checklist.createdAt}>
            {formattedDate} at {formattedTime}
          </time>
        </div>
        <div className={`checklist-card__score checklist-card__score--${scoreStatus}`}>
          <span className="score-value">{checklist.score}</span>
          <span className="score-label">/100</span>
        </div>
      </div>

      {checklist.notes && (
        <div className="checklist-card__notes">
          <p>{checklist.notes}</p>
        </div>
      )}

      <div className="checklist-card__footer">
        <span className={`status-badge status-badge--${scoreStatus}`}>
          {scoreStatus === 'excellent' && 'Excellent'}
          {scoreStatus === 'good' && 'Good'}
          {scoreStatus === 'needs-attention' && 'Needs Attention'}
        </span>

        <div className="checklist-card__actions">
          {onEdit && (
            <button
              onClick={() => onEdit(checklist)}
              className="btn btn--small btn--secondary"
              aria-label={`Edit checklist for ${checklist.customerId}`}
            >
              Edit
            </button>
          )}
          <button
            onClick={() => onDelete(checklist.id)}
            className="btn btn--small btn--danger"
            aria-label={`Delete checklist for ${checklist.customerId}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
