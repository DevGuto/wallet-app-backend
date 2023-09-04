const express = require("express");
const db = require("./db");
const routesCategories = require("./routes/categories");
const routesUsers = require("./routes/users");

const app = express();
app.use(express.json());

const port = 3000;

app.use("/categories", routesCategories);
app.use("/users", routesUsers);

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