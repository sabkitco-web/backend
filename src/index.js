
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

// Global middlewares
app.use(cors());
app.use(multer().any())
app.use(express.json());

// Mount /video routes
app.use('/video', require('./routes/video'));

app.get('/', (_, res) => {
  res.status(200).send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
