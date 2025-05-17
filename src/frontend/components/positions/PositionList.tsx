import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { ConfirmationDialog } from "../common/ConfirmationDialog";
import { PositionEditForm } from "./PositionEditForm";

export const PositionList: React.FC = () => {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; positionId: string | null }>({
    isOpen: false,
    positionId: null,
  });
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; positionId: string | null }>({
    isOpen: false,
    positionId: null,
  });
  const { user } = useAuth();

  const fetchPositions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("positions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPositions(data || []);
    } catch (err) {
      console.error("Error fetching positions:", err);
      setError("Failed to load positions");
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [user]);

  const handleDelete = async (positionId: string) => {
    setDeleteDialog({ isOpen: true, positionId });
  };

  const handleEdit = (positionId: string) => {
    setEditDialog({ isOpen: true, positionId });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.positionId) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("positions")
        .delete()
        .eq("id", deleteDialog.positionId);

      if (error) throw error;
      
      // Refresh the list
      await fetchPositions();
    } catch (err) {
      console.error("Error deleting position:", err);
      setError("Failed to delete position");
    } finally {
      setLoading(false);
      setDeleteDialog({ isOpen: false, positionId: null });
    }
  };

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="position-list">
      <h3>Your Positions</h3>
      {positions.length === 0 && <div>No positions yet.</div>}
      <div className="list-container">
        {positions.map((position) => (
          <div key={position.id} className="list-item">
            <div className="item-content">
              <h4>{position.title}</h4>
              <p>{position.department}</p>
              <p>{position.location}</p>
            </div>
            <div className="item-actions">
              <button 
                onClick={() => handleDelete(position.id)}
                disabled={loading}
                className="delete-btn"
              >
                Delete
              </button>
              <button 
                onClick={() => handleEdit(position.id)}
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
        title="Delete Position"
        message="Are you sure you want to delete this position? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, positionId: null })}
      />

      {editDialog.isOpen && editDialog.positionId && (
        <PositionEditForm
          positionId={editDialog.positionId}
          onClose={() => setEditDialog({ isOpen: false, positionId: null })}
          onUpdate={fetchPositions}
        />
      )}
    </div>
  );
};
