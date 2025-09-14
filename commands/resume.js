const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'resume',
        description: 'Reprend la lecture de la musique'
    },
    async execute(message, args) {
        const musicManager = message.client.musicManager;
        
        // Vérifier si le bot lit de la musique
        if (!musicManager.isConnected(message.guild.id)) {
            return message.reply('❌ Aucune musique n\'est en cours de lecture !');
        }

        const queue = musicManager.getQueue(message.guild.id);
        
        if (!queue.currentSong) {
            return message.reply('❌ Aucune chanson à reprendre !');
        }

        // Vérifier si l'utilisateur est dans le même canal vocal
        const userChannel = message.member.voice.channel;
        if (!userChannel) {
            return message.reply('❌ Vous devez être dans un canal vocal pour utiliser cette commande !');
        }

        // Reprendre la lecture
        const resumed = musicManager.resume(message.guild.id);
        
        if (resumed) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('▶️ Lecture reprise')
                .setDescription(`**${queue.currentSong.title}** continue de jouer.`)
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } else {
            message.reply('❌ Impossible de reprendre la lecture.');
        }
    }
};