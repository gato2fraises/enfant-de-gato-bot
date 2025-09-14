const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche l\'aide et les commandes disponibles'),
        
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📚 Commandes disponibles')
            .setDescription('Voici la liste des slash commands disponibles :')
            .addFields(
                { name: '**🎵 Commandes musicales**', value: '\u200B', inline: false },
                { name: '/play <url>', value: 'Joue une musique depuis YouTube', inline: false },
                { name: '/stop', value: 'Arrête la musique et vide la queue', inline: false },
                { name: '/queue', value: 'Affiche la liste des chansons', inline: false },
                { name: '**🛠️ Commandes de modération**', value: '\u200B', inline: false },
                { name: '/ban <utilisateur> [raison]', value: 'Bannit un utilisateur du serveur', inline: false },
                { name: '**🎫 Commandes de tickets**', value: '\u200B', inline: false },
                { name: '/ticket [raison]', value: 'Crée un nouveau ticket de support', inline: false },
                { name: '/close [raison]', value: 'Ferme le ticket actuel', inline: false },
                { name: '**🔒 Commandes de sécurité (Admins du bot)**', value: '\u200B', inline: false },
                { name: '/security', value: 'Affiche les statistiques et logs de sécurité', inline: false },
                { name: '**🛠️ Commandes générales**', value: '\u200B', inline: false },
                { name: '/ping', value: 'Affiche la latence du bot', inline: false },
                { name: '/help', value: 'Affiche cette aide', inline: false },
                { name: '/info', value: 'Informations sur le bot', inline: false },
                { name: '/stats', value: 'Statistiques globales du bot', inline: false },
                { name: '/invite', value: 'Génère un lien d\'invitation pour le bot', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Utilisez / pour voir l\'auto-complétion !' });
        
        interaction.reply({ embeds: [helpEmbed] });
    }
};