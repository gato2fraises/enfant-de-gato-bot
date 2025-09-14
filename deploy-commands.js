const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_TOKEN;

if (!clientId || !token) {
    console.error('❌ CLIENT_ID et DISCORD_TOKEN doivent être définis dans le fichier .env');
    process.exit(1);
}

const commands = [];

// Fonction pour charger toutes les commandes slash
function loadSlashCommands() {
    const commandsPath = path.join(__dirname, 'slash-commands');
    
    if (!fs.existsSync(commandsPath)) {
        console.log('📁 Dossier slash-commands créé');
        fs.mkdirSync(commandsPath);
        return;
    }

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

// Charger toutes les commandes slash depuis le dossier slash-commands
loadSlashCommands();

// Déployer les commandes
async function deployCommands() {
    const rest = new REST().setToken(token);

    try {
        console.log(`🚀 Début du déploiement de ${commands.length} commandes slash...`);

        // Déployer globalement (peut prendre jusqu'à 1 heure pour se propager)
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );

        console.log(`✅ ${data.length} commandes slash déployées avec succès !`);
        
        // Afficher la liste des commandes déployées
        console.log('\n📋 Commandes déployées :');
        data.forEach(command => {
            console.log(`  /${command.name} - ${command.description}`);
        });

    } catch (error) {
        console.error('❌ Erreur lors du déploiement des commandes:', error);
    }
}

// Fonction pour déployer sur un serveur spécifique (plus rapide pour les tests)
async function deployGuildCommands(guildId) {
    const rest = new REST().setToken(token);

    try {
        console.log(`🚀 Début du déploiement de ${commands.length} commandes slash sur le serveur ${guildId}...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log(`✅ ${data.length} commandes slash déployées sur le serveur !`);

    } catch (error) {
        console.error('❌ Erreur lors du déploiement des commandes sur le serveur:', error);
    }
}

// Fonction pour supprimer toutes les commandes
async function deleteAllCommands() {
    const rest = new REST().setToken(token);

    try {
        console.log('🗑️ Suppression de toutes les commandes slash...');

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] }
        );

        console.log('✅ Toutes les commandes slash ont été supprimées !');

    } catch (error) {
        console.error('❌ Erreur lors de la suppression des commandes:', error);
    }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--delete')) {
    deleteAllCommands();
} else if (args.includes('--guild') && args[args.indexOf('--guild') + 1]) {
    const guildId = args[args.indexOf('--guild') + 1];
    deployGuildCommands(guildId);
} else {
    deployCommands();
}

module.exports = { deployCommands, deployGuildCommands, deleteAllCommands };