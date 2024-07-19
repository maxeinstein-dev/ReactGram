const express = require("express");
const router = express();

router.use("/api/users", require("./UserRoutes"));
router.use("/api/photos", require("./PhotoRoutes"));

/* Teste Route */
router.get("/", (req, res) => {
  res.send("API Funcionando");
});

module.exports = router;
