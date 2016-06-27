var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var completeCounter = document.getElementById("count-label");

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
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title,
        complete: false
    }));
    createRequest.onload = onLoadFactory(createRequest, "Failed to create item. Server returned ",
                           201, callback);
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = onLoadFactory(createRequest, "Failed to get list. Server returned ",
                           200, callback, JSON.parse, "responseText");
    createRequest.send();
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        var count = 0;
        todos.forEach(function(todo) {
            if(!todo.complete) {
                count++;
            }
            var listItem = document.createElement("li");
            listItem.textContent = todo.title;
            listItem.className = todo.complete ? "complete" : "incomplete";

            var deleteButton = buttonFactory("delete", "delete-button", deleteEntry, todo);

            var completeButton = buttonFactory("complete", "complete-button", completeEntry, todo);

            listItem.appendChild(deleteButton);
            listItem.appendChild(completeButton);
            todoList.appendChild(listItem);
        });
        if(count === 0 ){
            completeCounter.textContent = "";
            completeCounter.className = "";
        }
        else {
            completeCounter.textContent = count;
            completeCounter.className = "complete-count";
        }
    });
}

function deleteEntry(todo) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + todo.id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.onload = onLoadFactory(createRequest, "Failed to delete. Server returned ", 200,
                           reloadTodoList);
    createRequest.send();
}

function completeEntry(todo) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo/");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.onload = onLoadFactory(createRequest, "Failed to update. Server returned ", 200,
                           reloadTodoList);
    createRequest.send(JSON.stringify({
        id: todo.id,
        complete: true
    }));
}

function buttonFactory(name, style, listener, todo) {
    var button = document.createElement("button");
    button.textContent = name;
    button.className = style;
    button.addEventListener("click", function() {
        listener(todo);
    });
    return button;
}

function onLoadFactory(req, err, status, callback, func, prop) {
    return function() {
        if (this.status === status) {
            if (func === undefined) {
                callback();
            }
            else {
                callback(func(req[prop]));
            }
        }
        else {
            error.textContent = err + req.status + " - " + req.responseText;
        }
    };
}

reloadTodoList();
