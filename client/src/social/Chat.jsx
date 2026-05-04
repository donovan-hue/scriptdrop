import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function Chat() {
  const { userName } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Conectar Socket.io
    const newSocket = io(SOCKET_URL);
    newSocket.emit('user_online', user.id);
    setSocket(newSocket);

    // Cargar mensajes existentes
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/messages/conversation/${userName}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Escuchar mensajes nuevos
    newSocket.on('receive_private_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on('user_typing', (data) => {
      if (data.userId === userName) {
        setIsTyping(true);
      }
    });

    newSocket.on('user_stopped_typing', (data) => {
      if (data.userId === userName) {
        setIsTyping(false);
      }
    });

    return () => newSocket.close();
  }, [userName, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = {
      senderId: user.id,
      senderUsername: user.username,
      receiverId: userName,
      content: input,
      timestamp: new Date()
    };

    // Enviar al servidor
    await axios.post(`${API_URL}/messages/send`, {
      receiverId: userName,
      content: input
    });

    // Emitir por Socket.io
    socket?.emit('send_private_message', newMessage);

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
  };

  const handleTyping = () => {
    socket?.emit('typing', {
      receiverId: userName,
      userId: user.id,
      username: user.username
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg h-96 flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <h2 className="text-xl font-bold">@{userName}</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === user.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && <p className="text-gray-500 italic">Typing...</p>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4 flex space-x-2 bg-gray-50 rounded-b-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
