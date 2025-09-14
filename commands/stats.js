const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'stats',
        description: 'Affiche les statistiques globales du bot'
    },
    async execute(message, args) {
        const client = message.client;
        
        // Calculer les statistiques
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.guilds.cache.reduce((acc, guild) => acc + guild.channels.cache.size, 0);
        
        // Uptime du bot
        const uptime = process.uptime();
        const uptimeString = new Date(uptime * 1000).toISOString().substr(11, 8);
        
        // Usage mémoire
        const memoryUsage = process.memoryUsage();
        const memoryUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100;
        
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📊 Statistiques du bot')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '🏠 Serveurs', value: `${client.guilds.cache.size}`, inline: true },
                { name: '👥 Utilisateurs', value: `${totalUsers.toLocaleString()}`, inline: true },
                { name: '📺 Canaux', value: `${totalChannels.toLocaleString()}`, inline: true },
                { name: '⏱️ Uptime', value: uptimeString, inline: true },
                { name: '💾 Mémoire utilisée', value: `${memoryUsed} MB`, inline: true },
                { name: '🔗 Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
                { name: '📅 En ligne depuis', value: `<t:${Math.floor(client.readyTimestamp / 1000)}:R>`, inline: false },
                { name: '🎵 Fonctionnalités', value: 'Musique • Modération • Utilitaires • Et plus !', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Bot Discord multi-fonctions' });

        message.reply({ embeds: [embed] });
    }
};