import React from "react";
const {ipcRenderer} = window.require('electron');

class FileList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            list: ['Please select files']
        }
    }

    onSelectFilesClicked(){
        ipcRenderer.send('select-files');
    }

    componentDidMount(){ 
        ipcRenderer.on('file-list', (e, list1)=>{
            //console.log(e)
          //  console.log(list1)
            this.setState({'list': list1})
        })
    }
    render(){
        return(
            <div className="div filelist">
                <h2>Files will be watching</h2>
                {this.state.list.map((item)=>(
                    <div className='item'>{item}</div>))}

                <button onClick={()=>this.onSelectFilesClicked()}>Select Files</button>
            </div>
        )
    }
}

export default FileList;