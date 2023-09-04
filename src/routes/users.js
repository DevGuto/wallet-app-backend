const express = require("express");
const router = express.Router();
const db = require("../db");

const findOneId = (id) => {
    return (query = {
        name: "fetch-user",
        text: "SELECT * FROM users WHERE id = $1",
        values: [Number(id)],
    });
};

const itExists = (name, email) => {
    return (query = {
        name: "fetch-user",
        text: "SELECT * FROM users WHERE name = $1 OR email = $2",
        values: [name, email],
    });
};


router.get("/", (req, res)=> {
    try {
        db.query("SELECT * FROM users ORDER BY id ASC", (error, response) => {
            if (error) {
              return res.status(500).json(error);
            }
        
            return res.status(200).json(response.rows);
        });
    } catch (error) {
        return res.status(500).json(error);
    }
  });

router.post("/", async (req, res) => {
    try {
        const { name, email } = req.body;

        if (name.length < 3) {
            return res.status(400).json({ error: "Name should have more than 3 characters." });
        }

        if (email.length < 5 || !email.includes("@")) {
            return res.status(400).json({error: "E-mail is invalid."});
        }

        db.query(itExists(name, email), (checkError, checkResponse) => {
            if (checkError) {
                return res.status(500).json(checkError);
            }

            if (checkResponse.rows.length > 0) {
                return res.status(400).json({ error: "Username or email already exists." });
            }

            const insertQuery = "INSERT INTO users(name, email) VALUES($1, $2) RETURNING *";
            const insertValues = [name, email];

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
        const user = await db.query(query);

        if(!user.rows[0]) {
            return res.status(404).json({ error: "User not found." })
        }

        const text = "DELETE FROM users WHERE id = $1 RETURNING *";
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
        const { name, email } = req.body;

        if(!id) {
            return res.status(400).json({ error: "Param id is mandatory." });
        }

        if (name.length < 3) {
            return res.status(400).json({ error: "Name should have more than 3 characters." });
        }

        if (email.length < 5 || !email.includes("@")) {
            return res.status(400).json({error: "E-mail is invalid."});
        }

        const query = findOneId(id)
        const user = await db.query(query);

        if(!user.rows[0]) {
            return res.status(404).json({ error: "User not found." })
        }

        const text = "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *";
        const values = [name, email, Number(id)];

        const updateResponse = await db.query(text, values);
        if(!updateResponse.rows[0]) {
            return res.status(400).json({ error: "User not updated." })
        }

        return res.status(200).json(updateResponse.rows);
    } catch (error) {
        return res.status(500).json(error);
    }
});

module.exports = router;