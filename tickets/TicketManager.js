const { ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');

class TicketManager {
    constructor() {
        this.tickets = new Map(); // Map<channelId, ticketData>
        this.ticketCounter = new Map(); // Map<guildId, number>
    }

    // Créer un nouveau ticket
    async createTicket(guild, user, reason = 'Aucune raison spécifiée') {
        try {
            // Vérifier si l'utilisateur a déjà un ticket ouvert
            const existingTicket = guild.channels.cache.find(channel => 
                channel.name === `ticket-${user.username.toLowerCase()}` && 
                channel.type === ChannelType.GuildText
            );

            if (existingTicket) {
                return { success: false, message: 'Vous avez déjà un ticket ouvert !', channel: existingTicket };
            }

            // Trouver ou créer la catégorie des tickets
            let ticketCategory = guild.channels.cache.find(channel => 
                channel.name.toLowerCase() === 'tickets' && channel.type === ChannelType.GuildCategory
            );

            if (!ticketCategory) {
                ticketCategory = await guild.channels.create({
                    name: 'TICKETS',
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ]
                });
            }

            // Obtenir le numéro du ticket
            const ticketNumber = this.getNextTicketNumber(guild.id);

            // Créer le canal de ticket
            const ticketChannel = await guild.channels.create({
                name: `ticket-${user.username.toLowerCase()}`,
                type: ChannelType.GuildText,
                parent: ticketCategory,
                topic: `Ticket #${ticketNumber} - ${user.tag} | Raison: ${reason}`,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.AttachFiles
                        ]
                    },
                    {
                        id: guild.members.me.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.ManageChannels,
                            PermissionsBitField.Flags.ManageMessages
                        ]
                    }
                ]
            });

            // Ajouter les permissions pour les modérateurs
            const modRoles = guild.roles.cache.filter(role => 
                role.permissions.has(PermissionsBitField.Flags.ManageMessages) ||
                role.permissions.has(PermissionsBitField.Flags.Administrator) ||
                role.name.toLowerCase().includes('mod') ||
                role.name.toLowerCase().includes('admin') ||
                role.name.toLowerCase().includes('staff')
            );

            for (const role of modRoles.values()) {
                await ticketChannel.permissionOverwrites.create(role, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    ManageMessages: true
                });
            }

            // Stocker les données du ticket
            const ticketData = {
                id: ticketNumber,
                channelId: ticketChannel.id,
                userId: user.id,
                guildId: guild.id,
                reason: reason,
                createdAt: new Date(),
                status: 'open'
            };

            this.tickets.set(ticketChannel.id, ticketData);

            // Créer l'embed de bienvenue
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`🎫 Ticket #${ticketNumber}`)
                .setDescription(`Bienvenue ${user} ! Votre ticket a été créé.`)
                .addFields(
                    { name: '👤 Créé par', value: user.tag, inline: true },
                    { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '📝 Raison', value: reason, inline: false },
                    { name: '❓ Comment ça marche ?', value: `
                    • Décrivez votre problème ou votre demande
                    • Un membre du staff vous répondra bientôt
                    • Utilisez \`!close\` pour fermer ce ticket
                    • Vous pouvez ajouter des fichiers/images
                    `, inline: false },
                    { name: '⚠️ Important', value: 'Restez respectueux et patient. Le spam peut résulter en une fermeture du ticket.', inline: false }
                )
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: `ID du ticket: ${ticketChannel.id}` });

            await ticketChannel.send({ 
                content: `${user} Votre ticket a été créé ! ${modRoles.size > 0 ? modRoles.map(r => `<@&${r.id}>`).join(' ') : ''}`,
                embeds: [welcomeEmbed] 
            });

            console.log(`🎫 Nouveau ticket #${ticketNumber} créé par ${user.tag} dans ${guild.name}`);

            return { success: true, channel: ticketChannel, ticketNumber };

        } catch (error) {
            console.error('Erreur lors de la création du ticket:', error);
            return { success: false, message: 'Erreur lors de la création du ticket.' };
        }
    }

    // Fermer un ticket
    async closeTicket(channel, user, reason = 'Aucune raison spécifiée') {
        try {
            const ticketData = this.tickets.get(channel.id);
            
            if (!ticketData) {
                return { success: false, message: 'Ce canal n\'est pas un ticket valide !' };
            }

            // Créer l'embed de fermeture
            const closeEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🔒 Ticket fermé')
                .setDescription(`Ce ticket a été fermé par ${user.tag}`)
                .addFields(
                    { name: '📝 Raison de fermeture', value: reason, inline: false },
                    { name: '🕒 Fermé le', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '⏱️ Durée d\'ouverture', value: this.calculateDuration(ticketData.createdAt), inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Ce canal sera supprimé dans 10 secondes...' });

            await channel.send({ embeds: [closeEmbed] });

            // Mettre à jour les données du ticket
            ticketData.status = 'closed';
            ticketData.closedAt = new Date();
            ticketData.closedBy = user.id;

            // Supprimer le ticket de la mémoire
            this.tickets.delete(channel.id);

            // Supprimer le canal après 10 secondes
            setTimeout(async () => {
                try {
                    await channel.delete(`Ticket fermé par ${user.tag}: ${reason}`);
                    console.log(`🗑️ Ticket #${ticketData.id} supprimé (fermé par ${user.tag})`);
                } catch (error) {
                    console.error('Erreur lors de la suppression du ticket:', error);
                }
            }, 10000);

            return { success: true, ticketData };

        } catch (error) {
            console.error('Erreur lors de la fermeture du ticket:', error);
            return { success: false, message: 'Erreur lors de la fermeture du ticket.' };
        }
    }

    // Ajouter un utilisateur à un ticket
    async addUserToTicket(channel, user, targetUser) {
        try {
            const ticketData = this.tickets.get(channel.id);
            
            if (!ticketData) {
                return { success: false, message: 'Ce canal n\'est pas un ticket valide !' };
            }

            await channel.permissionOverwrites.create(targetUser, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
                AttachFiles: true
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Utilisateur ajouté')
                .setDescription(`${targetUser} a été ajouté à ce ticket par ${user}`)
                .setTimestamp();

            await channel.send({ embeds: [embed] });

            return { success: true };

        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
            return { success: false, message: 'Erreur lors de l\'ajout de l\'utilisateur.' };
        }
    }

    // Retirer un utilisateur d'un ticket
    async removeUserFromTicket(channel, user, targetUser) {
        try {
            const ticketData = this.tickets.get(channel.id);
            
            if (!ticketData) {
                return { success: false, message: 'Ce canal n\'est pas un ticket valide !' };
            }

            // Ne pas permettre de retirer le créateur du ticket
            if (targetUser.id === ticketData.userId) {
                return { success: false, message: 'Vous ne pouvez pas retirer le créateur du ticket !' };
            }

            await channel.permissionOverwrites.delete(targetUser);

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Utilisateur retiré')
                .setDescription(`${targetUser} a été retiré de ce ticket par ${user}`)
                .setTimestamp();

            await channel.send({ embeds: [embed] });

            return { success: true };

        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            return { success: false, message: 'Erreur lors de la suppression de l\'utilisateur.' };
        }
    }

    // Obtenir le prochain numéro de ticket
    getNextTicketNumber(guildId) {
        const current = this.ticketCounter.get(guildId) || 0;
        const next = current + 1;
        this.ticketCounter.set(guildId, next);
        return next;
    }

    // Calculer la durée d'ouverture du ticket
    calculateDuration(createdAt) {
        const now = new Date();
        const diff = now - createdAt;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    // Vérifier si un canal est un ticket
    isTicketChannel(channelId) {
        return this.tickets.has(channelId);
    }

    // Obtenir les données d'un ticket
    getTicketData(channelId) {
        return this.tickets.get(channelId);
    }

    // Obtenir tous les tickets d'un serveur
    getGuildTickets(guildId) {
        return Array.from(this.tickets.values()).filter(ticket => ticket.guildId === guildId);
    }
}

module.exports = TicketManager;