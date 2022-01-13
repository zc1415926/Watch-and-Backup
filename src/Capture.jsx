import React from "react";
const {ipcRenderer, desktopCapturer, nativeImage} = window.require('electron');

const saveToDesktop = async(data, ext)=>{
    let desktopPath = await ipcRenderer.invoke('app-path')
    console.log(desktopPath)
    await ipcRenderer.invoke('write-image', data)
}

class Capture extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            imgsrc: ''
        }
    }

    onCaptureScreenClicked(){
        //ipcRenderer.send('select-files');
        desktopCapturer.getSources({types: ['screen']})
            .then(sources=>{
                console.log(sources)
                this.setState({imgsrc: sources[0].thumbnail.toDataURL()})
                const image = nativeImage.createFromDataURL(sources[0].thumbnail.toDataURL())
                let imageJpg = image.toJPEG(90);
                saveToDesktop(imageJpg, 'jpg')
            })
    }
 
    componentDidMount(){ 

    }
    render(){
        return(
            <div className="capture">
                <h2>Capture image</h2>
                <img src={this.state.imgsrc}/>

                <button onClick={()=>this.onCaptureScreenClicked()}>Capture Screen</button>
            </div>
        )
    }
}

export default Capture;