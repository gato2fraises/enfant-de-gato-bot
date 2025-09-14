const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('activity')
        .setDescription('Affiche les statistiques d\'activité du bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            if (!interaction.client.activityLogger) {
                return await interaction.editReply({
                    content: '❌ ActivityLogger non initialisé'
                });
            }

            const stats = interaction.client.activityLogger.getStats();
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('📊 Statistiques du bot')
                .addFields(
                    { name: 'Durée', value: `${stats.daysSinceStart || 0} jours`, inline: true },
                    { name: 'Commandes', value: `${stats.totalCommands || 0}`, inline: true },
                    { name: 'Utilisateurs', value: `${stats.uniqueUsers || 0}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Statistiques d\'activité' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur /activity:', error);
            await interaction.editReply({
                content: `❌ Erreur: ${error.message}`
            });
        }
    }
};