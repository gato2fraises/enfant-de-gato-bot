const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Arrête la musique et vide la queue'),
                
    async execute(interaction) {
        const musicManager = interaction.client.musicManager;
        
        // Vérifier si l'utilisateur est dans un canal vocal
        if (!interaction.member.voice.channel) {
            return interaction.reply({ 
                content: '❌ Vous devez être dans un canal vocal pour utiliser cette commande !', 
                flags: 64 // MessageFlags.Ephemeral 
            });
        }

        // Différer la réponse immédiatement
        await interaction.deferReply();

        try {
            const result = await musicManager.stop(interaction.guild.id);

            if (!result.success) {
                return interaction.editReply({ content: `❌ ${result.message}` });
            }

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⏹️ Musique arrêtée')
                .setDescription('La musique a été arrêtée et la queue a été vidée.')
                .addFields(
                    { name: '👤 Arrêté par', value: interaction.user.toString(), inline: true },
                    { name: '🎵 Chansons supprimées', value: result.clearedSongs?.toString() || '0', inline: true }
                )
                .setTimestamp();

            interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur dans la commande stop:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de l\'arrêt de la musique.')
                .addFields(
                    { name: 'Détails', value: error.message, inline: false }
                )
                .setTimestamp();

            interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};