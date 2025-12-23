import { useNavigate, useParams } from 'react-router-dom';
import { ChecklistDetail } from '../components';
import { checklistApi } from '../api';
import { ApiClientError } from '../api/client';
import type { Checklist } from '../types/api.types';
import './DetailPage.css';

export function DetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  function handleEdit(checklist: Checklist) {
    navigate(`/edit/${checklist.id}`);
  }

  async function handleDelete(checklistId: string) {
    if (!window.confirm('Are you sure you want to delete this checklist?')) {
      return;
    }

    try {
      await checklistApi.delete(checklistId);
      // Navigate back to home after successful deletion
      navigate('/');
    } catch (err) {
      if (err instanceof ApiClientError) {
        alert(`Failed to delete: ${err.message}`);
      } else {
        alert('Failed to delete checklist');
      }
    }
  }

  function handleClose() {
    navigate('/');
  }

  if (!id) {
    return (
      <div className="detail-page">
        <div className="detail-page__error">
          <p className="error-message">Invalid checklist ID</p>
          <button onClick={() => navigate('/')} className="btn btn--primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <ChecklistDetail
        checklistId={id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    </div>
  );
}
