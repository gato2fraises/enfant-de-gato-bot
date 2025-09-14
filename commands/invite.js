const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'invite',
        description: 'Génère un lien d\'invitation pour ajouter le bot à un serveur'
    },
    async execute(message, args) {
        // Permissions nécessaires pour le bot
        const permissions = [
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.EmbedLinks,
            PermissionsBitField.Flags.AttachFiles,
            PermissionsBitField.Flags.UseExternalEmojis,
            PermissionsBitField.Flags.AddReactions,
            PermissionsBitField.Flags.ManageMessages, // Pour la commande clear
            PermissionsBitField.Flags.Connect, // Pour rejoindre les canaux vocaux
            PermissionsBitField.Flags.Speak, // Pour jouer de la musique
            PermissionsBitField.Flags.UseVAD, // Pour la détection vocale
            PermissionsBitField.Flags.KickMembers, // Pour expulser des membres
            PermissionsBitField.Flags.BanMembers, // Pour bannir/débannir des membres
            PermissionsBitField.Flags.ModerateMembers // Pour les timeouts
        ];

        // Générer le lien d'invitation
        const inviteLink = message.client.generateInvite({
            scopes: ['bot'],
            permissions: permissions
        });

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🔗 Lien d\'invitation du bot')
            .setDescription('Utilisez ce lien pour ajouter le bot à vos serveurs Discord !')
            .addFields(
                { name: '📋 Lien d\'invitation', value: `[Cliquez ici pour inviter le bot](${inviteLink})`, inline: false },
                { name: '🔒 Permissions incluses', value: `
                **📝 Messages :**
                • Envoyer des messages
                • Lire l'historique des messages
                • Intégrer des liens et joindre des fichiers
                
                **🛡️ Modération :**
                • Gérer les messages (clear)
                • Expulser des membres (kick)
                • Bannir des membres (ban/unban)
                • Mettre en timeout (timeout)
                
                **🎵 Audio :**
                • Se connecter aux canaux vocaux
                • Parler dans les canaux vocaux
                • Utiliser la détection vocale
                `, inline: false },
                { name: '💡 Note', value: 'Vous devez avoir la permission "Gérer le serveur" pour ajouter des bots.', inline: false }
            )
            .setThumbnail(message.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Bot Discord avec fonctionnalités musicales' });

        message.reply({ embeds: [embed] });
    }
};