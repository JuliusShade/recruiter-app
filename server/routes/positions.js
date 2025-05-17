const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Create a new position
router.post('/positions', async (req, res) => {
  const { userId, title, department, location, description, requirements, salary_range, employment_type } = req.body;
  const { data, error } = await supabase
    .from('positions')
    .insert([{
      user_id: userId,
      title,
      department,
      location,
      description,
      requirements,
      salary_range,
      employment_type
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Get all positions for a user
router.get('/positions/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .eq('user_id', userId);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// (Add update/delete as needed)

module.exports = router;
