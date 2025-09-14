const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serveur')
        .setDescription('Affiche les informations du serveur'),
        
    async execute(interaction) {
        const guild = interaction.guild;
        
        if (!guild) {
            return interaction.reply({
                content: '❌ Cette commande ne peut être utilisée qu\'dans un serveur !',
                ephemeral: true
            });
        }
        
        // Calculer les statistiques du serveur
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(member => member.presence?.status !== 'offline').size;
        const botCount = guild.members.cache.filter(member => member.user.bot).size;
        const humanCount = totalMembers - botCount;
        
        // Informations sur les canaux
        const textChannels = guild.channels.cache.filter(channel => channel.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(channel => channel.type === 2).size;
        const categories = guild.channels.cache.filter(channel => channel.type === 4).size;
        
        // Niveau de vérification
        const verificationLevels = {
            0: 'Aucune',
            1: 'Faible',
            2: 'Moyen',
            3: 'Élevé',
            4: 'Très élevé'
        };
        
        // Niveau de filtre de contenu explicite
        const explicitFilterLevels = {
            0: 'Désactivé',
            1: 'Membres sans rôle',
            2: 'Tous les membres'
        };
        
        // Créer l'embed avec les informations du serveur
        const serverEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`📊 Informations de ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: '🆔 ID du serveur', value: guild.id, inline: true },
                { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
                { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true }
            )
            .addFields(
                { name: '👥 Membres', value: `**Total:** ${totalMembers}\n**Humains:** ${humanCount}\n**Bots:** ${botCount}`, inline: true },
                { name: '📺 Canaux', value: `**Texte:** ${textChannels}\n**Vocal:** ${voiceChannels}\n**Catégories:** ${categories}`, inline: true },
                { name: '🎭 Rôles', value: guild.roles.cache.size.toString(), inline: true }
            )
            .addFields(
                { name: '🔒 Niveau de vérification', value: verificationLevels[guild.verificationLevel] || 'Inconnu', inline: true },
                { name: '🔞 Filtre de contenu', value: explicitFilterLevels[guild.explicitContentFilter] || 'Inconnu', inline: true },
                { name: '🌍 Région', value: guild.preferredLocale || 'Non définie', inline: true }
            );
        
        // Ajouter l'icône du serveur si elle existe
        if (guild.iconURL()) {
            serverEmbed.setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }));
        }
        
        // Ajouter la bannière du serveur si elle existe
        if (guild.bannerURL()) {
            serverEmbed.setImage(guild.bannerURL({ dynamic: true, size: 1024 }));
        }
        
        // Ajouter des informations sur les boosts si le serveur en a
        if (guild.premiumSubscriptionCount > 0) {
            serverEmbed.addFields({
                name: '💎 Niveau de boost',
                value: `**Niveau:** ${guild.premiumTier}\n**Boosts:** ${guild.premiumSubscriptionCount}`,
                inline: true
            });
        }
        
        serverEmbed.setTimestamp()
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
        
        interaction.reply({ embeds: [serverEmbed] });
    }
};