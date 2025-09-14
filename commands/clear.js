const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'clear',
        description: 'Supprime un nombre spécifié de messages'
    },
    async execute(message, args) {
        // Vérifier les permissions
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply('❌ Vous n\'avez pas la permission de gérer les messages !');
        }
        
        const amount = parseInt(args[0]);
        
        if (isNaN(amount) || amount <= 0 || amount > 100) {
            return message.reply('❌ Veuillez spécifier un nombre entre 1 et 100 !');
        }
        
        try {
            const deleted = await message.channel.bulkDelete(amount + 1, true);
            
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Messages supprimés')
                .setDescription(`${deleted.size - 1} messages ont été supprimés.`)
                .setTimestamp()
                .setFooter({ text: 'Mon Bot Discord' });
            
            const reply = await message.channel.send({ embeds: [successEmbed] });
            
            // Supprimer le message de confirmation après 5 secondes
            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 5000);
            
        } catch (error) {
            console.error('Erreur lors de la suppression des messages:', error);
            message.reply('❌ Erreur lors de la suppression des messages. Les messages de plus de 14 jours ne peuvent pas être supprimés en masse.');
        }
    }
};