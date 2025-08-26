const express = require('express');
const bodyParser = require('body-parser');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
const PORT = 3000;

// Configura body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Inicializa WhatsApp com sessão salva
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneie o QR code no terminal (apenas da primeira vez).');
});

client.on('ready', () => {
    console.log('Bot do WhatsApp conectado!');
});

// Endpoint para enviar mensagem
app.post('/send', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ error: 'Número e mensagem são obrigatórios' });
    }

    const chatId = `${number}@c.us`;

    try {
        await client.sendMessage(chatId, message);
        res.json({ success: true, message: 'Mensagem enviada com sucesso!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Página inicial com formulário
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>WhatsApp Bot</title>
        </head>
        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
            <h2>Enviar Mensagem pelo WhatsApp</h2>
            <form action="/send" method="POST">
                <label>Número (com DDI + DDD):</label><br>
                <input type="text" name="number" placeholder="5511999999999" required><br><br>
                
                <label>Mensagem:</label><br>
                <textarea name="message" rows="4" cols="40" required></textarea><br><br>
                
                <button type="submit">Enviar</button>
            </form>
        </body>
        </html>
    `);
});

client.initialize();

// Inicia servidor web
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
