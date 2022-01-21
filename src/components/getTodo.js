import projectArray from "./listItemObject";
import DOMmanagement from "./manageDOM";
import storageManangement from "./localStorage";
import { Input } from "postcss";



const getTodo = (()=>{
    let projectList=[];
 
     document.querySelector('#projectFormSend').addEventListener('click',(e)=>{
        if(document.querySelector('#projectName').value === '' || validateProjectName()=== false){
            document.querySelector('#projectName').style.border = `1px solid red`;
        }else{ 
        document.querySelector('#projectName').style.border = `1px solid white`;
         e.preventDefault()
         let newProject = projectArray.project()
         newProject.projectName = document.querySelector('#projectName').value;
         newProject.projectContent = []
         projectList.push(newProject)
         DOMmanagement.appendProject(projectList,'newProject')
         storageManangement.setStorage();
        document.querySelector('.projectFormBackground').classList.remove('show')
        document.querySelector('#projectform').reset()
        }
    })



    document.querySelector('#formSend').addEventListener('click',(e)=>{
        let projectIndex = currentProject();
        if(document.querySelector('#name').value === '' || validateName() === false){
            document.querySelector('#name').style.border = `1px solid red`;
        }else{ 
        e.preventDefault();
        let newItem = projectArray.listItem();
        newItem.itemName = document.querySelector('#name').value;
        newItem.itemNote = document.querySelector('#note').value;
        if(document.querySelector('.formDate').value !== ''){
            newItem.itemDate = document.querySelector('.formDate').value;
        }else if(document.querySelector('.formDate').value === '') {
            newItem.itemDate = 'No date'}
        if(newItem.itemNote === ''){newItem.itemNote = 'No details'}
        projectList[projectIndex].projectContent.push(newItem);
        document.querySelector('#form').reset()
        DOMmanagement.appendList(projectList[projectIndex].projectContent[getTodo.projectList[projectIndex].projectContent.length-1])
        document.querySelector('.formBackground').classList.remove('show')
        storageManangement.setStorage();
        }
    })

    const validateName = ()=>{
        const projectIndex = currentProject();
        for(let i = 0;i<projectList[projectIndex].projectContent.length;i++){
            if(projectList[projectIndex].projectContent[i].itemName === document.querySelector('#name').value){
                alert('Name already in use')
                return false
            }
        }
    }

    const validateProjectName = ()=>{
        for(let i =0;i<projectList.length;i++){
            if(projectList[i].projectName === document.querySelector('#projectName').value)
            alert('Name already in use')
            return false;
        }
    }

    
    const currentProject = ()=>{
        let name = document.querySelector('.projectName').textContent;
        for(let i =0;projectList.length;i++){
            if(projectList[i].projectName === name ){
                return i
            }
        }
    }

    return {projectList}
})();

export default getTodo;