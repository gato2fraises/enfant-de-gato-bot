const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'userinfo',
        description: 'Affiche les informations d\'un utilisateur'
    },
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);
        
        let statusText = 'Inconnu';
        let statusEmoji = '❓';
        
        if (member?.presence?.status) {
            switch (member.presence.status) {
                case 'online':
                    statusText = 'En ligne';
                    statusEmoji = '🟢';
                    break;
                case 'idle':
                    statusText = 'Absent';
                    statusEmoji = '🟡';
                    break;
                case 'dnd':
                    statusText = 'Ne pas déranger';
                    statusEmoji = '🔴';
                    break;
                case 'offline':
                    statusText = 'Hors ligne';
                    statusEmoji = '⚫';
                    break;
            }
        }
        
        const userEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`👤 Informations de ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Nom d\'utilisateur', value: user.username, inline: true },
                { name: 'Tag', value: `#${user.discriminator}`, inline: true },
                { name: 'ID', value: user.id, inline: true },
                { name: 'Statut', value: `${statusEmoji} ${statusText}`, inline: true },
                { name: 'Compte créé', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false }
            );
        
        if (member) {
            userEmbed.addFields(
                { name: 'A rejoint le serveur', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                { name: 'Rôles', value: member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.name).join(', ') || 'Aucun', inline: false }
            );
        }
        
        userEmbed.setTimestamp().setFooter({ text: 'Mon Bot Discord' });
        
        message.reply({ embeds: [userEmbed] });
    }
};