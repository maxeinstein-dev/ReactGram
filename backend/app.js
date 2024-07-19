require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const port = process.env.PORT;

const app = express();

/* config JSON and form data response */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* Resolver problema de CORS */
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

/* Diretório de Upload */
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

/* Conexão com o Banco */
require("./config/db.js");

/* Rotas */
const router = require("./routes/Router.js");
app.use(router);

app.listen(port, () => {
  console.log(`Server rodando na porta: ${port}`);
});
