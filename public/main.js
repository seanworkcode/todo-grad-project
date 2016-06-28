var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countLabel = document.getElementById("count-label");
var section = document.getElementById("todo-list-section");
var FILTER_ALL = 0;
var FILTER_ACTIVE = 1;
var FILTER_COMPLETED = 2;
var filter;

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
    fetch("/api/todo", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            title: title
        })
    }).then(function(response) {
        if (response.status === 201) {
            callback();
        } else {
            throw Error("Failed to create item. Server returned " + response.status + " - " + response.statusText);
        }
    }).catch(function(err) {
        error.textContent = err;
    });
}

var requestsRunning = 0;
function getTodoList(callback) {
    requestsRunning++;
    fetch("/api/todo", {
        method: "GET"
    }).then(function(response) {
        if (response.status === 200) {
            if (requestsRunning < 2) {
                response.json().then(callback);
            }
            requestsRunning--;
        } else {
            throw Error("Failed to get list. Server returned " + response.status + " - " + response.statusText);
        }
    }).catch(function(err) {
        error.textContent = err;
    });
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
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        var filteredTodos;
        var bufferTodoList = document.createElement("ul");
        bufferTodoList.id = "todo-list";
        todoListPlaceholder.style.display = "none";
        updateIncompletes(todos, countLabel);
        switch (filter) {
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
            bufferTodoList.appendChild(listItem);
        });
        section.replaceChild(bufferTodoList, todoList);
        todoList = bufferTodoList;
    });
}

function deleteTodo(todo) {
    fetch("/api/todo/" + todo.id, {
        method: "DELETE",
        headers: {
            "Content-type": "application/json"
        }
    }).then(function(response) {
        if (response.status === 200) {
            reloadTodoList();
        } else {
            throw Error("Failed to delete. Server returned " + response.status + " - " + response.statusText);
        }
    }).catch(function(err) {
        error.textContent = err;
    });
}

function deleteCompletedTodos() {
    getTodoList(function(todos) {
        var completedTodoList = todos.filter(function(todo) {
            return todo.isComplete;
        });
        completedTodoList.forEach(function(todo) {
            fetch("/api/todo/" + todo.id, {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json"
                }
            }).then(function(response) {
                if (response.status === 200) {
                    reloadTodoList();
                } else {
                    throw Error("Failed to delete. Server returned " + response.status + " - " + response.statusText);
                }
            }).catch(function(err) {
                error.textContent = err;
            });
        });
    });
}

function completeTodo(todo) {
    fetch("/api/todo/" + todo.id, {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            isComplete: !todo.isComplete
        })
    }).then(function(response) {
        if (response.status === 200) {
            reloadTodoList();
        } else {
            throw Error("Failed to complete. Server returned " + response.status + " - " + response.statusText);
        }
    }).catch(function(err) {
        error.textContent = err;
    });
}

function setFilter(filterType) {
    filter = filterType;
    reloadTodoList();
}
