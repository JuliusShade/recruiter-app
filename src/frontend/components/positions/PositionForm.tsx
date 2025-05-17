import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabaseClient";

export const PositionForm: React.FC<{ onPositionAdded: () => void }> = ({
  onPositionAdded,
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
  const { user } = useAuth();

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

  const handleFileUpload = async (
    file: File,
    userId: string,
    positionId: string
  ) => {
    console.log('Starting file upload process:', { file, userId, positionId });
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
    console.log('Received presigned URL response:', res.status);
    const { url, key } = await res.json();
    console.log('Generated presigned URL:', url);

    console.log('Uploading file to S3...');
    const uploadRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    console.log('S3 upload response:', uploadRes.status);

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
      // 1. Create the position record
      console.log('Creating position record...');
      const { data: positionData, error: insertError } = await supabase
        .from("positions")
        .insert([
          {
            user_id: user.id,
            title: form.title,
            department: form.department,
            location: form.location,
            description: form.description,
            requirements: form.requirements,
            salary_range: form.salary_range,
            employment_type: form.employment_type,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating position:', insertError);
        setError(insertError.message);
        setLoading(false);
        return;
      }

      const positionId = positionData.id;
      console.log('Position created with ID:', positionId);
      let files_blob_path = null;

      // 2. Upload file if present
      if (form.position_file) {
        console.log('File present, starting upload...');
        files_blob_path = await handleFileUpload(
          form.position_file,
          user.id,
          positionId
        );
        console.log('File upload complete, updating position with path:', files_blob_path);
        
        // Update the position record with the file path
        const { error: updateError } = await supabase
          .from("positions")
          .update({ files_blob_path })
          .eq("id", positionId);
          
        if (updateError) {
          console.error('Error updating position with file path:', updateError);
        }
      }

      setForm({
        title: "",
        department: "",
        location: "",
        description: "",
        requirements: "",
        salary_range: "",
        employment_type: "",
        position_file: null,
      });
      setLoading(false);
      onPositionAdded();
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <form className="position-form" onSubmit={handleSubmit}>
      <h3>Add Position</h3>
      {error && <div className="error">{error}</div>}
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
      <label>Attach File</label>
      <input name="position_file" type="file" onChange={handleChange} />
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Add Position"}
      </button>
    </form>
  );
};
