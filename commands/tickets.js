const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'tickets',
        description: 'Affiche la liste de tous les tickets du serveur'
    },
    async execute(message, args) {
        const ticketManager = message.client.ticketManager;
        const user = message.author;
        const guild = message.guild;

        // Vérifier les permissions (modérateurs et admins seulement)
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels) && 
            !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous n\'avez pas la permission d\'utiliser cette commande !');
        }

        try {
            // Récupérer tous les tickets du serveur
            const guildTickets = ticketManager.getGuildTickets(guild.id);

            if (guildTickets.length === 0) {
                const noTicketsEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('🎫 Tickets du serveur')
                    .setDescription('Aucun ticket ouvert actuellement.')
                    .addFields(
                        { name: '💡 Information', value: 'Les utilisateurs peuvent créer un ticket avec `!ticket [raison]`', inline: false }
                    )
                    .setTimestamp();

                return message.reply({ embeds: [noTicketsEmbed] });
            }

            // Organiser les tickets par statut
            const openTickets = guildTickets.filter(ticket => ticket.status === 'open');
            const closedTickets = guildTickets.filter(ticket => ticket.status === 'closed');

            // Créer l'embed principal
            const ticketsEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🎫 Tickets du serveur')
                .setDescription(`**${guild.name}** possède **${guildTickets.length}** ticket(s) au total`)
                .setThumbnail(guild.iconURL())
                .setTimestamp();

            // Ajouter les tickets ouverts
            if (openTickets.length > 0) {
                let openTicketsList = '';
                for (const ticket of openTickets.slice(0, 10)) { // Limiter à 10 pour éviter le spam
                    const channel = guild.channels.cache.get(ticket.channelId);
                    const user = guild.members.cache.get(ticket.userId);
                    const duration = ticketManager.calculateDuration(ticket.createdAt);
                    
                    openTicketsList += `**#${ticket.id}** | ${channel ? channel.toString() : 'Canal supprimé'}\n`;
                    openTicketsList += `👤 ${user ? user.displayName : 'Utilisateur inconnu'} • ⏱️ ${duration}\n`;
                    openTicketsList += `📝 ${ticket.reason.slice(0, 50)}${ticket.reason.length > 50 ? '...' : ''}\n\n`;
                }

                ticketsEmbed.addFields({
                    name: `🟢 Tickets ouverts (${openTickets.length})`,
                    value: openTicketsList || 'Aucun',
                    inline: false
                });

                if (openTickets.length > 10) {
                    ticketsEmbed.addFields({
                        name: '⚠️ Limite atteinte',
                        value: `Seuls les 10 premiers tickets sont affichés. Total: ${openTickets.length}`,
                        inline: false
                    });
                }
            }

            // Statistiques
            const stats = {
                total: guildTickets.length,
                open: openTickets.length,
                closed: closedTickets.length,
                todayTickets: guildTickets.filter(ticket => {
                    const today = new Date();
                    const ticketDate = new Date(ticket.createdAt);
                    return ticketDate.toDateString() === today.toDateString();
                }).length
            };

            ticketsEmbed.addFields(
                { name: '📊 Statistiques', value: `Total: **${stats.total}**\nOuverts: **${stats.open}**\nFermés: **${stats.closed}**\nAujourd'hui: **${stats.todayTickets}**`, inline: true },
                { name: '🛠️ Actions', value: '`!ticket [raison]` - Créer un ticket\n`!close [raison]` - Fermer un ticket\n`!add @user` - Ajouter un utilisateur\n`!remove @user` - Retirer un utilisateur', inline: true }
            );

            message.reply({ embeds: [ticketsEmbed] });

        } catch (error) {
            console.error('Erreur dans la commande tickets:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la récupération des tickets.')
                .addFields(
                    { name: 'Détails', value: error.message, inline: false }
                )
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    }
};