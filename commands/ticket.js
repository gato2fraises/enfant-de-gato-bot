const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'ticket',
        description: 'Crée un nouveau ticket de support'
    },
    async execute(message, args) {
        const ticketManager = message.client.ticketManager;
        const guild = message.guild;
        const user = message.author;

        // Vérifier que la commande est utilisée dans un serveur
        if (!guild) {
            return message.reply('❌ Cette commande ne peut être utilisée que dans un serveur !');
        }

        // Récupérer la raison (optionnelle)
        const reason = args.join(' ') || 'Support général';

        // Vérifier si la raison n'est pas trop longue
        if (reason.length > 100) {
            return message.reply('❌ La raison est trop longue ! (Maximum 100 caractères)');
        }

        try {
            // Créer le ticket
            const result = await ticketManager.createTicket(guild, user, reason);

            if (!result.success) {
                if (result.channel) {
                    // L'utilisateur a déjà un ticket
                    const embed = new EmbedBuilder()
                        .setColor('#ff9900')
                        .setTitle('⚠️ Ticket existant')
                        .setDescription(`Vous avez déjà un ticket ouvert : ${result.channel}`)
                        .addFields(
                            { name: '💡 Astuce', value: 'Utilisez votre ticket existant ou fermez-le avec `!close` avant d\'en créer un nouveau.', inline: false }
                        )
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }

                return message.reply(`❌ ${result.message}`);
            }

            // Confirmer la création du ticket
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Ticket créé !')
                .setDescription(`Votre ticket #${result.ticketNumber} a été créé avec succès !`)
                .addFields(
                    { name: '📍 Canal', value: `${result.channel}`, inline: true },
                    { name: '📝 Raison', value: reason, inline: true },
                    { name: '⏰ Créé le', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
                    { name: '💡 Prochaines étapes', value: `
                    1. Rendez-vous dans ${result.channel}
                    2. Décrivez votre problème en détail
                    3. Attendez une réponse du staff
                    4. Utilisez \`!close\` pour fermer le ticket
                    `, inline: false }
                )
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: 'Merci d\'utiliser notre système de tickets !' });

            await message.reply({ embeds: [successEmbed] });

            // Supprimer le message original après 10 secondes pour garder le canal propre
            setTimeout(async () => {
                try {
                    await message.delete();
                } catch (error) {
                    // Ignorer si le message est déjà supprimé
                }
            }, 10000);

        } catch (error) {
            console.error('Erreur dans la commande ticket:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la création du ticket.')
                .addFields(
                    { name: 'Détails', value: error.message, inline: false },
                    { name: '💡 Solutions possibles', value: `
                    • Vérifiez que le bot a les permissions nécessaires
                    • Contactez un administrateur si le problème persiste
                    • Essayez de refaire la commande
                    `, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    }
};