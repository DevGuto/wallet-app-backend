const express = require("express");

const router = express.Router();
const db = require("../db");


const findOneId = (id) => {
    return (query = {
        name: "fetch-category",
        text: "SELECT * FROM categories WHERE id = $1",
        values: [Number(id)],
    });
};

const findName = (nameCategories) => {
    return (query = {
        name: "fetch-category",
        text: "SELECT * FROM categories WHERE nome = $1",
        values: [nameCategories],
    });
};


router.get("/", (req, res)=> {
    try {
        db.query("SELECT * FROM categories ORDER BY id ASC", (error, response) => {
            if (error) {
              return res.status(500).json(error);
            }
        
            return res.status(200).json(response.rows);
        });
    } catch (error) {
        return res.status(500).json(error);
    }
  });


router.post("/", (req, res) => {
    try {
        const { nameCategories } = req.body;

        if (nameCategories.length < 3) {
            return res.status(400).json({ error: "Name should have more than 3 characters." });
        }

        db.query(findName(nameCategories), (checkError, checkResponse) => {
            if (checkError) {
                return res.status(500).json(checkError);
            }

            if (checkResponse.rows.length > 0) {
                return res.status(400).json({ error: "A category with the same name already exists." });
            }

            const insertQuery = "INSERT INTO categories(nome) VALUES($1) RETURNING *";
            const insertValues = [nameCategories];

            db.query(insertQuery, insertValues, (insertError, insertResponse) => {
                if (insertError) {
                    return res.status(500).json(insertError);
                }
                return res.status(200).json(insertResponse.rows);
            });
        });
    } catch (error) {
        return res.status(500).json(error);
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if(!id) {
            return res
                .status(400)
                .json({ error: "Param id is mandatory." });
        }

        const query = findOneId(id)
        const category = await db.query(query);

        if(!category.rows[0]) {
            return res.status(404).json({ error: "Category not found." })
        }

        const text = "DELETE FROM categories WHERE id = $1 RETURNING *";
        const values = [ Number(id) ];
        
        const deleteResponse = await db.query(text, values)
        if(!deleteResponse.rows[0]) {
            return res.status(400).json({ error: "Category not deleted." })
        }
        return res.status(200).json(deleteResponse.rows);

    } catch (error) {
        return res.status(500).json(error);
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nameCategories } = req.body;

        if(!id) {
            return res.status(400).json({ error: "Param id is mandatory." });
        }

        if (nameCategories.length < 3) {
            return res.status(400).json({ error: "Name should have more than 3 characters." });
        }

        const query = findOneId(id)
        const category = await db.query(query);

        if(!category.rows[0]) {
            return res.status(404).json({ error: "Category not found." })
        }

        const text = "UPDATE categories SET nome = $1 WHERE id = $2 RETURNING *";
        const values = [nameCategories, Number(id)];

        const updateResponse = await db.query(text, values);
        if(!updateResponse.rows[0]) {
            return res.status(400).json({ error: "Category not updated." })
        }

        return res.status(200).json(updateResponse.rows);
    } catch (error) {
        return res.status(500).json(error);
    }
});

module.exports = router;