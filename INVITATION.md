# 🔗 Guide d'invitation du bot

## Comment ajouter le bot à votre serveur Discord

### Méthode 1 : Commande !invite (Recommandée)

1. **Sur un serveur où le bot est déjà présent :**
   - Tapez `!invite` dans n'importe quel canal
   - Le bot générera automatiquement un lien d'invitation avec toutes les permissions nécessaires
   - Cliquez sur le lien et sélectionnez votre serveur

### Méthode 2 : Lien direct

Si vous connaissez l'ID du bot, vous pouvez créer un lien d'invitation manuel :

```
https://discord.com/api/oauth2/authorize?client_id=BOT_ID&permissions=8589934592&scope=bot
```

Remplacez `BOT_ID` par l'ID réel du bot.

## 🔒 Permissions requises

Le bot a besoin des permissions suivantes pour fonctionner correctement :

### Permissions de base :
- ✅ **Envoyer des messages** - Pour répondre aux commandes
- ✅ **Lire l'historique des messages** - Pour traiter les commandes
- ✅ **Intégrer des liens** - Pour afficher les embeds colorés
- ✅ **Joindre des fichiers** - Pour partager des médias
- ✅ **Utiliser des émojis externes** - Pour les réactions
- ✅ **Ajouter des réactions** - Pour les interactions

### Permissions de modération :
- ✅ **Gérer les messages** - Pour la commande `!clear`

### Permissions musicales :
- ✅ **Se connecter** - Pour rejoindre les canaux vocaux
- ✅ **Parler** - Pour jouer de la musique
- ✅ **Utiliser la détection vocale** - Pour l'audio

## 🎉 Première utilisation

Une fois le bot ajouté à votre serveur :

1. **Le bot se présentera automatiquement** dans un canal général
2. **Tapez `!help`** pour voir toutes les commandes disponibles
3. **Testez avec `!ping`** pour vérifier que tout fonctionne
4. **Pour la musique :** Rejoignez un canal vocal et tapez `!play <lien YouTube>`

## 🚨 Dépannage

### Le bot ne répond pas :
- Vérifiez qu'il a la permission "Envoyer des messages" dans le canal
- Assurez-vous d'utiliser le bon préfixe (par défaut `!`)

### Problèmes de musique :
- Le bot doit avoir les permissions vocales
- Vous devez être dans un canal vocal
- Utilisez des liens YouTube valides

### Le bot n'apparaît pas en ligne :
- Vérifiez que le token est correct
- Redémarrez le bot si nécessaire

## 📞 Support

Pour toute aide supplémentaire :
- Tapez `!stats` pour voir les statistiques du bot
- Tapez `!info` pour plus d'informations techniques
- Contactez l'administrateur du bot

---

**Amusez-vous bien avec votre nouveau bot ! 🎉**