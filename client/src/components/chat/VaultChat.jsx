import React, { useState, useEffect, useRef } from 'react';
import useCrypto from '../../hooks/useCrypto';
import EncryptionStatus from './EncryptionStatus';
import MessageExpiration from './MessageExpiration';
import ParanoiaMode from './ParanoiaMode';
import '../styles/vault-chat.css';

const VaultChat = () => {
  const { keyPair, fingerprint, encryptMessage, decryptMessage, wipeKeys } = useCrypto();
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [recipientFingerprint, setRecipientFingerprint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paranoiaMode, setParanoiaMode] = useState(true);
  const [expirationTime, setExpirationTime] = useState(300);
  const [sessionActive, setSessionActive] = useState(true);
  const [ghostMode, setGhostMode] = useState(false);
  const [decoyMessages, setDecoyMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inactivityTimeoutRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (conversationId) {
      const fetchMessages = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/api/securechat/messages?conversationId=${conversationId}`);
          const data = await response.json();

          const decryptedMessages = await Promise.all(
            data.messages.map(async (msg) => {
              try {
                const decrypted = await decryptMessage(
                  msg.encryptedContent,
                  msg.nonce,
                  msg.senderFingerprint,
                  msg.ephemeralPublicKey
                );
                return {
                  ...msg,
                  content: decrypted,
                  isMine: msg.senderFingerprint === fingerprint,
                };
              } catch (error) {
                return {
                  ...msg,
                  content: '[Failed to decrypt]',
                  isMine: msg.senderFingerprint === fingerprint,
                };
              }
            })
          );

          setMessages(decryptedMessages);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }, 3000);

      return () => clearInterval(fetchMessages);
    }
  }, [conversationId, decryptMessage, fingerprint, API_URL]);

  useEffect(() => {
    const resetInactivityTimer = () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }

      inactivityTimeoutRef.current = setTimeout(() => {
        setSessionActive(false);
        handleAutoLogout();
      }, 15 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keypress', resetInactivityTimer);

    return () => {
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keypress', resetInactivityTimer);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAutoLogout = () => {
    wipeKeys();
    setMessages([]);
    setConversationId(null);
  };

  const handleInitiateChat = async () => {
    if (!recipientFingerprint || !keyPair) return;

    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setConversationId(newConversationId);

    try {
      const response = await fetch(`${API_URL}/api/securechat/key-exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientFingerprint,
          ephemeralPublicKey: keyPair.publicKey,
          sessionId: newConversationId,
        }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Key exchange failed');
    } catch (error) {
      console.error('Error initiating chat:', error);
      alert('Failed to initiate chat. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationId || !keyPair) return;

    setIsLoading(true);
    try {
      if (paranoiaMode && Math.random() > 0.7) {
        const decoyContent = generateDecoyMessage();
        setDecoyMessages([...decoyMessages, decoyContent]);
      }

      const encrypted = await encryptMessage(inputMessage, recipientFingerprint);

      const response = await fetch(`${API_URL}/api/securechat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          encryptedContent: encrypted.ciphertext,
          senderFingerprint: fingerprint,
          recipientFingerprint,
          nonce: encrypted.nonce,
          ephemeralPublicKey: encrypted.ephemeralPublicKey,
          expirationSeconds: expirationTime,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        setInputMessage('');
        const newMessage = {
          messageId: Math.random().toString(36).substring(7),
          content: inputMessage,
          senderFingerprint: fingerprint,
          isMine: true,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + expirationTime * 1000),
        };
        setMessages([...messages, newMessage]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const generateDecoyMessage = () => {
    const decoys = [
      'The quick brown fox jumps over the lazy dog',
      'Cryptography is the art of writing or solving codes',
      'Security through obscurity is not a valid strategy',
      'End-to-end encryption protects user privacy',
      'Hash functions are mathematical algorithms',
      'Key exchange protocols enable secure communication',
      'Paranoia is a feature, not a bug',
    ];
    return decoys[Math.floor(Math.random() * decoys.length)];
  };

  const handlePanicButton = () => {
    if (confirm('This will wipe all local vault data. Are you sure?')) {
      wipeKeys();
      setMessages([]);
      setConversationId(null);
      localStorage.clear();
      alert('All data wiped. Session ended.');
    }
  };

  const handleDisableScreenshots = () => {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    console.log('%c%s', 'font-size: 1px;', 'Screenshot detected');
  };

  useEffect(() => {
    const handleScreenshot = () => {
      handleDisableScreenshots();
    };

    document.addEventListener('keyup', (e) => {
      if ((e.key === 'PrintScreen') || (e.key === 'F12')) {
        handleScreenshot();
      }
    });
  }, []);

  if (!sessionActive) {
    return (
      <div className="vault-session-expired">
        <div className="vault-expired-content">
          <h2>Session Expired</h2>
          <p>Your secure session has expired due to inactivity.</p>
          <p>All local keys and data have been wiped for security.</p>
          <button onClick={() => window.location.reload()}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="vault-chat-container">
      <div className="vault-header">
        <h1>Paranoia Mode Chat</h1>
        <div className="vault-header-controls">
          <EncryptionStatus fingerprint={fingerprint} />
          <ParanoiaMode enabled={paranoiaMode} onChange={setParanoiaMode} />
          <button className="vault-panic-btn" onClick={handlePanicButton} title="Panic Button">
            🔥 WIPE
          </button>
        </div>
      </div>

      {!conversationId ? (
        <div className="vault-setup">
          <div className="vault-setup-box">
            <h2>Start Secure Conversation</h2>
            <div className="vault-form-group">
              <label>Your Fingerprint</label>
              <code className="vault-fingerprint">{fingerprint || 'Generating...'}</code>
            </div>
            <div className="vault-form-group">
              <label>Recipient Fingerprint</label>
              <input
                type="text"
                value={recipientFingerprint}
                onChange={(e) => setRecipientFingerprint(e.target.value.toUpperCase())}
                placeholder="Enter recipient's 16-char fingerprint"
                className="vault-input"
              />
            </div>
            <MessageExpiration value={expirationTime} onChange={setExpirationTime} />
            <button onClick={handleInitiateChat} className="vault-btn-primary">
              Initiate Secure Chat
            </button>
          </div>
        </div>
      ) : (
        <div className="vault-chat">
          <div className="vault-messages">
            {messages.map((msg) => (
              <div key={msg.messageId} className={`vault-message ${msg.isMine ? 'mine' : 'theirs'}`}>
                <div className="vault-message-header">
                  <span className="vault-sender">
                    {msg.isMine ? 'You' : 'Them'} • {msg.senderFingerprint.substring(0, 8)}
                  </span>
                  {msg.expiresAt && (
                    <span className="vault-expiry">
                      Expires: {new Date(msg.expiresAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <div className="vault-message-content">{msg.content}</div>
                <div className="vault-message-footer">
                  {msg.readReceipt && <span className="vault-read-status">✓✓ Read</span>}
                  {!ghostMode && <span className="vault-timestamp">{new Date(msg.createdAt).toLocaleTimeString()}</span>}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="vault-input-area">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type encrypted message..."
              className="vault-textarea"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSendMessage();
                }
              }}
            />
            <div className="vault-input-controls">
              <label className="vault-ghost-toggle">
                <input
                  type="checkbox"
                  checked={ghostMode}
                  onChange={(e) => setGhostMode(e.target.checked)}
                />
                Ghost Mode
              </label>
              <button onClick={handleSendMessage} disabled={isLoading} className="vault-btn-send">
                {isLoading ? 'Encrypting...' : 'Send Encrypted'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="vault-footer">
        <p>✓ End-to-End Encrypted • ✓ Perfect Forward Secrecy • ✓ Auto-Expiring Messages</p>
      </div>
    </div>
  );
};

export default VaultChat;
