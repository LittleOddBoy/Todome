// stores
let tasks = [];

let idb = null;
let isUpdate = false;

window.addEventListener("load", () => {
    // selections
    const todoInp = document.querySelector("#todoInput");
    const todoBtn = document.querySelector("#todoButton");
    const taskListElem = document.querySelector("#taskList");

    // work with indexedDB
    const indexedDBOpenRequest = indexedDB.open("todoListDB", 4);
    indexedDBOpenRequest.addEventListener("success", async (event) => {
        // ! READ THIS TO understand what did I do in next line: https://subinsb.com/global-functions-javascript/
        window.getDataFromIDB = async () => {
            // ? put all of the data from IDB into `tasks` array
            const getDataFromIDB_transaction = await idb.transaction(
                "tasks",
                "readonly"
            );
            let getDataFromIDB_tasksStore =
                getDataFromIDB_transaction.objectStore("tasks");
            let getAllDataRequest = getDataFromIDB_tasksStore.getAll();

            getAllDataRequest.addEventListener("error", (e) => {
                console.error("some error to check on getDataFromIDB() ->", e);
            });

            getAllDataRequest.addEventListener("success", (e) => {
                // tasks = [];
                tasks = [...getAllDataRequest.result];
                // console.log(tasks);
                window.loadAllTasks(tasks, taskListElem);
            });
        };

        function createNewTask(
            data = { id, title: "", isComplete: false },
            array = [],
            location,
            input
        ) {
            /**
             * ? The whole progress of creating a new task and adding that into the DOM.
             * @param data => (Object) all of the information about the task
             *      @param data.id => (Number) task id.
             *      @param data.title => (String) the title of the task, comes from the value of an input.
             *      @param data.isComplete => (Boolean) a flag, shows is the task complete of not. by default it's false.
             * @param array => (Array) directed to that array which includes rest of the tasks.
             * @param location => (DOMElement) where should I include the elements? tell here.
             * @param input => (DOMElement) the todoInp variable.
             * @returns true | false.
             */

            // if `isUpdate` is false, let's do the creating process.
            // console.log(isUpdate);
            if (!isUpdate) {
                if (!data.title) {
                    return false;
                }

                let creatingNewTaskTransaction = idb.transaction(
                    "tasks",
                    "readwrite"
                );
                let creatingNewTask_tasksStore =
                    creatingNewTaskTransaction.objectStore("tasks");
                let addingNewDataToIDB = creatingNewTask_tasksStore.add(data);

                addingNewDataToIDB.addEventListener("error", (err) => {
                    console.error(err);
                });

                addingNewDataToIDB.addEventListener("success", () => {
                    window.loadAllTasks(array, location);
                    resetInput(input);
                    return true;
                });
                // let newTaskData = data;
                // array.push(newTaskData);
                // window.getDataFromIDB();
                // console.log(array)
            } else {
                // if `isUpdate` is true, let's do the updating process.
                console.log("hello, edit");
                let updatingTaskTransaction = idb.transaction(
                    "tasks",
                    "readwrite"
                );
                let tasksStore = updatingTaskTransaction.objectStore("tasks");
                const oldDataOfEditableTask = tasksStore.get(
                    +input.getAttribute("data-task-id")
                );

                oldDataOfEditableTask.addEventListener("error", (err) => {
                    console.log(
                        "when I want to get all of the old data of editableTask, there is an error ->",
                        err
                    );
                });

                oldDataOfEditableTask.addEventListener("success", (e) => {
                    let editableTaskInformation = e.target.result;
                    editableTaskInformation.title = input.value;
                    tasksStore.put(editableTaskInformation);
                    window.getDataFromIDB();
                    window.loadAllTasks(array, location);
                    resetInput(input);
                    isUpdate = false;
                    input.setAttribute("data-task-id", "");
                    document.querySelector(
                        "#todoButton"
                    ).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
                    return true;
                });
            }
        }

        window.loadAllTasks = (array, location) => {
            /**
             * ? loading all of the tasks.
             * @param array => (Array) the array that includes rest of the tasks, inside of that.
             * @param location => (DOMElement) where should I put the result? show me.
             */

            // getDataFromIDB();
            let allTasksElements = "";
            array.forEach((elm) => {
                allTasksElements += `
        <div class="border-2 border-base-100 rounded-2xl p-3 flex justify-between items-center border-base-content/20">
            <div class="truncate flex items-center gap-x-2 group">
                <input type="checkbox" class="checkbox checkbox-sm peer" data-task-id="${
                    elm.id
                }" ${
                    !elm.isComplete ? "" : "checked"
                } onclick="checkOrNot(event)">
                <span class="truncate peer-checked:line-through">
                    ${elm.title}
                </span>
            </div>
            <div class="w-1/2 flex justify-end gap-x-2">
                <button class="__edit btn btn-circle btn-sm" onclick="findEditableTask(event, '#todoInput')" data-task-id="${
                    elm.id
                }">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                        class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                </button>
                <button class="__delete btn bg-base-content text-base-100 btn-circle btn-sm hover:bg-transparent hover:text-base-content" data-task-id="${
                    elm.id
                }" onclick="deleteTask(event)">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                        class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
        </div>
        
        `;
            });

            // console.log(allTasksElements)
            location.innerHTML = allTasksElements;
        };
        console.info(
            "PERFECT! => ",
            "everything is good, IDB opened successfully!"
        );
        idb = event.target.result;
        await window.getDataFromIDB();
        await window.loadAllTasks(tasks, taskListElem);

        // window.getDataFromIDB();
        window.loadAllTasks(tasks, taskListElem);

        // Creating new task by clicking on the button.
        todoBtn.addEventListener("click", () => {
            console.log();
            createNewTask(
                {
                    id: +tasks.length === 0 ? 1 : +tasks[tasks.length - 1].id + 1,
                    title: todoInp.value.trim(),
                    isComplete: false,
                },
                tasks,
                taskListElem,
                todoInp
            );
            window.getDataFromIDB();
            window.loadAllTasks(tasks, taskListElem);
            /**
             * ! A VERY INTERESTING POINT:
             * if you want to set an 'id' for the task, in the first think there is two different ways to do that:
             * first way: tasks.length++
             * second way: tasks.length + 1
             *
             * actually, if you do the first way, you will see the length of `tasks` has upgraded too!
             * but about second way, it won't happen.
             */
        });

        // Creating a new task by pressing `enter`.
        todoInp.addEventListener("keypress", (e) => {
            if (+e.which === 13) {
                createNewTask(
                    {
                        id:
                            +tasks.length === 0
                                ? 1
                                : +tasks[tasks.length - 1].id + 1,
                        title: todoInp.value.trim(),
                        isComplete: false,
                    },
                    tasks,
                    taskListElem,
                    todoInp
                );
                window.getDataFromIDB();
                window.loadAllTasks(tasks, taskListElem);
                /**
                 * ! A VERY INTERESTING POINT:
                 * if you want to set an 'id' for the task, in the first think there is two different ways to do that:
                 * first way: tasks.length++
                 * second way: tasks.length + 1
                 *
                 * actually, if you do the first way, you will see the length of `tasks` has upgraded too!
                 * but about second way, it won't happen.
                 */
            }
        });
    });

    indexedDBOpenRequest.addEventListener("error", (e) => {
        console.error(
            "ERROR! =>",
            "when I want to open the IDB, there is an error, check it:",
            e.target
        );
    });

    indexedDBOpenRequest.addEventListener("upgradeneeded", (e) => {
        console.warn("UPDATE! =>", "it was time to update, body!");
        const idb = e.target.result;
        console.log(idb);

        if (!idb.objectStoreNames.contains("tasks")) {
            idb.createObjectStore("tasks", { keyPath: "id" });
        }
    });
});

function resetInput(input) {
    /**
     * ? reset the value of an input & focus on that.
     * @param input => (DOMElement) the input.
     */

    input.value = "";
    input.focus();
}

let editableTaskID, editableTask, input;
function findEditableTask(e, id, array = tasks) {
    /**
     * ? this function will find the information about the task that you clicked on that and you want to click on it.
     * @param e => event.
     * @param id => the id of `todoInp`, to insert the values into it.
     * @param array => the array includes the rest of the tasks. by default it's `tasks`.
     *
     * ! NOTE: after finding, other parts of process will done in the `createNewTask()` function. check that.
     */

    console.log(isUpdate);
    if (e.target.tagName !== "BUTTON" && e.target.tagName === "path") {
        editableTaskID =
            e.target.parentNode.parentNode.getAttribute("data-task-id");
    } else if (e.target.tagName !== "BUTTON" && e.target.tagName !== "path") {
        editableTaskID = e.target.parentNode.getAttribute("data-task-id");
    } else {
        editableTaskID = e.target.getAttribute("data-task-id");
    }

    if (!input) {
        input = document.querySelector(id);
    }

    editableTask = array.find((task) => +task.id === +editableTaskID);
    isUpdate = true;
    input.value = editableTask.title;
    input.focus();
    document.querySelector(
        "#todoButton"
    ).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`;
    input.setAttribute("data-task-id", editableTaskID);
}

let deletableTaskID, deletableTaskIndex;
function deleteTask(e, array = tasks) {
    /**
     * ? delete the whole task
     * @param e => event.
     * @param array => (Array) the array includes rest of the tasks.
     */

    if (e.target.tagName !== "BUTTON" && e.target.tagName === "path") {
        deletableTaskID =
            e.target.parentNode.parentNode.getAttribute("data-task-id");
    } else if (e.target.tagName !== "BUTTON" && e.target.tagName !== "path") {
        deletableTaskID = e.target.parentNode.getAttribute("data-task-id");
    } else {
        deletableTaskID = e.target.getAttribute("data-task-id");
    }

    let deletingTaskTransaction = idb.transaction("tasks", "readwrite");
    let deletingTaskStor = deletingTaskTransaction.objectStore("tasks");
    let deletingTask = deletingTaskStor.delete(+deletableTaskID);

    deletingTask.addEventListener("error", (err) => {
        console.log(
            "whe I want to delete a task, there is a fucking error: ",
            err
        );
    });

    deletingTask.addEventListener("success", (e) => {
        console.log("deleted");
    });

    window.getDataFromIDB();
    window.loadAllTasks(array, document.querySelector("#taskList"));
    return true;
}

let checkableTaskIndex;
function checkOrNot(e, array = tasks) {
    /**
     * ? for changing `isComplete`, depends on the status of a checkbox
     * @param e => event.
     * @param array => (Array) includes rest of the tasks.
     */
    const updatingDataInIDB_transaction = idb.transaction("tasks", "readwrite");
    let updatingDataInIDB_tasksStore =
        updatingDataInIDB_transaction.objectStore("tasks");
    let oldDataOfTheTask = updatingDataInIDB_tasksStore.get(
        +e.target.getAttribute("data-task-id")
    );

    oldDataOfTheTask.addEventListener("error", (e) => {
        console.error("some error to check on getDataFromIDB() ->", e);
    });

    oldDataOfTheTask.addEventListener("success", () => {
        // tasks = [];
        let newDataOfTheTask = oldDataOfTheTask.result;

        if (e.target.hasAttribute("checked")) {
            e.target.removeAttribute("checked");
            // checkableTaskIndex = tasks.findIndex(
            //     (task) => task.id === +e.target.getAttribute("data-task-id")
            // );
            newDataOfTheTask.isComplete = false;
            console.log(newDataOfTheTask);
            updatingDataInIDB_tasksStore.put(newDataOfTheTask);
            // array[checkableTaskIndex].isComplete = false;
        } else {
            e.target.setAttribute("checked", "");
            // checkableTaskIndex = tasks.findIndex(
            //     (task) => task.id === +e.target.getAttribute("data-task-id")
            // );
            newDataOfTheTask.isComplete = true;
            console.log(newDataOfTheTask);
            updatingDataInIDB_tasksStore.put(newDataOfTheTask);

            // array[checkableTaskIndex].isComplete = true;
        }

        // window.getDataFromIDB();
        console.log(array);
        // window.loadAllTasks(array, document.querySelector("#taskList"));
    });
}

// TODO: handle check it or not with IDB
