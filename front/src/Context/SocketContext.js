import React, { createContext, useState, useEffect } from "react";
import { socket } from "../Socket";
import { useLocation, useNavigate } from "react-router-dom";

const SocketContext = createContext();

const ProvideContext = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    socket.on('me', (id) => console.log(id));
    socket.emit('checkRoom');

    // socket.on('roomCheckResult', ({ isInRoom, roomId }) => {
    //   if (isInRoom) {
    //     console.log('The user is already in a room' + roomId);
    //     if (location.pathname !== `/${roomId}`) {
    //       navigate(`/${roomId}`);
    //     }
    //     // Handle the case when the user is already in a room
    //   } else {
    //     console.log('The user is not in a room');
    //     // Handle the case when the user is not in a room
    //   }
    // });
  }, []);
  // useEffect(() => {
  //   // listening on incomming messages ::
  //   console.log('here 01');
  //   socket.on("FE-receive-message", ({ msg, sender, time }) => {
  //     console.log('here 02');
  //     setChat((chat) => [...chat, { msg, sender, time }]);
  //     // console.log(chat);
  //   });
  //   console.log('here 03');
  // }, []);

  return (
    <SocketContext.Provider value={{ isLoading, setIsLoading }}>{children}</SocketContext.Provider>
  );
};
export { SocketContext, ProvideContext };
