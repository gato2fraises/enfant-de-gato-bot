const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendupdate')
        .setDescription('Envoie une notification d\'update personnalisée (Admin seulement)')
        .addStringOption(option =>
            option.setName('titre')
                .setDescription('Titre de la notification')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description de la notification')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type de notification')
                .setRequired(false)
                .addChoices(
                    { name: 'Info', value: 'info' },
                    { name: 'Succès', value: 'success' },
                    { name: 'Avertissement', value: 'warning' },
                    { name: 'Erreur', value: 'error' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const titre = interaction.options.getString('titre');
        const description = interaction.options.getString('description');
        const type = interaction.options.getString('type') || 'info';

        try {
            await interaction.client.updateNotifier.sendUpdate(
                titre,
                description,
                type,
                [
                    {
                        name: '👤 Envoyé par',
                        value: `<@${interaction.user.id}>`,
                        inline: true
                    },
                    {
                        name: '📍 Depuis',
                        value: interaction.guild.name,
                        inline: true
                    }
                ]
            );

            await interaction.reply({
                content: `✅ Notification envoyée avec succès !`,
                flags: 64 // Ephemeral
            });

        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification:', error);
            await interaction.reply({
                content: '❌ Erreur lors de l\'envoi de la notification.',
                flags: 64 // Ephemeral
            });
        }
    },
};