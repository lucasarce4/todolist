import getTodo from "./getTodo";
import DOMmanagement from "./manageDOM";
import projectArray from "./listItemObject";

const storageManangement = (()=>{
    const setStorage = ()=>{
        localStorage.setItem("storedInfo", JSON.stringify(getTodo.projectList))
    }
    
    document.addEventListener('DOMContentLoaded',()=>{
        let parsedInfo  = JSON.parse(localStorage.getItem("storedInfo")) || []
        parsedInfo.forEach(element => {
            document.querySelector('.projectName').textContent = element.projectName
            getTodo.projectList.push(element);
   
        })
        load()
    })

    function load(){
        if(getTodo.projectList.length === 0){
        getTodo.projectList[0] = projectArray.project()
        getTodo.projectList[0].projectName = 'My project'
        getTodo.projectList[0].projectContent = []
        DOMmanagement.appendProject(getTodo.projectList,'newProject')
        }else{
            getTodo.projectList.forEach(element=>{DOMmanagement.appendProject(element)})
            document.querySelector('.projectName').textContent = getTodo.projectList[0].projectName;
            getTodo.projectList[0].projectContent.forEach(element => {
                DOMmanagement.appendList(element)
            });
        }
    }
    return {
        setStorage
    }
})();

export default storageManangement
