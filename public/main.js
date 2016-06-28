var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countLabel = document.getElementById("count-label");
var FILTER_ALL = 0;
var FILTER_ACTIVE = 1;
var FILTER_COMPLETED = 2;

setFilter(FILTER_ALL);

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

var requestsRunning = 0;
function getTodoList(callback) {
    requestsRunning++;
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            if (requestsRunning < 2) {
                callback(JSON.parse(this.responseText));
            }
            requestsRunning--;
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function makeButton(content, onClick) {
    var button = document.createElement("button");
    button.textContent = content.toString();
    button.className = "button";
    button.addEventListener("click", onClick);
    return button;
}

function updateIncompletes(todos, countLabel) {
    countLabel.textContent = "";
    var incompleteCount = todos.reduce(function(p, c) {
        return (!c.isComplete ? p + 1 : p);
    }, 0);
    countLabel.textContent = incompleteCount.toString() + " incomplete Todos";
    if (incompleteCount !== todos.length) {
        countLabel.appendChild(makeButton("Delete Completed", deleteCompletedTodos));
    }

}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        var filteredTodos;
        todoListPlaceholder.style.display = "none";
        updateIncompletes(todos, countLabel);
        switch (filter) {
            case FILTER_ALL:
                filteredTodos = todos;
                break;
            case FILTER_ACTIVE:
                filteredTodos = todos.filter(function(todo) {
                    return !todo.isComplete;
                });
                break;
            case FILTER_COMPLETED:
                filteredTodos = todos.filter(function(todo) {
                    return todo.isComplete;
                });
                break;
            default:
                filteredTodos = todos;
        }
        filteredTodos.forEach(function(todo) {
            var listItem = document.createElement("li");
            var deleteBtn = makeButton("Delete", deleteTodo.bind(null, todo));
            var completeBtn = makeButton("Complete", completeTodo.bind(null, todo));
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

function deleteCompletedTodos() {
    getTodoList(function(todos) {
        var completedTodoList = todos.filter(function(todo) {
            return todo.isComplete;
        });
        completedTodoList.forEach(function(todo) {
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
        });
    });
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

function setFilter(filterType) {
    filter = filterType;
    reloadTodoList();
}

reloadTodoList();
