var todoList = document.getElementById("todo-list");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title
    }));
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            throw new Error("Failed to create TODO item. Server returned " + this.status + " - " + this.responseText);
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            throw new Error("Failed to get TODO list. Server returned " + this.status + " - " + this.responseText);
        }
    };
    createRequest.send();
}

function reloadTodoList() {
    getTodoList(function(todos) {
        while (todoList.firstChild) {
            todoList.removeChild(todoList.firstChild);
        }
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            listItem.innerText = todo.title;
            todoList.appendChild(listItem);
        });
    });
}

reloadTodoList();