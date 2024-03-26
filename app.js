const app = require("express")();
const expressWs = require("express-ws")(app);
const wss = expressWs.getWss('/ws');
require('dotenv').config();

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.ws('/ws', (ws, req) => {

    ws.on('connection', () => {
        console.log('Client connected');
    });
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

app.listen(process.env.PORT, () => {
    console.log(`Server started on http://localhost:${process.env.PORT}`);
});