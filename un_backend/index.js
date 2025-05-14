const express = require('express');
const cors = require('cors'); 
const app = express();
require('dotenv').config();

const db = require('./db');
const projectsRoutes = require('./routes/projects');

app.use(cors());
app.use(express.json());
app.use('/api/projects', projectsRoutes);

app.get('/', (req, res) => {
  res.send('UN Habitat API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
