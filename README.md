# 🤖 Bot Discord

Un bot Discord personnalisé développé en JavaScript avec discord.js v14.

## 📋 Fonctionnalités

- ✅ **Système multi-serveurs** - Peut être ajouté à plusieurs serveurs Discord
- ✅ **Messages d'accueil automatiques** - Se présente lors de l'ajout à un nouveau serveur
- ✅ Commandes de base (ping, help, info, serveur)
- ✅ Système de commandes modulaire
- ✅ Messages d'embed colorés
- ✅ Message de bienvenue automatique pour nouveaux membres
- ✅ Commandes utiles (avatar, userinfo, clear, 8ball)
- ✅ **Système de musique complet**
  - 🎵 Lecture de musique YouTube
  - 📝 Système de queue (file d'attente)
  - ⏯️ Contrôles audio (pause, resume, skip, stop)
  - 🔁 Mode répétition
  - 📊 Affichage des informations musicales
- ✅ **Statistiques et monitoring** - Commandes stats et invite
- ✅ Gestion des erreurs
- ✅ Configuration flexible

## 🚀 Installation

### Prérequis

1. **Node.js** (version 16 ou supérieure)
   - Téléchargez depuis [nodejs.org](https://nodejs.org/)
   - Vérifiez l'installation : `node --version`

2. **Un bot Discord**
   - Rendez-vous sur [Discord Developer Portal](https://discord.com/developers/applications)
   - Créez une nouvelle application
   - Allez dans "Bot" et créez un bot
   - Copiez le token du bot

### Configuration

1. **Clonez ou téléchargez ce projet**

2. **Installez les dépendances**
   ```bash
   npm install
   ```

3. **Configuration du bot**
   - Copiez `.env.example` vers `.env`
   - Remplissez votre token Discord dans le fichier `.env` :
   ```env
   DISCORD_TOKEN=votre_token_ici
   GUILD_ID=votre_guild_id_ici
   OWNER_ID=votre_user_id_ici
   PREFIX=!
   ```

4. **Personnalisez la configuration**
   - Modifiez `config.json` selon vos préférences :
   ```json
   {
     "prefix": "!",
     "color": "#00ff00",
     "embedFooter": "Mon Bot Discord",
     "presence": {
       "activity": "Surveiller le serveur",
       "status": "online",
       "type": "WATCHING"
     }
   }
   ```

### Inviter le bot sur votre serveur

#### Méthode rapide (Recommandée) :
1. **Utilisez la commande `!invite`** sur un serveur où le bot est déjà présent
2. Le bot générera automatiquement un lien avec toutes les permissions nécessaires
3. Cliquez sur le lien et sélectionnez votre serveur

#### Méthode manuelle :
1. Dans le Developer Portal, allez dans "OAuth2" > "URL Generator"
2. Sélectionnez "bot" dans les scopes
3. Sélectionnez les permissions nécessaires :
   - Send Messages, Read Message History
   - Embed Links, Attach Files
   - Manage Messages (pour !clear)
   - Connect, Speak, Use VAD (pour la musique)
4. Copiez l'URL générée et ouvrez-la dans votre navigateur
5. Sélectionnez votre serveur et autorisez le bot

📝 **Note :** Le bot se présentera automatiquement lors de son ajout à un nouveau serveur !

## 🎮 Utilisation

### Démarrer le bot

```bash
# Mode normal
npm start

# Mode développement (redémarre automatiquement)
npm run dev
```

### Commandes disponibles

#### 🎵 **Commandes musicales**

| Commande | Description | Exemple |
|----------|-------------|---------|
| `!play <lien>` | Joue une musique depuis YouTube | `!play https://www.youtube.com/watch?v=...` |
| `!stop` | Arrête la musique et vide la queue | `!stop` |
| `!pause` | Met en pause la musique | `!pause` |
| `!resume` | Reprend la lecture | `!resume` |
| `!skip` | Passe à la chanson suivante | `!skip` |
| `!queue` | Affiche la liste des chansons en attente | `!queue` |
| `!nowplaying` | Affiche la chanson en cours de lecture | `!nowplaying` |
| `!loop` | Active/désactive la répétition | `!loop` |
| `!leave` | Force le bot à quitter le canal vocal | `!leave` |

#### 🛠️ **Commandes générales**

| Commande | Description | Exemple |
|----------|-------------|---------|
| `!ping` | Affiche la latence du bot | `!ping` |
| `!help` | Affiche l'aide | `!help` |
| `!info` | Informations sur le bot | `!info` |
| `!serveur` | Informations sur le serveur | `!serveur` |
| `!stats` | Statistiques globales du bot | `!stats` |
| `!invite` | Génère un lien d'invitation | `!invite` |
| `!avatar` | Affiche l'avatar d'un utilisateur | `!avatar @utilisateur` |
| `!userinfo` | Informations détaillées d'un utilisateur | `!userinfo @utilisateur` |
| `!clear` | Supprime des messages (modérateurs) | `!clear 10` |
| `!8ball` | Boule magique | `!8ball Est-ce que ça va marcher ?` |

## 🛠️ Développement

### Structure du projet

```
Bot discord/
├── commands/           # Dossier des commandes
│   ├── avatar.js
│   ├── clear.js
│   ├── 8ball.js
│   └── userinfo.js
├── index.js           # Fichier principal
├── config.json        # Configuration du bot
├── package.json       # Dépendances et scripts
├── .env.example       # Exemple de fichier d'environnement
├── .gitignore        # Fichiers à ignorer par Git
└── README.md         # Ce fichier
```

### Ajouter une nouvelle commande

1. Créez un nouveau fichier dans le dossier `commands/`
2. Utilisez cette structure :

```javascript
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'macommande',
        description: 'Description de ma commande'
    },
    async execute(message, args) {
        // Votre code ici
        message.reply('Hello World!');
    }
};
```

3. Redémarrez le bot pour charger la nouvelle commande

### Variables d'environnement

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `DISCORD_TOKEN` | Token de votre bot Discord | ✅ |
| `GUILD_ID` | ID de votre serveur (pour les commandes slash spécifiques) | ❌ |
| `OWNER_ID` | Votre ID utilisateur Discord | ❌ |
| `PREFIX` | Préfixe des commandes (défaut: !) | ❌ |

## 🐛 Dépannage

### Problèmes courants

1. **"Token invalide"**
   - Vérifiez que le token dans `.env` est correct
   - Assurez-vous que le bot n'est pas déjà connecté ailleurs

2. **"Cannot find module 'discord.js'"**
   - Exécutez `npm install` pour installer les dépendances

3. **"Missing Permissions"**
   - Vérifiez que le bot a les bonnes permissions sur votre serveur
   - Le rôle du bot doit être au-dessus des rôles qu'il doit gérer

4. **"Node.js non reconnu"**
   - Installez Node.js depuis [nodejs.org](https://nodejs.org/)
   - Redémarrez votre terminal après l'installation

### Logs et débogage

Le bot affiche des logs dans la console :
- ✅ : Succès
- ⚠️ : Avertissement
- ❌ : Erreur
- 📊 : Statistiques
- 👋 : Événements de membres

## 📚 Ressources

- [Documentation Discord.js](https://discord.js.org/#/docs)
- [Guide Discord.js](https://discordjs.guide/)
- [Discord Developer Portal](https://discord.com/developers/docs)
- [Node.js Documentation](https://nodejs.org/docs/)

## 📝 Licence

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser et de le modifier selon vos besoins.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation
- Soumettre des pull requests

## 🆘 Support

Si vous avez besoin d'aide :
1. Vérifiez la section [Dépannage](#-dépannage)
2. Consultez les [Issues](../../issues) du projet
3. Créez une nouvelle issue si nécessaire

---

**Bon développement ! 🚀**