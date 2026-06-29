/**
 * Main Application Logic
 * Uses self-hosted API for YouTube downloading
 */

class SelfHostedYouTubeDownloader {
    constructor() {
        this.apiBaseUrl = 'https://apiyoutube-tgai.onrender.com/api';
        this.currentVideoInfo = null;
        this.currentFormats = null;
        this.init();
    }

    init() {
        // DOM Elements
        this.urlInput = document.getElementById('youtubeUrl');
        this.fetchBtn = document.getElementById('fetchBtn');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
        this.videoInfo = document.getElementById('videoInfo');
        this.thumbnail = document.getElementById('thumbnail');
        this.videoTitle = document.getElementById('videoTitle');
        this.videoMeta = document.getElementById('videoMeta');
        this.videoOptions = document.getElementById('videoOptions');
        this.audioOptions = document.getElementById('audioOptions');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');
        this.successMessage = document.getElementById('successMessage');

        // Event Listeners
        this.fetchBtn.addEventListener('click', () => this.fetchVideoInfo());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.fetchVideoInfo();
        });

        // Load saved URL from localStorage
        const savedUrl = localStorage.getItem('lastYoutubeUrl');
        if (savedUrl) {
            this.urlInput.value = savedUrl;
        }

        // Check if server is running
        this.checkServerHealth();
    }

    async checkServerHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            if (response.ok) {
                console.log('✅ Server is running');
            } else {
                this.showError('Server ไม่ทำงาน กรุณาเริ่ม server ด้วย npm start');
            }
        } catch (error) {
            console.error('Server not running:', error);
            this.showError('Server ไม่ทำงาน กรุณาเริ่ม server ด้วย npm start');
        }
    }

    showLoading(show = true) {
        this.loading.classList.toggle('active', show);
        this.fetchBtn.disabled = show;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('active');
        setTimeout(() => {
            this.errorMessage.classList.remove('active');
        }, 5000);
    }

    showSuccess(message) {
        this.successMessage.textContent = message;
        this.successMessage.classList.add('active');
        setTimeout(() => {
            this.successMessage.classList.remove('active');
        }, 5000);
    }

    hideVideoInfo() {
        this.videoInfo.classList.remove('active');
        this.progressContainer.classList.remove('active');
        this.videoOptions.innerHTML = '';
        this.audioOptions.innerHTML = '';
    }

    async fetchVideoInfo() {
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showError('กรุณาใส่ลิงก์ YouTube');
            return;
        }

        // Validate YouTube URL
        const videoId = this.extractVideoId(url);
        if (!videoId) {
            this.showError('ลิงก์ไม่ถูกต้อง กรุณาใส่ลิงก์ YouTube ที่ถูกต้อง');
            return;
        }

        // Save URL to localStorage
        localStorage.setItem('lastYoutubeUrl', url);

        this.hideVideoInfo();
        this.showLoading(true);
        this.errorMessage.classList.remove('active');

        try {
            // Get video info from our API
            const infoResponse = await fetch(`${this.apiBaseUrl}/video-info?url=${encodeURIComponent(url)}`);
            const infoData = await infoResponse.json();

            if (infoData.error) {
                throw new Error(infoData.error);
            }

            this.currentVideoInfo = infoData;

            // Get available formats from our API
            const formatsResponse = await fetch(`${this.apiBaseUrl}/formats?url=${encodeURIComponent(url)}`);
            const formatsData = await formatsResponse.json();

            if (formatsData.error) {
                throw new Error(formatsData.error);
            }

            this.currentFormats = formatsData;
            
            this.displayVideoInfo(infoData, formatsData);
            this.showLoading(false);
        } catch (error) {
            this.showLoading(false);
            this.showError(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    }

    displayVideoInfo(videoInfo, formats) {
        this.thumbnail.src = videoInfo.thumbnail;
        this.videoTitle.textContent = videoInfo.title;
        
        const minutes = Math.floor(videoInfo.lengthSeconds / 60);
        const seconds = videoInfo.lengthSeconds % 60;
        
        this.videoMeta.innerHTML = `
            <span><i class="fas fa-user"></i> ${videoInfo.author}</span>
            <span><i class="fas fa-clock"></i> ${minutes}:${seconds.toString().padStart(2, '0')}</span>
            <span><i class="fas fa-eye"></i> ${this.formatNumber(videoInfo.viewCount)}</span>
        `;
        
        // Clear previous options
        this.videoOptions.innerHTML = '';
        this.audioOptions.innerHTML = '';

        // Add video quality options
        if (formats.video && formats.video.length > 0) {
            formats.video.forEach(format => {
                const btn = document.createElement('button');
                btn.className = 'quality-btn';
                btn.innerHTML = `<i class="fas fa-download"></i> ${format.quality}`;
                btn.onclick = () => this.downloadVideo(format.itag, format.container);
                this.videoOptions.appendChild(btn);
            });
        }

        // Add audio quality options
        if (formats.audio && formats.audio.length > 0) {
            formats.audio.forEach(format => {
                const btn = document.createElement('button');
                btn.className = 'quality-btn';
                btn.innerHTML = `<i class="fas fa-headphones"></i> ${format.container.toUpperCase()}`;
                btn.onclick = () => this.downloadVideo(format.itag, format.container);
                this.audioOptions.appendChild(btn);
            });
        }

        this.videoInfo.classList.add('active');
    }

    async downloadVideo(itag, container) {
        if (!this.currentVideoInfo) {
            this.showError('Video information not found. Please fetch video info again.');
            return;
        }

        // Disable all quality buttons
        const videoButtons = this.videoOptions.querySelectorAll('button');
        const audioButtons = this.audioOptions.querySelectorAll('button');
        videoButtons.forEach(btn => btn.disabled = true);
        audioButtons.forEach(btn => btn.disabled = true);

        this.progressContainer.classList.add('active');
        this.progressBar.style.width = '0%';
        this.progressText.textContent = 'Preparing download...';

        try {
            // Build download URL
            const downloadUrl = `${this.apiBaseUrl}/download?url=${encodeURIComponent(this.currentVideoInfo.url)}&itag=${itag}`;
            
            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress > 95) progress = 95;
                this.progressBar.style.width = `${progress}%`;
                this.progressText.textContent = `Downloading... ${Math.round(progress)}%`;
            }, 300);

            // Trigger download
            await this.triggerDownload(downloadUrl, `${this.currentVideoInfo.title}.${container}`);

            clearInterval(progressInterval);
            
            // Complete progress
            this.progressBar.style.width = '100%';
            this.progressText.textContent = 'Download complete!';

            this.showSuccess('Download started successfully!');
            
            setTimeout(() => {
                this.progressContainer.classList.remove('active');
            }, 2000);

        } catch (error) {
            this.progressContainer.classList.remove('active');
            this.showError(`Download failed: ${error.message}`);
        } finally {
            // Re-enable buttons
            videoButtons.forEach(btn => btn.disabled = false);
            audioButtons.forEach(btn => btn.disabled = false);
        }
    }

    async triggerDownload(url, filename) {
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

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

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SelfHostedYouTubeDownloader();
});
