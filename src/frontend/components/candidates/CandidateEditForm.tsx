import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";

interface CandidateEditFormProps {
  candidateId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export const CandidateEditForm: React.FC<CandidateEditFormProps> = ({
  candidateId,
  onClose,
  onUpdate,
}) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    linkedin_url: "",
    location: "",
    current_title: "",
    current_company: "",
    years_of_experience: "",
    resume_file: null as File | null,
    interview_notes_file: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResume, setCurrentResume] = useState<string | null>(null);
  const [currentInterviewNotes, setCurrentInterviewNotes] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        console.log("Fetching candidate with ID:", candidateId);
        const { data, error } = await supabase
          .from("candidates")
          .select("*")
          .eq("id", candidateId)
          .single();

        if (error) throw error;

        console.log("Fetched candidate data:", data);

        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone_number: data.phone_number || "",
          linkedin_url: data.linkedin_url || "",
          location: data.location || "",
          current_title: data.current_title || "",
          current_company: data.current_company || "",
          years_of_experience: data.years_of_experience?.toString() || "",
          resume_file: null,
          interview_notes_file: null,
        });

        // Set the current file paths if they exist
        if (data.resume_blob_path) {
          console.log("Found resume_blob_path:", data.resume_blob_path);
          setCurrentResume(data.resume_blob_path);
        }
        if (data.interview_notes_blob_path) {
          console.log("Found interview_notes_blob_path:", data.interview_notes_blob_path);
          setCurrentInterviewNotes(data.interview_notes_blob_path);
        }
      } catch (err) {
        console.error("Error fetching candidate:", err);
        setError("Failed to load candidate details");
      }
    };

    fetchCandidate();
  }, [candidateId]);

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

  const handleFileUpload = async (file: File, userId: string, candidateId: string, fileType: string) => {
    console.log(`Uploading ${fileType}:`, file.name, "for candidate:", candidateId);
    const res = await fetch("http://localhost:5000/candidates/generate-presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        candidateId,
        fileName: file.name,
        fileType: file.type,
      }),
    });
    const { url, key } = await res.json();
    console.log("Generated presigned URL and key:", { url, key });

    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    return key;
  };

  const handleRemoveFile = async (fileType: 'resume' | 'interview_notes') => {
    const currentFile = fileType === 'resume' ? currentResume : currentInterviewNotes;
    if (!currentFile) return;

    try {
      setLoading(true);
      console.log(`Removing ${fileType}:`, currentFile);
      // Delete the file from S3
      const res = await fetch("http://localhost:5000/candidates/delete-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileKey: currentFile,
        }),
      });

      if (!res.ok) throw new Error(`Failed to delete ${fileType}`);

      // Update the candidate record to remove the file reference
      const { error: updateError } = await supabase
        .from("candidates")
        .update({ [`${fileType}_blob_path`]: null })
        .eq("id", candidateId);

      if (updateError) throw updateError;

      if (fileType === 'resume') {
        setCurrentResume(null);
      } else {
        setCurrentInterviewNotes(null);
      }
    } catch (err) {
      console.error(`Error removing ${fileType}:`, err);
      setError(`Failed to remove ${fileType}`);
    } finally {
      setLoading(false);
    }
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
      let resume_blob_path = currentResume;
      let interview_notes_blob_path = currentInterviewNotes;

      // Upload new resume if one was selected
      if (form.resume_file) {
        // If there's an existing resume, delete it first
        if (currentResume) {
          await handleRemoveFile('resume');
        }
        resume_blob_path = await handleFileUpload(
          form.resume_file,
          user.id,
          candidateId,
          'resume'
        );
      }

      // Upload new interview notes if one was selected
      if (form.interview_notes_file) {
        // If there's existing interview notes, delete them first
        if (currentInterviewNotes) {
          await handleRemoveFile('interview_notes');
        }
        interview_notes_blob_path = await handleFileUpload(
          form.interview_notes_file,
          user.id,
          candidateId,
          'interview_notes'
        );
      }

      console.log("Updating candidate with file paths:", { resume_blob_path, interview_notes_blob_path });

      // Update the candidate record
      const { error: updateError } = await supabase
        .from("candidates")
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          linkedin_url: form.linkedin_url,
          location: form.location,
          current_title: form.current_title,
          current_company: form.current_company,
          years_of_experience: form.years_of_experience ? parseInt(form.years_of_experience) : null,
          resume_blob_path,
          interview_notes_blob_path,
        })
        .eq("id", candidateId);

      if (updateError) throw updateError;

      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error updating candidate:", err);
      setError("Failed to update candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-form">
        <h3>Edit Candidate</h3>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
          <input
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="phone_number"
            placeholder="Phone Number"
            value={form.phone_number}
            onChange={handleChange}
          />
          <input
            name="linkedin_url"
            placeholder="LinkedIn URL"
            value={form.linkedin_url}
            onChange={handleChange}
          />
          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
          />
          <input
            name="current_title"
            placeholder="Current Title"
            value={form.current_title}
            onChange={handleChange}
          />
          <input
            name="current_company"
            placeholder="Current Company"
            value={form.current_company}
            onChange={handleChange}
          />
          <input
            name="years_of_experience"
            type="number"
            placeholder="Years of Experience"
            value={form.years_of_experience}
            onChange={handleChange}
            min="0"
          />
          
          <div className="file-section">
            <label>Current Resume:</label>
            {currentResume ? (
              <div className="current-file">
                <span>{currentResume.split("/").pop()}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile('resume')}
                  disabled={loading}
                  className="remove-file-btn"
                >
                  Remove
                </button>
              </div>
            ) : (
              <span>No resume attached</span>
            )}
            <label>New Resume (optional):</label>
            <input name="resume_file" type="file" onChange={handleChange} />
          </div>

          <div className="file-section">
            <label>Current Interview Notes:</label>
            {currentInterviewNotes ? (
              <div className="current-file">
                <span>{currentInterviewNotes.split("/").pop()}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile('interview_notes')}
                  disabled={loading}
                  className="remove-file-btn"
                >
                  Remove
                </button>
              </div>
            ) : (
              <span>No interview notes attached</span>
            )}
            <label>New Interview Notes (optional):</label>
            <input name="interview_notes_file" type="file" onChange={handleChange} />
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