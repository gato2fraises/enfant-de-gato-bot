const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'avatar',
        description: 'Affiche l\'avatar d\'un utilisateur'
    },
    async execute(message, args) {
        // Obtenir l'utilisateur mentionné ou l'auteur du message
        const user = message.mentions.users.first() || message.author;
        
        const avatarEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`Avatar de ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setTimestamp()
            .setFooter({ text: 'Mon Bot Discord' });
        
        message.reply({ embeds: [avatarEmbed] });
    }
};