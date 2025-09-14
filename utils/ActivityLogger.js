const fs = require('fs');
const path = require('path');

class ActivityLogger {
    constructor() {
        this.logFile = path.join(__dirname, '../logs/activity.json');
        this.ensureLogFile();
    }

    ensureLogFile() {
        const logsDir = path.dirname(this.logFile);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        if (!fs.existsSync(this.logFile)) {
            fs.writeFileSync(this.logFile, JSON.stringify({
                startDate: new Date().toISOString(),
                commandsUsed: {},
                dailyStats: {},
                totalCommands: 0,
                uniqueUsers: []
            }, null, 2));
        }
    }

    logCommand(commandName, userId, guildId) {
        try {
            const data = this.readLog();
            const today = new Date().toISOString().split('T')[0];
            
            // Initialiser les structures si nécessaire
            if (!data.commandsUsed[commandName]) {
                data.commandsUsed[commandName] = 0;
            }
            if (!data.dailyStats[today]) {
                data.dailyStats[today] = {
                    commands: 0,
                    users: [],
                    guilds: []
                };
            }

            // S'assurer que uniqueUsers est un array
            if (!Array.isArray(data.uniqueUsers)) {
                data.uniqueUsers = [];
            }

            // Incrémenter les compteurs
            data.commandsUsed[commandName]++;
            data.totalCommands++;
            
            // Ajouter l'utilisateur s'il n'existe pas déjà
            if (!data.uniqueUsers.includes(userId)) {
                data.uniqueUsers.push(userId);
            }
            
            data.dailyStats[today].commands++;
            
            // Ajouter l'utilisateur du jour s'il n'existe pas déjà
            if (!data.dailyStats[today].users.includes(userId)) {
                data.dailyStats[today].users.push(userId);
            }
            
            // Ajouter le serveur du jour s'il n'existe pas déjà
            if (guildId && !data.dailyStats[today].guilds.includes(guildId)) {
                data.dailyStats[today].guilds.push(guildId);
            }

            fs.writeFileSync(this.logFile, JSON.stringify(data, null, 2));
            console.log(`📊 Commande loggée: ${commandName} par ${userId}`);
            
        } catch (error) {
            console.error('❌ Erreur lors du logging d\'activité:', error);
        }
    }

    readLog() {
        try {
            const rawData = fs.readFileSync(this.logFile, 'utf8');
            return JSON.parse(rawData);
        } catch (error) {
            console.error('❌ Erreur lors de la lecture du log:', error);
            return {
                startDate: new Date().toISOString(),
                commandsUsed: {},
                dailyStats: {},
                totalCommands: 0,
                uniqueUsers: []
            };
        }
    }

    getStats() {
        const data = this.readLog();
        const startDate = new Date(data.startDate);
        const now = new Date();
        const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        
        const last7Days = Object.entries(data.dailyStats || {})
            .filter(([date]) => {
                const dayDate = new Date(date);
                const daysDiff = Math.floor((now - dayDate) / (1000 * 60 * 60 * 24));
                return daysDiff <= 7;
            })
            .reduce((sum, [, stats]) => sum + (stats.commands || 0), 0);

        const last30Days = Object.entries(data.dailyStats || {})
            .filter(([date]) => {
                const dayDate = new Date(date);
                const daysDiff = Math.floor((now - dayDate) / (1000 * 60 * 60 * 24));
                return daysDiff <= 30;
            })
            .reduce((sum, [, stats]) => sum + (stats.commands || 0), 0);

        return {
            daysSinceStart,
            totalCommands: data.totalCommands || 0,
            uniqueUsers: (data.uniqueUsers || []).length,
            commandsLast7Days: last7Days,
            commandsLast30Days: last30Days,
            mostUsedCommands: Object.entries(data.commandsUsed || {})
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5),
            isEligibleForBadge: daysSinceStart >= 30 && last30Days >= 10
        };
    }
}

module.exports = ActivityLogger;