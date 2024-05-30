import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { SocketProvider } from './providers/socket';
import { PeerProvider } from './providers/peer';
import { HomeIndex } from './component/home';
import { RoomPage } from './component/room';
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <SocketProvider>
          <PeerProvider> 
            <Routes>
              <Route path='/' element={<HomeIndex/>} />
              <Route path='/roomid/:roomid' element={<RoomPage />} />
            </Routes>
          </PeerProvider>
        </SocketProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
