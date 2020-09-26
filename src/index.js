require('dotenv').load();
const express = require('express');
const http = require('http');
const torRequestProxy = require('./request-proxy')

var app = express();

app.use(torRequestProxy(process.env.S4_HOST));
app.get("/_healthcheck", (req, res) => res.json({ status: 'healthly', S4_HOST: process.env.S4_HOST }));
http.createServer(app).listen(80, () => console.log(`* Proxying http://localhost:80 -> ${process.env.S4_HOST}`));
module.exports = app;
