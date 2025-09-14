const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'leave',
        description: 'Force le bot à quitter le canal vocal'
    },
    async execute(message, args) {
        const musicManager = message.client.musicManager;
        
        // Vérifier si le bot est connecté à un canal vocal
        if (!musicManager.isConnected(message.guild.id)) {
            return message.reply('❌ Le bot n\'est pas connecté à un canal vocal !');
        }

        // Vérifier si l'utilisateur est dans le même canal vocal
        const userChannel = message.member.voice.channel;
        if (!userChannel) {
            return message.reply('❌ Vous devez être dans un canal vocal pour utiliser cette commande !');
        }

        // Arrêter la musique et déconnecter
        musicManager.stop(message.guild.id);

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('👋 Au revoir !')
            .setDescription('Le bot a quitté le canal vocal et la queue a été vidée.')
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};