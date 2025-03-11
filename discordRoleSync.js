require('dotenv').config();

const { readFileSync } = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

const token = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

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

client.login(token);