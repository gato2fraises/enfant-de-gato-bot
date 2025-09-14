const ActivityLogger = require('./utils/ActivityLogger');

// Test du système ActivityLogger
const logger = new ActivityLogger();

// Simuler quelques commandes pour tester
console.log('🧪 Test du système ActivityLogger...');

// Tester le logging
logger.logCommand('ping', '123456789', 'guild123');
logger.logCommand('help', '987654321', 'guild123');
logger.logCommand('play', '123456789', 'guild456');

// Tester les statistiques
const stats = logger.getStats();
console.log('📊 Statistiques de test:', stats);

console.log('✅ Test terminé !');