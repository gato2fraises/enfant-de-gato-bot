const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Ferme le ticket actuel')
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison de la fermeture')
                .setRequired(false)
                .setMaxLength(200)),
                
    async execute(interaction) {
        const ticketManager = interaction.client.ticketManager;
        const channel = interaction.channel;
        const user = interaction.user;

        // Vérifier que la commande est utilisée dans un ticket
        if (!ticketManager.isTicketChannel(channel.id)) {
            return interaction.reply({ 
                content: '❌ Cette commande ne peut être utilisée que dans un ticket !', 
                flags: 64 // MessageFlags.Ephemeral 
            });
        }

        const ticketData = ticketManager.getTicketData(channel.id);

        // Vérifier les permissions pour fermer le ticket
        const canClose = 
            user.id === ticketData.userId || // Créateur du ticket
            interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) || // Modérateur
            interaction.member.permissions.has(PermissionFlagsBits.Administrator); // Admin

        if (!canClose) {
            return interaction.reply({ 
                content: '❌ Vous n\'avez pas la permission de fermer ce ticket !', 
                flags: 64 // MessageFlags.Ephemeral 
            });
        }

        const reason = interaction.options.getString('raison') || 'Fermeture demandée';

        // Différer la réponse
        await interaction.deferReply();

        try {
            // Créer l'embed de confirmation
            const confirmEmbed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('⚠️ Confirmation de fermeture')
                .setDescription(`Êtes-vous sûr de vouloir fermer ce ticket ?`)
                .addFields(
                    { name: '🎫 Ticket', value: `#${ticketData.id}`, inline: true },
                    { name: '👤 Créateur', value: `<@${ticketData.userId}>`, inline: true },
                    { name: '📝 Raison', value: reason, inline: false },
                    { name: '⚠️ Action irréversible', value: 'Ce ticket sera supprimé dans 10 secondes après confirmation.', inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [confirmEmbed] });

            // Fermer le ticket après un délai de 5 secondes
            setTimeout(async () => {
                try {
                    const result = await ticketManager.closeTicket(channel, user, reason);

                    if (!result.success) {
                        console.error('Erreur lors de la fermeture du ticket:', result.message);
                        return;
                    }

                    console.log(`🔒 Ticket #${ticketData.id} fermé par ${user.tag} dans ${channel.guild.name}`);

                } catch (error) {
                    console.error('Erreur lors de la fermeture du ticket:', error);
                }
            }, 5000);

        } catch (error) {
            console.error('Erreur dans la commande close:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la fermeture du ticket.')
                .addFields(
                    { name: 'Détails', value: error.message, inline: false }
                )
                .setTimestamp();

            interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};