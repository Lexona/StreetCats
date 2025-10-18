import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();
const PORT = 3000;

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// gestore degli errori 
app.use((error, request, response, next) => {
  console.log(error.stack);
  response.status(error.status || 500).json({
    code: err.status || 500,
    description: err.message || "C'è stato un errore."
  });
});

app.listen(PORT);