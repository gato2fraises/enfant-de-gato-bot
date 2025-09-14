const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'kick',
        description: 'Expulse un utilisateur du serveur (sans bannir)'
    },
    async execute(message, args) {
        // Vérifier si l'utilisateur a la permission d'expulser
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission d\'expulser des membres !');
        }

        // Vérifier si le bot a la permission d'expulser
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply('❌ Je n\'ai pas la permission d\'expulser des membres !');
        }

        // Vérifier qu'un utilisateur a été mentionné
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('❌ Veuillez mentionner un utilisateur à expulser !\nExemple: `!kick @utilisateur raison`');
        }

        // Récupérer le membre du serveur
        const targetMember = message.guild.members.cache.get(target.id);
        if (!targetMember) {
            return message.reply('❌ Cet utilisateur n\'est pas sur ce serveur !');
        }

        // Vérifier que l'utilisateur n'essaie pas de s'expulser lui-même
        if (target.id === message.author.id) {
            return message.reply('❌ Vous ne pouvez pas vous expulser vous-même !');
        }

        // Vérifier que l'utilisateur n'essaie pas d'expulser le bot
        if (target.id === message.client.user.id) {
            return message.reply('❌ Vous ne pouvez pas m\'expulser !');
        }

        // Vérifier la hiérarchie des rôles
        if (targetMember.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply('❌ Vous ne pouvez pas expulser cet utilisateur car il a un rôle égal ou supérieur au vôtre !');
        }

        if (targetMember.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            return message.reply('❌ Je ne peux pas expulser cet utilisateur car il a un rôle égal ou supérieur au mien !');
        }

        // Vérifier si l'utilisateur est expulsable
        if (!targetMember.kickable) {
            return message.reply('❌ Je ne peux pas expulser cet utilisateur !');
        }

        // Récupérer la raison
        const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

        try {
            // Envoyer un message privé à l'utilisateur avant de l'expulser
            const dmEmbed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('👢 Vous avez été expulsé')
                .setDescription(`Vous avez été expulsé du serveur **${message.guild.name}**`)
                .addFields(
                    { name: 'Raison', value: reason, inline: false },
                    { name: 'Modérateur', value: message.author.tag, inline: true },
                    { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: 'Note', value: 'Vous pouvez rejoindre le serveur avec un nouveau lien d\'invitation.', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'Si vous pensez que cette expulsion est injuste, contactez les administrateurs.' });

            // Essayer d'envoyer le DM
            await target.send({ embeds: [dmEmbed] }).catch(() => {
                console.log(`Impossible d'envoyer un DM à ${target.tag}`);
            });

            // Expulser l'utilisateur
            await targetMember.kick(`${reason} | Modérateur: ${message.author.tag}`);

            // Confirmer l'expulsion
            const successEmbed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('👢 Utilisateur expulsé')
                .setDescription(`**${target.tag}** a été expulsé du serveur`)
                .addFields(
                    { name: 'ID', value: target.id, inline: true },
                    { name: 'Raison', value: reason, inline: false },
                    { name: 'Modérateur', value: message.author.tag, inline: true },
                    { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setThumbnail(target.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: 'L\'utilisateur peut rejoindre avec un nouveau lien d\'invitation' });

            message.reply({ embeds: [successEmbed] });

            // Log dans la console
            console.log(`👢 ${target.tag} (${target.id}) expulsé par ${message.author.tag} pour: ${reason}`);

        } catch (error) {
            console.error('Erreur lors de l\'expulsion:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de l\'expulsion.')
                .addFields(
                    { name: 'Détails', value: error.message, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    }
};