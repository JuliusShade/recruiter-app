import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface CandidateFormProps {
  onCandidateAdded: () => void;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({ onCandidateAdded }) => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    linkedin_url: '',
    location: '',
    current_title: '',
    current_company: '',
    years_of_experience: '',
    resume_file: null as File | null,
    interview_notes_file: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (files && files.length > 0) {
      console.log("File selected:", files[0].name);
      setForm((f) => ({ ...f, [name]: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleFileUpload = async (file: File, userId: string, candidateId: string, fileType: string) => {
    console.log(`Uploading ${fileType}:`, file.name, "for new candidate:", candidateId);
    const res = await fetch('http://localhost:5000/candidates/generate-presigned-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    return key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError('You must be logged in.');
      setLoading(false);
      return;
    }

    try {
      // First create the candidate record
      const { data: candidate, error: insertError } = await supabase
        .from('candidates')
        .insert([
          {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            phone_number: form.phone_number,
            linkedin_url: form.linkedin_url,
            location: form.location,
            current_title: form.current_title,
            current_company: form.current_company,
            years_of_experience: form.years_of_experience ? parseInt(form.years_of_experience) : null,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('Created new candidate:', candidate);

      let resume_blob_path = null;
      let interview_notes_blob_path = null;

      // Upload resume if one was selected
      if (form.resume_file) {
        resume_blob_path = await handleFileUpload(
          form.resume_file,
          user.id,
          candidate.id,
          'resume'
        );
        console.log('Resume uploaded, updating candidate with resume_blob_path:', resume_blob_path);
      }

      // Upload interview notes if one was selected
      if (form.interview_notes_file) {
        interview_notes_blob_path = await handleFileUpload(
          form.interview_notes_file,
          user.id,
          candidate.id,
          'interview_notes'
        );
        console.log('Interview notes uploaded, updating candidate with interview_notes_blob_path:', interview_notes_blob_path);
      }

      // Update the candidate record with the file paths
      if (resume_blob_path || interview_notes_blob_path) {
        const { error: updateError } = await supabase
          .from('candidates')
          .update({
            resume_blob_path,
            interview_notes_blob_path,
          })
          .eq('id', candidate.id);

        if (updateError) throw updateError;
      }

      // Reset form
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        linkedin_url: '',
        location: '',
        current_title: '',
        current_company: '',
        years_of_experience: '',
        resume_file: null,
        interview_notes_file: null,
      });

      onCandidateAdded();
    } catch (err) {
      console.error('Error creating candidate:', err);
      setError('Failed to create candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="candidate-form">
      <h3>Add New Candidate</h3>
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
          <label>Resume (optional):</label>
          <input name="resume_file" type="file" onChange={handleChange} />
        </div>
        <div className="file-section">
          <label>Interview Notes (optional):</label>
          <input name="interview_notes_file" type="file" onChange={handleChange} />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Candidate'}
        </button>
      </form>
    </div>
  );
};
