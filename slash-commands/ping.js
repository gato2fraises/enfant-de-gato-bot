const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Affiche la latence du bot'),
        
    async execute(interaction) {
        const ping = Date.now() - interaction.createdTimestamp;
        const apiPing = Math.round(interaction.client.ws.ping);
        
        const pingEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏓 Pong !')
            .addFields(
                { name: 'Latence du message', value: `${ping}ms`, inline: true },
                { name: 'Latence de l\'API', value: `${apiPing}ms`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Bot Discord' });
        
        interaction.reply({ embeds: [pingEmbed] });
    }
};