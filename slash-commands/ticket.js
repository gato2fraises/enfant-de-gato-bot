const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Crée un nouveau ticket de support')
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison de la création du ticket')
                .setRequired(false)
                .setMaxLength(100)),
                
    async execute(interaction) {
        const ticketManager = interaction.client.ticketManager;
        const guild = interaction.guild;
        const user = interaction.user;

        // Vérifier que la commande est utilisée dans un serveur
        if (!guild) {
            return interaction.reply({ 
                content: '❌ Cette commande ne peut être utilisée que dans un serveur !', 
                ephemeral: true 
            });
        }

        const reason = interaction.options.getString('raison') || 'Support général';

        // Différer la réponse car l'opération peut prendre du temps
        await interaction.deferReply({ ephemeral: true });

        try {
            // Créer le ticket
            const result = await ticketManager.createTicket(guild, user, reason);

            if (!result.success) {
                return interaction.editReply({ content: `❌ ${result.message}` });
            }

            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎫 Ticket créé avec succès !')
                .setDescription(`Votre ticket a été créé dans ${result.channel}`)
                .addFields(
                    { name: '🎯 Numéro du ticket', value: `#${result.ticketData.id}`, inline: true },
                    { name: '📝 Raison', value: reason, inline: true },
                    { name: '⏱️ Créé le', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                )
                .setTimestamp();

            interaction.editReply({ embeds: [successEmbed] });

            console.log(`🎫 Ticket #${result.ticketData.id} créé par ${user.tag} dans ${guild.name}`);

        } catch (error) {
            console.error('Erreur dans la commande ticket:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur')
                .setDescription('Une erreur est survenue lors de la création du ticket.')
                .addFields(
                    { name: 'Détails', value: error.message, inline: false }
                )
                .setTimestamp();

            interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};