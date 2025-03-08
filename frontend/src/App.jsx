import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { FaPaperPlane, FaSmile } from "react-icons/fa";
import Picker from "emoji-picker-react";
import "./App.css";
import { auth, db, loginUser, registerUser, logoutUser } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
    collection,
    addDoc,
    orderBy,
    query,
    onSnapshot,
    serverTimestamp,
    where,
    getDocs,
} from "firebase/firestore";

const socket = io("https://live-chat-app-wvea.onrender.com");

export default function App() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [dmMessages, setDmMessages] = useState([]);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isDM, setIsDM] = useState(false);
    const [dmReceiver, setDmReceiver] = useState("");
    const [users, setUsers] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchUsers();
                scrollToBottom(); // Ensure scrolling when logged in
            }
        });
    }, []);

    useEffect(() => {
        if (!isDM) {
            const q = query(collection(db, "messages"), orderBy("timestamp"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                setMessages(snapshot.docs.map(doc => doc.data()));
                setTimeout(scrollToBottom, 100); // Delay scroll to allow DOM update
            });
            return () => unsubscribe();
        }
    }, [isDM]);

    useEffect(() => {
        if (isDM && dmReceiver) {
            loadDirectMessages();
        }
    }, [isDM, dmReceiver]);

    useEffect(() => {
        socket.on("receive_message", (data) => {
            if (isDM) {
                setDmMessages((prev) => [...prev, data]);
            } else {
                setMessages((prev) => [...prev, data]);
            }
            setTimeout(scrollToBottom, 100);
        });

        return () => {
            socket.off("receive_message");
        };
    }, [isDM]);

    useEffect(() => {
        setTimeout(scrollToBottom, 100);
    }, [messages, dmMessages]);

    const fetchUsers = async () => {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        const userList = querySnapshot.docs.map(doc => doc.data().email);
        setUsers(userList.filter(email => email !== user?.email)); // Exclude self
    };

    const sendMessage = async () => {
        if (message.trim()) {
            if (isDM && dmReceiver) {
                const conversationID = [user.email, dmReceiver].sort().join("_");
                const msgData = { sender: user.email, message, timestamp: serverTimestamp() };
                await addDoc(collection(db, "direct_messages", conversationID, "messages"), msgData);
            } else {
                const msgData = { username: user.email, message, timestamp: serverTimestamp() };
                await addDoc(collection(db, "messages"), msgData);
            }
            setMessage("");
            setTimeout(scrollToBottom, 100);
        }
    };

    const loadDirectMessages = async () => {
        if (dmReceiver) {
            const conversationID = [user.email, dmReceiver].sort().join("_");
            const q = query(collection(db, "direct_messages", conversationID, "messages"), orderBy("timestamp"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                setDmMessages(snapshot.docs.map(doc => doc.data()));
                setTimeout(scrollToBottom, 100);
            });
            return () => unsubscribe();
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="chat-container">
            <div className="chat-header">ChatMe</div>
            {user ? (
                <>
                    <button onClick={logoutUser} className="logout-button">Logout</button>
                    <div className="dm-selector">
                        <button onClick={() => { setIsDM(false); setDmReceiver(""); }}>Public Chat</button>

                        <select
                            value={dmReceiver}
                            onChange={(e) => setDmReceiver(e.target.value)}
                            className="dm-dropdown"
                        >
                            <option value="" style={{ color: "black" }}>Select a user</option>
                            {users.map((email) => (
                                <option key={email} value={email}>{email}</option>
                            ))}
                        </select>
                        <button onClick={() => { setIsDM(true); loadDirectMessages(); }}>Start DM</button>

                    </div>
                    <div className="chat-messages">
                        {!isDM ? (
                            messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.username === user.email ? "sent" : "received"}`}>
                                    <p className="username">{msg.username}</p>
                                    <p>{msg.message}</p>
                                    <span className="timestamp">
                                        {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : ""}
                                    </span>
                                </div>
                            ))
                        ) : (
                            dmMessages.map((msg, index) => (
                                <div key={index} className={`message ${msg.sender === user.email ? "sent" : "received"}`}>
                                    <p className="username">{msg.sender}</p>
                                    <p>{msg.message}</p>
                                    <span className="timestamp">
                                        {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : ""}
                                    </span>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef}></div>
                    </div>
                    <div className="chat-input">
                        <div className="icons">
                            <FaSmile className="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                            {showEmojiPicker && (
                                <div className="emoji-picker">
                                    <Picker onEmojiClick={handleEmojiClick} />
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button onClick={sendMessage}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </>
            ) : (
                <div className="auth-container">
                    <h2>{isRegistering ? "Register" : "Login"}</h2>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        isRegistering ? await registerUser(email, password) : await loginUser(email, password);
                    }}>
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="submit">{isRegistering ? "Register" : "Login"}</button>
                    </form>
                    <p onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
                    </p>
                </div>
            )}
        </div>
    );
}
