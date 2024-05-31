import { useCallback, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useSocket } from "../providers/socket";
import './HomeIndex.css';  // Import the CSS file

export function HomeIndex() {
    const [email, setEmail] = useState('');
    const [roomId, setRoomId] = useState('');
    const { socket } = useSocket();
    const navigate = useNavigate();

    const handleJoinRoom = useCallback(({ roomId }) => {
        navigate(`/roomid/${roomId}`);
    }, [navigate]);

    useEffect(() => {
        socket.on('joined-room', handleJoinRoom);

        return () => {
            socket.off('joined-room', handleJoinRoom);
        }
    }, [socket, handleJoinRoom]);

    function handleSubmit() {
        socket.emit('join-room', { 'email': email, 'roomId': roomId });
    }

    return (
        <div className="login-page">
            <div className="card login-card">
                <div className="card-body">
                    <h5 className="card-title text-center">Join Room</h5>
                    <div className="form-group">
                        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" placeholder="UserName" id="txtMail" />
                    </div>
                    <div className="form-group">
                        <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} className="form-control" placeholder="Room Id" id="txtRoomId" />
                    </div>
                    <button className="btn btn-success w-100" onClick={handleSubmit}>Join</button>
                </div>
            </div>
        </div>
    );
}
