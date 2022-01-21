const projectArray = (()=>{

    const listItem = (name,note,date)=>{
        let itemName = name;
        let itemNote = note;
        let itemDate = date
        let completed = false;

        return{
            itemName,
            itemNote,
            itemDate,
            completed
        }
    }

    const project =(name,listItem)=>{
        let projectName = name;
        let projectContent = listItem
        
        return{
            projectName,
            projectContent
        }
    }

    return {
        listItem,
        project
    }
})();





export default projectArray;