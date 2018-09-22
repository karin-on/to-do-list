document.addEventListener('DOMContentLoaded', function() {

    // ===================================================
    // 1) Stałe
    // ===================================================

    const form = document.querySelector('#form');
    const formSection = document.querySelector('.form');
    const formHeader = document.querySelector('.header');

    const addNewTaskBtn = document.querySelector('#add-new-task-btn');
    const filterDoneBtn = document.querySelector('#filter-done-btn');
    const filterUndoneBtn = document.querySelector('#filter-undone-btn');
    const removeAllBtn = document.querySelector('#remove-all-btn');
    const removeFinishedBtn = document.querySelector('#remove-finished-btn');
    const filtersResetBtn = document.querySelector('#filters-reset-btn');

    const liToClone = document.querySelector('#li-to-clone');
    const taskList = document.querySelector('#task-list');
    const priorities = document.querySelector('#filter-priority');
    const filterPriorityForm = document.querySelector('#filter_priority');


    // ===================================================
    // 2) Definicje funkcji
    // ===================================================

    
    // ----- odczyt listy z local storage (zamiana z JSONa na zwykłą tablicę) -----

    function parseJsonFromLS() {
        //musi być pobrana wewnątrz funkcji
        let taskArrayJSON = localStorage.getItem("todolist");

        let htmlArray = [];             //TODO: znalezc jakas lepsza nazwe
        if (taskArrayJSON) {
            htmlArray = JSON.parse(taskArrayJSON);
        }
        return htmlArray;
    }

    // ----- pobranie listy z LS do htmla i odświeżenie buttonów -----
    // odpalana na starcie oraz przy dodawaniu/usuwaniu tasków

    function getFromLS() {
        //musi być pobierana wewnątrz poszczególnych funkcji, inaczej się nie aktualizuje
        let taskArray = parseJsonFromLS();

        addArrayToHtml(taskArray);
        findAllBtns();
    }


    // ----- odświeżenie eventów na wszystkich buttonach -----
    function findAllBtns() {
        findShowDescrBtns();
        findCompleteTaskBtns();
        findDeleteBtns();
    }

    // ----- przekazanie tablicy obiektów do stworzenia listy w html -----
    function addArrayToHtml(arr) {
        //wyczyszczenie htmla przed wczytaniem na nowo tasków
        taskList.innerHTML = "";

        for (let i = 0; i < arr.length; i++) {
            addObjectToHtml(arr[i]);
        }
    }

    // ---- dodawanie nowego taska z obiektu do html

    function addObjectToHtml(taskObject) {

        let liCloned = liToClone.cloneNode(true);

        liCloned.classList.remove('hidden-always');
        liCloned.removeAttribute('id');

        if (taskObject.taskDone) {
            liCloned.classList.add('done');
        }

        liCloned.querySelector('.task-name').innerText = taskObject.taskName;
        liCloned.querySelector('.task-date').innerText = taskObject.taskDate;
        liCloned.querySelector('.task-priority').innerText = taskObject.taskPriority;
        liCloned.querySelector('.task-description').innerText = taskObject.taskAbout;
        liCloned.querySelector('.task-id').innerText = taskObject.taskId;

        taskList.appendChild(liCloned);
    }


    // ------- walidacja -------


    function generateID() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    function formValidateAndSubmit(event) {
        event.preventDefault();

        let taskInput = document.querySelector('#task-input');
        let dateInput = document.querySelector('#date-input');  //+required w html
        let priorities = document.getElementsByName("form-priority");
        let textAreaInput = document.querySelector('#textarea-input');

        let error = document.querySelector('#error-message');
        error.innerText = '';
        let formValid = true;

        let taskPriority;
        for (let i = 0; i < 5; i++) {
            if (priorities[i].checked) {
                taskPriority = priorities[i].value;
            }
        }

        let getTaskId = generateID();


        //temat zadania

        if (taskInput.value.length <= 0) {
            formValid = false;
            error.innerText += "- enter a task's title \n";
        }
        if (taskInput.value.length > 25) {
            formValid = false;
            error.innerText += "- a title can't be longer than 25 characters \n";
        }


        //priorytet

        let checkboxCheckedNumber = 0;

        for (let i = 0; i < priorities.length; i++) {
            if (priorities[i].checked) {
                checkboxCheckedNumber += 1;
            }
        }
        if (!checkboxCheckedNumber) {
            error.innerText += '- choose priority \n';
            formValid = false;
        }


        //text area

        if (textAreaInput.value.length > 100) {
            formValid = false;
            error.innerText += "- a task's description can't be longer than 100 characters \n";
        }


        //JESLI WALIDACJA JEST OK:

        if(formValid) {
            createNewTaskObject(getTaskId, taskInput.value, dateInput.value, textAreaInput.value, taskPriority);
            closeForm();
            form.reset();
        }
    }

    form.addEventListener('submit', formValidateAndSubmit);


    // ----- schowanie formularza po walidacji -----
    function closeForm() {
        accordionClose(formSection);
        accordionHeader(formHeader);
        changeBtnTxt(addNewTaskBtn);
        changeBtnClass(addNewTaskBtn);
    }


    //=========================================================
    // ----- aktualizacja tablicy w local storage -----
    function addArrayToLS(arr) {
        let arrayJSON = JSON.stringify(arr);
        localStorage.setItem("todolist", arrayJSON);

        //odpala odświeżenie listy i eventów na buttonach w html
        getFromLS();
    }


    //=========================================================
    // ------- tworzenie nowego obiektu (taska) -----------
    function createNewTaskObject(addId, addTask, addDate, addDescription, addPriority) {

        let newTaskObject = {
            taskId: addId,
            taskName: addTask,
            taskDate: addDate,
            taskPriority: addPriority,
            taskAbout: addDescription,
            taskDone: false
        };

        let taskArray = parseJsonFromLS();

        // nowa tablica do przekazania do local storage
        let newArrToLS = [];
        newArrToLS = newArrToLS.concat(taskArray);
        newArrToLS.push(newTaskObject);

        addArrayToLS(newArrToLS);
    }


    //=========================================================
    // ------- BUTTONY - usuwanie pojedynczych tasków --------

    function deleteTask() {
        let taskId = this.parentElement.parentElement.parentElement.querySelector('.task-id');

        // usuwanie obiektu z tablicy głównej w LS
        deleteTaskFromArray(taskId);
    }

    function findDeleteBtns() {

        let deleteTaskBtns = document.querySelectorAll('.task-delete');
        for (let i = 0; i < deleteTaskBtns.length; i++) {
            deleteTaskBtns[i].addEventListener('click', deleteTask)
        }
    }


    // ----- usuwanie obiektu (taska) z tablicy ----
    function deleteTaskFromArray(id) {

        let taskArray = parseJsonFromLS();

        //kopia tablicy pobranej z LS
        let newArrToLS = taskArray.slice();

        for (let j = 0; j < newArrToLS.length; j++) {
            if (newArrToLS[j].taskId === id.innerText) {
                newArrToLS.splice(j, 1);

                //przekazanie uaktualnionej tablicy do LS
                //automatycznie odświeży listę w html i eventy na buttonach
                addArrayToLS(newArrToLS);
            }
        }
    }


    //=========================================================
    //--------- BUTTONY - oznaczanie wykonanych ------------


    function findCompleteTaskBtns() {
        let completeTaskBtns = document.querySelectorAll('.task-complete');

        for (let j = 0; j < completeTaskBtns.length; j++) {
            completeTaskBtns[j].addEventListener('click', markAsCompleted);
        }
    }

    function markAsCompleted() {

        let taskId = this.parentElement.parentElement.parentElement.querySelector('.task-id');
        let taskArray = parseJsonFromLS();

        //kopia tablicy pobranej z LS
        let newArrToLS = taskArray.slice();

        for (let i = 0; i < newArrToLS.length; i++) {
            if (newArrToLS[i].taskId === taskId.innerText) {
                newArrToLS[i].taskDone = !newArrToLS[i].taskDone;
            }
        }

        // ----- uaktualniona tablica wędruje do LS ----
        //automatycznie odświeża listę w html i zmienia klasę wykonanym elementom
        addArrayToLS(newArrToLS);
    }


    //=========================================================
    //-------- BUTTONY - accordion - szczegóły zadań --------

    function findShowDescrBtns () {
        let showDescrBtns = document.querySelectorAll('.task-show');

        for (let i = 0; i < showDescrBtns.length; i++) {
            showDescrBtns[i].addEventListener('click', showDescrPanel);
        }
    }


    function showDescrPanel() {
        let taskDescrPanel = this.parentElement.parentElement.parentElement.querySelector('.task-descr-panel');

        taskDescrPanel.classList.toggle('accordion-list-active');

        if (taskDescrPanel.style.maxHeight) {
            taskDescrPanel.style.maxHeight = null;
        } else {
            taskDescrPanel.style.maxHeight = taskDescrPanel.scrollHeight + "px";
        }
    }


    //=========================================================
    //-------------- FILTRY - priorytety --------------

    function filterPriority() {
        let taskArray = parseJsonFromLS();
        let priorityOption = this.value;
        let filteredArray = [];

        let allTasks = taskList.querySelectorAll('li');

        if (priorityOption !== "all") {
            taskArray.forEach(el => {
                if (el.taskPriority === priorityOption) {
                    filteredArray.push(el);
                }
            })
        } else {
            filteredArray = taskArray;
        }

        addArrayToHtml(filteredArray);
        findAllBtns();
    }

    priorities.addEventListener('change', filterPriority);


    //-------------- FILTRY - pokaż wykonane --------------

    function filterDone() {
        let taskArray = parseJsonFromLS();

        let filteredArray = [];
        taskArray.forEach(el => {
            if (el.taskDone) {
                filteredArray.push(el);
            }
        });
        addArrayToHtml(filteredArray);
        findAllBtns();
        filterPriorityForm.reset();
    }

    filterDoneBtn.addEventListener('click', filterDone);


    //-------------- FILTRY - pokaż niewykonane --------------

    function filterUndone() {
        let taskArray = parseJsonFromLS();
        let filteredArray = [];

        taskArray.forEach(el => {
            if (!el.taskDone) {
                filteredArray.push(el);
            }
        });
        addArrayToHtml(filteredArray);
        findAllBtns();
        filterPriorityForm.reset();
    }

    filterUndoneBtn.addEventListener('click', filterUndone);


    //-------------- FILTRY - pokaż wszystkie --------------

    function filtersReset() {
        let taskArray = parseJsonFromLS();

        addArrayToHtml(taskArray);
        findAllBtns();
        filterPriorityForm.reset();
    }

    filtersResetBtn.addEventListener('click', filtersReset);



    //===============================================
    // ----- usuwanie wszystkich zadań -----

    function removeAllTasks() {
        //przekazuję pustą tablicę do LS i ona jest wczytywana do html
        let newArrToLS = [];
        addArrayToLS(newArrToLS);
    }

    removeAllBtn.addEventListener('click', removeAllTasks);


    //===============================================
    // ----- usuwanie wykonanych zadań -----

    function removeFinishedTasks() {
        let taskArray = parseJsonFromLS();
        let newArrToLS = [];

        for (let i = 0; i < taskArray.length; i++) {
            if (!taskArray[i].taskDone) {
                newArrToLS.push(taskArray[i])
            }
        }
        addArrayToLS(newArrToLS);
    }

    removeFinishedBtn.addEventListener('click', removeFinishedTasks);


    //===============================================
    // ---- wysuwanie i chowanie formularza po kliknięciu dodaj nowe ----

    function addNewTask() {
        accordion(formSection);
        accordionHeader(formHeader);
        changeBtnTxt(addNewTaskBtn);
        changeBtnClass(addNewTaskBtn);
    }

    addNewTaskBtn.addEventListener('click', addNewTask);


    //stylowanie formularza (akordeon)
    function accordion(thisSection) {
        thisSection.classList.toggle('accordion');

        thisSection.style.maxHeight = thisSection.style.maxHeight ?
            null :
            thisSection.scrollHeight + "px";
    }

    //stylowanie nagłówka (akordeon)
    function accordionHeader(thisHeader) {
        thisHeader.classList.toggle('header-accordion');
    }

    function changeBtnTxt(btnName) {
        btnName.innerText = btnName.innerText === "ADD NEW" ?
            "Hide form" :
            "Add new"
    }

    function changeBtnClass(btnName) {
        btnName.classList.toggle("btn-dark-blue");
        btnName.classList.toggle("btn-light-blue");
    }

    // --- zamykanie akordeona po wysłaniu formularza ---
    // --- wywoływane po walidacji
    function accordionClose(thisSection) {
        thisSection.classList.toggle('accordion');
        thisSection.style.maxHeight = null;
    }


    // ===================================================
    // 3) Wywoływanie funkcji
    // ===================================================

        // ----- start aplikacji -----
        getFromLS();

});
