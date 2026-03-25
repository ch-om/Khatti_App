const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET all events - public, no auth needed
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('events')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// GET single event - public
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.json(data);
});

// POST create event - protected
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, category, lat, lng, address, event_date } = req.body;

  if (!title || !category || !lat || !lng) {
    return res.status(400).json({ error: 'Title, category, lat and lng are required' });
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      title,
      description,
      category,
      lat,
      lng,
      address,
      host_id: req.user.id,
      event_date,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// DELETE event - protected
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { data: event } = await supabase
    .from('events')
    .select('host_id')
    .eq('id', id)
    .single();

  if (event.host_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own events' });
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Event deleted' });
});

module.exports = router;