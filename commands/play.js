const { EmbedBuilder } = require('discord.js');
const MusicUtils = require('../music/MusicUtils');

module.exports = {
    data: {
        name: 'play',
        description: 'Joue une musique depuis YouTube'
    },
    async execute(message, args) {
        const musicManager = message.client.musicManager;
        
        // Vérifier si l'utilisateur est dans un canal vocal
        if (!message.member.voice.channel) {
            return message.reply('❌ Vous devez être dans un canal vocal pour utiliser cette commande !');
        }

        // Vérifier si une URL a été fournie
        if (!args[0]) {
            return message.reply('❌ Veuillez fournir un lien YouTube !\nExemple: `!play https://www.youtube.com/watch?v=...`');
        }

        const url = args[0];

        // Vérifier si c'est une URL YouTube valide
        if (!MusicUtils.isValidYouTubeUrl(url)) {
            return message.reply('❌ Veuillez fournir un lien YouTube valide !\nExemple: `!play https://www.youtube.com/watch?v=...`');
        }

        // Afficher un message de chargement
        const loadingEmbed = new EmbedBuilder()
            .setColor('#ffff00')
            .setTitle('🔄 Chargement...')
            .setDescription('Récupération des informations de la vidéo...')
            .setTimestamp();

        const loadingMessage = await message.reply({ embeds: [loadingEmbed] });

        try {
            // Récupérer les informations de la vidéo
            const videoInfo = await MusicUtils.getVideoInfo(url);
            
            if (!videoInfo) {
                await loadingMessage.edit({
                    embeds: [new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Erreur')
                        .setDescription('Impossible de récupérer les informations de cette vidéo.')
                        .setTimestamp()]
                });
                return;
            }

            // Créer l'objet chanson
            const song = {
                title: videoInfo.title,
                url: videoInfo.url,
                duration: videoInfo.duration,
                thumbnail: videoInfo.thumbnail,
                author: videoInfo.author,
                requestedBy: message.author
            };

            // Récupérer le gestionnaire de musique depuis le client
            const musicManager = message.client.musicManager;
            
            // Vérifier si le bot est déjà connecté à un canal vocal
            if (!musicManager.isConnected(message.guild.id)) {
                const connection = await musicManager.joinChannel(message.member, message.channel);
                if (!connection) {
                    await loadingMessage.delete();
                    return;
                }
                
                const queue = musicManager.getQueue(message.guild.id);
                queue.connection = connection;
            }

            // Supprimer le message de chargement
            await loadingMessage.delete();

            // Ajouter la chanson à la queue
            await musicManager.addSong(message.guild.id, song, message.channel);

        } catch (error) {
            console.error('Erreur lors de la commande play:', error);
            
            await loadingMessage.edit({
                embeds: [new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Erreur')
                    .setDescription('Une erreur est survenue lors du traitement de votre demande.')
                    .setTimestamp()]
            });
        }
    }
};