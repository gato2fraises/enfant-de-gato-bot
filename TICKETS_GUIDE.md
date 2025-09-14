# 🎫 Système de Tickets - Guide Complet

## 📋 Vue d'ensemble

Le système de tickets permet aux utilisateurs de créer des salons privés pour obtenir de l'aide du staff. Chaque ticket est un salon temporaire avec des permissions spécifiques.

## 🚀 Fonctionnalités

### ✨ Création automatique
- **Catégorie automatique** : Création de la catégorie "🎫 Tickets" si elle n'existe pas
- **Numérotation** : Chaque ticket reçoit un numéro unique (#1, #2, etc.)
- **Permissions** : Configuration automatique des permissions pour l'utilisateur et le staff

### 🛡️ Sécurité
- **Accès contrôlé** : Seuls l'utilisateur, les modérateurs et admins peuvent voir le ticket
- **Logs automatiques** : Enregistrement des actions dans le canal de logs
- **Vérifications** : Empêche les actions non autorisées

### 📊 Gestion avancée
- **Statut en temps réel** : Suivi de l'état des tickets (ouvert/fermé)
- **Historique** : Conservation des données temporaires pour les statistiques
- **Multi-serveurs** : Chaque serveur a son propre système de tickets

## 📝 Commandes disponibles

### 🎫 `!ticket [raison]`
**Description** : Crée un nouveau ticket de support
**Utilisation** :
```
!ticket Mon problème de connexion
!ticket Aide pour la configuration
!ticket Signalement d'un bug
```
**Fonctionnement** :
- Crée un salon privé dans la catégorie "🎫 Tickets"
- Donne accès uniquement à l'utilisateur et au staff
- Envoie un message de bienvenue avec les instructions
- Ping les rôles de modération s'ils existent

### 🔒 `!close [raison]`
**Description** : Ferme le ticket actuel
**Permissions** : Créateur du ticket, modérateurs, administrateurs
**Utilisation** :
```
!close Problème résolu
!close Pas de réponse de l'utilisateur
!close
```
**Fonctionnement** :
- Affiche un résumé du ticket (durée, créateur, etc.)
- Supprime automatiquement le salon après 10 secondes
- Enregistre l'action dans les logs

### ➕ `!add @utilisateur`
**Description** : Ajoute un utilisateur au ticket
**Permissions** : Créateur du ticket, modérateurs, administrateurs
**Utilisation** :
```
!add @Expert
!add @Assistant
```
**Fonctionnement** :
- Donne les permissions de lecture/écriture à l'utilisateur
- Confirme l'action avec un message dans le ticket

### ➖ `!remove @utilisateur`
**Description** : Retire un utilisateur du ticket
**Permissions** : Créateur du ticket, modérateurs, administrateurs
**Utilisation** :
```
!remove @utilisateur
```
**Restrictions** :
- Impossible de retirer le créateur du ticket
- Impossible de retirer un administrateur
**Fonctionnement** :
- Retire toutes les permissions de l'utilisateur
- Confirme l'action avec un message

### 📊 `!tickets`
**Description** : Affiche tous les tickets du serveur
**Permissions** : Modérateurs et administrateurs uniquement
**Fonctionnement** :
- Liste les tickets ouverts avec détails
- Affiche les statistiques globales
- Montre les commandes disponibles

## 🏗️ Architecture technique

### 📁 Structure des fichiers
```
tickets/
├── TicketManager.js     # Gestionnaire principal
commands/
├── ticket.js           # Création de tickets
├── close.js            # Fermeture de tickets
├── add.js              # Ajout d'utilisateurs
├── remove.js           # Retrait d'utilisateurs
└── tickets.js          # Liste des tickets
```

### 🧩 Intégration
- **index.js** : Initialisation du `TicketManager` dans le client
- **Commandes** : Accès via `message.client.ticketManager`
- **Événements** : Gestion automatique des permissions et logs

## ⚙️ Configuration

### 🔧 Permissions requises
Le bot doit avoir les permissions suivantes :
- `Manage Channels` (Gérer les salons)
- `Manage Roles` (Gérer les rôles) 
- `View Channels` (Voir les salons)
- `Send Messages` (Envoyer des messages)
- `Embed Links` (Intégrer des liens)
- `Read Message History` (Lire l'historique)

### 🏷️ Rôles de modération
Le système détecte automatiquement les rôles de modération :
- Noms contenant : "mod", "admin", "staff", "helper", "support"
- Ou permissions `Manage Channels` / `Administrator`

### 📂 Catégorie automatique
- **Nom** : "🎫 Tickets"
- **Création** : Automatique si inexistante
- **Position** : En haut de la liste des salons

## 📈 Données et statistiques

### 💾 Stockage temporaire
- **Map tickets** : Données des tickets actifs
- **Map counters** : Compteurs par serveur
- **Persistence** : En mémoire (redémarre à 0 après reboot)

### 📊 Métriques disponibles
- Nombre total de tickets
- Tickets ouverts vs fermés
- Tickets créés aujourd'hui
- Durée moyenne des tickets
- Activité par utilisateur

## 🚨 Gestion d'erreurs

### ⚠️ Erreurs communes
1. **Permissions insuffisantes** : Message d'erreur explicite
2. **Salon supprimé** : Nettoyage automatique des données
3. **Utilisateur introuvable** : Vérification d'existence
4. **Limite de tickets** : Aucune limite imposée actuellement

### 🔍 Debugging
- **Console logs** : Actions importantes enregistrées
- **Try/catch** : Toutes les opérations protégées
- **Messages d'erreur** : Feedback utilisateur informatif

## 🎯 Cas d'usage

### 👥 Pour les utilisateurs
```
Utilisateur : !ticket Je n'arrive pas à me connecter
Bot : Crée ticket-001 et ping le staff
Staff : Répond dans le ticket privé
Utilisateur : Problème résolu
Staff : !close Problème résolu
Bot : Ferme et supprime le ticket
```

### 🛠️ Pour les modérateurs
```
Modérateur : !tickets
Bot : Affiche la liste des tickets ouverts
Modérateur : Se rend dans un ticket
Modérateur : !add @Expert
Bot : Ajoute l'expert au ticket
Expert : Aide l'utilisateur
Modérateur : !close Résolu avec l'aide de l'expert
```

## 🔮 Extensions possibles

### 🎛️ Fonctionnalités avancées
- **Sauvegarde** : Export des conversations avant fermeture
- **Catégories** : Tickets par type (support, signalement, etc.)
- **Auto-fermeture** : Fermeture automatique après inactivité
- **Templates** : Messages prédéfinis selon le type
- **Évaluations** : Système de notation du support

### 📊 Analytics
- **Dashboard** : Interface web de gestion
- **Rapports** : Statistiques détaillées
- **Alertes** : Notifications pour tickets anciens
- **Intégrations** : Webhook Discord, Slack, etc.

## ✅ Test complet

Pour tester le système :

1. **Création** : `!ticket Test du système`
2. **Ajout** : `!add @ami` 
3. **Vérification** : `!tickets` (en tant que mod)
4. **Retrait** : `!remove @ami`
5. **Fermeture** : `!close Test terminé`

Le système est maintenant pleinement fonctionnel ! 🎉