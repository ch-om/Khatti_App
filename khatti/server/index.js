const express = require('express');
const cors = require('cors');
require('dotenv').config();

const eventsRouter = require('./routes/events');
const usersRouter = require('./routes/users');
const attendeesRouter = require('./routes/attendees');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/events', eventsRouter);
app.use('/users', usersRouter);
app.use('/events', attendeesRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Khatti server is running! 🎉' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


