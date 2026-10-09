import express, { urlencoded } from "express";
import { createClient } from "redis";
import { CookieClicker } from "./repository/CookieClicker.js";

const app = express();
const port = 3000;

const client = createClient();
await client.connect();
//dependency injection
const clicker = new CookieClicker(client);
app.use(express.json());

app.post("/:cookieId", async (req, res) => {
  //fire and forget
  const cookieId = req.params.cookieId;
  clicker.click(cookieId);
  res.status(202).send();
});

app.get("/:cookieId", async (req, res) => {
  const cookieId = req.params.cookieId;
  const data = await clicker.readall(cookieId);
  res.send(data);
});

app.listen(port, () => {
  console.log("The server is running on http://localhost:3000/");
});
