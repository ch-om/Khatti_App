const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// JOIN an event - protected
router.post('/:id/join', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('attendees')
    .insert({
      event_id: id,
      user_id: req.user.id,
      status: 'going',
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// LEAVE an event - protected
router.delete('/:id/leave', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('attendees')
    .delete()
    .eq('event_id', id)
    .eq('user_id', req.user.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Left event' });
});

// GET attendees of an event - public
router.get('/:id/attendees', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('attendees')
    .select('*')
    .eq('event_id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;