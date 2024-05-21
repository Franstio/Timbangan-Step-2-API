import express from "express";
import ScalesRoute from "./routes/ScalesRoute.js";
import ScannerRoute from "./routes/ScannerRoute.js";
import db from "./config/db.js";
import cors from  "cors";
import http from 'http';
import { Server } from "socket.io";
//import { getScales4Kg ,getScales50Kg} from "./controllers/Scales.js";
import bodyParser from "body-parser";

const app = express();
const server = http.createServer(app);

const port = 5000;

/* app.use(cors({
  origin: '*', // Allow any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  credentials:false 
}));
const io = new Server(server, {
  cors: {
    origin: "*"
  }
}); */

app.use(cors({
  credentials:false,
  origin: 'http://localhost:3000'
}));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});

app.use(bodyParser.json());

try {
  await db.authenticate();
  console.log('Database terhubung..');
  
} catch (error) {
  console.error(error);
  
}

export { Server, io };

app.use(ScalesRoute);
app.use(ScannerRoute);

/* io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
}); */

server.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
//getScales4Kg(io);
//getScales50Kg(io);