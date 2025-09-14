const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'unban',
        description: 'Débannit un utilisateur du serveur'
    },
    async execute(message, args) {
        // Vérifier si l'utilisateur a la permission de bannir
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de débannir des membres !');
        }

        // Vérifier si le bot a la permission de bannir
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ Je n\'ai pas la permission de débannir des membres !');
        }

        // Vérifier qu'un ID utilisateur a été fourni
        const userId = args[0];
        if (!userId) {
            return message.reply('❌ Veuillez fournir l\'ID de l\'utilisateur à débannir !\nExemple: `!unban 123456789 raison`');
        }

        // Vérifier que l'ID est valide
        if (!/^\d{17,19}$/.test(userId)) {
            return message.reply('❌ L\'ID fourni n\'est pas valide !');
        }

        // Récupérer la raison
        const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

        try {
            // Vérifier si l'utilisateur est banni
            const banList = await message.guild.bans.fetch();
            const bannedUser = banList.get(userId);

            if (!bannedUser) {
                return message.reply('❌ Cet utilisateur n\'est pas banni sur ce serveur !');
            }

            // Débannir l'utilisateur
            await message.guild.members.unban(userId, `${reason} | Modérateur: ${message.author.tag}`);

            // Confirmer le débannissement
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Utilisateur débanni')
                .setDescription(`**${bannedUser.user.tag}** a été débanni du serveur`)
                .addFields(
                    { name: 'ID', value: userId, inline: true },
                    { name: 'Raison du débannissement', value: reason, inline: false },
                    { name: 'Modérateur', value: message.author.tag, inline: true },
                    { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: 'Raison du bannissement original', value: bannedUser.reason || 'Aucune raison', inline: false }
                )
                .setThumbnail(bannedUser.user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: 'L\'utilisateur peut maintenant rejoindre le serveur' });

            message.reply({ embeds: [successEmbed] });

            // Log dans la console
            console.log(`✅ ${bannedUser.user.tag} (${userId}) débanni par ${message.author.tag} pour: ${reason}`);

        } catch (error) {
            console.error('Erreur lors du débannissement:', error);
            
            let errorMessage = 'Une erreur est survenue lors du débannissement.';
            
            if (error.code === 10013) {
                errorMessage = 'Utilisateur introuvable. Vérifiez l\'ID fourni.';
            } else if (error.code === 10026) {
                errorMessage = 'Cet utilisateur n\'est pas banni.';
            }

            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription(errorMessage)
                .addFields(
                    { name: 'Code d\'erreur', value: error.code?.toString() || 'Inconnu', inline: true },
                    { name: 'Détails', value: error.message, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    }
};