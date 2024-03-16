import React, { useCallback, useState, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import "./lobby.css"; 

const LobbyScreen = () => {
    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");
    const [error, setError] = useState(""); 

    const socket = useSocket();
    const navigate = useNavigate();

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        if (email && room) {
            socket.emit('room:join', { email, room });
        } else {
            setError("Please enter both email and room number."); 
        }
    }, [email, room, socket]);

    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data;
        navigate(`/room/${room}`);
        console.log(`${email} joined`);
    }, [navigate]);

    useEffect(() => {
        socket.on("room:join", handleJoinRoom);
        return () => {
            socket.off("room:join", handleJoinRoom);
        }
    }, [socket, handleJoinRoom]);

    return (
        <div className="lobby-container">
            <h1> Create your Virtual Lobby</h1>
            <p>Please enter your email and room number to join.</p>
            <form onSubmit={handleSubmitForm}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="room">Room Number:</label>
                    <input type="text" id="room" value={room} onChange={(e) => setRoom(e.target.value)} required />
                </div>
                <button type="submit">Join Lobby</button>
                {error && <p className="error-message">{error}</p>} 
            </form>
            
        </div>
    );
};

export default LobbyScreen;
