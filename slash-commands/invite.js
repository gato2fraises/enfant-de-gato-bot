const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Génère un lien d\'invitation pour le bot'),
        
    async execute(interaction) {
        const client = interaction.client;
        
        // Permissions requises pour le bon fonctionnement du bot
        const permissions = [
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.UseExternalEmojis,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.BanMembers,
            PermissionFlagsBits.KickMembers,
            PermissionFlagsBits.ModerateMembers,
            PermissionFlagsBits.ManageMessages
        ];
        
        // Calculer la valeur des permissions
        const permissionsValue = permissions.reduce((a, b) => a | b, 0n);
        
        // Générer le lien d'invitation
        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=${permissionsValue}&scope=bot%20applications.commands`;
        
        const inviteEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🔗 Invitation du bot')
            .setDescription(`Cliquez sur le lien ci-dessous pour inviter **${client.user.username}** sur votre serveur !`)
            .addFields(
                { name: '🤖 Bot', value: client.user.username, inline: true },
                { name: '🆔 ID', value: client.user.id, inline: true },
                { name: '📊 Serveurs actuels', value: client.guilds.cache.size.toString(), inline: true }
            )
            .addFields(
                { name: '✨ Fonctionnalités incluses', value: '🎵 Musique YouTube\n🎫 Système de tickets\n🛡️ Modération complète\n🔒 Sécurité avancée\n⚡ Slash commands', inline: false }
            )
            .addFields(
                { name: '🔗 Lien d\'invitation', value: `[Cliquez ici pour inviter le bot](${inviteLink})`, inline: false }
            )
            .addFields(
                { name: '⚠️ Permissions requises', value: 'Le bot a besoin de certaines permissions pour fonctionner correctement. Assurez-vous de les accorder lors de l\'invitation.', inline: false }
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Merci d\'utiliser notre bot !' });
        
        interaction.reply({ embeds: [inviteEmbed] });
    }
};