import https from "https";
import http from "http";

import express from "express"
import expressWs from "express-ws";

import fs from "fs";

import cors from "cors";

import { config } from "dotenv";
config();

const app = express();

app.use(
   express.urlencoded({
       limit: "50mb",
       extended: true,
       parameterLimit: 50000,
   })
);

app.use(cors({
    origin: ["https://panda-chat.netlify.app", "localhost:8080"],
    credentials: true
}))

let http_server = http.createServer(app);

// Initialize WS
const wss = expressWs(app, http_server).getWss("/ws");

// Test Path
app.get('/', (req, res) => {
    res.send('Hello World');
})

app.ws('/ws', (ws, req) => {
    console.log('Client connected!');
    ws.on('message', (message, isBinary) => {
        if (isBinary) {
            console.log(`Received Binary Message of ${message.length} bytes`);
        } else {
            console.log(`Received Message => ${message}`);
        }
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
                if (isBinary) {
                    client.send(message, { binary: true });
                    return;
                }
                client.send(`${message}`);
            }
        });
    });
})

;(async () => {
   
    http_server.listen(process.env.HTTP_PORT, () => {
        console.log(`Http Server is running on port ${process.env.HTTP_PORT}`);
    });

    if (process.env.HTTPS_PORT) {
        if (!fs.existsSync('./keys/key.pem') || !fs.existsSync('./keys/cert.pem')) {
            console.log("Https Keys are not present. Https Server will not run.");
        } else {
            var options = {
                key: fs.readFileSync('./keys/key.pem'),
                cert: fs.readFileSync('./keys/cert.pem')
            };
            try {
                https.createServer(options, app).listen(process.env.HTTPS_PORT, () => {
                    console.log(`Https Server is running on port ${process.env.HTTPS_PORT}`);
                });
            } catch (err) {
                console.log("Https Server will not run.");
                console.log((err instanceof Error) ? err.stack : "Error: " + err);
            }
        }
    }
})();
