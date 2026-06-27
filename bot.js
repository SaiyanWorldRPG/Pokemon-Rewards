require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

// ===============================
// CONFIGURAÇÕES DO BOT
// ===============================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ===============================
// CONFIGURAÇÕES DO GITHUB
// ===============================
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const repoOwner = "SaiyanWorldRPG";
const repoName = "Pokemon-Rewards";
const filePath = "rewards.json";

// Função para atualizar recompensas no GitHub
async function updateRewards(playerId, reward) {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    try {
        // 1. Baixar o arquivo atual
        const response = await axios.get(url, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        const sha = response.data.sha;
        const content = Buffer.from(response.data.content, "base64").toString();
        const json = content ? JSON.parse(content) : {};

        // 2. Adicionar recompensa
        if (!json[playerId]) json[playerId] = [];
        json[playerId].push(reward);

        // 3. Enviar arquivo atualizado
        const newContent = Buffer.from(JSON.stringify(json, null, 2)).toString("base64");

        await axios.put(url, {
            message: `Adicionar recompensa para ${playerId}`,
            content: newContent,
            sha: sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        return true;

    } catch (err) {
        console.error("Erro ao atualizar recompensas:", err);
        return false;
    }
}

// ===============================
// EVENTO: BOT ONLINE
// ===============================
client.on("ready", () => {
    console.log(`Bot online como ${client.user.tag}`);
});

// ===============================
// EVENTO: MENSAGENS
// ===============================
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // Comando de teste
    if (message.content === "!ping") {
        return message.reply("Pong!");
    }

    // ===============================
    // COMANDO !give
    // ===============================
    if (message.content.startsWith("!give")) {
        const args = message.content.split(" ");

        if (args.length < 5) {
            return message.reply("Uso correto: !give <PUBLIC_ID> item/pokemon <ITEM/ESPECIE> <QTD/NIVEL>");
        }

        const playerId = args[1];
        const type = args[2];

        // ITEM
        if (type === "item") {
            const item = args[3];
            const qty = parseInt(args[4]);

            const ok = await updateRewards(playerId, {
                type: "item",
                item: item,
                qty: qty
            });

            if (ok) {
                message.reply(`Item enviado para ${playerId}!`);
            } else {
                message.reply("Erro ao enviar recompensa.");
            }
        }

        // POKEMON
        if (type === "pokemon") {
            const species = args[3];
            const level = parseInt(args[4]);

            const ok = await updateRewards(playerId, {
                type: "pokemon",
                species: species,
                level: level
            });

            if (ok) {
                message.reply(`Pokémon enviado para ${playerId}!`);
            } else {
                message.reply("Erro ao enviar recompensa.");
            }
        }
    }
});

// ===============================
// LOGIN DO BOT
// ===============================
client.login(process.env.TOKEN);
