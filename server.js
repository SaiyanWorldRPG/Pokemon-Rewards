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

// Rota /clear alterada para GET para aceitar a chamada via pbDownloadToString do RPG Maker
app.get("/clear", async (req, res) => {
    const playerId = req.query.playerId;
    console.log(`-> Rota GET /clear acessada para o ID: ${playerId}`);

    if (!playerId) {
        console.log("-> Erro: playerId ausente.");
        return res.status(400).json({ success: false, error: "playerId ausente" });
    }

    try {
        const { json, sha } = await getRewardsJSON();

        if (json[playerId]) {
            delete json[playerId];
            const success = await saveRewardsJSON(json, sha);
            if (success) {
                console.log(`-> Recompensas limpas com sucesso para o jogador: ${playerId}`);
                return res.json({ success: true, message: "Removido com sucesso" });
            }
        }

        console.log(`-> ID ${playerId} não encontrado para limpar.`);
        return res.json({ success: true, message: "ID não encontrado, mas ignorado" });
    } catch (err) {
        console.error("-> Erro ao limpar recompensas:", err);
        return res.status(500).json({ success: false, error: "Erro interno" });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor web de recompensas ativo!");
});
