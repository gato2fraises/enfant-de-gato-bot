const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'skip',
        description: 'Passe à la chanson suivante'
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

        const currentSong = queue.currentSong;
        
        // Passer à la chanson suivante
        musicManager.skip(message.guild.id);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('⏭️ Chanson sautée')
            .setDescription(`**${currentSong.title}** a été sautée.`)
            .addFields(
                { name: 'Chansons restantes', value: `${queue.songs.length}`, inline: true }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};