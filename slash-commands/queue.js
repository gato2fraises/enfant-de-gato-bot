const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Affiche la queue musicale actuelle'),
                
    async execute(interaction) {
        const musicManager = interaction.client.musicManager;
        const guildId = interaction.guild.id;

        try {
            const queue = musicManager.getQueue(guildId);

            if (!queue || queue.songs.length === 0) {
                return interaction.reply({ 
                    content: '❌ Aucune musique dans la queue !', 
                    flags: 64 // MessageFlags.Ephemeral 
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🎵 Queue musicale')
                .setDescription(`**${queue.songs.length}** chanson(s) dans la queue`)
                .setTimestamp();

            // Afficher la chanson actuelle
            if (queue.songs[0]) {
                embed.addFields({
                    name: '🎶 En cours de lecture',
                    value: `**${queue.songs[0].title}**\nDemandé par: ${queue.songs[0].requester}`,
                    inline: false
                });
            }

            // Afficher les prochaines chansons (maximum 10)
            if (queue.songs.length > 1) {
                let nextSongs = '';
                const songsToShow = Math.min(queue.songs.length - 1, 10);
                
                for (let i = 1; i <= songsToShow; i++) {
                    const song = queue.songs[i];
                    nextSongs += `**${i}.** ${song.title}\n`;
                }

                if (queue.songs.length > 11) {
                    nextSongs += `\n... et ${queue.songs.length - 11} autre(s)`;
                }

                embed.addFields({
                    name: '📋 Prochaines chansons',
                    value: nextSongs,
                    inline: false
                });
            }

            // Ajouter les informations sur la répétition
            if (queue.loop) {
                embed.addFields({
                    name: '🔄 Mode répétition',
                    value: 'Activé',
                    inline: true
                });
            }

            // Ajouter la durée totale estimée (si disponible)
            embed.addFields({
                name: '📊 Statistiques',
                value: `Total: **${queue.songs.length}** chanson(s)\nVolume: **${queue.volume || 100}%**`,
                inline: true
            });

            interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur dans la commande queue:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de l\'affichage de la queue.')
                .setTimestamp();

            interaction.reply({ embeds: [errorEmbed], flags: 64 }); // MessageFlags.Ephemeral
        }
    }
};