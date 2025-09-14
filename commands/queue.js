const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'queue',
        description: 'Affiche la liste des chansons en attente'
    },
    async execute(message, args) {
        const musicManager = message.client.musicManager;
        const queueData = musicManager.getQueueList(message.guild.id);
        
        if (!queueData.current && queueData.songs.length === 0) {
            return message.reply('❌ Aucune chanson dans la queue !');
        }

        let description = '';
        
        // Chanson actuelle
        if (queueData.current) {
            description += `**🎵 En cours de lecture:**\n[${queueData.current.title}](${queueData.current.url})\n`;
            description += `*Demandé par ${queueData.current.requestedBy.username}*\n\n`;
        }

        // Chansons en attente
        if (queueData.songs.length > 0) {
            description += '**📝 Prochaines chansons:**\n';
            
            const songsToShow = queueData.songs.slice(0, 10); // Limiter à 10 chansons
            
            songsToShow.forEach((song, index) => {
                description += `\`${index + 1}.\` [${song.title}](${song.url})\n`;
                description += `*${song.duration} • ${song.requestedBy.username}*\n`;
            });
            
            if (queueData.songs.length > 10) {
                description += `\n*... et ${queueData.songs.length - 10} chanson(s) de plus*`;
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📋 Queue musicale')
            .setDescription(description)
            .addFields(
                { name: 'Total des chansons', value: `${queueData.songs.length + (queueData.current ? 1 : 0)}`, inline: true },
                { name: 'Répétition', value: queueData.loop ? '🔁 Activée' : '❌ Désactivée', inline: true }
            )
            .setTimestamp();

        if (queueData.current && queueData.current.thumbnail) {
            embed.setThumbnail(queueData.current.thumbnail);
        }

        message.reply({ embeds: [embed] });
    }
};