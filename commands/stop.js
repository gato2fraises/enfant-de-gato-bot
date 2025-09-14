const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'stop',
        description: 'Arrête la musique et vide la queue'
    },
    async execute(message, args) {
        const musicManager = message.client.musicManager;
        
        // Vérifier si le bot lit de la musique
        if (!musicManager.isConnected(message.guild.id)) {
            return message.reply('❌ Aucune musique n\'est en cours de lecture !');
        }

        // Vérifier si l'utilisateur est dans le même canal vocal
        const queue = musicManager.getQueue(message.guild.id);
        const userChannel = message.member.voice.channel;
        
        if (!userChannel) {
            return message.reply('❌ Vous devez être dans un canal vocal pour utiliser cette commande !');
        }

        // Arrêter la musique
        musicManager.stop(message.guild.id);

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⏹️ Musique arrêtée')
            .setDescription('La lecture a été arrêtée et la queue vidée.')
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};