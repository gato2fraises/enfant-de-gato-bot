const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Statistiques globales du bot'),
        
    async execute(interaction) {
        const client = interaction.client;
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const statsEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📊 Statistiques du bot')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '🏠 Serveurs', value: client.guilds.cache.size.toString(), inline: true },
                { name: '👥 Utilisateurs totaux', value: client.users.cache.size.toString(), inline: true },
                { name: '📺 Canaux', value: client.channels.cache.size.toString(), inline: true },
                { name: '⏱️ Temps de fonctionnement', value: `${hours}h ${minutes}m ${seconds}s`, inline: true },
                { name: '⚡ Latence API', value: `${Math.round(client.ws.ping)}ms`, inline: true },
                { name: '💾 Utilisation mémoire', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`, inline: true }
            )
            .addFields(
                { name: '🎵 Statistiques musicales', value: `Queues actives: ${client.musicManager?.queues?.size || 0}`, inline: true },
                { name: '🎫 Statistiques tickets', value: `Tickets actifs: ${client.ticketManager?.tickets?.size || 0}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Statistiques en temps réel' });
        
        interaction.reply({ embeds: [statsEmbed] });
    }
};