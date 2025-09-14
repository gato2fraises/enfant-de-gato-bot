const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Joue une musique depuis YouTube')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL YouTube de la musique à jouer')
                .setRequired(true)),
                
    async execute(interaction) {
        const musicManager = interaction.client.musicManager;
        
        // Vérifier si l'utilisateur est dans un canal vocal
        if (!interaction.member.voice.channel) {
            return interaction.reply({ 
                content: '❌ Vous devez être dans un canal vocal pour utiliser cette commande !', 
                ephemeral: true 
            });
        }

        const url = interaction.options.getString('url');
        
        // Vérifier si c'est une URL YouTube valide
        const MusicUtils = require('../music/MusicUtils');
        if (!MusicUtils.isValidYouTubeUrl(url)) {
            return interaction.reply({ 
                content: '❌ Veuillez fournir un lien YouTube valide !', 
                ephemeral: true 
            });
        }

        // Différer la réponse car l'opération peut prendre du temps
        await interaction.deferReply();

        // Vérifier à nouveau si l'utilisateur est toujours dans un canal vocal
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.editReply({ 
                content: '❌ Vous n\'êtes plus dans un canal vocal !' 
            });
        }

        try {
            console.log(`🎵 Commande play reçue de ${interaction.user.username}`);
            console.log(`📺 Canal vocal ID: ${voiceChannel.id}`);
            console.log(`🏠 Serveur: ${interaction.guild.name} (${interaction.guild.id})`);
            
            // Utiliser directement les informations de l'interaction
            const result = await musicManager.playFromInteraction(interaction, url);

            if (!result.success) {
                return interaction.editReply({ content: `❌ ${result.message}` });
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎵 Musique ajoutée')
                .setDescription(`**${result.song.title}**`)
                .addFields(
                    { name: '👤 Demandé par', value: interaction.user.toString(), inline: true },
                    { name: '⏱️ Durée', value: result.song.duration || 'Inconnue', inline: true },
                    { name: '📍 Position', value: result.position === 1 ? 'En cours de lecture' : `${result.position} dans la queue`, inline: true }
                )
                .setThumbnail(result.song.thumbnail || null)
                .setTimestamp();

            interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur dans la commande play:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la lecture de la musique.')
                .addFields(
                    { name: 'Détails', value: error.message, inline: false }
                )
                .setTimestamp();

            interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};