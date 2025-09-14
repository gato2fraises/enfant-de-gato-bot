const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'loop',
        description: 'Active ou désactive la répétition de la chanson actuelle'
    },
    async execute(message, args) {
        const musicManager = message.client.musicManager;
        
        // Vérifier si le bot lit de la musique
        if (!musicManager.isConnected(message.guild.id)) {
            return message.reply('❌ Aucune musique n\'est en cours de lecture !');
        }

        // Vérifier si l'utilisateur est dans le même canal vocal
        const userChannel = message.member.voice.channel;
        if (!userChannel) {
            return message.reply('❌ Vous devez être dans un canal vocal pour utiliser cette commande !');
        }

        // Basculer le mode loop
        const loopEnabled = musicManager.toggleLoop(message.guild.id);
        
        const embed = new EmbedBuilder()
            .setColor(loopEnabled ? '#00ff00' : '#ff0000')
            .setTitle('🔁 Mode répétition')
            .setDescription(loopEnabled ? 
                '✅ La répétition est maintenant **activée**. La chanson actuelle sera répétée.' : 
                '❌ La répétition est maintenant **désactivée**.')
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};