const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'untimeout',
        description: 'Retire le timeout d\'un utilisateur'
    },
    async execute(message, args) {
        // Vérifier si l'utilisateur a la permission de modérer
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de retirer les timeouts !');
        }

        // Vérifier si le bot a la permission de modérer
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Je n\'ai pas la permission de retirer les timeouts !');
        }

        // Vérifier qu'un utilisateur a été mentionné
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('❌ Veuillez mentionner un utilisateur pour retirer son timeout !\nExemple: `!untimeout @utilisateur raison`');
        }

        // Récupérer le membre du serveur
        const targetMember = message.guild.members.cache.get(target.id);
        if (!targetMember) {
            return message.reply('❌ Cet utilisateur n\'est pas sur ce serveur !');
        }

        // Vérifier si l'utilisateur est en timeout
        if (!targetMember.isCommunicationDisabled()) {
            return message.reply('❌ Cet utilisateur n\'est pas en timeout !');
        }

        // Récupérer la raison
        const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

        try {
            // Retirer le timeout
            await targetMember.timeout(null, `Timeout retiré: ${reason} | Modérateur: ${message.author.tag}`);

            // Envoyer un DM à l'utilisateur
            const dmEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Timeout retiré')
                .setDescription(`Votre timeout sur **${message.guild.name}** a été retiré`)
                .addFields(
                    { name: 'Raison', value: reason, inline: false },
                    { name: 'Modérateur', value: message.author.tag, inline: true },
                    { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Vous pouvez maintenant participer normalement au serveur.' });

            await target.send({ embeds: [dmEmbed] }).catch(() => {
                console.log(`Impossible d'envoyer un DM à ${target.tag}`);
            });

            // Confirmer la suppression du timeout
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Timeout retiré')
                .setDescription(`Le timeout de **${target.tag}** a été retiré`)
                .addFields(
                    { name: 'ID', value: target.id, inline: true },
                    { name: 'Raison', value: reason, inline: false },
                    { name: 'Modérateur', value: message.author.tag, inline: true },
                    { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setThumbnail(target.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: 'L\'utilisateur peut maintenant participer normalement' });

            message.reply({ embeds: [successEmbed] });

            // Log dans la console
            console.log(`✅ Timeout retiré pour ${target.tag} (${target.id}) par ${message.author.tag}: ${reason}`);

        } catch (error) {
            console.error('Erreur lors de la suppression du timeout:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la suppression du timeout.')
                .addFields(
                    { name: 'Détails', value: error.message, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    }
};