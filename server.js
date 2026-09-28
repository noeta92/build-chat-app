import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;

const server = http.createServer((req,res) => {
    fs.readFile("./public/index.html", (err,data) => {
        if (err) {
            res.writeHead(500, {"Content-Type" : "text/plain"});
            res.end("Internal Server Erro");
            return;
        }
        res.writeHead(200, {"Content-Type" :"text/html"});
        res.end(data);
        });
    });

const wss = new WebSocketServer({server});

wss.on("connection", (socket, req) => {
  const username = new URL(req.url, "http://localhost").searchParams.get(
    "username",
  );

  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(
        JSON.stringify({ type: "system", text: `${username} joined` }),
      );
    }
  }

  socket.on("message", (message) => {
    const { username, text } = JSON.parse(message.toString());
    const payload = JSON.stringify({ type: "chat", username, text });
    
    for (const client of wss.clients) {
        if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  }
  });

  socket.on("close", () => {
    const payload = JSON.stringify({
    type: "system",
    text: `${username} left`,
  });

  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  } 
});
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});


