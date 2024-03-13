import React, { useCallback, useState, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom"


const LobbyScreen = () => {
    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");
    
    const socket = useSocket();

    const navigate = useNavigate();

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        socket.emit('room:join', {email, room});
    }, [email, room, socket]);


    const handleJoinRoom = useCallback((data) =>{
        const { email, room } = data
        navigate(`/room/${room}`);
        console.log(`${email} joinded`)
    }, [navigate]);


    useEffect(() => {
        socket.on("room:join", handleJoinRoom);
        return () => {
            socket.off("room:join", handleJoinRoom)
        }
    
    }, [socket, handleJoinRoom]);



    return (
        <div className="lobby-container">
    <h1>Welcome to Our Company's Virtual Lobby</h1>
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
    </form>
    <p>Don't have an account? <a href="/signup">Sign up</a> here.</p>
    </div>

    );
};

export default LobbyScreen;
