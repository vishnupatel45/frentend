import React, { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from '../providers/socket';
import { usePeer } from '../providers/peer';
import './RoomPage.css';

export function RoomPage() {
    const { socket } = useSocket();
    const { createOffer, createAnswer, setRemoteans, sendStream, remoteStream } = usePeer();

    const [myStream, setMyStream] = useState(null);
    const [remoteId, setRemoteId] = useState('');
    const [callAccepted, setCallAccepted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const myVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const handleError = useCallback((error) => {
        console.error('Error accessing media devices:', error.message);
    }, []);

    const requestMediaAccess = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setMyStream(stream);
            if (myVideoRef.current) {
                myVideoRef.current.srcObject = stream;
            }
        } catch (error) {
            handleError(error);
        }
    }, [handleError]);

    useEffect(() => {
        requestMediaAccess();
    }, [requestMediaAccess]);

    const handleStartMeeting = useCallback(() => {
        if (myStream) {
            sendStream(myStream);
            socket.emit('start-meeting', { stream: myStream });
        }
    }, [myStream, sendStream, socket]);

    useEffect(() => {
        const handleUserJoin = async (data) => {
            const { email } = data;
            console.log('User joined:', email);
            const offer = await createOffer();
            socket.emit('call-user', { email, offer });
            setRemoteId(email);
        };

        const handleIncomingCall = async (data) => {
            const { from, offer } = data;
            console.log('Incoming call:', from, offer);
            const ans = await createAnswer(offer);
            socket.emit('call-accepted', { email: from, ans });
            setRemoteId(from);
            setCallAccepted(true);
        };

        const handleCallAccepted = async (data) => {
            const { ans } = data;
            console.log('Call got accepted:', ans);
            await setRemoteans(ans);
            setCallAccepted(true);
        };

        socket.on('user-join', handleUserJoin);
        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-accepted', handleCallAccepted);

        return () => {
            socket.off('user-join', handleUserJoin);
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted', handleCallAccepted);
        };
    }, [socket, createOffer, createAnswer, setRemoteans]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            console.log('Setting remote stream:', remoteStream);
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const handleSendMessage = useCallback(() => {
        if (newMessage.trim()) {
            socket.emit('send-message', { message: newMessage });
            setMessages((prevMessages) => [...prevMessages, { sender: 'me', message: newMessage }]);
            setNewMessage('');
        }
    }, [newMessage, socket]);

    useEffect(() => {
        const handleReceiveMessage = (data) => {
            setMessages((prevMessages) => [...prevMessages, { sender: 'them', message: data.message }]);
        };

        socket.on('receive-message', handleReceiveMessage);

        return () => {
            socket.off('receive-message', handleReceiveMessage);
        };
    }, [socket]);

    return (
        <div className="room-page">
            <div className="container">
                <h1 className="text-center">Room Page</h1>
                <h4 className="text-center">You are connected to {remoteId}</h4>
                <div className="video-container">
                    <div className="video-wrapper">
                        <h5>My Video</h5>
                        <video ref={myVideoRef} autoPlay playsInline className="video" />
                    </div>
                </div>
                {/* {!callAccepted && (
                    <div className="text-center">
                        <button className="btn btn-primary" onClick={handleStartMeeting}>Start Live Meeting</button>
                    </div>
                )} */}
                <div className="chat-container">
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <span>{msg.message}</span>
                            </div>
                        ))}
                    </div>
                    <div className="message-input">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="form-control"
                        />
                        <button onClick={handleSendMessage} className="btn btn-success">Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
