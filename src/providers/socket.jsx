
import React, {useMemo} from "react";
import {io} from 'socket.io-client';

const soctectConetion = React.createContext(null);

export const useSocket =() =>{
    return React.useContext(soctectConetion);
};

export const SocketProvider = (props) =>{
        const socket = useMemo(
            ()=> io('https://backend-o707.onrender.com',[])
        );
        return (
            <soctectConetion.Provider value={{socket}}>
                {props.children}
            </soctectConetion.Provider>
        )
        
}

