const express = require("express");
const fs = require("fs");
const app = express();

app.get("/rewards.json", (req, res) => {
    try {
        const data = fs.readFileSync("rewards.json", "utf8");
        res.setHeader("Content-Type", "application/json");
        res.send(data);
    } catch (err) {
        res.status(500).send({ error: "Erro ao ler rewards.json" });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor de recompensas ativo!");
});
