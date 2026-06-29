const express = require('express');
const ytdl = require('@distube/ytdl-core');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Helper function to extract video ID
function extractVideoId(url) {
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

// API: Get video info
app.get('/api/video-info', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const info = await ytdl.getInfo(url);
        
        res.json({
            videoId: info.videoDetails.videoId,
            title: info.videoDetails.title,
            author: info.videoDetails.author.name,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
            lengthSeconds: info.videoDetails.lengthSeconds,
            viewCount: info.videoDetails.viewCount,
            formats: info.formats.map(format => ({
                itag: format.itag,
                quality: format.qualityLabel || 'audio',
                container: format.container,
                hasVideo: format.hasVideo,
                hasAudio: format.hasAudio,
                contentLength: format.contentLength
            }))
        });
    } catch (error) {
        console.error('Error getting video info:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Get available formats
app.get('/api/formats', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const info = await ytdl.getInfo(url);
        
        // Filter and organize formats
        const videoFormats = info.formats
            .filter(format => format.hasVideo && format.hasAudio)
            .sort((a, b) => {
                const qualityA = parseInt(a.qualityLabel) || 0;
                const qualityB = parseInt(b.qualityLabel) || 0;
                return qualityB - qualityA;
            })
            .map(format => ({
                itag: format.itag,
                quality: format.qualityLabel || 'unknown',
                container: format.container,
                url: `/api/download?url=${encodeURIComponent(url)}&itag=${format.itag}`
            }));

        const audioFormats = info.formats
            .filter(format => format.hasAudio && !format.hasVideo)
            .map(format => ({
                itag: format.itag,
                quality: 'audio',
                container: format.container,
                url: `/api/download?url=${encodeURIComponent(url)}&itag=${format.itag}`
            }));

        res.json({
            video: videoFormats.slice(0, 5), // Top 5 video qualities
            audio: audioFormats.slice(0, 2)  // Top 2 audio formats
        });
    } catch (error) {
        console.error('Error getting formats:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Download video
app.get('/api/download', async (req, res) => {
    try {
        const { url, itag } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const info = await ytdl.getInfo(url);
        const format = info.formats.find(f => f.itag === parseInt(itag));

        if (!format) {
            return res.status(400).json({ error: 'Format not found' });
        }

        // Set headers for download
        res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.${format.container}"`);
        res.header('Content-Type', format.mimeType);

        // Stream the video
        ytdl(url, { format: format }).pipe(res);

    } catch (error) {
        console.error('Error downloading:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
});

// API: Stream video (for preview)
app.get('/api/stream', async (req, res) => {
    try {
        const { url, itag } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const info = await ytdl.getInfo(url);
        
        // Use a lower quality for streaming
        let format = info.formats.find(f => f.itag === parseInt(itag));
        if (!format) {
            // Default to 720p or highest available
            format = info.formats.find(f => f.qualityLabel === '720p') || 
                    info.formats.find(f => f.hasVideo && f.hasAudio);
        }

        if (!format) {
            return res.status(400).json({ error: 'No suitable format found' });
        }

        // Set headers for streaming
        res.header('Content-Type', format.mimeType);
        res.header('Accept-Ranges', 'bytes');

        // Stream the video
        ytdl(url, { format: format }).pipe(res);

    } catch (error) {
        console.error('Error streaming:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'YouTube Downloader API is running' });
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 YouTube Downloader API running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
});
