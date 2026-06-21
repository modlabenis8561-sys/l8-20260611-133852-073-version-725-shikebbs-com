function initMoviePlayer(videoId, buttonId, sourceUrl) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    let connected = false;

    if (!video) {
        return;
    }

    function connect() {
        if (connected || !sourceUrl) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            connected = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            connected = true;
            return;
        }

        video.src = sourceUrl;
        connected = true;
    }

    function reveal() {
        if (button) {
            button.classList.add("is-hidden");
        }
    }

    function cover() {
        if (button && video.paused) {
            button.classList.remove("is-hidden");
        }
    }

    async function start() {
        connect();
        reveal();
        try {
            await video.play();
        } catch (error) {
            cover();
        }
    }

    if (button) {
        button.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", reveal);
    video.addEventListener("pause", cover);
    video.addEventListener("ended", cover);
    connect();
}
