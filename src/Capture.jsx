import React from "react";
const {ipcRenderer, desktopCapturer, nativeImage} = window.require('electron');

//本程序中关于异步的知识，下面的文章了我很大启发https://www.jianshu.com/p/1e75bd387aa0，https://www.bilibili.com/video/BV1Cb4y1o7yA?p=230
//让一个变量名=>一个async的匿名函数，这种写法可以在匿名函数里使用await调用异步函数
//在React中，要用async/await的写法，要写在class外边

//把截图的数据传给主进程，写入文件
const saveToDesk = async(data)=>{
    let imagePath = await ipcRenderer.invoke('write-image', data)
    //使用await调用异步函数，会像同步函数一样，执行完await标注的函数才往下执行
    //执行到下边就代表文件写完了，ipcMain.handle函数已经返回

    //调用return 完成这个异步函数，这返回值没有被使用
    return imagePath
} 

//让一个变量名=>一个async的匿名函数，这种写法可以在匿名函数里使用await调用异步函数
const getCaptureFiles = async()=>{
    //await后边的函数执行完成后，captureFiles才会收到值，然后才执行return那一步
    let captureFiles = await ipcRenderer.invoke('get-capture-files')
    return captureFiles
}

class Capture extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            //imgsrc: '',
            //appPath: '',
            captureFiles: []
        }
    }

    onCaptureScreenClicked(){
        //按下截图按钮后，调用截图函数
        desktopCapturer.getSources({types: ['screen']})
            .then(sources=>{
                //直接把图片转换成URL放到img标签的src里就可以显示
                //this.setState({imgsrc: sources[0].thumbnail.toDataURL()})
                //const image = nativeImage.createFromDataURL(sources[0].thumbnail.toDataURL())
                //把截到的数据转换成90%的JPEG
                const imageJpg = sources[0].thumbnail.toJPEG(90);
                //返回数据，完成本层的then函数
                return imageJpg
            })
            //写入图片文件，“匿名函数=>调用函数”这样的形式就是当调用的函数return时，完成本层的then
            .then((imageJpg)=>saveToDesk(imageJpg))
            //这一层的then意思和上一层一样，只不过上一个是简写，本个then是完整形式
            //完成文件写入后，调用读取全部文件函数
            .then(()=>{
                return getCaptureFiles()
            })
            //所有文件读取完成后，调用setState，更新dom
            .then((files)=>{
                this.setState({captureFiles: files})
            })
    }
 
    componentDidMount(){ 
        //一开始运行程序，首先读取一次所有文件
        getCaptureFiles().then((files)=>{
            this.setState({captureFiles: files})
        })
    }

    render(){
        return(
            <div className="capture">
                <h2>Capture image</h2>
                {/* <img src={this.state.imgsrc}/> */}

                <button onClick={()=>this.onCaptureScreenClicked()}>Capture Screen</button>
                { 
                    this.state.captureFiles.map((item)=>{
                        //根据地址，以nativeImage的形式读取图片
                        let img = nativeImage.createFromPath(item)
                        //把文件地址按\\符号切分成一个数组
                        let fileNameArray = item.split('\\')
                        //取出地址的最后一部分，也就是文件名
                        let fileName =  fileNameArray[fileNameArray.length-1]
                        return(
                            // 要有一个唯一的key，反正文件名也是唯一的，就借用一下
                            <div key={fileName}>
                                <h2>{fileName}</h2>
                                <img src={img.toDataURL()} />
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

export default Capture;