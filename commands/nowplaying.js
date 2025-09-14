const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'nowplaying',
        description: 'Affiche la chanson en cours de lecture'
    },
    async execute(message, args) {
        const musicManager = message.client.musicManager;
        const queue = musicManager.getQueue(message.guild.id);
        
        if (!queue.currentSong || !queue.playing) {
            return message.reply('❌ Aucune chanson n\'est en cours de lecture !');
        }

        const song = queue.currentSong;
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎵 En cours de lecture')
            .setDescription(`**[${song.title}](${song.url})**`)
            .addFields(
                { name: '👤 Auteur', value: song.author || 'Inconnu', inline: true },
                { name: '⏱️ Durée', value: song.duration, inline: true },
                { name: '👋 Demandé par', value: song.requestedBy.username, inline: true },
                { name: '📝 Chansons en attente', value: `${queue.songs.length}`, inline: true },
                { name: '🔁 Répétition', value: queue.loop ? 'Activée' : 'Désactivée', inline: true },
                { name: '🔗 Statut', value: queue.playing ? '▶️ En lecture' : '⏸️ En pause', inline: true }
            )
            .setThumbnail(song.thumbnail)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};