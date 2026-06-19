(function () {
    function setMessage(shell, message) {
        var output = shell.querySelector('[data-player-message]');
        if (output) {
            output.textContent = message || '';
        }
    }

    function attachSource(video, source, shell) {
        if (!source) {
            setMessage(shell, '当前条目未配置播放源');
            return Promise.reject(new Error('empty source'));
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    setMessage(shell, '网络波动，正在重新连接播放源');
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    setMessage(shell, '媒体解码异常，正在恢复播放');
                    hls.recoverMediaError();
                } else {
                    setMessage(shell, '播放器初始化失败');
                    hls.destroy();
                }
            });
            return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return Promise.resolve();
        }

        setMessage(shell, '当前浏览器不支持 HLS 播放');
        return Promise.reject(new Error('hls unsupported'));
    }

    function setupPlayer(shell) {
        var video = shell.querySelector('video');
        var start = shell.querySelector('[data-player-start]');
        var source = shell.getAttribute('data-src');
        var loaded = false;

        if (!video || !start) {
            return;
        }

        start.addEventListener('click', function () {
            function playVideo() {
                shell.classList.add('is-started');
                video.play().catch(function () {
                    setMessage(shell, '请再次点击播放器开始播放');
                });
            }

            if (loaded) {
                playVideo();
                return;
            }

            setMessage(shell, '正在加载播放源');
            attachSource(video, source, shell).then(function () {
                loaded = true;
                setMessage(shell, '');
                playVideo();
            }).catch(function () {
                shell.classList.remove('is-started');
            });
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
