// Retrieve the list of tasks from localStorage and parse it as an array
let taskList = JSON.parse(localStorage.getItem("tasks"));
// Initialize the addTask button element
const addTask = document.querySelector("#addTask");
// Array to hold task entries
let entries = [];

// Function to generate a unique ID for each task
function generateTaskId() {
  const id = crypto.randomUUID();
  return id;
}

// Function to create a task card element for a given task
function createTaskCard(task) {
  console.log(task); // Log task details for debugging
  // Create HTML elements for the task card
  const taskCard = document.createElement("div");
  const taskTitle = document.createElement("h5");
  const cardBody = document.createElement("div");
  const taskDescription = document.createElement("p");
  const taskDueDate = document.createElement("p");
  const deleteButton = document.createElement("a");

  // Set attributes and classes for the task card elements
  taskCard.setAttribute("data-project-id", task.id);
  taskCard.setAttribute("id", task.id);
  taskCard.className = "card w-100 m-2";
  taskTitle.className = "card-header";
  cardBody.className = "card-body";
  taskDescription.className = "card-title";
  taskDueDate.className = "card-text";
  deleteButton.className = "btn btn-danger";

  // Set text content for the task card elements
  taskTitle.textContent = task.taskTitle;
  taskDescription.textContent = task.taskDescription;
  taskDueDate.textContent = task.taskDueDate;
  deleteButton.textContent = "Delete";

  // Append elements to form the task card structure
  taskCard.appendChild(taskTitle);
  taskCard.appendChild(cardBody);
  cardBody.appendChild(taskDescription);
  cardBody.appendChild(taskDueDate);
  cardBody.appendChild(deleteButton);

  // Select the lists where task cards will be added
  const todoList = $('#todo-cards');
  const inProgressList = $('#in-progress-cards');
  const doneList = $('#done-cards');

  // Initialize draggable functionality for task cards
  $(function () {
    $(".card").draggable({
      opacity: 0.7,
      zIndex: 100,
      helper: function (e) {
        // Clone the card being dragged
        const original = $(e.target).hasClass("ui-draggable")
          ? $(e.target)
          : $(e.target).closest(".ui-draggable");
        return original.clone().css({
          width: original.outerWidth(),
        });
      },
    });
  });

  // Add event listener for the delete button
  deleteButton.addEventListener(
    "click",
    function () {
      handleDeleteTask(task.id);
    },
    false
  );

  // Check if the task has a due date and is not marked as "done"
  if (task.taskDueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.taskDueDate, "MM/DD/YYYY");

    // Set background color based on task due date
    if (now.isSame(taskDueDate, "day")) {
      taskCard.className = "card w-100 m-2 bg-warning text-white";
    } else if (now.isAfter(taskDueDate)) {
      taskCard.className = "card w-100 m-2 bg-danger text-white";
      deleteButton.className = "btn btn-danger border-light";
    }
  }

  // Append the task card to the appropriate list based on status
  if (task.status === 'to-do') {
    todoList.append(taskCard);
  } else if (task.status === 'in-progress') {
    inProgressList.append(taskCard);
  } else if (task.status === 'done') {
    doneList.append(taskCard);
  }
}

// Function to render all tasks as cards and initialize drag-and-drop functionality
function renderTaskList() {
  // Select and clear all task lists
  const todoList = $('#todo-cards');
  todoList.empty();
  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();
  const doneList = $('#done-cards');
  doneList.empty();
  
  // Render each task as a card
  if (entries.length > 0)
    for (let index = 0; index < entries.length; index++) {
      const task = entries[index];
      createTaskCard(task);
    }
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const task = {
    taskTitle: exampleFormControlInput1.value.trim(),
    taskDueDate: datepicker.value,
    taskDescription: exampleFormControlTextarea1.value.trim(),
    id: generateTaskId(),
    status: "to-do",
  };

  // Add the new task to entries and save to localStorage
  entries.push(task);
  localStorage.setItem("tasks", JSON.stringify(entries));

  // Re-render the task list
  renderTaskList();
}

// Function to handle deleting a task by ID
function handleDeleteTask(id) {
  const element = document.getElementById(id);
  element.remove();

  // Remove the task from the entries array
  for (let index = 0; index < entries.length; index++) {
    const task = entries[index];
    if (task.id == id) {
      entries.splice(index, 1);
    }
  }
  // Update localStorage
  localStorage.setItem("tasks", JSON.stringify(entries));
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable[0].dataset.projectId;
  const newStatus = event.target.id;

  // Update the task status in the entries array
  for (let entry of entries) {
    if (entry.id === taskId) {
      entry.status = newStatus;
    }
  }

  // Update localStorage and re-render the task list
  localStorage.setItem("tasks", JSON.stringify(entries));
  renderTaskList();
}

// Initialize the page with necessary event listeners and components
$(document).ready(function () {
  // Make lanes droppable and handle task drop
  $(".lane").droppable({
    accept: ".card",
    drop: handleDrop,
  });

  // Initialize date picker for the due date field
  $(function () {
    $("#datepicker").datepicker();
  });

  // Load and render tasks from localStorage if available
  if (taskList !== null) {
    entries = entries.concat(taskList);
    renderTaskList();
  }
});

// Add event listener for adding a task
addTask.addEventListener("click", handleAddTask);