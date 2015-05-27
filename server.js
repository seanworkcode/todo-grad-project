var server = require("./server/server");

var port = process.env.PORT || 8080;

server(port);
console.log("Server running on port " + port);