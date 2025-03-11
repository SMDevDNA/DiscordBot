require('dotenv').config();

const { readFileSync } = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');

const token = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json({ limit: '50mb' }));  // Збільшуємо ліміт для JSON
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Чтение Lua файла как строки
function readLuaFile(path) {
    const content = readFileSync(path, 'utf8');
    return content;
}

let luaData;

client.once('ready', () => {
    console.log('Bot is online!');
    luaData = readLuaFile('./GuildDataWorker.lua');
});

client.on('error', console.error);

// Пример поиска имени пользователя
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!syncRolesForAllMembers')) {

        const regex = /\["Name"\] *= *"([^"]+)"/g;
        let match;
        let memberFound = false;
        const role = message.guild.roles.cache.get('1173284062195093535');


        const guildId = message.guild.id;
        const guild = client.guilds.cache.get(guildId);
        try {
            const members = await guild.members.fetch(); // Завантажує всіх учасників сервера
            members.forEach(member => {
                while ((match = regex.exec(luaData)) !== null) {
                    if (match[1] === "@" + member.displayName) {
                        memberFound = true;
                        console.log(`${member.displayName} (${member.id})`);
                        member.roles.add(role);
                        break;
                    }
                }
            });
        } catch (error) {
            console.error(`Ошибка при получении участников сервера ${guild.name}:`, error);
        }
        return;
    }

    if (message.content.startsWith('!checkMember')) {
        console.log("Check" + message.content);
        const username = message.content.split(' ')[1];
        if (!username) {
            return message.reply('Пожалуйста, укажите никнейм.');
        }
        console.log(username);

        const regex = /\["Name"\] *= *"([^"]+)"/g;
        let match;
        let memberFound = false;

        while ((match = regex.exec(luaData)) !== null) {
            if (match[1] === username) {
                memberFound = true;
                break;
            }
        }

        if (match) {
            message.reply(`Пользователь ${username} найден в гильдии!`);
        } else {
            message.reply(`Пользователь ${username} не найден.`);
        }
    }
});

app.use(express.json());

app.post('/updateLuaData', (req, res) => {
    const { data } = req.body; // Отримуємо дані з тіла запиту
    if (!data) {
        return res.status(400).send({ error: 'Не указаны данные для записи.' });
    }

    // Записуємо отримані дані в змінну luaData
    luaData = data;

    console.log('LuaData обновлено:', luaData);

    // Повертаємо успішну відповідь
    return res.status(200).send({ message: 'Данные успешно обновлены.' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

client.login(token);