const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
    connection.query("SELECT * FROM tblproductos", (err, results) => {
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

app.post("/confirmarpago", (req, res) => {
    console.log(req.body);
    res.send(JSON.stringify({ "resp": "ok" }));
});

app.post("/pagar", (req, res) => {
    let total = 0;
    req.body.carrito.map(p => total += p.cantidad * p.precio);

    // Guardar venta
    let consulta = `insert into tblventas (fecha, email, total, status) 
                    values (now(), ?, ${total}, 'PENDIENTE')`;

    let statement = connection.query(consulta, [req.body.email], (err, result) => {
        if (err) throw err;
        console.log('Se insertó ' + result.affectedRows + ' fila(s) en tblVentas (id: ' + result.insertId + ')');
        let idVenta = result.insertId;

        //Insertamos el detalle de la venta
        let insertDetalle = "insert into tbldetalledeventa (idventa, idproducto, precio, cantidad, descargado) values ";
        let detalle = "";
        req.body.carrito.map(p => detalle += `(${idVenta},${p.id},${p.precio},${p.cantidad},0),`);
        detalle = detalle.substring(0, detalle.length - 1);
        connection.query(insertDetalle + detalle, [], (err, result) => {
            if (err) {
                console.log(err);
                res.send(JSON.stringify({ 'resp': 'No ok!' }));
            } else {
                console.log('Se insertaron ' + result.affectedRows + ' filas en tblDetalleDeVentas');
            }
            res.send(JSON.stringify({ "resp": 'ok' }));
        });
    });
});

app.listen(3500, () => { console.log("Servidor escuchando en 3500") });