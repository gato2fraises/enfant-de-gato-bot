const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

class UpdateNotifier {
    constructor(client) {
        this.client = client;
        this.updateChannelId = config.updateChannelId;
    }

    /**
     * Envoie une notification de mise à jour au salon configuré
     * @param {string} title - Titre de la mise à jour
     * @param {string} description - Description de la mise à jour
     * @param {string} type - Type de mise à jour (info, success, warning, error)
     * @param {Array} fields - Champs supplémentaires (optionnel)
     */
    async sendUpdate(title, description, type = 'info', fields = []) {
        try {
            const channel = await this.client.channels.fetch(this.updateChannelId);
            if (!channel) {
                console.log('❌ Salon de mise à jour introuvable');
                return;
            }

            const colors = {
                info: '#3498db',      // Bleu
                success: '#2ecc71',   // Vert
                warning: '#f39c12',   // Orange
                error: '#e74c3c'      // Rouge
            };

            const emojis = {
                info: 'ℹ️',
                success: '✅',
                warning: '⚠️',
                error: '❌'
            };

            const embed = new EmbedBuilder()
                .setColor(colors[type] || colors.info)
                .setTitle(`${emojis[type] || emojis.info} ${title}`)
                .setDescription(description)
                .setTimestamp()
                .setFooter({ 
                    text: `${config.embedFooter} • Mise à jour automatique`,
                    iconURL: this.client.user.displayAvatarURL()
                });

            if (fields.length > 0) {
                embed.addFields(fields);
            }

            await channel.send({ embeds: [embed] });
            console.log(`📢 Mise à jour envoyée: ${title}`);
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de la mise à jour:', error);
        }
    }

    /**
     * Envoie une notification de démarrage du bot
     */
    async sendStartupNotification() {
        await this.sendUpdate(
            'Bot démarré avec succès',
            `**${this.client.user.username}** est maintenant en ligne et opérationnel ! 🚀`,
            'success',
            [
                {
                    name: '📊 Statistiques',
                    value: `• Serveurs: ${this.client.guilds.cache.size}\n• Utilisateurs: ${this.client.users.cache.size}\n• Commandes chargées: ${this.client.commands.size + this.client.slashCommands.size}`,
                    inline: true
                },
                {
                    name: '🕐 Heure de démarrage',
                    value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                    inline: true
                }
            ]
        );
    }

    /**
     * Envoie une notification d'arrêt du bot
     */
    async sendShutdownNotification() {
        await this.sendUpdate(
            'Bot en cours d\'arrêt',
            'Le bot va être arrêté pour maintenance ou mise à jour.',
            'warning'
        );
    }

    /**
     * Envoie une notification d'erreur critique
     */
    async sendErrorNotification(error) {
        await this.sendUpdate(
            'Erreur critique détectée',
            `Une erreur inattendue s'est produite:\n\`\`\`${error.message}\`\`\``,
            'error',
            [
                {
                    name: '🕐 Heure de l\'erreur',
                    value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                    inline: true
                }
            ]
        );
    }

    /**
     * Envoie une notification de nouveau serveur
     */
    async sendNewGuildNotification(guild) {
        await this.sendUpdate(
            'Nouveau serveur rejoint',
            `Le bot a été ajouté au serveur **${guild.name}** ! 🎉`,
            'success',
            [
                {
                    name: '📊 Informations du serveur',
                    value: `• Nom: ${guild.name}\n• Membres: ${guild.memberCount}\n• Propriétaire: <@${guild.ownerId}>`,
                    inline: true
                },
                {
                    name: '🆔 ID du serveur',
                    value: guild.id,
                    inline: true
                }
            ]
        );
    }

    /**
     * Envoie une notification de mise à jour de fonctionnalité
     */
    async sendFeatureUpdateNotification(featureName, description) {
        await this.sendUpdate(
            `Nouvelle fonctionnalité: ${featureName}`,
            description,
            'info'
        );
    }
}

module.exports = UpdateNotifier;