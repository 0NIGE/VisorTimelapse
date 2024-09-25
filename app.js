const express = require('express');
const fs = require('fs');
const path = require('path');
const compression = require('compression');
const cors = require('cors');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Ruta base para las carpetas de video
const VIDEO_BASE_PATH = '/Ruta de videos';

// Configuración de seguridad y optimización
app.use(compression());
app.use(cors());

// Configuración para servir archivos estáticos desde "/public", pero bajo el prefijo "/visor"
app.use('/visor', express.static(path.join(__dirname, 'public')));

// Rutas para servir videos
app.use('/visor/videos', express.static(VIDEO_BASE_PATH));

// Ruta para obtener la lista de videos en una carpeta específica dentro de VIDEO_BASE_PATH
app.get('/visor/videos/:folder', async (req, res) => {
    try {
        const folderName = req.params.folder;
        const folderPath = path.join(VIDEO_BASE_PATH, folderName);

        if (!fs.existsSync(folderPath)) {
            console.error('Directory does not exist:', folderPath);
            return res.status(404).send('Directory does not exist');
        }

        const files = await fs.promises.readdir(folderPath);
        const videos = files.filter(file => file.endsWith('.mp4') || file.endsWith('.avi'));
        res.json(videos);
    } catch (err) {
        console.error('Error reading directory:', err);
        res.status(500).send('Error reading directory');
    }
});

// Ruta para obtener la lista de carpetas en VIDEO_BASE_PATH
app.get('/visor/folders', async (req, res) => {
    try {
        const folders = await fs.promises.readdir(VIDEO_BASE_PATH);
        const directories = folders.filter(folder => {
            const folderPath = path.join(VIDEO_BASE_PATH, folder);
            return fs.statSync(folderPath).isDirectory();
        });
        res.json(directories);
    } catch (err) {
        console.error('Error reading directory:', err);
        res.status(500).send('Error reading directory');
    }
});

// Manejo de errores centralizado
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Iniciar el servidor HTTP
app.listen(PORT, () => {
    console.log(`HTTP Server is running on http://${HOST}:${PORT}/visor`);
});
