const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testupdate')
        .setDescription('Teste le système de notifications d\'updates (Admin seulement)')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type de notification à tester')
                .setRequired(true)
                .addChoices(
                    { name: 'Info', value: 'info' },
                    { name: 'Succès', value: 'success' },
                    { name: 'Avertissement', value: 'warning' },
                    { name: 'Erreur', value: 'error' }
                ))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message personnalisé pour le test')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const type = interaction.options.getString('type');
        const customMessage = interaction.options.getString('message') || 'Ceci est un test du système de notifications.';

        try {
            await interaction.client.updateNotifier.sendUpdate(
                `Test de notification - ${type.toUpperCase()}`,
                customMessage,
                type,
                [
                    {
                        name: '🧪 Test initié par',
                        value: `<@${interaction.user.id}>`,
                        inline: true
                    },
                    {
                        name: '📍 Serveur',
                        value: interaction.guild.name,
                        inline: true
                    }
                ]
            );

            await interaction.reply({
                content: `✅ Notification de test envoyée avec succès ! Type: **${type}**`,
                flags: 64 // Ephemeral
            });

        } catch (error) {
            console.error('Erreur lors du test de notification:', error);
            await interaction.reply({
                content: '❌ Erreur lors de l\'envoi de la notification de test.',
                flags: 64 // Ephemeral
            });
        }
    },
};