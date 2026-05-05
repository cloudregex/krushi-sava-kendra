require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => {
  res.send('Hello World! Express server is running.');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
