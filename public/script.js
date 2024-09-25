document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        videoPlayer: document.getElementById('video-player'),
        playPauseButton: document.getElementById('play-pause'),
        prevFrameButton: document.getElementById('prev-frame'),
        nextFrameButton: document.getElementById('next-frame'),
        zoomSlider: document.getElementById('zoom-slider'),
        folderSelect: document.getElementById('folder-select'),
        videoSelect: document.getElementById('video-select'),
        videoWrapper: document.getElementById('video-wrapper'),
        folderName: document.getElementById('folder-name'),
        imageBar: document.getElementById('image-bar'),
        imageBarContainer: document.getElementById('image-bar-container'),
        loopToggleButton: document.getElementById('loop-toggle'),
        progressBar: document.getElementById('progress-bar')
    };

    let isLooping = false;
    let isPanning = false, startX = 0, startY = 0;
    let transform = { x: 0, y: 0 }, zoom = 1;
    let lastUpdateTime = 0;

    // Cambia esto a la URL de tu servidor
    const serverDomain = 'http://localhost:3000';

    const updatePlayPauseIcon = (isPlaying) => {
        elements.playPauseButton.innerHTML = isPlaying 
            ? '<i class="fas fa-pause"></i>'
            : '<i class="fas fa-play"></i>';
    };

    // Actualizar la barra de progreso del video
    const updateProgressBar = () => {
        const currentTime = Math.floor(elements.videoPlayer.currentTime);
        const duration = elements.videoPlayer.duration;
        if (currentTime !== lastUpdateTime) {
            const progress = (currentTime / duration) * 100;
            elements.progressBar.value = progress;
            lastUpdateTime = currentTime;
        }
    };

    // Manejador de eventos para la barra de progreso
    elements.videoPlayer.addEventListener('timeupdate', updateProgressBar);

    // Permitir que el usuario cambie la posición del video mediante la barra de progreso
    elements.progressBar.addEventListener('input', () => {
        const duration = elements.videoPlayer.duration;
        const newTime = (elements.progressBar.value / 100) * duration;
        elements.videoPlayer.currentTime = newTime;
    });

    const validateUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol.startsWith('http');
        } catch (err) {
            console.error('Invalid URL:', url);
            return false;
        }
    };

    const loadLastVideoFromFolder = async (folder) => {
        try {
            const videoUrl = `videos/${folder}`;
            console.log('Attempting to fetch videos from URL:', videoUrl);
            const response = await fetch(videoUrl);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            const videos = await response.json();
            if (videos.length > 0) {
                const lastVideo = videos[videos.length - 1];
                // Usar el dominio del servidor de producción
                const videoSource = `${serverDomain}/visor/videos/${folder}/${lastVideo}`;

                elements.videoSelect.innerHTML = videos.map(video => {
                    const videoName = video.replace('.mp4', '');
                    return `<option value="${video}">${videoName}</option>`;
                }).join('');
                elements.videoSelect.value = lastVideo;
                elements.videoPlayer.src = videoSource;
                console.log('Video source set to:', elements.videoPlayer.src);
                elements.videoPlayer.load();
                updateFolderName(folder);
                updateImageBar(folder);
                // Reiniciar barra de progreso y pausar video
                elements.videoPlayer.pause();
                elements.progressBar.value = 0; // Reiniciar barra de progreso
                updatePlayPauseIcon(false);
                lastUpdateTime = 0; // Reiniciar tiempo de actualización
            } else {
                console.warn('No videos found in the folder:', folder);
            }
        } catch (error) {
            console.error('Failed to fetch videos:', error);
        }
    };

    const updateFolderName = folder => {
        elements.folderName.textContent = `${getDisplayName(folder)} ${folderDescriptions[folder] || ''}`;
    };

    const updateImageBar = folder => {
        switch (true) {
            case folder.startsWith("ch13_enhanced"):
                elements.imageBar.src = "./imgs/barras/barra_ch13.png";
                elements.imageBarContainer.style.display = "block";
                break;

            case folder.startsWith("ch02"):
                elements.imageBar.src = "./imgs/barras/barra_ch02.png";
                elements.imageBarContainer.style.display = "block";
                break;

            case folder.includes("enhanced"):
                elements.imageBar.src = "./imgs/barras/temperatura_de_brillo.png";
                elements.imageBarContainer.style.display = "block";
                break;

            case folder.startsWith("ch"):
                elements.imageBar.src = "./imgs/barras/temperatura_de_brillo_gris.png";
                elements.imageBarContainer.style.display = "block";
                break;

            default:
                elements.imageBarContainer.style.display = "none";
                break;
        }
    };

    const getDisplayName = folder => folder.startsWith("ch") ?
        `Canal ${folder.match(/\d+/)[0]}${folder.includes("enhanced") ? " Mejorado" : ""}` :
        folder;

    // Evento para el cambio de carpeta
    elements.folderSelect.addEventListener('change', () => {
        const folder = elements.folderSelect.value;
        if (folder) {
            console.log('Folder selected:', folder);
            loadLastVideoFromFolder(folder);
        } else {
            console.error('No folder selected.');
        }
    });

    // Evento para el cambio de video
    elements.videoSelect.addEventListener('change', () => {
        const folder = elements.folderSelect.value;
        const video = elements.videoSelect.value;

        if (folder && video) {
            const videoSource = `${serverDomain}/visor/videos/${folder}/${video}`;

            if (validateUrl(videoSource)) {
                elements.videoPlayer.src = videoSource;
                elements.videoPlayer.load();

                // Reiniciar barra de progreso y pausar video
                elements.videoPlayer.pause();
                elements.progressBar.value = 0; // Reiniciar barra de progreso
                updatePlayPauseIcon(false);
                lastUpdateTime = 0; // Reiniciar tiempo de actualización

                console.log('Video source set to:', videoSource);
            } else {
                console.error('Invalid video URL:', videoSource);
            }
        } else {
            console.error('Folder or video not selected.');
        }
    });

    // Control de play/pause
    elements.playPauseButton.addEventListener('click', () => {
        if (elements.videoPlayer.paused) {
            elements.videoPlayer.play().catch(error => {
            });
            updatePlayPauseIcon(true);
            console.log('Video is playing.');
        } else {
            elements.videoPlayer.pause();
            updatePlayPauseIcon(false);
            console.log('Video is paused.');
        }
    });

    // Control de avance y retroceso de un segundo
    elements.nextFrameButton.addEventListener('click', () => {
        elements.videoPlayer.pause();
        elements.videoPlayer.currentTime = Math.min(elements.videoPlayer.duration, elements.videoPlayer.currentTime + 1); // Avanzar un segundo
        updatePlayPauseIcon(false);
        updateProgressBar();
        console.log('Advanced by one second.');
    });

    elements.prevFrameButton.addEventListener('click', () => {
        elements.videoPlayer.pause();
        elements.videoPlayer.currentTime = Math.max(0, elements.videoPlayer.currentTime - 1); // Retroceder un segundo
        updatePlayPauseIcon(false);
        updateProgressBar();
        console.log('Moved back by one second.');
    });

    // Control de bucle
    elements.loopToggleButton.addEventListener('click', () => {
        isLooping = !isLooping;
        elements.videoPlayer.loop = isLooping;
        console.log('Looping is now:', isLooping);

        // Cambia la clase para reflejar el estado activo/inactivo
        if (isLooping) {
            elements.loopToggleButton.classList.add('button-active');
        } else {
            elements.loopToggleButton.classList.remove('button-active');
        }
    });

    // Control de zoom
    elements.zoomSlider.addEventListener('input', () => {
        zoom = elements.zoomSlider.value;
        elements.videoPlayer.style.transform = `scale(${zoom})`;
        elements.videoWrapper.style.cursor = zoom > 1 ? 'grab' : 'default';
        console.log('Zoom level changed:', zoom);

        if (zoom == 1) {
            transform = { x: 0, y: 0 };
            elements.videoPlayer.style.transform = `translate(0px, 0px) scale(1)`;
        }
    });

    // Definición de funciones de pan (mover) antes de usarlas
    const startPan = (event) => {
        if (zoom > 1) {
            isPanning = true;
            startX = (event.touches ? event.touches[0].clientX : event.clientX) - transform.x;
            startY = (event.touches ? event.touches[0].clientY : event.clientY) - transform.y;
            elements.videoWrapper.style.cursor = 'grabbing';
            console.log('Started panning at:', { startX, startY });
            document.addEventListener('mousemove', pan);
            document.addEventListener('mouseup', endPan);
            document.addEventListener('touchmove', pan);
            document.addEventListener('touchend', endPan);
        }
    };

    const endPan = () => {
        isPanning = false;
        elements.videoWrapper.style.cursor = zoom > 1 ? 'grab' : 'default';
        console.log('Ended panning.');
        document.removeEventListener('mousemove', pan);
        document.removeEventListener('mouseup', endPan);
        document.removeEventListener('touchmove', pan);
        document.removeEventListener('touchend', endPan);
    };

    const pan = (event) => {
        if (!isPanning) return;
        transform.x = (event.touches ? event.touches[0].clientX : event.clientX) - startX;
        transform.y = (event.touches ? event.touches[0].clientY : event.clientY) - startY;
        limitPan();
        console.log('Panning. Current transform:', transform);
    };

    const limitPan = () => {
        const videoRect = elements.videoPlayer.getBoundingClientRect();
        const wrapperRect = elements.videoWrapper.getBoundingClientRect();

        const maxX = (videoRect.width - wrapperRect.width) / 2;
        const maxY = (videoRect.height - wrapperRect.height) / 2;

        transform.x = Math.max(Math.min(transform.x, maxX), -maxX);
        transform.y = Math.max(Math.min(transform.y, maxY), -maxY);

        elements.videoPlayer.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${zoom})`;
        console.log('Pan limited. Current transform:', transform);
    };

    // Asignar eventos de pan
    elements.videoWrapper.addEventListener('mousedown', startPan);
    elements.videoWrapper.addEventListener('touchstart', startPan);

    // Inicializar con la primera carpeta
    fetch('/visor/folders')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            console.log('Successfully fetched folders:', response);
            return response.json();
        })
        .then(folders => {
            if (folders.length === 0) {
                console.error('No folders found.');
                return;
            }
            console.log('Folders found:', folders);
            elements.folderSelect.innerHTML = '<option value="">Seleccione un Tipo</option>';
            folders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder;
                option.textContent = simpleDescriptions[folder] || folder;
                elements.folderSelect.appendChild(option);
            });
            const fcFolderOption = elements.folderSelect.querySelector('option[value="fc"]');
            if (fcFolderOption) {
                elements.folderSelect.value = 'fc';
                loadLastVideoFromFolder('fc');
            }
        })
        .catch(error => {
            console.error('Failed to fetch folders:', error);
        });

    const folderDescriptions = {
        "ch02": "[0.64μm] - Visible (Rojo) - Albedo(%)",
        "ch07": "[3.9μm] - Infrarojo de Onda Corta - Temperatura de brillo(C°)",
        "ch07_enhanced": "[3.9μm] - Infrarojo de Onda Corta Mejorado - Temperatura de brillo (C°)",
        "ch08": "[6.2μm] - Vapor de Agua (Nivel Alto) - Temperatura de brillo (C°)",
        "ch08_enhanced": "[6.2μm] - Vapor de Agua (Nivel Alto) Mejorado - Temperatura de brillo (C°)",
        "ch09": "[6.9μm] - Vapor de Agua (Nivel Medio) - Temperatura de brillo (C°)",
        "ch09_enhanced": "[6.9μm] - Vapor de Agua (Nivel Medio) Mejorado - Temperatura de brillo (C°)",
        "ch13": "[10.3μm] - Infrarojo (Banda Limpia) - Temperatura de brillo (C°)",
        "ch13_enhanced": "[10.3μm] - Infrarojo (Banda Limpia) Mejorado - Temperatura de brillo (C)",
        "ch14": "[11.2μm] - Infrarojo (Onda Larga) - Temperatura de brillo (C°)",
        "ch14_enhanced": "[11.2μm] - Infrarojo (Onda Larga) Mejorado - Temperatura de brillo (C°)",
        "ch15": "[12.3μm] - Infrarojo (Banda Sucia) - Temperatura de brillo (C°)",
        "ch15_enhanced": "[12.3μm] - Infrarojo (Banda Sucia) Mejorado - Temperatura de brillo (C°)",
        "fc": "- Color Verdadero"
    };

    const simpleDescriptions = {
        "ch02": "Visible (Rojo)",
        "ch07": "Infrarojo de Onda Corta",
        "ch07_enhanced": "Infrarojo de Onda Corta Mejorado",
        "ch08": "Vapor de Agua (Nivel Alto)",
        "ch08_enhanced": "Vapor de Agua (Nivel Alto) Mejorado",
        "ch09": "Vapor de Agua (Nivel Medio)",
        "ch09_enhanced": "Vapor de Agua (Nivel Medio) Mejorado",
        "ch13": "Infrarojo (Banda Limpia)",
        "ch13_enhanced": "Infrarojo (Banda Limpia) Mejorado",
        "ch14": "Infrarojo (Onda Larga)",
        "ch14_enhanced": "Infrarojo (Onda Larga) Mejorado",
        "ch15": "Infrarojo (Banda Sucia)",
        "ch15_enhanced": "Infrarojo (Banda Sucia) Mejorado",
        "fc": "Color Verdadero"
    };
});
