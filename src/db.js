const { Pool } = require("pg");

const db = new Pool({
    user: "docker",
    password: "docker",
    database: "postgres",
    host: "localhost",
    port: 5432,
});

module.exports = db;