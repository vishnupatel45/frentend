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
        await Peer.setRemoteDescription(offer);
        const answer = await Peer.createAnswer();
        await Peer.setLocalDescription(answer);
        return answer;
    };

    const setRemoteans = async (ans) => {
        await Peer.setRemoteDescription(ans);
    };

    const sendStream = async (stream) => {
        const tracks = stream.getTracks();
        for (const track of tracks) {
            Peer.addTrack(track, stream);
        }
    };

    const handleTrackEvent = useCallback((ev) => {
        const streams = ev.streams;
        setRemoteStream(streams[0]);
    }, []);

    useEffect(() => {
        Peer.addEventListener('track', handleTrackEvent);
        return () => {
            Peer.removeEventListener('track', handleTrackEvent);
        };
    }, [Peer, handleTrackEvent]);

    return (
        <peerContext.Provider value={{ Peer, createOffer, createAnswer, setRemoteans, sendStream, remoteStream }}>
            {props.children}
        </peerContext.Provider>
    );
};