const ytdl = require('@distube/ytdl-core');

class MusicUtils {
    // Extraire les informations d'une vidéo YouTube
    static async getVideoInfo(url) {
        try {
            if (!ytdl.validateURL(url)) {
                return null;
            }

            const info = await ytdl.getInfo(url);
            const details = info.videoDetails;

            return {
                title: details.title,
                url: details.video_url,
                duration: this.formatDuration(details.lengthSeconds),
                thumbnail: details.thumbnails[details.thumbnails.length - 1].url,
                author: details.author.name,
                views: parseInt(details.viewCount).toLocaleString()
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des infos vidéo:', error);
            return null;
        }
    }

    // Rechercher une vidéo par nom
    static async searchVideo(query) {
        try {
            // Pour une recherche simple, on peut utiliser une URL de recherche YouTube
            // Dans un vrai projet, il faudrait utiliser l'API YouTube ou youtube-sr
            const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            
            // Pour l'instant, on retourne null et on demandera à l'utilisateur de fournir un lien direct
            return null;
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            return null;
        }
    }

    // Formater la durée en secondes vers MM:SS ou HH:MM:SS
    static formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return 'Inconnue';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // Valider une URL YouTube
    static isValidYouTubeUrl(url) {
        return ytdl.validateURL(url);
    }

    // Extraire l'ID d'une vidéo YouTube
    static getVideoId(url) {
        try {
            return ytdl.getVideoID(url);
        } catch (error) {
            return null;
        }
    }

    // Vérifier si une URL est une playlist
    static isPlaylist(url) {
        return url.includes('playlist?list=') || url.includes('&list=');
    }

    // Nettoyer une URL YouTube (enlever les paramètres inutiles)
    static cleanYouTubeUrl(url) {
        try {
            const videoId = this.getVideoId(url);
            return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
        } catch (error) {
            return url;
        }
    }
}

module.exports = MusicUtils;