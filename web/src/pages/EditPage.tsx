import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChecklistForm } from '../components';
import { checklistApi } from '../api';
import { ApiClientError } from '../api/client';
import type { Checklist, UpdateChecklistInput } from '../types/api.types';
import './EditPage.css';

export function EditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchChecklist(id);
    }
  }, [id]);

  async function fetchChecklist(checklistId: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await checklistApi.getById(checklistId);
      setChecklist(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to load checklist');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: UpdateChecklistInput) {
    if (!id) return;

    try {
      setSubmitting(true);
      setError(null);
      await checklistApi.update(id, data);
      // Navigate back to detail page after successful update
      navigate(`/detail/${id}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to update checklist');
      }
      throw err; // Re-throw so form knows submission failed
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (id) {
      navigate(`/detail/${id}`);
    } else {
      navigate('/');
    }
  }

  if (loading) {
    return (
      <div className="edit-page">
        <div className="edit-page__loading">
          <div className="spinner" />
          <p>Loading checklist...</p>
        </div>
      </div>
    );
  }

  if (error && !checklist) {
    return (
      <div className="edit-page">
        <div className="edit-page__error">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/')} className="btn btn--primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="edit-page">
        <div className="edit-page__error">
          <p className="error-message">Checklist not found</p>
          <button onClick={() => navigate('/')} className="btn btn--primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-page">
      <div className="edit-page__container">
        {error && (
          <div className="edit-page__error-banner">
            <p className="error-message">{error}</p>
            <button onClick={() => setError(null)} className="btn btn--small btn--secondary">
              Dismiss
            </button>
          </div>
        )}
        <ChecklistForm
          checklist={checklist}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={submitting}
        />
      </div>
    </div>
  );
}
