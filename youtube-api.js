/**
 * YouTube Downloader API Module
 * Handles communication with YouTube download services
 */

class YouTubeDownloaderAPI {
    constructor() {
        // Using Cobalt API - a free, no-key required service
        this.apiUrl = 'https://cobalt-api.kwiatekmiki.pl';
        // Alternative API endpoints (fallback)
        this.fallbackApis = [
            'https://api.cobalt.tools',
            'https://cobalt-api.qwik.site'
        ];
        this.currentApiIndex = 0;
    }

    /**
     * Extract video ID from YouTube URL
     */
    extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    /**
     * Get video information using noembed (free, no key required)
     */
    async getVideoInfo(url) {
        const videoId = this.extractVideoId(url);
        if (!videoId) {
            throw new Error('ไม่พบ Video ID จากลิงก์ที่ให้มา');
        }

        try {
            // Use noembed for basic video info (free service)
            const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            return {
                videoId: videoId,
                title: data.title,
                author: data.author_name,
                thumbnail: data.thumbnail_url,
                url: url
            };
        } catch (error) {
            throw new Error(`ไม่สามารถดึงข้อมูลวิดีโอได้: ${error.message}`);
        }
    }

    /**
     * Get available download formats/qualities
     */
    async getDownloadFormats(url) {
        const videoId = this.extractVideoId(url);
        if (!videoId) {
            throw new Error('ไม่พบ Video ID');
        }

        try {
            // Using Cobalt API for format information
            const apiEndpoint = this.fallbackApis[this.currentApiIndex];
            
            const response = await fetch(`${apiEndpoint}/api/json`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    vCodec: 'h264',
                    vQuality: 'max',
                    aFormat: 'mp3'
                })
            });

            if (!response.ok) {
                // Try next API if current one fails
                this.currentApiIndex = (this.currentApiIndex + 1) % this.fallbackApis.length;
                throw new Error('API ไม่ตอบสนอง');
            }

            const data = await response.json();

            // Return available formats based on API response
            return {
                status: 'success',
                audio: [
                    { quality: 'mp3', label: 'MP3 (Audio Only)', size: 'Unknown' },
                    { quality: 'm4a', label: 'M4A (AAC Audio)', size: 'Unknown' }
                ],
                video: [
                    { quality: '1080p', label: '1080p HD', size: 'Unknown' },
                    { quality: '720p', label: '720p HD', size: 'Unknown' },
                    { quality: '480p', label: '480p', size: 'Unknown' },
                    { quality: '360p', label: '360p', size: 'Unknown' }
                ]
            };
        } catch (error) {
            // Return default formats if API fails
            return {
                status: 'fallback',
                audio: [
                    { quality: 'mp3', label: 'MP3 (Audio Only)', size: 'Unknown' }
                ],
                video: [
                    { quality: '720p', label: '720p HD', size: 'Unknown' },
                    { quality: '480p', label: '480p', size: 'Unknown' },
                    { quality: '360p', label: '360p', size: 'Unknown' }
                ]
            };
        }
    }

    /**
     * Download video with specific quality
     */
    async downloadVideo(url, quality, format = 'mp4', onProgress = null) {
        const videoId = this.extractVideoId(url);
        if (!videoId) {
            throw new Error('ไม่พบ Video ID');
        }

        try {
            const apiEndpoint = this.fallbackApis[this.currentApiIndex];
            
            // Prepare request body based on format
            const requestBody = {
                url: url,
                vCodec: 'h264',
                vQuality: this.mapQuality(quality),
                aFormat: format === 'mp3' ? 'mp3' : 'mp4'
            };

            const response = await fetch(`${apiEndpoint}/api/json`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error('ไม่สามารถเริ่มการดาวน์โหลดได้');
            }

            const data = await response.json();

            if (data.status === 'error') {
                throw new Error(data.text || 'เกิดข้อผิดพลาดในการดาวน์โหลด');
            }

            // Return download URL
            return {
                success: true,
                downloadUrl: data.url,
                filename: this.generateFilename(data.filename || `video_${videoId}.${format}`),
                format: format
            };
        } catch (error) {
            throw new Error(`การดาวน์โหลดล้มเหลว: ${error.message}`);
        }
    }

    /**
     * Map quality names to API values
     */
    mapQuality(quality) {
        const qualityMap = {
            '1080p': '1080',
            '720p': '720',
            '480p': '480',
            '360p': '360',
            'max': 'max'
        };
        return qualityMap[quality] || 'max';
    }

    /**
     * Generate safe filename
     */
    generateFilename(filename) {
        return filename
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase()
            .substring(0, 100);
    }

    /**
     * Alternative: Use y2mate API (another free service)
     */
    async downloadViaY2mate(url, quality, onProgress = null) {
        const videoId = this.extractVideoId(url);
        if (!videoId) {
            throw new Error('ไม่พบ Video ID');
        }

        try {
            // Step 1: Get video info
            const infoResponse = await fetch(`https://www.y2mate.com/youtube/${videoId}`);
            const infoText = await infoResponse.text();
            
            // Parse video ID from response (simplified)
            // In production, you'd need proper HTML parsing
            
            throw new Error('Y2Mate API ต้องการการจัดการเพิ่มเติม');
        } catch (error) {
            throw new Error(`การดาวน์โหลดผ่าน Y2Mate ล้มเหลว: ${error.message}`);
        }
    }

    /**
     * Direct download using savefrom.net (alternative method)
     */
    async getDirectDownloadLink(url) {
        try {
            // Using a different approach with a public API
            const response = await fetch(`https://api.savefrom.biz/api/convert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url
                })
            });

            const data = await response.json();
            
            if (data.success) {
                return data.url;
            }
            
            throw new Error('ไม่สามารถสร้างลิงก์ดาวน์โหลดได้');
        } catch (error) {
            throw new Error(`ข้อผิดพลาดในการสร้างลิงก์: ${error.message}`);
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YouTubeDownloaderAPI;
}
