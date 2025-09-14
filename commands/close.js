const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'close',
        description: 'Ferme le ticket actuel'
    },
    async execute(message, args) {
        const ticketManager = message.client.ticketManager;
        const channel = message.channel;
        const user = message.author;

        // Vérifier que la commande est utilisée dans un ticket
        if (!ticketManager.isTicketChannel(channel.id)) {
            return message.reply('❌ Cette commande ne peut être utilisée que dans un ticket !');
        }

        const ticketData = ticketManager.getTicketData(channel.id);

        // Vérifier les permissions pour fermer le ticket
        const canClose = 
            user.id === ticketData.userId || // Créateur du ticket
            message.member.permissions.has(PermissionsBitField.Flags.ManageChannels) || // Modérateur
            message.member.permissions.has(PermissionsBitField.Flags.Administrator); // Admin

        if (!canClose) {
            return message.reply('❌ Vous n\'avez pas la permission de fermer ce ticket ! Seul le créateur du ticket ou un modérateur peut le fermer.');
        }

        // Récupérer la raison de fermeture
        const reason = args.join(' ') || 'Aucune raison spécifiée';

        // Vérifier si la raison n'est pas trop longue
        if (reason.length > 200) {
            return message.reply('❌ La raison de fermeture est trop longue ! (Maximum 200 caractères)');
        }

        try {
            // Demander confirmation si ce n'est pas le créateur du ticket
            if (user.id !== ticketData.userId) {
                const confirmEmbed = new EmbedBuilder()
                    .setColor('#ff9900')
                    .setTitle('⚠️ Confirmation de fermeture')
                    .setDescription(`Êtes-vous sûr de vouloir fermer ce ticket ?`)
                    .addFields(
                        { name: '👤 Créateur du ticket', value: `<@${ticketData.userId}>`, inline: true },
                        { name: '📝 Raison de fermeture', value: reason, inline: true },
                        { name: '⚠️ Attention', value: 'Cette action est irréversible et le canal sera supprimé.', inline: false }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Retapez !close pour confirmer ou ignorez ce message pour annuler.' });

                await message.reply({ embeds: [confirmEmbed] });
                return;
            }

            // Fermer le ticket
            const result = await ticketManager.closeTicket(channel, user, reason);

            if (!result.success) {
                return message.reply(`❌ ${result.message}`);
            }

            // Le message de fermeture est géré dans le TicketManager
            console.log(`🔒 Ticket #${result.ticketData.id} fermé par ${user.tag}`);

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

            message.reply({ embeds: [errorEmbed] });
        }
    }
};