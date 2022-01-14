import React from "react";
const {ipcRenderer} = window.require('electron');

const getSetting = async()=>{

    try {
        let setting = await ipcRenderer.invoke('get-setting-file')
        console.log('setting')
        console.log(setting)
 
        if(setting.captureFiles){           
            return setting
        }else{
            return {"captureFiles": []}
        }

    } catch (error) {
        console.log(error)
    }
}

class FileList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            list: ['Please select files']
        }
    }

    onSelectFilesClicked(){
        // ipcRenderer.send('select-files');
        ipcRenderer.invoke('select-files')
            .then((data)=>{
                //console.log('data')
                //console.log(data)
                if(data.length !== 0){
                    this.setState({'list': data})
                    return data
                }
            })
            .then((data)=>ipcRenderer.invoke('write-setting', data))
    }

    onDeleteFilePathClicked(index){
        console.log('index')
        console.log(index)
        console.log(this.state.list[index])

        let tempArr = this.state.list
        tempArr.splice(index, 1)
        //this.setState({'list': tempArr})
        ipcRenderer.invoke('write-setting', tempArr)
            .then(()=>getSetting())
            .then((setting)=>{
                this.setState({'list': setting.captureFiles})
            })
    }

    componentDidMount(){ 
        ipcRenderer.on('file-list', (e, list1)=>{
            //console.log(e)
          //  console.log(list1)
            this.setState({'list': list1})
        })
        getSetting()
            .then((setting)=>{
                this.setState({'list': setting.captureFiles})
            })
    }
    render(){
        return(
            <div className="div filelist">
                <h2>Files will be watching</h2>
                {this.state.list.map((item, index)=>(
                    <div className='item' key={index}>
                        {item}
                        <button style={{marginLeft:"4px"}} onClick={()=>this.onDeleteFilePathClicked(index)}>x</button>
                    </div>))}

                <button onClick={()=>this.onSelectFilesClicked()}>Select Files</button>
            </div>
        )
    }
}

export default FileList;