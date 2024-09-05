const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Ruta base para las carpetas de video
const VIDEO_BASE_PATH = '/home/sebastian/FTP/videos';

// Configuración de seguridad y optimización

app.use(compression());

// Configuración de CORS para permitir acceso desde cualquier origen
app.use(cors());

// Ruta para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(VIDEO_BASE_PATH));

// Ruta para obtener la lista de videos en una carpeta específica dentro de VIDEO_BASE_PATH
app.get('/videos/:folder', async (req, res) => {
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
app.get('/folders', async (req, res) => {
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

// Configuración de HTTPS
/*const sslOptions = {
    key: fs.readFileSync('/path/to/your/ssl/private-key.pem'), // Cambia esto a la ruta de tu archivo de clave privada
    cert: fs.readFileSync('/path/to/your/ssl/certificate.pem'), // Cambia esto a la ruta de tu certificado SSL
    ca: fs.readFileSync('/path/to/your/ssl/ca-bundle.pem') // Si tienes un archivo de CA bundle, inclúyelo aquí (opcional)
};

// Iniciar el servidor HTTPS
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`HTTPS Server is running on http://${HOST}:${PORT}`);
}); */

// Si también quieres soportar HTTP
app.listen(PORT, () => {
    console.log(`HTTP Server is running on http://${HOST}:${PORT}`);
});



