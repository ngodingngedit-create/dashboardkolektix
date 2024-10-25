import React, { useState, useEffect } from 'react';
import { Input } from '@nextui-org/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faPaperclip, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import config from '@/Config';
import Cookies from 'js-cookie';
import axios from 'axios';
import style from './styles.module.css';

interface Contact {
    id: number;
    name: string;
    lastMessage: string;
    lastMessageTime: string;
    lastMessageDate: string;
    has_replies: any[];
}

interface Message {
    id: number;
    from: string;
    message: string;
    createdAt: string;
    userName: string;
    userImage: string;
}

interface Reply {
    id: string;
    user_id: string;
    message: string;
    created_at: string;
}

const FullPageChat = () => {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const getChatSupportData = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token');

            const response = await axios.get(`${config.wsUrl}chat-support`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('API Response:', response.data);

            if (response && response.data && response.data.data) {
                const contactsData = response.data.data.map((contact: any) => {
                    const replies = contact.has_replies || [];
                    const lastReply = replies.length > 0 ? replies[replies.length - 1] : null;

                    return {
                        id: contact.id,
                        name: 'Kolektix Support',
                        lastMessage: lastReply ? lastReply.message : 'Belum ada pesan',
                        lastMessageTime: lastReply ? new Date(lastReply.created_at).toLocaleString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                        }) : 'Belum ada pesan',
                        lastMessageDate: lastReply ? new Date(lastReply.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                        }) : 'Belum ada pesan',
                        has_replies: replies,
                    };
                });

                // Tambahkan kontak Admin secara manual
                const adminContact = {
                    id: -1,
                    name: 'Admin',
                    lastMessage: 'Selamat datang! Jika Anda memiliki pertanyaan, silakan tanyakan.',
                    lastMessageTime: new Date().toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    }),
                    lastMessageDate: new Date().toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                    }),
                    has_replies: [],
                };

                contactsData.unshift(adminContact); // Menambahkan kontak Admin di awal daftar

                setContacts(contactsData);
                setSelectedContact(contactsData[0]); // Mengatur kontak yang dipilih
            }
        } catch (error) {
            console.error('Error fetching chat support data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMessages = selectedContact?.has_replies.map((reply: Reply) => ({
        id: parseInt(reply.id, 10), // convert id to number
        from: reply.user_id === Cookies.get('userId') ? 'User' : 'Admin',
        message: reply.message,
        createdAt: new Date(reply.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        userName: reply.user_id === Cookies.get('userId') ? 'User' : 'Admin',
        userImage: reply.user_id === Cookies.get('userId') ? '/path-to-user-image.jpg' : '/path-to-admin-image.jpg', // Ganti dengan path yang sesuai
      }));

    const selectContact = (contact: Contact) => {
        setSelectedContact(contact);

        // Ambil pesan yang relevan untuk kontak yang dipilih
        const filteredMessages = contact.has_replies.map((reply: Reply) => ({
            id: parseInt(reply.id, 10), // convert id to number
            from: reply.user_id === Cookies.get('userId') ? 'User' : 'Admin',
            message: reply.message,
            createdAt: new Date(reply.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            userName: reply.user_id === Cookies.get('userId') ? 'User' : 'Admin',
            userImage: reply.user_id === Cookies.get('userId') ? '/path-to-user-image.jpg' : '/path-to-admin-image.jpg', // Ganti dengan path yang sesuai
        }));

        setMessages(filteredMessages);
    };

    const sendMessage = async () => {
        if (newMessage.trim()) {
            const token = Cookies.get('token');

            const newMsg = {
                message: newMessage,
                chat_support_id: selectedContact?.id,
            };

            try {
                const response = await axios.post(`${config.wsUrl}chat-support`, newMsg, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const sentMessage = {
                    id: response.data.id,
                    from: 'User',
                    message: newMessage,
                    createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    userName: 'User',
                    userImage: '/path-to-user-image.jpg',
                };
                setMessages([...messages, sentMessage]);
                setNewMessage('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    useEffect(() => {
        getChatSupportData();
    }, []);

    return (
                    <div className="flex justify-center items-center min-h-screen bg-gray-50">
                        <div className="flex flex-col w-full max-w-4xl h-[70vh] shadow-lg rounded-lg overflow-hidden bg-white">
                            <div className="flex h-full">
                                    <div className="w-1/3 bg-gray-100 border-r overflow-y-auto border-e-2">
                        {contacts.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => selectContact(contact)}
                                className={`flex items-center p-3 border-t border-primary-light-200 cursor-pointer ${selectedContact?.id === contact.id ? 'bg-blue-200' : ''}`}
                            >
                                <div className='w-10 h-10 rounded-full bg-primary-base mr-2 overflow-hidden flex items-center justify-center'></div>
                                <div className="flex-1 flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-bold text-black truncate">{contact.name}</p>
                                        <p className="text-sm text-black truncate overflow-hidden whitespace-nowrap text-ellipsis max-w-[200px]">{contact.lastMessage}</p>
                                    </div>
                                    <span className="text-xs text-black ml-2">
                                        {contact.lastMessageTime}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>


                    <div className="flex-1 flex flex-col">
                        {selectedContact && (
                            <div className="flex items-center gap-3 p-3 bg-white border shadow-md border-primary-light-200 w-full">
                                <div className='w-10 h-10 rounded-full bg-primary-base'></div>
                                <p className="text-md text-black font-semibold">{selectedContact.name}</p>
                            </div>
                        )}
                        <div className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto bg-chat w-full">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">Belum ada chat</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex items-start gap-2 p-2 rounded-xl shadow-md max-w-xs ${msg.from === 'User' ? 'bg-blue-100 self-end' : 'bg-gray-200 self-start'}`}
                                    >
                                        <div className="flex flex-col">
                                            <p className="text-sm text-black break-words max-w-full">{msg.message}</p>
                                            <span className="text-xs text-gray-500 self-end mt-1">{msg.createdAt}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-2 border-t flex items-center gap-2 bg-white">
                            <button className="text-dark-grey w-8 h-8 md:w-10 md:h-10 hover:bg-primary-light-200 rounded-full">
                                <FontAwesomeIcon icon={faPaperclip} />
                            </button>
                            <Input
                                value={newMessage}
                                placeholder="Ketik pesan..."
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-grow text-black"
                                size="sm"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-500 text-white p-2 rounded-full"
                            >
                                <FontAwesomeIcon icon={faPaperPlane} size='lg' />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullPageChat;
