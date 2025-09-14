const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'timeout',
        description: 'Met un utilisateur en timeout (isolation temporaire)'
    },
    async execute(message, args) {
        // Vérifier si l'utilisateur a la permission de modérer
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de mettre des membres en timeout !');
        }

        // Vérifier si le bot a la permission de modérer
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Je n\'ai pas la permission de mettre des membres en timeout !');
        }

        // Vérifier qu'un utilisateur a été mentionné
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('❌ Veuillez mentionner un utilisateur à mettre en timeout !\nExemple: `!timeout @utilisateur 10m raison`');
        }

        // Récupérer le membre du serveur
        const targetMember = message.guild.members.cache.get(target.id);
        if (!targetMember) {
            return message.reply('❌ Cet utilisateur n\'est pas sur ce serveur !');
        }

        // Vérifier que l'utilisateur n'essaie pas de se mettre en timeout lui-même
        if (target.id === message.author.id) {
            return message.reply('❌ Vous ne pouvez pas vous mettre en timeout vous-même !');
        }

        // Vérifier que l'utilisateur n'essaie pas de mettre le bot en timeout
        if (target.id === message.client.user.id) {
            return message.reply('❌ Vous ne pouvez pas me mettre en timeout !');
        }

        // Vérifier la hiérarchie des rôles
        if (targetMember.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply('❌ Vous ne pouvez pas mettre en timeout cet utilisateur car il a un rôle égal ou supérieur au vôtre !');
        }

        if (targetMember.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            return message.reply('❌ Je ne peux pas mettre en timeout cet utilisateur car il a un rôle égal ou supérieur au mien !');
        }

        // Vérifier si l'utilisateur peut être modéré
        if (!targetMember.moderatable) {
            return message.reply('❌ Je ne peux pas mettre cet utilisateur en timeout !');
        }

        // Parser la durée
        const duration = args[1];
        if (!duration) {
            return message.reply('❌ Veuillez spécifier une durée !\nExemples: `5m`, `1h`, `2d`\nCommande: `!timeout @utilisateur 10m raison`');
        }

        // Convertir la durée en millisecondes
        const timeRegex = /^(\d+)([smhd])$/;
        const match = duration.match(timeRegex);
        
        if (!match) {
            return message.reply('❌ Format de durée invalide !\nUtilisez: `s` (secondes), `m` (minutes), `h` (heures), `d` (jours)\nExemple: `10m` pour 10 minutes');
        }

        const amount = parseInt(match[1]);
        const unit = match[2];

        let timeoutDuration;
        switch (unit) {
            case 's':
                timeoutDuration = amount * 1000;
                break;
            case 'm':
                timeoutDuration = amount * 60 * 1000;
                break;
            case 'h':
                timeoutDuration = amount * 60 * 60 * 1000;
                break;
            case 'd':
                timeoutDuration = amount * 24 * 60 * 60 * 1000;
                break;
        }

        // Vérifier les limites de timeout (max 28 jours)
        const maxTimeout = 28 * 24 * 60 * 60 * 1000; // 28 jours
        if (timeoutDuration > maxTimeout) {
            return message.reply('❌ La durée maximum du timeout est de 28 jours !');
        }

        if (timeoutDuration < 5000) { // Minimum 5 secondes
            return message.reply('❌ La durée minimum du timeout est de 5 secondes !');
        }

        // Récupérer la raison
        const reason = args.slice(2).join(' ') || 'Aucune raison spécifiée';

        try {
            // Calculer la date de fin
            const endTime = new Date(Date.now() + timeoutDuration);

            // Mettre en timeout
            await targetMember.timeout(timeoutDuration, `${reason} | Modérateur: ${message.author.tag}`);

            // Envoyer un DM à l'utilisateur
            const dmEmbed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('⏰ Vous avez été mis en timeout')
                .setDescription(`Vous avez été mis en timeout sur **${message.guild.name}**`)
                .addFields(
                    { name: 'Durée', value: duration, inline: true },
                    { name: 'Fin du timeout', value: `<t:${Math.floor(endTime.getTime() / 1000)}:F>`, inline: true },
                    { name: 'Raison', value: reason, inline: false },
                    { name: 'Modérateur', value: message.author.tag, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Pendant le timeout, vous ne pouvez pas envoyer de messages ou rejoindre des canaux vocaux.' });

            await target.send({ embeds: [dmEmbed] }).catch(() => {
                console.log(`Impossible d'envoyer un DM à ${target.tag}`);
            });

            // Confirmer le timeout
            const successEmbed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('⏰ Utilisateur mis en timeout')
                .setDescription(`**${target.tag}** a été mis en timeout`)
                .addFields(
                    { name: 'ID', value: target.id, inline: true },
                    { name: 'Durée', value: duration, inline: true },
                    { name: 'Fin du timeout', value: `<t:${Math.floor(endTime.getTime() / 1000)}:F>`, inline: false },
                    { name: 'Raison', value: reason, inline: false },
                    { name: 'Modérateur', value: message.author.tag, inline: true }
                )
                .setThumbnail(target.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: 'L\'utilisateur ne peut plus envoyer de messages ou rejoindre des canaux vocaux' });

            message.reply({ embeds: [successEmbed] });

            // Log dans la console
            console.log(`⏰ ${target.tag} (${target.id}) mis en timeout par ${message.author.tag} pour ${duration}: ${reason}`);

        } catch (error) {
            console.error('Erreur lors du timeout:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la mise en timeout.')
                .addFields(
                    { name: 'Détails', value: error.message, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    }
};