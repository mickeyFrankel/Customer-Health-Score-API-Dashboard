import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChecklistForm } from '../components';
import { checklistApi } from '../api';
import { ApiClientError } from '../api/client';
import type { CreateChecklistInput } from '../types/api.types';
import './CreatePage.css';

export function CreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: CreateChecklistInput) {
    try {
      setLoading(true);
      setError(null);
      await checklistApi.create(data);
      // Navigate back to home after successful creation
      navigate('/');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to create checklist');
      }
      throw err; // Re-throw so form knows submission failed
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate('/');
  }

  return (
    <div className="create-page">
      <div className="create-page__container">
        {error && (
          <div className="create-page__error">
            <p className="error-message">{error}</p>
            <button onClick={() => setError(null)} className="btn btn--small btn--secondary">
              Dismiss
            </button>
          </div>
        )}
        <ChecklistForm onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} />
      </div>
    </div>
  );
}
