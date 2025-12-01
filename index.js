const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr) => {
    console.log('ESCANEA ESTE CODIGO QR CON EL WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('¡El Bot de WhatsApp está listo y conectado!');
});

client.on('auth_failure', msg => {
    console.error('Error de autenticación:', msg);
});

app.post('/enviar-mensaje', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ error: 'Faltan datos (phone, message)' });
    }

    try {
        const numberDetails = await client.getNumberId(phone);
        
        if (!numberDetails) {
            return res.status(404).json({ error: 'El número no está registrado en WhatsApp' });
        }

        const chatId = numberDetails._serialized;

        await client.sendMessage(chatId, message);
        console.log(`📨 Mensaje enviado a ${phone}`);
        
        res.json({ success: true, message: 'Mensaje enviado correctamente' });

    } catch (error) {
        console.error('Error enviando mensaje:', error);
        res.status(500).json({ error: 'Error interno al enviar mensaje' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor API escuchando en el puerto ${port}`);
    console.log('⏳ Iniciando cliente de WhatsApp... (esto puede tardar unos segundos)');
    client.initialize();
});

client.on('loading_screen', (percent, message) => {
    console.log('⏳ Cargando WhatsApp Web:', percent, '%', message);
});

client.on('authenticated', () => {
    console.log('✅ Autenticado correctamente');
});
