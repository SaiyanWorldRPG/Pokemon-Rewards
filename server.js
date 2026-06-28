const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

app.get("/rewards.json", (req, res) => {
    try {
        const data = fs.readFileSync("rewards.json", "utf8");
        res.setHeader("Content-Type", "application/json");
        res.send(data);
    } catch (err) {
        res.status(500).send({ error: "Erro ao ler rewards.json" });
    }
});

app.post("/update", (req, res) => {
    const { playerId, reward } = req.body;

    if (!playerId || !reward) {
        return res.status(400).send({ error: "Dados inválidos" });
    }

    try {
        const data = fs.readFileSync("rewards.json", "utf8");
        const json = data ? JSON.parse(data) : {};

        if (!json[playerId]) json[playerId] = [];
        json[playerId].push(reward);

        fs.writeFileSync("rewards.json", JSON.stringify(json, null, 2));

        res.send({ success: true });
    } catch (err) {
        res.status(500).send({ error: "Erro ao atualizar rewards.json" });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor de recompensas ativo!");
});
