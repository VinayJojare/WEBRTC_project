import React, { useEffect, useCallback, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from 'react-player';
import peer from '../service/Peer';
import Peer from '../service/Peer';

const Roompage = () => {


    const socket = useSocket();

    const [remoteSocketId, setRemoteSocketId] = useState(null)

    const [myStream, setMyStream] = useState()

    const [remoteStream, setRemoteStream] = useState();

    const handleUserJoined = useCallback(({ email, id }) =>{
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id)
    }, []);


    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio:true,
            video:true
        });
        const offer = await Peer.getOffer();
        socket.emit("user:call", {to: remoteSocketId, offer});
        setMyStream(stream)
    }, [remoteSocketId, socket])

    const handleIncomingCall = useCallback(async ({from, offer}) => {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setMyStream(stream);
        console.log('incoming call', from, offer);
        const ans = await Peer.getAnswer(offer)
        socket.emit("call:accepted", { to: from, ans });
        
    }, [socket]);

    const sendStreams = useCallback(() =>{
        for (const track of myStream.getTracks()){
            peer.peer.addTrack(track, myStream);
        }

    }, [myStream]);

    const handleCallAccepted = useCallback(({ ans }) => {
        peer.setLocalDescription(ans);
        console.log("Call Accepted!");
        sendStreams()
        
        

    }, [sendStreams]);


    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded])

    const handleNegoNeedIncoming = useCallback(async ({from, offer}) =>  {
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', { to: from, ans });

    }, [socket])

    const handleNegoFinal = useCallback(async({ ans }) => {
        await peer.setLocalDescription(ans);

    },
    [])

    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams
            setRemoteStream(remoteStream[0])
        })
        


    })

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incoming:call", handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncoming)
        socket.on('peer:nego:final', handleNegoFinal)

        return () => {
            socket.off('user:joined', handleUserJoined);
            socket.off("incoming:call", handleIncomingCall);
            socket.off("call:accepted", handleCallAccepted)
            socket.off("peer:nego:needed", handleNegoNeedIncoming)
            socket.off('peer:nego:final', handleNegoFinal)
        };
    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoFinal]);



    return(
        <div className="room-container">
    <h1>Welcome to the Virtual Room</h1>
    <p>Status: {remoteSocketId ? 'Connected' : 'No one in Room'}</p>

    {/* Button to send stream if myStream is available */}
    {myStream && <button onClick={sendStreams}>Send Stream</button>}

    
    {remoteSocketId && <button onClick={handleCallUser}>Call</button>}

   
    {myStream && (
        <>
            <h2>My Video</h2>
            <ReactPlayer
                playing
                muted
                height="300px"
                width="400px"
                url={myStream}
            />
        </>
    )}

   
    {remoteStream && (
        <>
            <h2>Remote Stream</h2>
            <ReactPlayer
                playing
                muted
                height="300px"
                width="400px"
                url={remoteStream}
            />
        </>
    )}
</div>

    );
};

export default Roompage;