var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

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
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
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
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            listItem.textContent = todo.title;
            listItem.className = todo.complete ? "complete" : "incomplete";

            var deleteButton = buttonFactory("delete", "deleteButton", deleteEntry, todo);

            var completeButton = buttonFactory("complete", "completeButton", completeEntry, todo);

            listItem.appendChild(deleteButton);
            listItem.appendChild(completeButton);
            todoList.appendChild(listItem);
        });
    });
}

function deleteEntry(todo) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + todo.id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.onload = function() {
        loader("Failed to delete. Server returned " + this.status + " - " + this.responseText, this.status);
    };
    createRequest.send();
}

function completeEntry(todo) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo/");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.onload = function() {
        loader("Failed to update. Server returned " + this.status + " - " + this.responseText, this.status);
    };
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

function loader(err, status) {
    if (status !== 200) {
        error.textContent = err;
        return;
    }
    reloadTodoList();
}

reloadTodoList();
