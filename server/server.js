var express = require("express");
var bodyParser = require("body-parser");

module.exports = function(port) {
    var app = express();

    app.use(express.static("public"));
    app.use(bodyParser.json());

    var latestId = 0;
    var todos = [];

    // Create
    app.put("/api/todo", function(req, res) {
        var todo = req.body;
        todo.id = latestId.toString();
        latestId++;
        todos.push(todo);
        res.sendStatus(200);
    });

    // Read
    app.get("/api/todo", function(req, res) {
        res.json(todos);
    });

    app.get("/api/todo/:id", function(req, res) {
        var id = req.params.id;
        var todo = getTodo(id);
        if (todo) {
            res.json(todo);
        } else {
            res.sendStatus(404);
        }
    });

    // Update
    app.post("/api/todo/:id", function(req, res) {
        var id = req.params.id;
        var todo = getTodo(id);
        var newTodo = req.body;
        newTodo.id = id;
        if (todo) {
            var index = todos.indexOf(todo);
            todos[index] = newTodo;
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

    // Delete
    app.delete("/api/todo/:id", function(req, res) {
        var id = req.params.id;
        var todo = getTodo(id);
        if (todo) {
            todos = todos.filter(function(otherTodo) {
                return otherTodo !== todo;
            });
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

    function getTodo(id) {
        return todos.filter(function(todo) {
            return todo.id === id;
        })[0];
    }

    return app.listen(port);
};
