const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET all events
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('events')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// GET single event
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

// POST create event
router.post('/', async (req, res) => {
  const { title, description, category, lat, lng, address, host_id, event_date } = req.body;

  if (!title || !category || !lat || !lng) {
    return res.status(400).json({ error: 'Title, category, lat and lng are required' });
  }

  const { data, error } = await supabase
    .from('events')
    .insert({ title, description, category, lat, lng, address, host_id, event_date })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// DELETE event
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

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