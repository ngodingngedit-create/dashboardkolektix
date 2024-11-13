import { useEffect, useMemo, useRef, useState } from 'react';
import { Accordion, AccordionItem, Input } from '@nextui-org/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faPaperPlane, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { UserProps } from '@/utils/globalInterface';
import InputField from '@/components/Input';
import { formatDate, formatDateDiff } from '@/utils/useFormattedDate';
import { Get, Post } from '@/utils/REST';
import useLoggedUser from '@/utils/useLoggedUser';
import { toast, ToastContainer } from 'react-toastify';
import { Chip } from '@nextui-org/react';
import { InboxListProps } from '@/utils/globalInterface';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '@/Config';
import AuthModal from '../AuthModal';
import React from 'react';
import { ActionIcon, Badge, Box, Card, Flex, Indicator, Text, TextInput, Tooltip } from '@mantine/core';
import _ from 'lodash';
import { Icon } from '@iconify/react/dist/iconify.js';
import Link from 'next/link';
import paperplane from '../../assets/icon/paperplane.png';
import Image from 'next/image';

interface ChatProps {
    inbox_id: number;
    from: number;
    to: number;
    message: string;
}

interface ChatListProps {
    name: string | null;
    lastMsg: string;
    time: string;
    countMsg?: number;
    selected?: number;
    setSelected: (selected: number) => void;
    setName: (name: string) => void;
    id: number;
    setMessages: (messages: ChatProps) => void;
    inbox: number;
    messages: ChatProps;
}

interface Dummy {
    id: number;
    from: {
        id: number;
        name: string;
    };
    to: {
        id: number;
        name: string;
    };
    chats: {
        message: string;
        created_at: string;
    }[];
    lastMsg: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

interface Reply {
    id: string;
    user_id: string;
    message: string;
    created_at: string;
}

interface SupportContact {
    id: number;
    name: string;
    lastMessage: string;
    lastMessageTime: string;
    lastMessageDate: string;
    has_replies: Reply[];
}

const ChatList = ({ id, name, lastMsg, time, countMsg, selected, setSelected, setName, setMessages, inbox, messages }: ChatListProps) => {
    const readMsg = (id: number) => {
        Post(`${id}/inbox-read`, {})
            .then((res: any) => {
                console.log(res);
            })
            .catch((err: any) => {
                console.log(err);
            });
    };

    const unreadCount = useMemo(() => {

    }, [])

    return (
        <div
            onClick={() => {
                setSelected(id);
                name && setName(name);
                readMsg(inbox);
                setMessages({ ...messages, to: id, inbox_id: inbox });
            }}
            className={`flex justify-between py-3 px-4 min-h-16 max-h-16 cursor-pointer ${selected === id && 'bg-primary-light-200'}`}
        >
            <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-primary-base"></div>
                <div>
                    <p className="font-semibold text-dark">{name}</p>
                    <p className="text-xs text-dark">{lastMsg}</p>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <p className="text-xs text-primary-base">{time}</p>
                {(countMsg ?? 0) > 0 && <div className="bg-primary-base text-white w-6 flex items-center justify-center rounded-full text-xs mt-1">{countMsg}</div>}
            </div>
        </div>
    );
};

const Chat = () => {
    const [chat, setChat] = useState<InboxListProps[]>([]);
    const [selected, setSelected] = useState<number>(0);
    const [messagerName, setName] = useState<string>('');
    const [user, setUser] = useState<UserProps>();
    const users = useLoggedUser();
    const [supportContacts, setSupportContacts] = useState<SupportContact[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [supportChats, setSupportChats] = useState([]);
    const [searchedChats, setSearchedChats] = useState<InboxListProps[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [messages, setMessages] = useState<ChatProps>({
        inbox_id: 0,
        from: 0,
        to: selected,
        message: ''
    });
    const [newMessage, setNewMessage] = useState<string>('');
    const [modalVisible, setModalVisible] = useState(false);

    const handleButtonClick = (form?: React.FormEvent) => {
        form?.preventDefault();
        const token = Cookies.get('token'); // Ambil token dari cookies
        if (!token) {
            setModalVisible(true); // Hanya set modalVisible ke true jika tidak ada token
        } else {
            // Tindakan lain jika token ada (misalnya, tampilkan pesan atau lakukan sesuatu yang lain)
            console.log('Token is present, modal will not be opened.');
        }
    };

    const defaultSupportContact: Dummy = {
        id: 1,
        from: {
            id: 0,
            name: 'Kolektix Support'
        },
        to: {
            id: 0,
            name: 'User'
        },
        chats: [
            {
                message: 'Halo, ada yang bisa kami bantu?',
                created_at: new Date().toISOString()
            }
        ],
        lastMsg: 'Ada yang bisa kami bantu?',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: ''
    };

    const [supportContact, setSupportContact] = useState<Dummy | null>(defaultSupportContact);

    useEffect(() => {
        if (users) {
            setUser(users);
            if (users.id) {
                setMessages({
                    ...messages,
                    from: users.id
                });
            }
        }
    }, [users]);

    const getData = () => {
        Get('inbox', {})
            .then((res: any) => {
                setChat(res);
                console.log(res, 'chat');
            })
            .catch((err: any) => {
                console.log(err);
            });
    };

    const getChatSupportData = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`${config.wsUrl}chat-support`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Response dari API:', response.data);
            if (response && response.data && response.data.data) {
                const contactsData = response.data.data.map((contact: any) => {
                    const replies = contact.has_replies || [];
                    const lastReply = replies.length > 0 ? replies[replies.length - 1] : null;

                    return {
                        id: contact.id,
                        name: 'Kolektix Support',
                        lastMessage: lastReply ? lastReply.message : 'Belum ada pesan',
                        lastMessageTime: lastReply ? formatDate(lastReply.created_at) : 'Belum ada pesan',
                        lastMessageDate: lastReply ? formatDate(lastReply.created_at) : 'Belum ada pesan',
                        has_replies: replies
                    };
                });

                setSupportContacts(contactsData); // Simpan kontak `chat-support` ke state
            }
        } catch (error) {
            console.error('Error fetching chat support data:', error);
        }
    };

    const sendMessage = (form?: React.FormEvent) => {
        form?.preventDefault();
        if (newMessage.trim()) {
            Post('inbox-chat', { ...messages, message: newMessage })
                .then((res: any) => {
                    console.log(res);
                    getData();
                    setNewMessage('');
                    if (messageBoxRef.current) {
                        messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
                    }
                })
                .catch((err: any) => {
                    toast.error(err.response.data.message);
                });
        }
        
    };

    const sendSupportMessage = (form?: React.FormEvent) => {
        form?.preventDefault();
        if (newMessage.trim()) {
            // Ambil token dari cookie menggunakan js-cookie
            const token = Cookies.get('token');

            // Periksa apakah token ada
            if (!token) {
                console.error('Token tidak ditemukan.');
                return;
            }

            // Kirim pesan dengan menambahkan Authorization header
            axios
                .post(
                    `${config.wsUrl}chat-support`,
                    { message: newMessage },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                .then((res) => {
                    console.log('Pesan terkirim:', res.data);
                    getChatSupportData(); // Memperbarui daftar chat setelah mengirim pesan tanpa reload halaman
                    setNewMessage(''); // Reset input
                    if (messageBoxRef.current) {
                        messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
                    }
                })
                .catch((err) => {
                    toast.error(err.response?.data?.message || 'Error mengirim pesan.');
                    console.error('Error mengirim pesan:', err);
                });
        }
    };

    useEffect(() => {
        getData();
        getChatSupportData();
    }, []);

    const totalUnread = useMemo(() => {
        return chat.reduce((q, n) => q + n.chats.filter((e) => e.status == 'unread' && e.user_id != users?.id).length, 0);
    }, [chat]);

    useEffect(() => {
      if (Boolean(searchQuery)) {
        setSearchedChats(chat.filter(e => e.from.name?.toLowerCase().includes(searchQuery.toLowerCase())));
      } else {
        setSearchedChats([]);
      }
    }, [searchQuery]);

    const messageBoxRef = useRef<HTMLDivElement | null>(null);
    
    useEffect(() => {
      if (messageBoxRef.current) {
        messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
      }
    }, [chat, selected])

    return (
        <>
            <AuthModal visible={modalVisible} onClose={() => setModalVisible(false)} />
            <div className="[&_h2>button]:!py-2 [&_h2>button]:!pr-2 [&_h2>button>span]:!hidden [&_h2[data-open]>button>span]:!block [&_h2[data-open]_.indicatorTotalBadge]:!opacity-0 [&_h2[data-open]_.redirectBtn]:!block fixed bottom-6 right-6 transition-all duration-300 bg-white shadow-xl rounded-lg z-50 opacity-100">
                <Accordion>
                    <AccordionItem
                        title={
                            <div className="flex items-center text-primary-base w-full relative">
                                <FontAwesomeIcon icon={faCommentDots} className="ml-2 text-gray-600" />
                                <p className="ml-2 text-[18px]">Chat</p>
                                {totalUnread > 0 && (
                                    <Badge color="red" ml={10} pos="absolute" className={`top-[-10px] right-[-10px] indicatorTotalBadge`}>
                                        {totalUnread}
                                    </Badge>
                                )}
                                {(users?.id && Boolean(users.has_creator)) && (
                                //   <Tooltip label="Buka di dashboard" bg="white" c="gray" className={`shadow-lg`} withArrow>
                                    <ActionIcon component={Link} href="/dashboard/chat" variant="transparent" className={`text-primary-base ml-[10px] redirectBtn !hidden !absolute right-0 !z-50`}>
                                      <Icon icon="majesticons:open-line" className={`!text-[20px] !text-primary-base`} />
                                    </ActionIcon>
                                //   </Tooltip>
                                )}
                            </div>
                        }
                    >
                        {user && user.id ? (
                            <div className="flex !h-[80vh] w-[90vw] lg:w-[70vw] transition-all duration-300 flex-col md:flex-row shadow-2xl overflow-x-hidden box-border">
                                {/* Contact List */}
                                <div className="w-full md:w-1/3 bg-gray-100 border-r-[#d0d0d0] overflow-y-auto border-e-2 flex-shrink-0">
                                    <Box p={5}>
                                      <TextInput
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        leftSection={<Icon icon="uiw:search" />}
                                        placeholder="Cari Chat"
                                        variant="unstyled"
                                      />
                                    </Box>

                                    {/* Kontak Support */}
                                    <ChatList name="Kolektix Support" lastMsg={supportContacts[0]?.lastMessage || 'Belum ada pesan'} time={supportContacts[0]?.lastMessageTime || 'Belum ada pesan'} key="kolektix-support" setSelected={setSelected} selected={selected} setName={setName} setMessages={setMessages} messages={messages} id={0} inbox={0} />

                                    {(searchQuery && searchedChats.length == 0) && (
                                      <Card>
                                        <Text size="sm" c="gray">Chat tidak ditemukan</Text>
                                      </Card>
                                    )}

                                    {/* Kontak Lain */}
                                    {chat.length > 0 ? (
                                        (searchQuery ? searchedChats : chat)
                                            .filter((item: InboxListProps) => item.from.id !== user?.id)
                                            .map((item: InboxListProps) => <ChatList countMsg={item.chats.filter((e) => e.status == 'unread' && e.user_id != users?.id).length} name={item.from.has_creator.name} lastMsg={item.chats[0].message} time={formatDate(item.chats[0].created_at)} key={item.from.id} setSelected={setSelected} selected={selected} id={item.from.id} setName={setName} setMessages={setMessages} messages={messages} inbox={item.id} />)
                                    ) : (
                                        <p className="p-2 text-gray-500">Belum ada kontak lain.</p>
                                    )}
                                </div>

                                {/* Chat Window */}
                                <div className="flex-1 flex flex-col">
                                    {messagerName !== '' && (
                                        <div className="flex items-center py-4 px-3 h-16 gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-base"></div>
                                            <div>
                                                <p className="font-semibold text-dark">{messagerName}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messageBoxRef} className="flex-1 p-4 flex flex-col overflow-y-auto bg-chat w-full">
                                        {/* Cek apakah kontak yang dipilih adalah Kolektix Support */}
                                        {selected === 0 ? (
                                            <>
                                                {/* Render pesan dari Kolektix Support */}
                                                {supportContacts.map((supportContact, index) => {
                                                    let lastDate: string | null = null;

                                                    return (
                                                        <div key={index}>
                                                            {supportContact.has_replies.map((reply: any, replyIndex: number) => {
                                                                const currentDate = formatDateDiff(reply.created_at);
                                                                const showDateLabel = currentDate !== lastDate;
                                                                if (showDateLabel) {
                                                                    lastDate = currentDate;
                                                                }

                                                                const isAdminReply = reply.reply_from.email === 'admin@kolektix.com';
                                                                const messageContent = reply.message || 'Ada yang bisa kami bantu?';

                                                                return (
                                                                    <div key={replyIndex}>
                                                                        {showDateLabel && (
                                                                            <div className="flex justify-center">
                                                                                <Chip size="sm">{currentDate}</Chip>
                                                                            </div>
                                                                        )}
                                                                        {/* Balikkan penempatan dan warna chat Kolektix Support */}
                                                                        <div className={`flex flex-col gap-2 px-4 lg:px-16 ${isAdminReply ? '' : 'items-end'}`}>
                                                                            <div className={`${isAdminReply ? 'bg-primary-base text-white' : 'bg-white text-dark'} rounded-xl max-w-56 w-fit p-2 py-1.5 shadow-md flex justify-between my-1`}>
                                                                                <p className="flex-grow">{messageContent}</p>
                                                                                <span className="text-[11px] ml-2 pt-1">
                                                                                    {new Date(reply.created_at).toLocaleTimeString('en-US', {
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit',
                                                                                        hour12: false
                                                                                    })}
                                                                                </span>
                                                                                {!isAdminReply && (
                                                                                  <Icon
                                                                                    icon={true ? "solar:check-read-linear" : "ci:check"}
                                                                                    className={`text-grey text-[18px] ml-[3px] translate-y-[2px]`}
                                                                                  />
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        ) : (
                                            // Render pesan dari kontak lain
                                            (() => {
                                                let lastDate: string | null = null;
                                                return chat
                                                    .filter((chatitem: any) => (chatitem.from.id === user.id && chatitem.to.id === selected) || (chatitem.to.id === user.id && chatitem.from.id === selected))
                                                    .flatMap((chatitem) =>
                                                        chatitem.chats.map((chat) => ({
                                                            ...chat,
                                                            fromId: chatitem.from.id,
                                                            createdAt: chat.created_at
                                                        }))
                                                    )
                                                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                                    .map((chat, index) => {
                                                        const currentDate = formatDateDiff(chat.createdAt);
                                                        const showDateLabel = currentDate !== lastDate;

                                                        if (showDateLabel) {
                                                            lastDate = currentDate;
                                                        }

                                                        return (
                                                            <div key={index}>
                                                                {showDateLabel && (
                                                                    <div className="flex justify-center">
                                                                        <Chip size="sm">{currentDate}</Chip>
                                                                    </div>
                                                                )}
                                                                {/* Balikkan penempatan dan warna chat pengguna */}
                                                                <div className={`flex flex-col gap-2 ${chat.fromId !== user.id ? 'items-end' : ''} px-4 lg:px-16`}>
                                                                    <div className={`${chat.fromId !== user.id ? 'bg-white text-dark' : ' bg-primary-base text-white'} rounded-xl max-w-56 w-fit p-2 py-1.5 shadow-md flex justify-between my-1 items-end`}>
                                                                        <p className="flex-grow">{chat.message}</p>
                                                                        <span className={`text-[11px] ml-2 ${chat.fromId !== user.id ? 'text-grey' : ' text-primary-light-200'}`}>
                                                                            {new Date(chat.createdAt).toLocaleTimeString('en-US', {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                                hour12: false
                                                                            })}
                                                                        </span>
                                                                        {chat.fromId !== user.id && (
                                                                          <Icon
                                                                            icon={chat.status == "read" ? "solar:check-read-linear" : "ci:check"}
                                                                            className={`${chat.status ? 'text-primary-base' : 'text-grey'} text-[18px] ml-[3px]`}
                                                                          />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    });
                                            })()
                                        )}
                                    </div>

                                    {selected !== 0 ? (
                                        <form onSubmit={sendMessage}>
                                            <div className="flex items-center p-3 bg-white w-full shadow-md">
                                                <Input fullWidth color="primary" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ketik pesan anda" aria-label="Ketik pesan anda" />
                                                <button
                                                    className='text-white bg-primary-dark w-10 h-10 hover:bg-primary-base shrink-0 ml-[7px] flex items-center justify-center rounded-full'
                                                    onClick={sendMessage}
                                                >
                                                    <Image src={paperplane} alt='paperplane' />
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <form onSubmit={sendSupportMessage}>
                                            <div className="flex items-center p-3 pt-0 bg-white w-full shadow-md mt-4">
                                                <Input fullWidth color="primary" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ketik pesan anda" aria-label="Ketik pesan anda" />
                                                <button
                                                    className='text-white bg-primary-dark w-10 h-10 hover:bg-primary-base shrink-0 ml-[7px] flex items-center justify-center rounded-full'
                                                    onClick={sendSupportMessage}
                                                >
                                                    <Image src={paperplane} alt='paperplane' />
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Tampilkan Data Dummy
                            <div className="flex h-[80vh] w-[90vw] lg:w-[70vw] transition-all duration-300 flex-col md:flex-row shadow-2xl overflow-x-hidden box-border">
                                <div className="w-full md:w-1/3 bg-gray-100 border-r border-r-[#d0d0d0] overflow-y-auto border-e-2 flex-shrink-0">
                                    <ChatList name="Kolektix Support" lastMsg={defaultSupportContact.lastMsg} time={formatDate(defaultSupportContact.created_at)} key={defaultSupportContact.id} setSelected={setSelected} selected={selected} id={defaultSupportContact.id} setName={setName} setMessages={setMessages} messages={messages} inbox={defaultSupportContact.id} />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto bg-chat w-full z-10">
                                        {/* Tempat untuk menampilkan pesan kosong atau konten lainnya */}
                                        <div className="flex justify-center items-center h-full">
                                            <p className="text-gray-500 text-dark">Silakan pilih chat untuk melihat pesan.</p>
                                        </div>
                                    </div>
                                    {/* Tambahkan input untuk mengirim pesan */}
                                    <form onSubmit={handleButtonClick}>
                                        <div className="flex items-center p-3 bg-white w-full shadow-md">
                                            <Input fullWidth color="primary" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ketik pesan anda" aria-label="Ketik pesan anda" />
                                            <button
                                                className='text-white bg-primary-dark w-10 h-10 hover:bg-primary-base shrink-0 ml-[7px] flex items-center justify-center rounded-full'
                                                onClick={sendMessage}
                                            >
                                                <Image src={paperplane} alt='paperplane' />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </AccordionItem>
                </Accordion>
                <ToastContainer />
            </div>
        </>
    );
};

export default Chat;
