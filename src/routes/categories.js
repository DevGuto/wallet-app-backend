const express = require("express");

const router = express.Router();
const db = require("../db");

router.get("/", (req, res)=> {
    db.query("SELECT * FROM categories", (error, response) => {
      if (error) {
        return res.status(500).json(error);
      }
  
      return res.status(200).json(response.rows);
    });
  });

  router.post("/", (req, res) => {
    const { nameCategories } = req.body;

    if (nameCategories.length < 3) {
        return res.status(400).json({ error: "Name should have more than 3 characters" });
    }

    // Verificar se já existe um registro com o mesmo nome na tabela
    const checkQuery = "SELECT * FROM categories WHERE nome = $1";
    const checkValues = [nameCategories];

    db.query(checkQuery, checkValues, (checkError, checkResponse) => {
        if (checkError) {
            return res.status(500).json(checkError);
        }

        if (checkResponse.rows.length > 0) {
            return res.status(400).json({ error: "A category with the same name already exists" });
        }

        // Se não existir, inserir o novo registro
        const insertQuery = "INSERT INTO categories(nome) VALUES($1) RETURNING *";
        const insertValues = [nameCategories];

        db.query(insertQuery, insertValues, (insertError, insertResponse) => {
            if (insertError) {
                return res.status(500).json(insertError);
            }

            return res.status(200).json(insertResponse.rows);
        });
    });
});

module.exports = router;