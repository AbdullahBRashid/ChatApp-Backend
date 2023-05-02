const express = require('express');
const ws = require('ws');

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const wss = new ws.WebSocketServer({ port: 4000 });

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