const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannit un utilisateur du serveur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à bannir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison du bannissement')
                .setRequired(false)
                .setMaxLength(500))
        .addIntegerOption(option =>
            option.setName('jours')
                .setDescription('Nombre de jours de messages à supprimer (0-7)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(7))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
                
    async execute(interaction) {

        // Vérifier les permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ 
                content: '❌ Vous n\'avez pas la permission de bannir des utilisateurs !', 
                flags: 64 // MessageFlags.Ephemeral 
            });
        }

        const targetUser = interaction.options.getUser('utilisateur');
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';
        const deleteMessageDays = interaction.options.getInteger('jours') || 0;

        // Vérifier que l'utilisateur ne se bannit pas lui-même
        if (targetUser.id === interaction.user.id) {
            return interaction.reply({ 
                content: '❌ Vous ne pouvez pas vous bannir vous-même !', 
                flags: 64 // MessageFlags.Ephemeral 
            });
        }

        // Vérifier que l'utilisateur ne bannit pas le bot
        if (targetUser.id === interaction.client.user.id) {
            return interaction.reply({ 
                content: '❌ Vous ne pouvez pas me bannir !', 
                flags: 64 // MessageFlags.Ephemeral 
            });
        }

        // Différer la réponse
        await interaction.deferReply();

        try {
            // Essayer de récupérer le membre
            let targetMember = null;
            try {
                targetMember = await interaction.guild.members.fetch(targetUser.id);
            } catch (error) {
                // L'utilisateur n'est pas sur le serveur, on peut quand même le bannir par ID
            }

            // Vérifications de hiérarchie si le membre est sur le serveur
            if (targetMember) {
                const executorMember = interaction.member;
                
                // Vérifier la hiérarchie des rôles
                if (targetMember.roles.highest.position >= executorMember.roles.highest.position) {
                    return interaction.editReply({ 
                        content: '❌ Vous ne pouvez pas bannir un utilisateur ayant un rôle égal ou supérieur au vôtre !' 
                    });
                }

                // Vérifier si le bot peut bannir cet utilisateur
                if (!targetMember.bannable) {
                    return interaction.editReply({ 
                        content: '❌ Je ne peux pas bannir cet utilisateur (permissions insuffisantes ou rôle trop élevé) !' 
                    });
                }

                // Vérifier les permissions spéciales
                if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.editReply({ 
                        content: '❌ Vous ne pouvez pas bannir un administrateur !' 
                    });
                }
            }

            // Envoyer un message privé à l'utilisateur avant de le bannir
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('🔨 Vous avez été banni')
                    .setDescription(`Vous avez été banni du serveur **${interaction.guild.name}**`)
                    .addFields(
                        { name: '👮 Modérateur', value: interaction.user.tag, inline: true },
                        { name: '📝 Raison', value: reason, inline: true },
                        { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                    )
                    .setTimestamp();

                await targetUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`Impossible d'envoyer un MP à ${targetUser.tag} avant le ban`);
            }

            // Effectuer le bannissement
            await interaction.guild.members.ban(targetUser, {
                deleteMessageDays: deleteMessageDays,
                reason: `${reason} - Par ${interaction.user.tag}`
            });

            // Créer l'embed de confirmation
            const banEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🔨 Utilisateur banni')
                .setDescription(`**${targetUser.tag}** a été banni du serveur`)
                .addFields(
                    { name: '👤 Utilisateur', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: '👮 Modérateur', value: interaction.user.tag, inline: true },
                    { name: '📝 Raison', value: reason, inline: false },
                    { name: '🗑️ Messages supprimés', value: `${deleteMessageDays} jour(s)`, inline: true },
                    { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: `ID: ${targetUser.id}` });

            interaction.editReply({ embeds: [banEmbed] });

            // Log dans la console
            console.log(`🔨 ${targetUser.tag} banni de ${interaction.guild.name} par ${interaction.user.tag} - Raison: ${reason}`);

            // Envoyer un log dans le canal de modération s'il existe
            const logChannel = interaction.guild.channels.cache.find(channel => 
                channel.name.includes('mod-log') || 
                channel.name.includes('logs') || 
                channel.name.includes('audit')
            );

            if (logChannel) {
                logChannel.send({ embeds: [banEmbed] });
            }

        } catch (error) {
            console.error('Erreur lors du bannissement:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors du bannissement.')
                .addFields(
                    { name: 'Détails', value: error.message, inline: false }
                )
                .setTimestamp();

            interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};