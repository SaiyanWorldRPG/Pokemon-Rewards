const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

// Retorna o JSON limpo para o jogo (Usa res.json em vez de res.send de string)
app.get("/rewards.json", (req, res) => {
    try {
        if (!fs.existsSync("rewards.json")) {
            return res.json({});
        }
        const data = fs.readFileSync("rewards.json", "utf8");
        const json = data ? JSON.parse(data) : {};
        res.json(json);
    } catch (err) {
        console.error("Erro ao ler rewards.json:", err);
        res.status(500).json({ error: "Erro ao ler rewards.json" });
    }
});

// Adiciona recompensa (chamado pelo bot)
app.post("/update", (req, res) => {
    const { playerId, reward } = req.body;

    if (!playerId || !reward) {
        return res.status(400).json({ error: "Dados inválidos" });
    }

    try {
        let json = {};
        if (fs.existsSync("rewards.json")) {
            const data = fs.readFileSync("rewards.json", "utf8");
            json = data ? JSON.parse(data) : {};
        }

        if (!json[playerId]) json[playerId] = [];
        json[playerId].push(reward);

        fs.writeFileSync("rewards.json", JSON.stringify(json, null, 2));
        console.log(`Recompensa adicionada para o jogador: ${playerId}`);

        res.json({ success: true });
    } catch (err) {
        console.error("Erro ao atualizar rewards.json:", err);
        res.status(500).json({ error: "Erro ao atualizar rewards.json" });
    }
});

// LIMPA RECOMPENSAS (chamado pelo jogo)
app.post("/clear", (req, res) => {
    const { playerId } = req.body;

    if (!playerId) {
        return res.status(400).json({ error: "playerId ausente" });
    }

    try {
        if (!fs.existsSync("rewards.json")) {
            return res.json({ success: true });
        }

        const data = fs.readFileSync("rewards.json", "utf8");
        const json = data ? JSON.parse(data) : {};

        if (json[playerId]) {
            delete json[playerId];
            fs.writeFileSync("rewards.json", JSON.stringify(json, null, 2));
            console.log(`Recompensas limpas/deletadas para o jogador: ${playerId}`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Erro ao limpar recompensas:", err);
        res.status(500).json({ error: "Erro ao limpar recompensas" });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor de recompensas ativo!");
});
