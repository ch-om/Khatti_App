const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET user by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(data);
});

// PUT update trust score
router.put('/:id/trust-score', async (req, res) => {
  const { id } = req.params;
  const { trust_score } = req.body;

  if (trust_score < 0 || trust_score > 100) {
    return res.status(400).json({ error: 'Trust score must be between 0 and 100' });
  }

  const { data, error } = await supabase
    .from('users')
    .update({ trust_score })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// POST report user
router.post('/:id/report', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Reason is required' });
  }

  // reduce trust score by 10 when reported
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('trust_score')
    .eq('id', id)
    .single();

  if (fetchError) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newScore = Math.max(0, user.trust_score - 10);

  const { data, error } = await supabase
    .from('users')
    .update({ trust_score: newScore })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'User reported', trust_score: newScore });
});

module.exports = router;