import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { ConfirmationDialog } from "../common/ConfirmationDialog";
import { CandidateEditForm } from "./CandidateEditForm";

export const CandidateList: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; candidateId: string | null }>({
    isOpen: false,
    candidateId: null,
  });
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; candidateId: string | null }>({
    isOpen: false,
    candidateId: null,
  });
  const { user } = useAuth();

  const fetchCandidates = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError("Failed to load candidates");
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [user]);

  const handleDelete = async (candidateId: string) => {
    setDeleteDialog({ isOpen: true, candidateId });
  };

  const handleEdit = (candidateId: string) => {
    setEditDialog({ isOpen: true, candidateId });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.candidateId) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("candidates")
        .delete()
        .eq("id", deleteDialog.candidateId);

      if (error) throw error;
      
      // Refresh the list
      await fetchCandidates();
    } catch (err) {
      console.error("Error deleting candidate:", err);
      setError("Failed to delete candidate");
    } finally {
      setLoading(false);
      setDeleteDialog({ isOpen: false, candidateId: null });
    }
  };

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="candidate-list">
      <h3>Your Candidates</h3>
      {candidates.length === 0 && <div>No candidates yet.</div>}
      <div className="list-container">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="list-item">
            <div className="item-content">
              <h4>{candidate.name}</h4>
              <p>{candidate.email}</p>
              <p>{candidate.phone}</p>
            </div>
            <div className="item-actions">
              <button 
                onClick={() => handleDelete(candidate.id)}
                disabled={loading}
                className="delete-btn"
              >
                Delete
              </button>
              <button 
                onClick={() => handleEdit(candidate.id)}
                className="edit-btn"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Candidate"
        message="Are you sure you want to delete this candidate? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, candidateId: null })}
      />

      {editDialog.isOpen && editDialog.candidateId && (
        <CandidateEditForm
          candidateId={editDialog.candidateId}
          onClose={() => setEditDialog({ isOpen: false, candidateId: null })}
          onUpdate={fetchCandidates}
        />
      )}
    </div>
  );
}; 