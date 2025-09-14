const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'pause',
        description: 'Met en pause la musique'
    },
    async execute(message, args) {
        const musicManager = message.client.musicManager;
        
        // Vérifier si le bot lit de la musique
        if (!musicManager.isConnected(message.guild.id)) {
            return message.reply('❌ Aucune musique n\'est en cours de lecture !');
        }

        const queue = musicManager.getQueue(message.guild.id);
        
        if (!queue.playing || !queue.currentSong) {
            return message.reply('❌ Aucune chanson n\'est en cours de lecture !');
        }

        // Vérifier si l'utilisateur est dans le même canal vocal
        const userChannel = message.member.voice.channel;
        if (!userChannel) {
            return message.reply('❌ Vous devez être dans un canal vocal pour utiliser cette commande !');
        }

        // Mettre en pause
        const paused = musicManager.pause(message.guild.id);
        
        if (paused) {
            const embed = new EmbedBuilder()
                .setColor('#ffff00')
                .setTitle('⏸️ Musique en pause')
                .setDescription(`**${queue.currentSong.title}** est maintenant en pause.`)
                .addFields(
                    { name: 'Astuce', value: 'Utilisez `!resume` pour reprendre la lecture.', inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } else {
            message.reply('❌ Impossible de mettre la musique en pause.');
        }
    }
};