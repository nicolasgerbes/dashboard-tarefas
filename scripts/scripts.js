const STORAGE_KEY = "tasks-board"
const NS = "http://www.w3.org/2000/svg"

const addButtons = document.querySelectorAll(".add-card-btn")

function saveTasks() {
  const tasks = []

  document.querySelectorAll(".cards-list").forEach(function (list) {
    const listId = list.id

    list.querySelectorAll(".tasks").forEach(function (task) {
      const title = task.querySelector("h3").textContent.trim()
      const description = task.querySelector(".content-tasks").textContent.trim()

      tasks.push({
        title: title,
        description: description,
        list: listId
      })
    })
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function createTrashIcon(task) {
  const iconTrashSvg = document.createElementNS(NS, "svg")
  const iconTrashPath = document.createElementNS(NS, "path")

  iconTrashSvg.classList.add("size-6", "icon-trash")

  iconTrashSvg.setAttribute("fill", "none")
  iconTrashSvg.setAttribute("viewBox", "0 0 24 24")
  iconTrashSvg.setAttribute("stroke-width", "1.5")
  iconTrashSvg.setAttribute("stroke", "currentColor")

  iconTrashPath.setAttribute("stroke-linecap", "round")
  iconTrashPath.setAttribute("stroke-linejoin", "round")
  iconTrashPath.setAttribute(
    "d",
    "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
  )

  iconTrashSvg.appendChild(iconTrashPath)

  iconTrashSvg.addEventListener("click", function (event) {
    event.stopPropagation()
    task.remove()
    saveTasks()
  })

  return iconTrashSvg
}

function createTask(targetList, title = "", description = "", shouldSave = true) {
  const task = document.createElement("div")
  task.classList.add("tasks")
  task.setAttribute("draggable", "true")

  const taskTitle = document.createElement("h3")
  const contentTask = document.createElement("div")
  const iconTrashSvg = createTrashIcon(task)

  taskTitle.classList.add("editable-text")
  contentTask.classList.add("content-tasks", "editable-text")

  taskTitle.setAttribute("data-placeholder", "Título da tarefa")
  contentTask.setAttribute("data-placeholder", "Descrição da tarefa")

  taskTitle.textContent = title
  contentTask.textContent = description

  taskTitle.addEventListener("click", function () {
    taskTitle.contentEditable = true
    taskTitle.focus()
  })

  contentTask.addEventListener("click", function () {
    contentTask.contentEditable = true
    contentTask.focus()
  })

  taskTitle.addEventListener("blur", function () {
    resetPlaceholderIfEmpty(taskTitle)
    taskTitle.contentEditable = false
    saveTasks()
  })

  contentTask.addEventListener("blur", function () {
    resetPlaceholderIfEmpty(contentTask)
    contentTask.contentEditable = false
    saveTasks()
  })

  task.addEventListener("dragstart", function (event) {
    const dragPreview = task.cloneNode(true)
    const taskRect = task.getBoundingClientRect()

    dragPreview.classList.remove("dragging")
    dragPreview.classList.add("drag-preview")

    dragPreview.style.width = `${taskRect.width}px`
    dragPreview.style.height = `${taskRect.height}px`

    document.body.appendChild(dragPreview)

    const offsetX = event.clientX - taskRect.left
    const offsetY = event.clientY - taskRect.top

    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", "")
    event.dataTransfer.setDragImage(dragPreview, offsetX, offsetY)

    task.classList.add("dragging")

    setTimeout(function () {
      dragPreview.remove()
    }, 0)
  })
  task.addEventListener("dragend", function () {
    task.classList.remove("dragging")
  })

  task.appendChild(taskTitle)
  task.appendChild(contentTask)
  task.appendChild(iconTrashSvg)

  targetList.appendChild(task)

  if (shouldSave) {
    saveTasks()
  }
}

function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

  savedTasks.forEach(function (task) {
    const targetList = document.querySelector(`#${task.list}`)

    if (targetList) {
      createTask(targetList, task.title, task.description, false)
    }
  })
}


function resetPlaceholderIfEmpty(element) {
  if (element.textContent.trim() === "") {
    element.textContent = ""
  }
}


addButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const column = button.closest(".task-column")
    const targetList = column.querySelector(".cards-list")

    createTask(targetList)
  })
})
const taskColumns = document.querySelectorAll(".task-column")

taskColumns.forEach(function (column) {
  column.addEventListener("dragover", function (event) {
    event.preventDefault()
  })

  column.addEventListener("drop", function (event) {
    event.preventDefault()

    const draggingTask = document.querySelector(".dragging")

    if (!draggingTask) return

    const cardsList = column.querySelector(".cards-list")
    const targetTask = event.target.closest(".tasks")

    if (targetTask && targetTask !== draggingTask && cardsList.contains(targetTask)) {
      const targetRect = targetTask.getBoundingClientRect()
      const isAfterMiddle = event.clientY > targetRect.top + targetRect.height / 2

      if (isAfterMiddle) {
        targetTask.after(draggingTask)
      } else {
        targetTask.before(draggingTask)
      }
    } else {
      cardsList.appendChild(draggingTask)
    }

    saveTasks()
  })
})

loadTasks()