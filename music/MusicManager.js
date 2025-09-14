const { 
    createAudioPlayer, 
    createAudioResource, 
    joinVoiceChannel, 
    VoiceConnectionStatus, 
    AudioPlayerStatus,
    entersState
} = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const { EmbedBuilder } = require('discord.js');

// Configuration FFmpeg
const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath;
console.log(`🔧 FFmpeg configuré: ${ffmpegPath}`);

class MusicManager {
    constructor() {
        this.queues = new Map(); // Map<guildId, GuildQueue>
    }

    // Créer ou récupérer la queue d'un serveur
    getQueue(guildId) {
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, {
                songs: [],
                playing: false,
                currentSong: null,
                connection: null,
                player: null,
                textChannel: null,
                volume: 50,
                loop: false,
                preloadedStream: null // Pour précharger la prochaine chanson
            });
        }
        return this.queues.get(guildId);
    }

    // Ajouter une chanson à la queue
    async addSong(guildId, song, textChannel) {
        const queue = this.getQueue(guildId);
        queue.textChannel = textChannel;
        queue.songs.push(song);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎵 Chanson ajoutée à la queue')
            .setDescription(`**${song.title}**`)
            .addFields(
                { name: 'Durée', value: song.duration, inline: true },
                { name: 'Demandé par', value: song.requestedBy.username, inline: true },
                { name: 'Position dans la queue', value: `${queue.songs.length}`, inline: true }
            )
            .setThumbnail(song.thumbnail)
            .setTimestamp();

        textChannel.send({ embeds: [embed] });

        if (!queue.playing) {
            this.play(guildId);
        }
    }

    // Rejoindre un canal vocal
    async joinChannel(member, textChannel) {
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            textChannel.send('❌ Vous devez être dans un canal vocal pour utiliser cette commande !');
            return null;
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            await entersState(connection, VoiceConnectionStatus.Ready, 30000);
            return connection;
        } catch (error) {
            console.error('Erreur lors de la connexion au canal vocal:', error);
            textChannel.send('❌ Impossible de rejoindre le canal vocal !');
            return null;
        }
    }

    // Lire une chanson
    // Lire une chanson (méthode principale)
    async play(guildId) {
        const queue = this.getQueue(guildId);
        console.log(`🎵 [play] Démarrage pour guildId: ${guildId}`);
        console.log(`📊 [play] Queue state: songs=${queue.songs.length}, playing=${queue.playing}, connection=${!!queue.connection}`);
        
        if (queue.songs.length === 0) {
            console.log(`📭 [play] Queue vide, arrêt de la lecture`);
            queue.playing = false;
            queue.currentSong = null;
            
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('📻 Queue terminée')
                .setDescription('Aucune chanson dans la queue. Ajoutez des chansons avec `!play <lien>`')
                .setTimestamp();
            
            if (queue.textChannel) {
                queue.textChannel.send({ embeds: [embed] });
            }
            return;
        }

        const song = queue.songs.shift();
        queue.currentSong = song;
        queue.playing = true;

        console.log(`🎵 [play] Début lecture: ${song.title}`);
        console.log(`🎵 [play] URL: ${song.url}`);

        try {
            // Créer la ressource audio avec configuration optimisée
            console.log(`🎵 [play] Création du stream ytdl...`);
            const stream = ytdl(song.url, {
                filter: 'audioonly',
                highWaterMark: 1 << 26, // Buffer plus large pour éviter les interruptions
                quality: 'highestaudio',
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                }
            });

            console.log(`🎵 [play] Création de la ressource audio...`);
            const resource = createAudioResource(stream, {
                inputType: 'arbitrary',
                inlineVolume: true,
                metadata: {
                    title: song.title
                }
            });

            // Créer le player audio s'il n'existe pas
            if (!queue.player) {
                console.log(`🎵 [play] Création du player audio...`);
                queue.player = createAudioPlayer({
                    behaviors: {
                        noSubscriber: 'pause'
                    }
                });
                
                queue.player.on(AudioPlayerStatus.Playing, () => {
                    console.log(`✅ [player] Lecture en cours: ${song.title}`);
                });

                queue.player.on(AudioPlayerStatus.Buffering, () => {
                    console.log(`🔄 [player] Buffering en cours...`);
                });

                queue.player.on(AudioPlayerStatus.Idle, () => {
                    console.log(`⏭️ [player] Chanson terminée, passage à la suivante...`);
                    if (queue.loop && queue.currentSong) {
                        queue.songs.unshift(queue.currentSong);
                    }
                    setTimeout(() => this.play(guildId), 500); // Délai réduit
                });

                queue.player.on('error', error => {
                    console.error('❌ [player] Erreur du player audio:', error);
                    setTimeout(() => this.play(guildId), 2000);
                });

                // Événements pour détecter les problèmes de réseau
                queue.player.on('stateChange', (oldState, newState) => {
                    console.log(`🔄 [player] État changé: ${oldState.status} -> ${newState.status}`);
                });
            } else {
                console.log(`🎵 [play] Réutilisation du player existant`);
            }

            // S'assurer que le player est connecté à la connexion vocale
            if (queue.connection && queue.player) {
                console.log(`🔗 [play] Connexion du player à la connexion vocale...`);
                const subscription = queue.connection.subscribe(queue.player);
                console.log(`🔗 [play] Player connecté: ${subscription ? 'OK' : 'ERREUR'}`);
                
                if (!subscription) {
                    console.error('❌ [play] Impossible de connecter le player à la connexion vocale');
                    return;
                }
            } else {
                console.error('❌ [play] Connexion ou player manquant');
                console.error(`❌ [play] connection: ${!!queue.connection}, player: ${!!queue.player}`);
                return;
            }

            // Jouer la ressource
            console.log(`▶️ [play] Lancement de la lecture...`);
            queue.player.play(resource);
            console.log(`✅ [play] Commande play() envoyée au player`);

            // Envoyer l'embed "En cours de lecture"
            if (queue.textChannel) {
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('🎵 En cours de lecture')
                    .setDescription(`**${song.title}**`)
                    .addFields(
                        { name: 'Durée', value: song.duration, inline: true },
                        { name: 'Demandé par', value: song.requestedBy.username, inline: true },
                        { name: 'Chansons restantes', value: `${queue.songs.length}`, inline: true }
                    )
                    .setThumbnail(song.thumbnail)
                    .setTimestamp();

                queue.textChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error('❌ [play] Erreur lors de la lecture:', error);
            if (queue.textChannel) {
                queue.textChannel.send(`❌ Erreur lors de la lecture de "${song.title}". Passage à la suivante...`);
            }
            setTimeout(() => this.play(guildId), 2000);
        }
    }

    // Arrêter la musique
    stop(guildId) {
        const queue = this.getQueue(guildId);
        
        // Compter les chansons qui vont être supprimées
        const clearedSongs = queue.songs.length + (queue.currentSong ? 1 : 0);
        
        console.log(`🛑 [stop] Arrêt de la musique pour guildId: ${guildId}`);
        console.log(`🛑 [stop] Chansons à supprimer: ${clearedSongs}`);
        
        // Nettoyer la queue
        queue.songs = [];
        queue.playing = false;
        queue.currentSong = null;
        
        // Arrêter le player audio
        if (queue.player) {
            console.log(`🛑 [stop] Arrêt du player audio`);
            queue.player.stop();
        }
        
        // Détruire la connexion vocale
        if (queue.connection) {
            console.log(`🛑 [stop] Destruction de la connexion vocale`);
            queue.connection.destroy();
            queue.connection = null;
        }
        
        // Supprimer la queue du cache
        this.queues.delete(guildId);
        
        console.log(`✅ [stop] Musique arrêtée avec succès`);
        
        return {
            success: true,
            message: 'Musique arrêtée avec succès',
            clearedSongs: clearedSongs
        };
    }

    // Passer à la chanson suivante
    skip(guildId) {
        const queue = this.getQueue(guildId);
        if (queue.player) {
            queue.player.stop();
        }
    }

    // Mettre en pause
    pause(guildId) {
        const queue = this.getQueue(guildId);
        if (queue.player) {
            return queue.player.pause();
        }
        return false;
    }

    // Reprendre la lecture
    resume(guildId) {
        const queue = this.getQueue(guildId);
        if (queue.player) {
            return queue.player.unpause();
        }
        return false;
    }

    // Activer/désactiver la répétition
    toggleLoop(guildId) {
        const queue = this.getQueue(guildId);
        queue.loop = !queue.loop;
        return queue.loop;
    }

    // Obtenir la queue actuelle
    getQueueList(guildId) {
        const queue = this.getQueue(guildId);
        return {
            current: queue.currentSong,
            songs: queue.songs,
            loop: queue.loop
        };
    }

    // Vérifier si le bot est connecté à un canal vocal
    isConnected(guildId) {
        const queue = this.getQueue(guildId);
        return queue.connection && queue.connection.state.status === VoiceConnectionStatus.Ready;
    }

    // Méthode spécifique pour les interactions slash
    async playFromInteraction(interaction, url) {
        try {
            const guild = interaction.guild;
            const user = interaction.user;
            const voiceChannel = interaction.member.voice.channel;
            
            console.log(`🎵 Tentative de lecture pour ${user.username}`);
            console.log(`📺 Canal vocal ID: ${voiceChannel.id}`);
            console.log(`🏠 Serveur: ${guild.name} (${guild.id})`);
            
            const guildId = guild.id;
            const MusicUtils = require('./MusicUtils');
            
            // Nettoyer l'URL YouTube
            const cleanUrl = MusicUtils.cleanYouTubeUrl(url);
            console.log(`🔗 URL nettoyée: ${cleanUrl}`);
            
            // Récupérer les informations de la vidéo
            const videoInfo = await MusicUtils.getVideoInfo(cleanUrl);
            if (!videoInfo) {
                return {
                    success: false,
                    message: 'Impossible de récupérer les informations de cette vidéo YouTube.'
                };
            }
            
            console.log(`📹 Vidéo trouvée: ${videoInfo.title}`);

            // Créer l'objet chanson
            const song = {
                title: videoInfo.title,
                url: videoInfo.url,
                duration: videoInfo.duration,
                thumbnail: videoInfo.thumbnail,
                requestedBy: user,
                author: videoInfo.author
            };

            // Rejoindre le canal vocal
            const queue = this.getQueue(guildId);
            if (!queue.connection) {
                try {
                    console.log(`🔗 Connexion au canal vocal ${voiceChannel.id}...`);
                    queue.connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: guild.id,
                        adapterCreator: guild.voiceAdapterCreator,
                        selfDeaf: true, // Se déafenner pour de meilleures performances
                        selfMute: false
                    });
                    
                    // Ajouter des événements pour surveiller la connexion
                    queue.connection.on('stateChange', (oldState, newState) => {
                        console.log(`🔄 [connection] État changé: ${oldState.status} -> ${newState.status}`);
                    });

                    queue.connection.on('disconnect', () => {
                        console.log('🔌 [connection] Connexion fermée');
                    });
                    
                    await entersState(queue.connection, VoiceConnectionStatus.Ready, 30000);
                    console.log('✅ Connexion au canal vocal établie');
                } catch (error) {
                    console.error('❌ Erreur lors de la connexion au canal vocal:', error);
                    return {
                        success: false,
                        message: 'Impossible de rejoindre le canal vocal.'
                    };
                }
            }

            // S'assurer que le textChannel est défini
            if (!queue.textChannel) {
                queue.textChannel = interaction.channel;
            }

            // Ajouter la chanson à la queue
            queue.songs.push(song);
            const position = queue.songs.length;
            console.log(`📝 Chanson ajoutée à la queue. Position: ${position}, Total: ${queue.songs.length}`);

            // Si aucune musique ne joue, commencer la lecture
            if (!queue.playing) {
                console.log('🎵 Aucune musique en cours, démarrage de la lecture...');
                queue.playing = true;
                this.play(guildId);
            } else {
                console.log('🎵 Musique déjà en cours, ajout à la queue');
            }

            return {
                success: true,
                song: song,
                position: position,
                message: `Chanson ajoutée à la queue : ${song.title}`
            };

        } catch (error) {
            console.error('❌ Erreur dans playFromInteraction:', error);
            return {
                success: false,
                message: `Erreur lors du traitement de la musique : ${error.message}`
            };
        }
    }

}

module.exports = MusicManager;