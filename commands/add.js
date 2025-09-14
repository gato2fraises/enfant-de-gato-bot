const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'add',
        description: 'Ajoute un utilisateur au ticket actuel'
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

        // Vérifier les permissions pour ajouter quelqu'un
        const canAdd = 
            user.id === ticketData.userId || // Créateur du ticket
            message.member.permissions.has(PermissionsBitField.Flags.ManageChannels) || // Modérateur
            message.member.permissions.has(PermissionsBitField.Flags.Administrator); // Admin

        if (!canAdd) {
            return message.reply('❌ Vous n\'avez pas la permission d\'ajouter des utilisateurs à ce ticket !');
        }

        // Vérifier qu'un utilisateur a été mentionné
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('❌ Veuillez mentionner un utilisateur à ajouter au ticket !\nExemple: `!add @utilisateur`');
        }

        // Vérifier que l'utilisateur existe sur le serveur
        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('❌ Cet utilisateur n\'est pas membre de ce serveur !');
        }

        // Vérifier que l'utilisateur n'est pas déjà dans le ticket
        const permissions = channel.permissionsFor(targetMember);
        if (permissions && permissions.has(PermissionsBitField.Flags.ViewChannel)) {
            return message.reply('❌ Cet utilisateur a déjà accès à ce ticket !');
        }

        try {
            // Ajouter l'utilisateur au ticket
            const result = await ticketManager.addUserToTicket(channel, user, targetUser);

            if (!result.success) {
                return message.reply(`❌ ${result.message}`);
            }

            console.log(`➕ ${targetUser.tag} ajouté au ticket #${ticketData.id} par ${user.tag}`);

        } catch (error) {
            console.error('Erreur dans la commande add:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de l\'ajout de l\'utilisateur.')
                .addFields(
                    { name: 'Détails', value: error.message, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    }
};