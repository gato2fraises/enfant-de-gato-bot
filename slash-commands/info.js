const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Informations sur le bot'),
        
    async execute(interaction) {
        const infoEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('ℹ️ Informations du bot')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                { name: '🤖 Nom', value: interaction.client.user.username, inline: true },
                { name: '🆔 ID', value: interaction.client.user.id, inline: true },
                { name: '📅 Créé le', value: `<t:${Math.floor(interaction.client.user.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '📊 Serveurs', value: interaction.client.guilds.cache.size.toString(), inline: true },
                { name: '👥 Utilisateurs', value: interaction.client.users.cache.size.toString(), inline: true },
                { name: '⚡ Latence', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true },
                { name: '🔧 Version Node.js', value: process.version, inline: true },
                { name: '📚 Discord.js', value: require('discord.js').version, inline: true },
                { name: '💾 Mémoire utilisée', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`, inline: true }
            )
            .addFields(
                { name: '✨ Fonctionnalités', value: '🎵 Musique\n🎫 Système de tickets\n🛡️ Modération\n🔒 Sécurité avancée\n⚡ Slash commands', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Bot Discord multi-fonctions' });
        
        interaction.reply({ embeds: [infoEmbed] });
    }
};