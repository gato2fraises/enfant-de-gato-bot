const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: '8ball',
        description: 'Pose une question à la boule magique'
    },
    async execute(message, args) {
        const question = args.join(' ');
        
        if (!question) {
            return message.reply('❌ Veuillez poser une question !');
        }
        
        const responses = [
            'Oui, absolument !',
            'Non, certainement pas.',
            'Peut-être...',
            'C\'est très probable.',
            'Je ne pense pas.',
            'Essayez encore plus tard.',
            'Les signes pointent vers oui.',
            'Les perspectives ne sont pas bonnes.',
            'Sans aucun doute !',
            'Ma réponse est non.',
            'Vous pouvez compter dessus.',
            'Mieux vaut ne pas vous le dire maintenant.',
            'Très douteux.',
            'Oui, dans des circonstances favorables.',
            'Concentrez-vous et demandez à nouveau.',
            'Les chances sont bonnes.',
            'Ne comptez pas dessus.',
            'Mes sources disent non.',
            'C\'est certain !',
            'Je ne peux pas prédire maintenant.'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const ballEmbed = new EmbedBuilder()
            .setColor('#8B00FF')
            .setTitle('🎱 Boule Magique')
            .addFields(
                { name: '❓ Question', value: question, inline: false },
                { name: '💭 Réponse', value: randomResponse, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Mon Bot Discord' });
        
        message.reply({ embeds: [ballEmbed] });
    }
};