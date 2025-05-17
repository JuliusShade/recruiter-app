import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";

interface PositionEditFormProps {
  positionId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export const PositionEditForm: React.FC<PositionEditFormProps> = ({
  positionId,
  onClose,
  onUpdate,
}) => {
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    description: "",
    requirements: "",
    salary_range: "",
    employment_type: "",
    position_file: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const { data, error } = await supabase
          .from("positions")
          .select("*")
          .eq("id", positionId)
          .single();

        if (error) throw error;

        setForm({
          title: data.title,
          department: data.department,
          location: data.location,
          description: data.description,
          requirements: data.requirements,
          salary_range: data.salary_range,
          employment_type: data.employment_type,
          position_file: null,
        });
        setCurrentFile(data.files_blob_path);
      } catch (err) {
        console.error("Error fetching position:", err);
        setError("Failed to load position details");
      }
    };

    fetchPosition();
  }, [positionId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (files && files.length > 0) {
      setForm((f) => ({ ...f, [name]: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleFileUpload = async (file: File, userId: string, positionId: string) => {
    const res = await fetch("http://localhost:5000/positions/generate-presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        positionId,
        fileName: file.name,
        fileType: file.type,
      }),
    });
    const { url, key } = await res.json();

    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    return key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    try {
      let files_blob_path = currentFile;

      // Upload new file if one was selected
      if (form.position_file) {
        files_blob_path = await handleFileUpload(
          form.position_file,
          user.id,
          positionId
        );
      }

      // Update the position record
      const { error: updateError } = await supabase
        .from("positions")
        .update({
          title: form.title,
          department: form.department,
          location: form.location,
          description: form.description,
          requirements: form.requirements,
          salary_range: form.salary_range,
          employment_type: form.employment_type,
          files_blob_path,
        })
        .eq("id", positionId);

      if (updateError) throw updateError;

      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error updating position:", err);
      setError("Failed to update position");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-form">
        <h3>Edit Position</h3>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <input
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
          />
          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          <textarea
            name="requirements"
            placeholder="Requirements"
            value={form.requirements}
            onChange={handleChange}
          />
          <input
            name="salary_range"
            placeholder="Salary Range"
            value={form.salary_range}
            onChange={handleChange}
          />
          <input
            name="employment_type"
            placeholder="Employment Type"
            value={form.employment_type}
            onChange={handleChange}
          />
          <div className="file-section">
            <label>Current File:</label>
            {currentFile ? (
              <div className="current-file">
                <span>{currentFile.split("/").pop()}</span>
                <button
                  type="button"
                  onClick={() => setCurrentFile(null)}
                  className="remove-file-btn"
                >
                  Remove
                </button>
              </div>
            ) : (
              <span>No file attached</span>
            )}
            <label>New File (optional):</label>
            <input name="position_file" type="file" onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 