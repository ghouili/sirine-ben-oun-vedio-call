import React, { useEffect, useState, useRef, useContext } from "react";
// import socket from "../../../Socket";
import "./Messenger.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUserFriends,
  faCommentAlt,
  faPaperPlane,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import streamSaver from "streamsaver";
import { SocketContext } from "../../../Context/SocketContext";
import { socket } from "../../../Socket";
import { useParams } from "react-router-dom";
// import worker from '../../../worker';

// const worker = new Worker('../../../../public/worker.js');

function Messenger({
  setIsMessenger,
  display,
  roomId,
  peers,
  fileNameRef,
  gotFile,
  setGotFile,
}) {
  const params = useParams();
  const { setIsLoading } = useContext(SocketContext);
  let time = moment(new Date()).format("hh:mm A");
  const [chat, setChat] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const messagesEndRef = useRef(null);

  const selectFile = async (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    socket.on("receive-message", ({ sender, message, time }) => {
      setChat((chat) => [...chat, { message, sender, time }]);
    });

    return () => {
      // BAD: this will remove all listeners for the 'foo' event, which may
      // include the ones registered in another component
      socket.off("receive-message");
    };
  }, []);

  const sendFile = async (e) => {
    e.preventDefault();
    console.log(peers);
  };

  // Scroll to Bottom of Message List
  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    setIsLoading(true);
    let sender = localStorage.getItem('userName') ;
    socket
      .timeout(5000)
      .emit("send-message", { roomId: params.id, sender , message: text, time }, () => {
        setIsLoading(false);
        setText("");
      });
  };

  return (
    <div className="messenger-container">
      <div className="messenger-header">
        <h3>Meeting details</h3>
        <FontAwesomeIcon
          className="icon"
          icon={faTimes}
          onClick={() => {
            setIsMessenger(false);
          }}
        />
      </div>

      <div className="messenger-header-tabs">
        <div className="tab">
          <FontAwesomeIcon className="icon" icon={faUserFriends} />
          <p>People (1)</p>
        </div>
        <div className="tab active">
          <FontAwesomeIcon className="icon" icon={faCommentAlt} />
          <p>Chat</p>
        </div>
      </div>

      <div className="chat-section">
        {chat &&
          chat.map(({ sender, message, time, pdf }, idx) => {
            console.log("messae    " + message);
            return (
              <div key={idx} className="chat-block">
                {gotFile && (
                  <div>
                    <span>
                      You have received a file. Would you like to download the
                      file?
                    </span>
                    <button onClick={() => alert("downloading...")}>Yes</button>
                    {/* <button onClick={download}>Yes</button> */}
                  </div>
                )}
                <div className="sender">
                  {sender} <small>{time}</small>
                </div>
                {/* <p className="msg">here commes an actual msg </p> */}
                {pdf ? (
                  <p className="msg">pdf </p>
                ) : (
                  <p className="msg">{message} </p>
                )}
              </div>
            );
          })}

        {gotFile && (
          <div>
            <span>
              You have received a file. Would you like to download the file?
            </span>
            <button onClick={() => alert("downloading...")}>Yes</button>
            {/* <button onClick={download}>Yes</button> */}
          </div>
        )}
        <div style={{ float: "left", clear: "both" }} ref={messagesEndRef} />
      </div>

      <div className="send-msg-section">
        <input
          placeholder="Send a message to everyone"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="w-fit">
          <input
            onChange={selectFile}
            type="file"
            className="hidden"
            id="attache_file"
          />
          <label htmlFor="attache_file" className="cursor-pointer">
            <FontAwesomeIcon className="icon" icon={faPaperclip} />
          </label>
        </div>
        <div onClick={sendMessage}>
          <FontAwesomeIcon className="icon" icon={faPaperPlane} />
        </div>
      </div>
    </div>
  );
}

export default Messenger;
