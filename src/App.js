import Navbar from './Navbar';
import FileList from './FileList';
import Capture from './Capture';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="content">
        <FileList />
        <Capture />
      </div>
    </div>
  );
}

export default App;