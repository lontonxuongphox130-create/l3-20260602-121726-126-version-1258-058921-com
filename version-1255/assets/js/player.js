(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var holder = document.querySelector('[data-player]');
        if (!holder) {
            return;
        }
        var video = holder.querySelector('video');
        var button = holder.querySelector('[data-play-button]');
        var hlsInstance = null;
        var attached = false;

        function attachSource() {
            if (!video || attached) {
                return;
            }
            var source = video.getAttribute('data-src');
            if (!source) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
            attached = true;
        }

        function playVideo() {
            attachSource();
            if (!video) {
                return;
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function () {
                playVideo();
            });
        }
        if (video) {
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('playing');
                }
            });
            video.addEventListener('pause', function () {
                if (button) {
                    button.classList.remove('playing');
                }
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
