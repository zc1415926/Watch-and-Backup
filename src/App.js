import Navbar from './Navbar';
import FileList from './FileList';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="content">
        <FileList />
      </div>
    </div>
  );
}

export default App;