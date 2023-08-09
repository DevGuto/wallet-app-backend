const express = require('express');
const db = require("./db");
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Aprendendo Node.js - APDev');
})

app.listen(port, () => {
  
  db.connect()
    .then(()=> {
      console.log("DB connected");
    })
    .catch((error) => {
      throw new Error(error);
    });

  console.log(`Example app listening on port ${port}`);
});