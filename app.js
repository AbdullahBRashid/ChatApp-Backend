const express = require('express');
const ws = require('ws');

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

const wss = new ws.WebSocketServer({ port: 4500 });

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
        wss.clients.forEach((client) => {

            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(`${message}`)
            }
        });
    });
});