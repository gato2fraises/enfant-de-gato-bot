const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;

if (!clientId || !token || !guildId) {
    console.error('❌ CLIENT_ID, DISCORD_TOKEN et GUILD_ID doivent être définis dans le fichier .env');
    process.exit(1);
}

const commands = [];

// Charger toutes les commandes slash
function loadSlashCommands() {
    const commandsPath = path.join(__dirname, 'slash-commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                console.log(`✅ Commande slash ${command.data.name} chargée`);
            } else {
                console.warn(`⚠️ La commande ${file} n'a pas les propriétés 'data' et 'execute' requises.`);
            }
        } catch (error) {
            console.error(`❌ Erreur lors du chargement de ${file}:`, error);
        }
    }
}

loadSlashCommands();

// Déployer les commandes pour un serveur spécifique (instantané)
async function deployGuildCommands() {
    const rest = new REST().setToken(token);

    try {
        console.log(`🚀 Début du déploiement de ${commands.length} commandes slash pour le serveur ${guildId}...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log(`✅ ${data.length} commandes slash déployées avec succès pour le serveur !`);
        console.log('⚡ Les commandes sont disponibles immédiatement !');
        
        // Afficher la liste des commandes déployées
        console.log('\n📋 Commandes déployées :');
        data.forEach(command => {
            console.log(`  /${command.name} - ${command.description}`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du déploiement des commandes:', error);
    }
}

deployGuildCommands();