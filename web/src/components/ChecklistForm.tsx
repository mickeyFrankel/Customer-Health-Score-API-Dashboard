import { useState, FormEvent } from 'react';
import type { Checklist, CreateChecklistInput, UpdateChecklistInput } from '../types/api.types';
import './ChecklistForm.css';

interface ChecklistFormProps {
  checklist?: Checklist; // If provided, this is edit mode
  onSubmit: (data: CreateChecklistInput | UpdateChecklistInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function ChecklistForm({
  checklist,
  onSubmit,
  onCancel,
  loading = false,
}: ChecklistFormProps) {
  const isEditMode = !!checklist;

  const [customerId, setCustomerId] = useState(checklist?.customerId || '');
  const [score, setScore] = useState(checklist?.score?.toString() || '');
  const [notes, setNotes] = useState(checklist?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!customerId.trim()) {
      newErrors.customerId = 'Customer ID is required';
    } else if (customerId.length > 100) {
      newErrors.customerId = 'Customer ID must be less than 100 characters';
    }

    if (!score) {
      newErrors.score = 'Score is required';
    } else {
      const scoreNum = parseInt(score, 10);
      if (isNaN(scoreNum)) {
        newErrors.score = 'Score must be a number';
      } else if (scoreNum < 0) {
        newErrors.score = 'Score must be at least 0';
      } else if (scoreNum > 100) {
        newErrors.score = 'Score must be at most 100';
      }
    }

    if (notes && notes.length > 1000) {
      newErrors.notes = 'Notes must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = {
      customerId,
      score: parseInt(score, 10),
      notes: notes.trim() || null,
    };

    try {
      await onSubmit(data);
      // Reset form on successful creation (not edit)
      if (!isEditMode) {
        setCustomerId('');
        setScore('');
        setNotes('');
        setErrors({});
      }
    } catch (error) {
      // Error handling is done by parent component
      console.error('Form submission error:', error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="checklist-form">
      <h2 className="checklist-form__title">
        {isEditMode ? 'Edit Checklist' : 'Create New Checklist'}
      </h2>

      <div className="form-group">
        <label htmlFor="customer-id" className="form-label">
          Customer ID <span className="required">*</span>
        </label>
        <input
          id="customer-id"
          type="text"
          value={customerId}
          onChange={e => setCustomerId(e.target.value)}
          className={`form-input ${errors.customerId ? 'form-input--error' : ''}`}
          placeholder="e.g., customer-123"
          disabled={loading}
          required
        />
        {errors.customerId && <p className="form-error">{errors.customerId}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="score" className="form-label">
          Health Score (0-100) <span className="required">*</span>
        </label>
        <div className="score-input-wrapper">
          <input
            id="score"
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={e => setScore(e.target.value)}
            className={`form-input ${errors.score ? 'form-input--error' : ''}`}
            placeholder="85"
            disabled={loading}
            required
          />
          {score && !errors.score && (
            <div className="score-preview">
              <div
                className="score-bar"
                style={{
                  width: `${score}%`,
                  backgroundColor:
                    parseInt(score) >= 80
                      ? '#10b981'
                      : parseInt(score) >= 60
                        ? '#f59e0b'
                        : '#ef4444',
                }}
              />
            </div>
          )}
        </div>
        {errors.score && <p className="form-error">{errors.score}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="notes" className="form-label">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className={`form-textarea ${errors.notes ? 'form-input--error' : ''}`}
          placeholder="Add any additional notes about the customer's health..."
          rows={4}
          maxLength={1000}
          disabled={loading}
        />
        <div className="form-hint">
          {notes.length}/1000 characters
          {errors.notes && <span className="form-error"> • {errors.notes}</span>}
        </div>
      </div>

      <div className="checklist-form__actions">
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner spinner--small" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{isEditMode ? 'Update Checklist' : 'Create Checklist'}</>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn--secondary"
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
