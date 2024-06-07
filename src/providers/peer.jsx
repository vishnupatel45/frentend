import React, { useCallback, useEffect, useMemo, useState } from "react";

const peerContext = React.createContext(null);

export const usePeer = () => React.useContext(peerContext);

export const PeerProvider = (props) => {
    const Peer = useMemo(() => new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun.services.mozilla.com' }
        ],
    }), []);

    const [remoteStream, setRemoteStream] = useState(null);

    const createOffer = async () => {
        const offer = await Peer.createOffer();
        await Peer.setLocalDescription(offer);
        return offer;
    };

    const createAnswer = async (offer) => {
        await Peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await Peer.createAnswer();
        await Peer.setLocalDescription(answer);
        return answer;
    };

    const setRemoteans = async (ans) => {
        await Peer.setRemoteDescription(new RTCSessionDescription(ans));
    };
    // const setRemoteans = async (ans) => {
    //     // Assuming you have a peer connection named peerConnection
    //     await Peer.setRemoteDescription(new RTCSessionDescription(ans));
    //     Peer.ontrack = (event) => {
    //         setRemoteStream(event.streams[0]);
    //     }
    // }

    const sendStream = (stream) => {
        stream.getTracks().forEach(track => Peer.addTrack(track, stream));
    };

    const handleTrackEvent = useCallback((event) => {
        setRemoteStream(event.streams[0]);
    }, []);

    useEffect(() => {
        Peer.addEventListener('track', handleTrackEvent);
        return () => {
            Peer.removeEventListener('track', handleTrackEvent);
        };
    }, [Peer, handleTrackEvent]);

    return (
        <peerContext.Provider value={{ createOffer, createAnswer, setRemoteans, sendStream, remoteStream }}>
            {props.children}
        </peerContext.Provider>
    );
};