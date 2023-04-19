const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const app = express();

app.use(cors());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tienda_paypal'
});
connection.connect((err) => {
    if (err) {
        console.log("No se ha podido establecer la conexión. Error: " + err);
        return;
    }
    console.log("Conexión establecida correctamente");
});

app.get("/", (req, res) => {
    connection.query("SELECT * FROM tblproductos", (err, results, fields) => {
        if (err) {
            console.log(err);
            let response = {
                error: err
            }
            res.send(JSON.stringify(response));
        }
        res.send(JSON.stringify(results));
    });
});

app.listen(3500, () => { console.log("Servidor escuchando en 3500") });