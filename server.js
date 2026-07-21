const express = require("express");
const { Octokit } = require("@octokit/rest");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const owner = process.env.GITHUB_USER;
const repo = process.env.GITHUB_REPO;
const filePath = "docs/rewards.json";

async function getRewardsJSON() {
  try {
    const res = await octokit.repos.getContent({ owner, repo, path: filePath });
    const content = Buffer.from(res.data.content, "base64").toString("utf8");
    return { json: JSON.parse(content), sha: res.data.sha };
  } catch (err) {
    console.error("Erro ao baixar rewards.json do GitHub:", err);
    return { json: {}, sha: null };
  }
}

async function saveRewardsJSON(newJSON, sha) {
  try {
    const contentEncoded = Buffer.from(JSON.stringify(newJSON, null, 2)).toString("base64");
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: "Atualizar recompensas via Servidor",
      content: contentEncoded,
      sha
    });
    return true;
  } catch (err) {
    console.error("Erro ao salvar rewards.json no GitHub:", err);
    return false;
  }
}

// Rota /clear universal (aceita req.body de qualquer formato)
app.post("/clear", async (req, res) => {
    console.log("-> ROTA /CLEAR ACESSADA! Body recebido:", req.body);
    
    const playerId = req.body && req.body.playerId;

    if (!playerId) {
        console.log("-> Erro: playerId veio vazio.");
        return res.status(400).json({ error: "playerId ausente" });
    }

    try {
        const { json, sha } = await getRewardsJSON();

        if (json[playerId]) {
            delete json[playerId];
            const success = await saveRewardsJSON(json, sha);
            if (success) {
                console.log(`-> Recompensas limpas com sucesso para o jogador: ${playerId}`);
                return res.json({ success: true });
            }
        }

        console.log(`-> ID ${playerId} não encontrado para limpar.`);
        return res.json({ success: true });
    } catch (err) {
        console.error("-> Erro ao limpar recompensas:", err);
        return res.status(500).json({ error: "Erro ao limpar recompensas" });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor web de recompensas ativo!");
});
