const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'ban',
        description: 'Bannit un utilisateur du serveur'
    },
    async execute(message, args) {
        // Vérifier si l'utilisateur a la permission de bannir
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de bannir des membres !');
        }

        // Vérifier si le bot a la permission de bannir
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ Je n\'ai pas la permission de bannir des membres !');
        }

        // Vérifier qu'un utilisateur a été mentionné ou qu'un ID a été fourni
        const target = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
        
        if (!target) {
            return message.reply('❌ Veuillez mentionner un utilisateur ou fournir son ID !\nExemple: `!ban @utilisateur raison` ou `!ban 123456789 raison`');
        }

        // Récupérer le membre du serveur
        const targetMember = message.guild.members.cache.get(target.id);

        // Vérifier que l'utilisateur n'essaie pas de se bannir lui-même
        if (target.id === message.author.id) {
            return message.reply('❌ Vous ne pouvez pas vous bannir vous-même !');
        }

        // Vérifier que l'utilisateur n'essaie pas de bannir le bot
        if (target.id === message.client.user.id) {
            return message.reply('❌ Vous ne pouvez pas me bannir !');
        }

        // Vérifier la hiérarchie des rôles
        if (targetMember) {
            if (targetMember.roles.highest.position >= message.member.roles.highest.position) {
                return message.reply('❌ Vous ne pouvez pas bannir cet utilisateur car il a un rôle égal ou supérieur au vôtre !');
            }

            if (targetMember.roles.highest.position >= message.guild.members.me.roles.highest.position) {
                return message.reply('❌ Je ne peux pas bannir cet utilisateur car il a un rôle égal ou supérieur au mien !');
            }

            // Vérifier si l'utilisateur est bannable
            if (!targetMember.bannable) {
                return message.reply('❌ Je ne peux pas bannir cet utilisateur !');
            }
        }

        // Récupérer la raison (ou mettre une raison par défaut)
        const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

        try {
            // Envoyer un message privé à l'utilisateur avant de le bannir
            const dmEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🔨 Vous avez été banni')
                .setDescription(`Vous avez été banni du serveur **${message.guild.name}**`)
                .addFields(
                    { name: 'Raison', value: reason, inline: false },
                    { name: 'Modérateur', value: message.author.tag, inline: true },
                    { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Si vous pensez que ce bannissement est injuste, contactez les administrateurs.' });

            // Essayer d'envoyer le DM (peut échouer si l'utilisateur a désactivé les DM)
            await target.send({ embeds: [dmEmbed] }).catch(() => {
                console.log(`Impossible d'envoyer un DM à ${target.tag}`);
            });

            // Bannir l'utilisateur
            await message.guild.members.ban(target, { 
                reason: `${reason} | Modérateur: ${message.author.tag}`,
                deleteMessageDays: 1 // Supprimer les messages des dernières 24h
            });

            // Confirmer le bannissement
            const successEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🔨 Utilisateur banni')
                .setDescription(`**${target.tag}** a été banni du serveur`)
                .addFields(
                    { name: 'ID', value: target.id, inline: true },
                    { name: 'Raison', value: reason, inline: false },
                    { name: 'Modérateur', value: message.author.tag, inline: true },
                    { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setThumbnail(target.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: 'Messages des dernières 24h supprimés' });

            message.reply({ embeds: [successEmbed] });

            // Log dans la console
            console.log(`🔨 ${target.tag} (${target.id}) banni par ${message.author.tag} pour: ${reason}`);

        } catch (error) {
            console.error('Erreur lors du bannissement:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors du bannissement.')
                .addFields(
                    { name: 'Détails', value: error.message, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    }
};