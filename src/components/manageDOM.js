import getTodo from "./getTodo";
import storageManangement from "./localStorage";

const DOMmanagement = (()=>{

    document.querySelector('.newTodo').addEventListener('click',()=>{
        document.querySelector('.formBackground').classList.toggle('show');
        closeForm('.formBackground')
    })

    document.querySelector('#addProject').addEventListener('click',()=>{
        document.querySelector('.projectFormBackground').classList.toggle('show')
        closeForm('.projectFormBackground')
    })

    document.querySelector('.closeForm').addEventListener('click',()=>{
        document.querySelector('#form').reset()
        document.querySelector('.formBackground').classList.remove('show')
    })

    document.querySelector('.closeProjectForm').addEventListener('click',()=>{
        document.querySelector('#projectform').reset()
        document.querySelector('.projectFormBackground').classList.remove('show')
    })
    
    document.querySelector('.menu_button').addEventListener('click',()=>{
        document.querySelector('.menu_button').classList.toggle('open')
        document.querySelector('.sideBar').classList.toggle('open')
    })

    const appendList = (itemList)=>{
        const container =  document.querySelector('.itemContainer');
        let itemDiv = document.createElement('div');
        itemDiv.classList.add('item')
        container.appendChild(itemDiv);

        addCheckbox(itemDiv);

        let nameDiv = document.createElement('div')
        nameDiv.addEventListener('click',editContent.bind(null,'input',nameDiv));
        nameDiv.classList.add('name')
        itemDiv.appendChild(nameDiv)
        nameDiv.textContent = itemList.itemName

        addDatePicker(itemList,itemDiv);

        changeStatusDOM(itemList,itemDiv)

        let noteDiv = document.createElement('div')
        noteDiv.classList.add('note')
        noteDiv.addEventListener('click',editContent.bind(null,'textarea',noteDiv));
        itemDiv.appendChild(noteDiv)
        noteDiv.textContent = itemList.itemNote

        let arrow = document.createElement('arrow')
        arrow.classList.add('arrow')
        arrow.innerHTML = `<i class="fas fa-angle-right"></i>`
        arrow.addEventListener('click',showNote);
        itemDiv.appendChild(arrow)
        addButton(itemDiv);
    }

    function addCheckbox(itemDiv){
        let newCheckbox = document.createElement('input')
        newCheckbox.type = 'checkbox';
        newCheckbox.classList.add('checkbox')
        newCheckbox.addEventListener('click',changeStatus)
        itemDiv.insertBefore(newCheckbox,itemDiv.firstChild);
    }

    function addButton(itemDiv){
        let itemDeleteButton = document.createElement('div');
        itemDeleteButton.addEventListener('click', deleteButton);
        itemDeleteButton.classList.add('itemDelete');
        itemDeleteButton.innerHTML= '<i class="fas fa-trash"></i>'
        itemDiv.appendChild(itemDeleteButton);
    }


    function addDatePicker(itemList,itemDiv){
        let dateInput = document.createElement('div')
        dateInput.classList.add('dateText')
        dateInput.addEventListener('click',editDate.bind(null,itemList,itemDiv))
        dateInput.textContent = itemList.itemDate
        itemDiv.appendChild(dateInput)
    }

    
    function deleteButton(event){
        let currentProject = setCurrentProject(document.querySelector('.projectName').textContent)
       let todo = event.target.parentNode.parentNode
       let todoName = todo.querySelector('.name').textContent;
       for(let i = 0;i<getTodo.projectList[currentProject].projectContent.length;i++)
        if(getTodo.projectList[currentProject].projectContent[i].itemName == todoName){
            
            getTodo.projectList[currentProject].projectContent.splice(i,1);
        }
        todo.remove()
        storageManangement.setStorage();
    } 
       
        


    const closeForm=(background)=>{
        document.querySelector(background).addEventListener('click',function(e){
            if(e.target !== e.currentTarget) return
            document.querySelector('#form').reset()
            document.querySelector(background).classList.remove('show')
        })
    }

    const editContent=(type,name)=>{
        const nameDiv = name;
        const input = document.createElement(type)
        input.value = nameDiv.textContent;
        let temp = nameDiv.textContent;
        nameDiv.textContent = '';
        input.classList.add('input')
        input.addEventListener('focusout',confirmEdit.bind(null,input,nameDiv,temp,type))
        nameDiv.appendChild(input)
        input.focus()
        nameDiv.addEventListener('keyup',(event)=>{
            if(event.keyCode==13){input.blur()}})
    }

    const confirmEdit=(input,nameDiv,temp,type)=>{
        let itemType;
        const projectName =document.querySelector('.projectName').textContent
        for(let i=0;i<getTodo.projectList.length;i++){
            if(projectName === getTodo.projectList[i].projectName){
                for(let j = 0;i<getTodo.projectList[i].projectContent.length;j++){
                    if(type === 'input'){
                        itemType = getTodo.projectList[i].projectContent[j].itemName
                        getTodo.projectList[i].projectContent[j].itemName = input.value;
                    }else if (type === 'textarea'){
                        itemType = getTodo.projectList[i].projectContent[j].itemNote
                        getTodo.projectList[i].projectContent[j].itemNote = input.value;
                    }
                    if(itemType === temp){
                        itemType = input.value;
                        nameDiv.textContent = input.value;
                        storageManangement.setStorage();
                        input.remove()
                        return
                    }
                }
            }
        }
    }

    const editDate = (itemList,itemDiv)=>{
       const dateDiv =  itemDiv.querySelector('.dateText')
       const dateInput = document.createElement('input')
       dateInput.type = 'date'
       dateInput.classList.add('date')
       dateInput.value = dateDiv.textContent
       dateDiv.remove()
       dateInput.addEventListener('focusout', confirmDateEdit.bind(null,itemList,itemDiv,dateInput))
       itemDiv.appendChild(dateInput)
    }

    const confirmDateEdit =(itemList,itemDiv,dateInput)=>{
        itemList.itemDate = dateInput.value
        storageManangement.setStorage();
        addDatePicker(itemList,itemDiv)
        dateInput.remove()
    }

    const showNote = (event)=>{
        let item = event.target.parentNode.parentNode;
        item.querySelector('.note').classList.toggle('show')
        if(item.querySelector('.note').classList.contains('show')){
            item.querySelector('.arrow').innerHTML = `<i class="fas fa-angle-down"></i>`
        }else{
            item.querySelector('arrow').innerHTML = `<i class="fas fa-angle-right"></i>`
        }
    }

    const appendProject = (projectList,source)=>{
        const container = document.querySelector('.projectContainer');
        const project = document.createElement('div');
        project.classList.add('sideBarProject')
        const name = document.createElement('p')
        if(source === 'newProject'){
            name.textContent = projectList[projectList.length-1].projectName 
        }else(
            name.textContent = projectList.projectName
            )
            name.addEventListener('click',changeProject)
        const deleteIcon = document.createElement('div');
        deleteIcon.innerHTML = `<i class="fas fa-times"></i>`
        deleteIcon.addEventListener('click',deleteProject)
        deleteIcon.classList.add('deleteProject')
        project.appendChild(name)
        project.appendChild(deleteIcon)
        container.appendChild(project)
        document.querySelector('.projectName').textContent = name.textContent
    }

    const deleteProject=(event)=>{
        const projectContainer = event.target.parentNode.parentNode
        const projectName = projectContainer.querySelector('p').textContent
        for(let i=0;i<getTodo.projectList.length;i++){
            if(getTodo.projectList[i].projectName === projectName){
                getTodo.projectList.splice(i,1);
                while(document.querySelector('.itemContainer').firstChild){document.querySelector('.itemContainer').firstChild.remove()}
                if(i+1<getTodo.projectList.length){
                        console.log(i+1,getTodo.projectList.length)
                        document.querySelector('.projectName').textContent = getTodo.projectList[i+1].projectName
                        for(let j=0;j<getTodo.projectList[i+1].projectContent[j].length;j++){
                        appendList(getTodo.projectList[i+1].projectContent[j]);
                        break;
                    }
                }else{
                    document.querySelector('.projectName').textContent = getTodo.projectList[i-1].projectName
                    for(let j=0;j<getTodo.projectList[i-1].projectContent.length;j++){
                    appendList(getTodo.projectList[i-1].projectContent[j]);
                }
                break;
            }
        }
        projectContainer.remove()
        storageManangement.setStorage();
        }
    }

    const changeProject = (event)=>{
        let name = event.target.firstChild.textContent;
        document.querySelector('.projectName').textContent = name;

        let currentProject= setCurrentProject(name);
        
        while(document.querySelector('.itemContainer').firstChild){
            document.querySelector('.itemContainer').lastChild.remove()
        }
        
        for(let i = 0;i<getTodo.projectList[currentProject].projectContent.length;i++){
            appendList(getTodo.projectList[currentProject].projectContent[i])
        }
            
    }
    
    const setCurrentProject=(name) =>{
        for(let i = 0; i<getTodo.projectList.length;i++){
            if(getTodo.projectList[i].projectName === name){
                 return  i;
            }
        }
    }

    const changeStatus=(event)=>{
        if(event.target !== event.currentTarget) return
        let item = event.target.parentNode
        let itemName = item.querySelector('.name').textContent
        const projectName =document.querySelector('.projectName').textContent
        for(let i=0;i<getTodo.projectList.length;i++){
            if(projectName === getTodo.projectList[i].projectName){
                for(let j = 0;j<getTodo.projectList[i].projectContent.length;j++){
                    if(getTodo.projectList[i].projectContent[j].itemName === itemName){
                        changeStatusDOM(getTodo.projectList[i].projectContent[j],item,'true')
                        break;
                    }
                }
            }
        }
        
    }

    const changeStatusDOM=(item,itemDiv,source)=>{
        if(source === 'true'){
            item.completed = !item.completed
        }
        if(item.completed){
            itemDiv.querySelector('.name').classList.add('strike')
            itemDiv.style.background = '#4bb44b'
            const checkedIcon =  document.createElement('div')
            checkedIcon.innerHTML = `<i class="fas fa-check"></i>`
            checkedIcon.classList.add('checkedIcon')
            checkedIcon.addEventListener('click',uncheck.bind(null,item,itemDiv))
            itemDiv.insertBefore(checkedIcon,itemDiv.querySelector('.name'))
            itemDiv.querySelector('.checkbox').style.visibility = 'hidden'
        }else if(!item.completed){ 
            itemDiv.querySelector('.name').classList.remove('strike')
            itemDiv.style.background = `#000000`
            itemDiv.querySelector('.checkbox').style.visibility = 'visible'
            itemDiv.querySelector('.checkbox').checked = false;
            if(itemDiv.querySelector('.checkedIcon') !== null) itemDiv.querySelector('.checkedIcon').remove()
        }    
            storageManangement.setStorage();
    }

    
    const uncheck=(item,itemDiv)=>{
        itemDiv.querySelector('input').style.visibility = 'visible'
        changeStatusDOM(item,itemDiv,'true')
    }
        


     return {appendList,
            appendProject
            }
})();

export default DOMmanagement;