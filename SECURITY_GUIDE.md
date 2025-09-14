# 🔒 Guide de Sécurité - Bot Discord

## 📋 Vue d'ensemble du système de sécurité

Le bot dispose d'un système de sécurité multicouches pour protéger contre les abus et assurer un fonctionnement stable et sûr.

## 🛡️ Fonctionnalités de sécurité

### ⏱️ Système de Cooldown
- **Commandes générales** : 3 secondes par défaut
- **Commandes musicales** : 5 secondes 
- **Commandes de modération** : 10 secondes
- **Création de tickets** : 30 secondes
- **Protection** : Empêche le spam de commandes

### 🚫 Système de Blacklist
- **Utilisateurs blacklistés** : Ignorés silencieusement
- **Serveurs blacklistés** : Bot inutilisable sur le serveur
- **Gestion** : Via commandes d'administration
- **Logs** : Toutes les actions sont enregistrées

### 📊 Limites de ressources
- **Queue musicale** : Maximum 50 chansons
- **Tickets par utilisateur** : Maximum 3 tickets ouverts
- **Tickets par serveur** : Maximum 20 tickets actifs
- **Protection** : Évite la surcharge du système

### 👑 Administrateurs du bot
- **Permissions étendues** : Accès à toutes les commandes de sécurité
- **Gestion** : Peuvent ajouter/retirer d'autres admins
- **Bypass** : Passent les vérifications de cooldown et limites
- **Multi-niveaux** : Hiérarchie des permissions

### 🚨 Détection automatique
- **Invitations Discord** : Détection des liens discord.gg
- **Messages suspects** : URLs, mentions de masse
- **Spam** : Caractères répétés, flood
- **Logs** : Enregistrement des activités suspectes

## 📝 Commandes d'administration

### 🔒 `!security`
**Description** : Gestion générale de la sécurité
**Permissions** : Admins du bot uniquement

**Sous-commandes** :
```
!security stats          # Statistiques de sécurité
!security logs [nombre]   # Logs récents (max 20)
!security cleanup        # Nettoie les anciens cooldowns
!security help           # Aide des commandes de sécurité
```

**Exemples** :
```
!security stats
!security logs 15
!security cleanup
```

### 🚫 `!blacklist`
**Description** : Gestion des blacklists
**Permissions** : Admins du bot uniquement

**Actions disponibles** :
```
!blacklist add user <ID> [raison]      # Blacklister un utilisateur
!blacklist add guild <ID> [raison]     # Blacklister un serveur
!blacklist remove user <ID>            # Retirer un utilisateur
!blacklist remove guild <ID>           # Retirer un serveur
!blacklist check user <ID>             # Vérifier un utilisateur
!blacklist check guild <ID>            # Vérifier un serveur
!blacklist list users                  # Liste des utilisateurs
!blacklist list guilds                 # Liste des serveurs
```

**Exemples** :
```
!blacklist add user 123456789 Spam excessif
!blacklist remove user 123456789
!blacklist check guild 987654321
!blacklist list users
```

### 👑 `!botadmin`
**Description** : Gestion des administrateurs du bot
**Permissions** : Admins du bot uniquement

**Actions disponibles** :
```
!botadmin add <ID>        # Ajouter un admin
!botadmin remove <ID>     # Retirer un admin
!botadmin list            # Liste des admins
```

**Exemples** :
```
!botadmin add 123456789
!botadmin remove 123456789
!botadmin list
```

## ⚙️ Configuration

### 📁 Fichier de configuration : `security-config.json`

```json
{
  "security": {
    "cooldowns": {
      "default": 3000,      // Cooldown par défaut (ms)
      "music": 5000,        // Cooldown musique (ms)
      "moderation": 10000,  // Cooldown modération (ms)
      "tickets": 30000      // Cooldown tickets (ms)
    },
    "limits": {
      "maxQueueSize": 50,           // Taille max queue
      "maxTicketsPerUser": 3,       // Tickets max par user
      "maxActiveTickets": 20,       // Tickets actifs max
      "maxMessageLength": 2000,     // Longueur max message
      "maxReason": 100              // Longueur max raison
    },
    "autoModeration": {
      "enabled": true,              // Modération auto activée
      "detectInvites": true,        // Détecter invitations
      "detectSpam": true,           // Détecter spam
      "detectMassMentions": true,   // Détecter mentions masse
      "suspiciousUrlCheck": true    // Vérifier URLs suspectes
    },
    "logging": {
      "enabled": true,              // Logs activés
      "maxLogs": 1000,             // Nombre max de logs
      "logTypes": {
        "cooldownViolations": true, // Log violations cooldown
        "blacklistHits": true,      // Log hits blacklist
        "rateLimitHits": true,      // Log limites atteintes
        "suspiciousMessages": true, // Log messages suspects
        "adminActions": true        // Log actions admin
      }
    },
    "defaultBotAdmins": [
      "VOTRE_ID_DISCORD_ICI"       // Admins par défaut
    ],
    "emergencyMode": {
      "enabled": false,             // Mode urgence
      "onlyBotAdmins": false,       // Seulement admins
      "maintenanceMessage": "🔧 Le bot est en maintenance."
    }
  }
}
```

### 🔧 Configuration initiale

1. **Modifier l'ID admin** dans `security-config.json` :
   ```json
   "defaultBotAdmins": ["VOTRE_ID_DISCORD_RÉEL"]
   ```

2. **Redémarrer le bot** pour charger la configuration

3. **Tester les permissions** :
   ```
   !security stats
   !botadmin list
   ```

## 📊 Monitoring et surveillance

### 📈 Métriques surveillées
- **Commandes bloquées** : Nombre total de commandes refusées
- **Violations de cooldown** : Tentatives de spam
- **Hits blacklist** : Tentatives d'utilisateurs/serveurs blacklistés
- **Limites atteintes** : Dépassements de limites de ressources
- **Messages suspects** : Contenu potentiellement malveillant

### 📋 Types de logs
- `COOLDOWN_VIOLATION` : Violation de cooldown
- `BLACKLIST_HIT` : Tentative d'accès blacklisté
- `RATE_LIMIT_HIT` : Limite de ressource atteinte
- `SUSPICIOUS_MESSAGE` : Message suspect détecté
- `USER_BLACKLISTED` : Utilisateur ajouté à la blacklist
- `GUILD_BLACKLISTED` : Serveur ajouté à la blacklist
- `BOT_ADMIN_ADDED` : Admin ajouté
- `BOT_ADMIN_REMOVED` : Admin retiré

### 🔍 Surveillance automatique
```bash
# Console logs automatiques pour les événements critiques
🚨 [SECURITY] BLACKLIST_HIT: { userId: '123', type: 'user' }
🚨 [SECURITY] SUSPICIOUS_MESSAGE: { flags: ['DISCORD_INVITE'] }
🚨 [SECURITY] RATE_LIMIT_HIT: { type: 'queue', limit: 50 }
```

## 🚨 Mode d'urgence

### 🔒 Activation du mode d'urgence
```json
"emergencyMode": {
  "enabled": true,
  "onlyBotAdmins": true,
  "maintenanceMessage": "🔧 Bot en maintenance."
}
```

### 🔧 Effets du mode d'urgence
- **enabled: true** : Message de maintenance affiché
- **onlyBotAdmins: true** : Seuls les admins peuvent utiliser le bot
- **Message personnalisé** : Affiché aux utilisateurs non-admins

## 🛠️ Maintenance et dépannage

### 🧹 Nettoyage automatique
- **Cooldowns expirés** : Suppression automatique
- **Logs anciens** : Limitation à 1000 entrées max
- **Commande manuelle** : `!security cleanup`

### 🔍 Dépannage courant

**Problème** : "Seuls les administrateurs du bot peuvent utiliser cette commande"
**Solution** : 
1. Vérifier l'ID dans `security-config.json`
2. Utiliser `!botadmin add <votre_id>`
3. Redémarrer le bot

**Problème** : Cooldown trop strict
**Solution** : 
1. Modifier les valeurs dans `security-config.json`
2. Redémarrer le bot
3. Utiliser `!security cleanup` pour nettoyer

**Problème** : Trop de messages suspects détectés
**Solution** :
1. Désactiver `detectInvites` ou autres dans la config
2. Ajuster les patterns de détection

## 📋 Checklist de sécurité

### ✅ Configuration initiale
- [ ] ID admin configuré dans `security-config.json`
- [ ] Cooldowns ajustés selon vos besoins
- [ ] Limites de ressources définies
- [ ] Auto-modération configurée
- [ ] Mode d'urgence préparé

### ✅ Surveillance
- [ ] Vérification régulière des stats (`!security stats`)
- [ ] Lecture des logs (`!security logs`)
- [ ] Nettoyage périodique (`!security cleanup`)
- [ ] Surveillance des blacklists

### ✅ Gestion des incidents
- [ ] Procédure de blacklist établie
- [ ] Admins de confiance ajoutés
- [ ] Mode d'urgence testé
- [ ] Sauvegarde de la configuration

## 🔮 Fonctionnalités avancées

### 🎯 Extensions possibles
- **Sauvegarde persistante** : Base de données pour blacklists
- **API de monitoring** : Interface web de surveillance
- **Alertes Discord** : Webhooks pour événements critiques
- **Géolocalisation** : Détection de connexions suspectes
- **Machine Learning** : Détection avancée de spam

### 🔗 Intégrations
- **Discord Audit Logs** : Corrélation avec les logs Discord
- **Services externes** : APIs de vérification d'URLs
- **Notifications** : SMS/Email pour alertes critiques
- **Dashboard** : Interface graphique de gestion

Le système de sécurité est maintenant complètement opérationnel ! 🛡️