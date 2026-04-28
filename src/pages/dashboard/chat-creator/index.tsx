import { useEffect, useRef, useState } from 'react';
import { Chip } from '@nextui-org/react';
import { UserProps } from '@/utils/globalInterface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import InputField from '@/components/Input';
import { formatDate, formatDateDiff } from '@/utils/useFormattedDate';
import { Get, Post } from '@/utils/REST';
import Image from 'next/image';
import paperplane from '../../../assets/icon/paperplane.png';
import { InboxListProps } from '@/utils/globalInterface';
import useLoggedUser from '@/utils/useLoggedUser';
import { toast } from 'react-toastify';
import { Box, Card, Text, TextInput, Image as ImageM } from '@mantine/core';
import { Icon } from '@iconify/react/dist/iconify.js';
import echo from '@/utils/socket';

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
  image?: string;
}

const ChatList = ({
  id,
  name,
  lastMsg,
  time,
  countMsg,
  selected,
  setSelected,
  setName,
  setMessages,
  inbox,
  messages,
  image,
}: ChatListProps) => {
  const readMsg = (id: number) => {
    Post(`${id}/inbox-read`, {})
      .then((res: any) => {
        console.log(res);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const isActive = selected === id;

  return (
    <div
      onClick={() => {
        setSelected(id);
        name && setName(name);
        readMsg(inbox);
        setMessages({ ...messages, to: id, inbox_id: inbox });
      }}
      className={`flex justify-between py-4 px-5 cursor-pointer transition-all duration-200 border-l-4 ${
        isActive 
          ? 'bg-blue-50/50 border-primary-base' 
          : 'border-transparent hover:bg-gray-50'
      }`}
    >
      <div className='flex gap-3 items-center min-w-0 flex-grow'>
        <div className="relative shrink-0">
          <ImageM 
            src={image ?? '/images/layanan-pelanggan.png'} 
            className="rounded-full border border-gray-100 shadow-sm" 
            w={44} 
            h={44} 
            radius={999}
          />
          {isActive && (
             <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div className="min-w-0 flex-grow">
          <div className="flex justify-between items-baseline gap-2">
            <Text fw={700} size="sm" className="truncate">{name}</Text>
            <Text size="10px" c="dimmed">{time}</Text>
          </div>
          <Text size="xs" c={isActive ? "blue.8" : "dimmed"} className="line-clamp-1 mt-0.5" fw={isActive ? 600 : 400}>
            {lastMsg}
          </Text>
        </div>
      </div>
      <div className='flex flex-col items-end justify-center ml-2 shrink-0'>
        {(countMsg ?? 0) > 0 && (
          <div className='bg-primary-base text-white px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm'>
            {countMsg}
          </div>
        )}
      </div>
    </div>
  );
};

const Chat = () => {
  const [chat, setChat] = useState<InboxListProps[]>([]);
  const [selected, setSelected] = useState<number>(0);
  const [messagerName, setName] = useState<string>('');
  const [user, setUser] = useState<UserProps>();
  const [searchedChats, setSearchedChats] = useState<InboxListProps[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const users = useLoggedUser();
  const [messages, setMessages] = useState<ChatProps>({
    inbox_id: 0,
    from: 0,
    to: selected,
    message: '',
  });

  useEffect(() => {
    if (users) {
      setUser(users);
      if (users.id) {
        getData();
        setMessages({
          ...messages,
          from: users.id,
        });
      }
    }
  }, [users]);

  useEffect(() => {
    if (!echo) {
      console.error("Echo instance not available!");
      return;
    }

    const channelName = `creator-chat.${users?.id}`;
    const channel = echo.channel(channelName);

    if (users?.id) {
      channel.listen('.NewCreatorChat', (data: any) => {
        setChat(chat => ([data.data, ...chat]));
        const audio = new Audio('/audio/live-chat.wav');
        audio.play().catch(() => { });
      });
      channel.listen('.CreatorChat', (data: any) => {
        setChat(chat => chat.map(e => e.id == data.data.inbox_id ? ({
          ...e,
          chats: [
            ...e.chats,
            data.data
          ]
        }) : e));
        const audio = new Audio('/audio/live-chat.wav');
        audio.play().catch(() => { });
      });
    }

    return () => {
      channel.stopListening(".CreatorChat");
    };
  }, [users]);

  const getData = () => {
    Get('inbox', {})
      .then((res: any) => {
        const chatlist = (res as InboxListProps[])
          .filter(e => (Boolean(e.from) && (Boolean(e.to))))
          .filter(e => e.to.id == users?.id)

        setChat(chatlist)
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const sendMessage = (form?: React.FormEvent) => {
    form?.preventDefault();
    if (!messages.message.trim()) return;

    Post('inbox-chat', { ...messages, isCreator: true })
      .then((res: any) => {
        getData();
        setMessages({ ...messages, message: '' })
        setTimeout(() => {
          if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
          }
        }, 100);
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || "Gagal mengirim pesan");
      });
  };

  useEffect(() => {
    if (searchQuery) {
      setSearchedChats(chat.filter(e => e.from.name?.toLowerCase().includes(searchQuery.toLowerCase())));
    } else {
      setSearchedChats([]);
    }
  }, [searchQuery, chat]);

  const messageBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [chat, selected]);

  const currentInbox = chat.find(e => e.from.id == selected);

  return (
    user &&
    user.id && (
      <div className='flex text-dark bg-white h-[calc(100vh-81px)] overflow-hidden'>
        {/* SIDEBAR */}
        <div className='w-[350px] flex flex-col border-r border-light-grey bg-gray-50/20'>
          <div className='p-4 bg-white border-b border-light-grey'>
            <Text fw={800} size="xl" className="mb-4 text-primary-dark">Pesan</Text>
            <TextInput
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftSection={<Icon icon="solar:magnifer-linear" className="text-gray-400" width={18} />}
              placeholder="Cari chat..."
              radius="md"
              size="sm"
              styles={{
                input: { backgroundColor: '#f8f9fa' }
              }}
            />
          </div>

          <div className='flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200'>
            {(searchQuery && searchedChats.length == 0) && (
              <div className="p-8 text-center">
                 <Icon icon="solar:chat-round-unread-linear" width={48} className="text-gray-200 mb-2 mx-auto" />
                 <Text size="sm" c="dimmed">Chat tidak ditemukan</Text>
              </div>
            )}
            
            {chat.length === 0 && (
               <div className="p-8 text-center">
                 <Icon icon="solar:ghost-linear" width={48} className="text-gray-200 mb-2 mx-auto" />
                 <Text size="sm" c="dimmed">Belum ada percakapan</Text>
              </div>
            )}

            {(searchQuery ? searchedChats : chat)
              .sort((a, b) => {
                const aUnread = a.chats.filter(c => c.status === "unread" && c.user_id !== users?.id).length;
                const bUnread = b.chats.filter(c => c.status === "unread" && c.user_id !== users?.id).length;
                if (aUnread !== bUnread) return bUnread - aUnread;
                return new Date(b.chats[0].created_at).getTime() - new Date(a.chats[0].created_at).getTime();
              })
              .map((item: InboxListProps) => (
                <ChatList
                  name={item.from.name ?? ''}
                  lastMsg={item.chats[0].message}
                  time={formatDate(item.chats[0].created_at)}
                  countMsg={item.chats.filter(e => e.status == "unread" && e.user_id != users?.id).length}
                  key={item.from.id}
                  setSelected={setSelected}
                  selected={selected}
                  id={item.from.id ?? 0}
                  setName={setName}
                  setMessages={setMessages}
                  messages={messages}
                  inbox={item.id}
                  image={item.from.has_creator?.image_url}
                />
              ))}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className='flex-grow flex flex-col relative' style={{ 
          backgroundColor: '#e5ddd5',
          backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '400px'
        }}>
          {messagerName !== '' ? (
            <>
              {/* Header */}
              <div className='flex items-center py-3 px-5 h-16 gap-3 bg-white border-b border-light-grey shadow-sm z-10'>
                <ImageM 
                  src={currentInbox?.from.has_creator?.image_url ?? '/images/layanan-pelanggan.png'} 
                  className="rounded-full border border-gray-100 shadow-sm" 
                  w={42} 
                  h={42} 
                  radius={999}
                />
                <div className="flex-grow min-w-0">
                  <Text fw={700} className="truncate line-clamp-1">{messagerName}</Text>
                  <Text size="10px" c="green.7" fw={600} className="uppercase tracking-widest">Active Chat</Text>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Icon icon="solar:menu-dots-bold" width={20} className="text-gray-500" />
                </button>
              </div>

              {/* Messages Content */}
              <div ref={messageBoxRef} className='flex-grow py-6 px-4 gap-3 overflow-y-auto scroll-smooth custom-scrollbar'>
                {(() => {
                  let lastDate: string | null = null;
                  const currentChats = chat
                    .filter(
                      (chatitem: InboxListProps) =>
                        (chatitem.from.id === user.id && chatitem.to.id === selected) ||
                        (chatitem.to.id === user.id && chatitem.from.id === selected)
                    )
                    .flatMap((chatitem) =>
                      chatitem.chats.map((chat) => ({
                        ...chat,
                        fromId: chatitem.from.id,
                        createdAt: chat.created_at,
                      }))
                    )
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

                  if (currentChats.length === 0) {
                    return (
                      <div className="h-full flex flex-col items-center justify-center opacity-40">
                         <Icon icon="solar:chat-square-line-linear" width={64} className="mb-2" />
                         <Text fw={600}>Kirim pesan untuk memulai obrolan</Text>
                      </div>
                    );
                  }

                  return currentChats.map((chatMsg, index) => {
                    const currentDate = formatDateDiff(chatMsg.createdAt);
                    const showDateLabel = currentDate !== lastDate;
                    if (showDateLabel) lastDate = currentDate;

                    const isMine = chatMsg.user_id == user.id;

                    return (
                      <div key={index} className="flex flex-col">
                        {showDateLabel && (
                          <div className='flex justify-center my-6'>
                            <div className="bg-gray-200/60 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-gray-600 py-1 px-3 rounded-full">
                               {currentDate}
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex w-full mb-1 ${isMine ? 'justify-end pl-12' : 'justify-start pr-12'}`}>
                          <div
                            className={`relative group max-w-[85%] md:max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${
                              isMine
                                ? 'bg-primary-base text-white rounded-tr-none'
                                : 'bg-white text-dark rounded-tl-none'
                            }`}
                          >
                            <Text size="sm" className="whitespace-pre-wrap leading-relaxed">{chatMsg.message}</Text>
                            <div className={`flex items-center justify-end gap-1 mt-1.5 opacity-70`}>
                              <span className="text-[9px] font-medium">
                                {new Date(chatMsg.createdAt).toLocaleTimeString('id-Id', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isMine && (
                                <Icon
                                  icon={chatMsg.status == "read" ? "solar:check-read-bold" : "solar:check-line-linear"}
                                  className={`text-[12px] ${chatMsg.status === 'read' ? 'text-blue-200' : 'text-gray-300'}`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Input Bar */}
              <div className='p-4 bg-white/80 backdrop-blur-md border-t border-light-grey'>
                <form onSubmit={sendMessage} className='max-w-4xl mx-auto flex gap-3 items-center'>
                  <button type="button" className='w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors shrink-0'>
                    <Icon icon="solar:paperclip-linear" width={22} />
                  </button>
                  <div className='flex-grow relative'>
                    <TextInput
                      variant="filled"
                      placeholder='Ketik pesan anda...'
                      radius="xl"
                      size="md"
                      value={messages.message}
                      onChange={(e) => setMessages({ ...messages, message: e.target.value })}
                      styles={{
                        input: { 
                          backgroundColor: '#f0f2f5',
                          border: 'none',
                          paddingRight: '15px'
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-11 h-11 flex items-center justify-center rounded-full transition-all shadow-md ${
                      messages.message.trim() ? 'bg-primary-base text-white scale-100 hover:shadow-lg' : 'bg-gray-200 text-gray-400 scale-95 cursor-not-allowed'
                    }`}
                    disabled={!messages.message.trim()}
                  >
                    <Icon icon="solar:paper-plane-bold" width={22} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white">
               <div className="w-1/3 opacity-20 mb-6">
                  <Icon icon="solar:chat-round-line-bold-duotone" width="100%" className="text-primary-dark" />
               </div>
               <Text fw={700} size="xl" c="dimmed">Pilih chat untuk memulai</Text>
               <Text size="sm" c="dimmed" mt={4}>Pilih dari daftar di sebelah kiri untuk melihat percakapan</Text>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default Chat;
