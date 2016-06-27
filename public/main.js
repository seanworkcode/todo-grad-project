var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countLabel = document.getElementById("count-label");

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
        title: title
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

function makeButton(content, cssClass, onClick) {
    var button = document.createElement("button");
    button.textContent = content.toString();
    button.className = cssClass.toString();
    button.addEventListener("click", onClick);
    return button;
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        countLabel.textContent = todos.filter(function(todo) {
            return todo.isComplete === false;
        }).length.toString();
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            var deleteBtn = makeButton("Delete", "delete-button", deleteTodo.bind(null, todo));
            var completeBtn = makeButton("Complete", "complete-button", completeTodo.bind(null, todo));
            listItem.textContent = todo.title;
            if (todo.isComplete) {
                listItem.className = "completed-item";
            }
            listItem.appendChild(completeBtn);
            listItem.appendChild(deleteBtn);
            todoList.appendChild(listItem);
        });
    });
}

function deleteTodo(todo) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + todo.id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.onload = function() {
        if (this.status === 200) {
            reloadTodoList();
        } else {
            error.textContent = "Failed to delete. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function completeTodo(todo) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo/" + todo.id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.onload = function() {
        if (this.status === 200) {
            reloadTodoList();
        }
    };
    createRequest.send(JSON.stringify({isComplete: !todo.isComplete}));
}

reloadTodoList();
