const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'remove',
        description: 'Retire un utilisateur du ticket actuel'
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

        // Vérifier les permissions pour retirer quelqu'un
        const canRemove = 
            user.id === ticketData.userId || // Créateur du ticket
            message.member.permissions.has(PermissionsBitField.Flags.ManageChannels) || // Modérateur
            message.member.permissions.has(PermissionsBitField.Flags.Administrator); // Admin

        if (!canRemove) {
            return message.reply('❌ Vous n\'avez pas la permission de retirer des utilisateurs de ce ticket !');
        }

        // Vérifier qu'un utilisateur a été mentionné
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('❌ Veuillez mentionner un utilisateur à retirer du ticket !\nExemple: `!remove @utilisateur`');
        }

        // Vérifier que l'utilisateur existe sur le serveur
        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('❌ Cet utilisateur n\'est pas membre de ce serveur !');
        }

        // Vérifier qu'on ne retire pas le créateur du ticket ou un admin
        if (targetUser.id === ticketData.userId) {
            return message.reply('❌ Vous ne pouvez pas retirer le créateur du ticket !');
        }

        if (targetMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous ne pouvez pas retirer un administrateur du ticket !');
        }

        // Vérifier que l'utilisateur a accès au ticket
        const permissions = channel.permissionsFor(targetMember);
        if (!permissions || !permissions.has(PermissionsBitField.Flags.ViewChannel)) {
            return message.reply('❌ Cet utilisateur n\'a pas accès à ce ticket !');
        }

        try {
            // Retirer l'utilisateur du ticket
            const result = await ticketManager.removeUserFromTicket(channel, user, targetUser);

            if (!result.success) {
                return message.reply(`❌ ${result.message}`);
            }

            console.log(`➖ ${targetUser.tag} retiré du ticket #${ticketData.id} par ${user.tag}`);

        } catch (error) {
            console.error('Erreur dans la commande remove:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors du retrait de l\'utilisateur.')
                .addFields(
                    { name: 'Détails', value: error.message, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    }
};