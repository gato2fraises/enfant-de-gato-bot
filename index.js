const { Client, GatewayIntentBits, EmbedBuilder, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Chargement de la configuration
const config = require('./config.json');

// Importation des gestionnaires
const MusicManager = require('./music/MusicManager');
const TicketManager = require('./tickets/TicketManager');
const UpdateNotifier = require('./utils/UpdateNotifier');
const ActivityLogger = require('./utils/ActivityLogger');

// Création du client Discord avec les intents nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates // Ajout pour la musique
    ]
});

// Collection pour stocker les commandes
client.commands = new Collection();
client.slashCommands = new Collection();

// Initialisation des gestionnaires
client.musicManager = new MusicManager();
client.ticketManager = new TicketManager();
client.updateNotifier = new UpdateNotifier(client);
client.activityLogger = new ActivityLogger();

// Fonction pour charger les commandes
function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    
    // Créer le dossier commands s'il n'existe pas
    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath);
        console.log('📁 Dossier commands créé');
    }

    // Charger tous les fichiers de commandes (préfixe)
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Commande ${command.data.name} chargée`);
        } else {
            console.log(`⚠️ Commande ${file} incomplète`);
        }
    }
}

// Fonction pour charger les slash commands
function loadSlashCommands() {
    const slashCommandsPath = path.join(__dirname, 'slash-commands');
    
    // Créer le dossier slash-commands s'il n'existe pas
    if (!fs.existsSync(slashCommandsPath)) {
        fs.mkdirSync(slashCommandsPath);
        console.log('📁 Dossier slash-commands créé');
        return;
    }

    // Charger tous les fichiers de slash commands
    const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

    for (const file of slashCommandFiles) {
        const filePath = path.join(slashCommandsPath, file);
        try {
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                client.slashCommands.set(command.data.name, command);
                console.log(`✅ Slash command ${command.data.name} chargée`);
            } else {
                console.warn(`⚠️ La slash command ${file} n'a pas les propriétés requises.`);
            }
        } catch (error) {
            console.error(`❌ Erreur lors du chargement de ${file}:`, error);
        }
    }
}

// Événement : Bot prêt
client.once('ready', async () => {
    console.log(`🚀 ${client.user.tag} est en ligne !`);
    console.log(`📊 Serveurs: ${client.guilds.cache.size}`);
    console.log(`👥 Utilisateurs: ${client.users.cache.size}`);
    
    // Définir le statut du bot
    client.user.setPresence({
        activities: [{ name: config.presence.activity, type: config.presence.type }],
        status: config.presence.status,
    });
    
    // Charger les commandes
    loadCommands();
    loadSlashCommands();
    
    // Envoyer notification de démarrage
    await client.updateNotifier.sendStartupNotification();
});

// Événement : Bot rejoint un nouveau serveur
client.on('guildCreate', async guild => {
    console.log(`🆕 Bot ajouté au serveur: ${guild.name} (ID: ${guild.id})`);
    console.log(`👥 Membres: ${guild.memberCount}`);
    
    // Envoyer notification de nouveau serveur
    await client.updateNotifier.sendNewGuildNotification(guild);
    
    // Trouver un canal pour envoyer un message de présentation
    const channel = guild.channels.cache.find(channel => 
        channel.type === 0 && // TextChannel
        (channel.name.includes('general') || 
         channel.name.includes('bot') || 
         channel.name.includes('commandes') ||
         channel.name.includes('bienvenue')) &&
        channel.permissionsFor(guild.members.me).has('SendMessages')
    ) || guild.channels.cache.find(channel => 
        channel.type === 0 && 
        channel.permissionsFor(guild.members.me).has('SendMessages')
    );

    if (channel) {
        const welcomeEmbed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('🎉 Merci de m\'avoir ajouté !')
            .setDescription(`
                Salut tout le monde ! Je suis **${client.user.username}**, votre nouveau bot Discord ! 🤖
                
                **🎵 Fonctionnalités principales :**
                • Lecture de musique YouTube
                • Commandes de modération
                • Informations sur les utilisateurs
                • Et bien plus encore !
            `)
            .addFields(
                { name: '🚀 Pour commencer', value: `Tapez \`${config.prefix}help\` pour voir toutes les commandes disponibles !`, inline: false },
                { name: '🎵 Musique', value: `Utilisez \`${config.prefix}play <lien YouTube>\` pour jouer de la musique !`, inline: false },
                { name: '❓ Besoin d\'aide ?', value: `Tapez \`${config.prefix}info\` pour plus d'informations sur le bot.`, inline: false }
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Amusez-vous bien ! 🎉' });

        channel.send({ embeds: [welcomeEmbed] }).catch(err => {
            console.log('Impossible d\'envoyer le message de bienvenue:', err.message);
        });
    }
});

// Événement : Bot retiré d'un serveur
client.on('guildDelete', guild => {
    console.log(`❌ Bot retiré du serveur: ${guild.name} (ID: ${guild.id})`);
    console.log(`📊 Serveurs restants: ${client.guilds.cache.size}`);
});

// Événement : Nouveau membre
client.on('guildMemberAdd', member => {
    console.log(`👋 ${member.user.tag} a rejoint ${member.guild.name}`);
    
    // Message de bienvenue (optionnel)
    const welcomeChannel = member.guild.channels.cache.find(channel => 
        channel.name === 'bienvenue' || channel.name === 'general'
    );
    
    if (welcomeChannel) {
        const welcomeEmbed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('👋 Bienvenue !')
            .setDescription(`Bienvenue ${member.user}, sur **${member.guild.name}** !`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: config.embedFooter });
        
        welcomeChannel.send({ embeds: [welcomeEmbed] });
    }
});

// Événement : Interactions (Slash Commands)
client.on('interactionCreate', async interaction => {
    // Ignorer si ce n'est pas une commande slash
    if (!interaction.isChatInputCommand()) return;

    // Récupérer la commande slash
    const command = client.slashCommands.get(interaction.commandName);
    
    if (!command) {
        console.warn(`Aucune commande slash trouvée pour ${interaction.commandName}`);
        return interaction.reply({ 
            content: '❌ Commande non trouvée !', 
            flags: 64 // MessageFlags.Ephemeral
        });
    }

    try {
        // Logger l'activité
        client.activityLogger.logCommand(interaction.commandName, interaction.user.id, interaction.guildId);
        
        await command.execute(interaction);
    } catch (error) {
        console.error(`Erreur lors de l'exécution de la commande slash ${interaction.commandName}:`, error);
        
        // Vérifier si l'interaction est encore valide avant de répondre
        try {
            const errorMessage = {
                content: '❌ Une erreur est survenue lors de l\'exécution de la commande !',
                flags: 64 // MessageFlags.Ephemeral
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        } catch (replyError) {
            // Si on ne peut pas répondre (interaction expirée), on log juste l'erreur
            console.error('❌ Erreur du client Discord:', replyError);
        }
    }
});

// Événement : Messages
client.on('messageCreate', async message => {
    // Ignorer les messages des bots
    if (message.author.bot) return;
    
    // Vérifier si le message commence par le préfixe
    if (!message.content.startsWith(config.prefix)) return;
    
    // Extraire la commande et les arguments
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    // Commandes intégrées simples
    switch (commandName) {
        case 'ping':
            const ping = Date.now() - message.createdTimestamp;
            const apiPing = Math.round(client.ws.ping);
            
            const pingEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('🏓 Pong !')
                .addFields(
                    { name: 'Latence du message', value: `${ping}ms`, inline: true },
                    { name: 'Latence de l\'API', value: `${apiPing}ms`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: config.embedFooter });
            
            message.reply({ embeds: [pingEmbed] });
            break;
            
        case 'help':
        case 'aide':
            const helpEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('📚 Commandes disponibles')
                .setDescription('Voici la liste des commandes disponibles :')
                .addFields(
                    { name: '**🎵 Commandes musicales**', value: '\u200B', inline: false },
                    { name: `${config.prefix}play <lien>`, value: 'Joue une musique depuis YouTube', inline: false },
                    { name: `${config.prefix}stop`, value: 'Arrête la musique et vide la queue', inline: false },
                    { name: `${config.prefix}pause`, value: 'Met en pause la musique', inline: false },
                    { name: `${config.prefix}resume`, value: 'Reprend la lecture', inline: false },
                    { name: `${config.prefix}skip`, value: 'Passe à la chanson suivante', inline: false },
                    { name: `${config.prefix}queue`, value: 'Affiche la liste des chansons', inline: false },
                    { name: `${config.prefix}nowplaying`, value: 'Affiche la chanson actuelle', inline: false },
                    { name: `${config.prefix}loop`, value: 'Active/désactive la répétition', inline: false },
                    { name: `${config.prefix}leave`, value: 'Force le bot à quitter le canal vocal', inline: false },
                    { name: '**�️ Commandes de modération**', value: '\u200B', inline: false },
                    { name: `${config.prefix}ban @user [raison]`, value: 'Bannit un utilisateur du serveur', inline: false },
                    { name: `${config.prefix}unban <ID> [raison]`, value: 'Débannit un utilisateur', inline: false },
                    { name: `${config.prefix}kick @user [raison]`, value: 'Expulse un utilisateur du serveur', inline: false },
                    { name: `${config.prefix}timeout @user <durée> [raison]`, value: 'Met un utilisateur en timeout (ex: 10m)', inline: false },
                    { name: `${config.prefix}untimeout @user [raison]`, value: 'Retire le timeout d\'un utilisateur', inline: false },
                    { name: '**🎫 Commandes de tickets**', value: '\u200B', inline: false },
                    { name: `${config.prefix}ticket [raison]`, value: 'Crée un nouveau ticket de support', inline: false },
                    { name: `${config.prefix}close [raison]`, value: 'Ferme le ticket actuel', inline: false },
                    { name: `${config.prefix}add @user`, value: 'Ajoute un utilisateur au ticket', inline: false },
                    { name: `${config.prefix}remove @user`, value: 'Retire un utilisateur du ticket', inline: false },
                    { name: `${config.prefix}tickets`, value: 'Liste tous les tickets du serveur (Modérateurs)', inline: false },
                    { name: '**🔒 Commandes de sécurité (Admins du bot)**', value: '\u200B', inline: false },
                    { name: `${config.prefix}security`, value: 'Affiche les statistiques et logs de sécurité', inline: false },
                    { name: `${config.prefix}blacklist`, value: 'Gère la blacklist des utilisateurs/serveurs', inline: false },
                    { name: `${config.prefix}botadmin`, value: 'Gère les administrateurs du bot', inline: false },
                    { name: '**�🛠️ Commandes générales**', value: '\u200B', inline: false },
                    { name: `${config.prefix}ping`, value: 'Affiche la latence du bot', inline: false },
                    { name: `${config.prefix}help`, value: 'Affiche cette aide', inline: false },
                    { name: `${config.prefix}info`, value: 'Informations sur le bot', inline: false },
                    { name: `${config.prefix}serveur`, value: 'Informations sur le serveur', inline: false },
                    { name: `${config.prefix}stats`, value: 'Statistiques globales du bot', inline: false },
                    { name: `${config.prefix}invite`, value: 'Génère un lien d\'invitation pour le bot', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: config.embedFooter });
            
            message.reply({ embeds: [helpEmbed] });
            break;
            
        case 'info':
            const infoEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('ℹ️ Informations du bot')
                .setThumbnail(client.user.displayAvatarURL())
                .addFields(
                    { name: 'Nom', value: client.user.tag, inline: true },
                    { name: 'ID', value: client.user.id, inline: true },
                    { name: 'Serveurs', value: `${client.guilds.cache.size}`, inline: true },
                    { name: 'Utilisateurs', value: `${client.users.cache.size}`, inline: true },
                    { name: 'Créé le', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: 'En ligne depuis', value: `<t:${Math.floor(client.readyTimestamp / 1000)}:R>`, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: config.embedFooter });
            
            message.reply({ embeds: [infoEmbed] });
            break;
            
        case 'serveur':
        case 'server':
            const serverEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(`ℹ️ Informations sur ${message.guild.name}`)
                .setThumbnail(message.guild.iconURL())
                .addFields(
                    { name: 'Nom', value: message.guild.name, inline: true },
                    { name: 'ID', value: message.guild.id, inline: true },
                    { name: 'Propriétaire', value: `<@${message.guild.ownerId}>`, inline: true },
                    { name: 'Membres', value: `${message.guild.memberCount}`, inline: true },
                    { name: 'Canaux', value: `${message.guild.channels.cache.size}`, inline: true },
                    { name: 'Rôles', value: `${message.guild.roles.cache.size}`, inline: true },
                    { name: 'Créé le', value: `<t:${Math.floor(message.guild.createdTimestamp / 1000)}:F>`, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: config.embedFooter });
            
            message.reply({ embeds: [serverEmbed] });
            break;
            
        default:
            // Vérifier si c'est une commande personnalisée
            const command = client.commands.get(commandName);
            if (command) {
                try {
                    // Logger l'activité pour les commandes avec préfixe
                    client.activityLogger.logCommand(commandName, message.author.id, message.guildId);
                    
                    await command.execute(message, args);
                } catch (error) {
                    console.error(`Erreur lors de l'exécution de la commande ${commandName}:`, error);
                    message.reply('❌ Une erreur est survenue lors de l\'exécution de cette commande.');
                }
            }
            break;
    }
});

// Gestion des erreurs
client.on('error', async error => {
    console.error('❌ Erreur du client Discord:', error);
    await client.updateNotifier.sendErrorNotification(error);
});

process.on('unhandledRejection', async error => {
    console.error('❌ Promesse rejetée non gérée:', error);
    await client.updateNotifier.sendErrorNotification(error);
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
    console.log('🛑 Arrêt du bot demandé...');
    await client.updateNotifier.sendShutdownNotification();
    client.destroy();
    process.exit(0);
});

// Connexion du bot
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ ERREUR: Token Discord manquant !');
    console.log('📝 Créez un fichier .env et ajoutez votre token Discord:');
    console.log('DISCORD_TOKEN=votre_token_ici');
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);