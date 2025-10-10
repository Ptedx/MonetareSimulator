console.log("Starting test server...");
import express from "express";
console.log("Express imported");
const app = express();
console.log("App created");
app.get("/", (req, res) => res.send("OK"));
const port = 5000;
app.listen(port, () => console.log(`Test server on port ${port}`));
