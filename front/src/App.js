import { useEffect, useState } from "react";
import './App.scss';

import { socket } from './Socket';
import { Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage/HomePage";
import CallPage from "./components/CallPage/CallPage";

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);

  // useEffect(() => {
  //   // no-op if the socket is already connected
  //   socket.connect();

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  // useEffect(() => {
  //   function onConnect() {
  //     setIsConnected(true);
  //   }

  //   function onDisconnect() {
  //     setIsConnected(false);
  //   }

  //   socket.on('connect', onConnect);
  //   socket.on('disconnect', onDisconnect);

  //   return () => {
  //     socket.off('connect', onConnect);
  //     socket.off('disconnect', onDisconnect);
  //   };
  // }, []);
  return (
    <Routes>
      <Route
        path="/:id"
        element={
          // <Check >
          <CallPage />
          // </Check>
        }
      />
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<h1>no match </h1>} />

    </Routes>
  );
}

export default App;
