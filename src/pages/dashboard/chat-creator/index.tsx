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
  return (
    <div
      onClick={() => {
        setSelected(id);
        name && setName(name);
        readMsg(inbox);
        setMessages({ ...messages, to: id, inbox_id: inbox });
      }}
      className={`flex justify-between py-3 px-4 min-h-16 max-h-16 cursor-pointer ${
        selected === id && 'bg-primary-light-200'
      }`}
    >
      <div className='flex gap-3 items-center'>
        <ImageM src={image ?? '/images/layanan-pelanggan.png'} className="rounded-full shrink-0" w={36} h={36} radius={999}/>
        <div>
          <p className='font-semibold'>{name}</p>
          <p className='text-xs'>{lastMsg}</p>
        </div>
      </div>
      <div className='flex flex-col items-center'>
        <p className='text-xs text-primary-base'>{time}</p>
        {(countMsg ?? 0) > 0 && (
          <div className='bg-primary-base text-white w-6 flex items-center justify-center rounded-full text-xs mt-1'>
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

        // const newChannelName = `new-creator-chat.${users?.id}`;
        // const newChannel = echo.channel(newChannelName);
        const channelName = `creator-chat.${users?.id}`;
        const channel = echo.channel(channelName);

        if (users?.id) {
            channel.listen('.NewCreatorChat', (data: any) => {
                setChat(chat => ([data.data, ...chat]));
                const audio = new Audio('/audio/live-chat.wav');
                audio.play();
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
                audio.play();
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
        console.log(chatlist, res, users?.id);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const sendMessage = (form?: React.FormEvent) => {
    form?.preventDefault();
    Post('inbox-chat', {...messages, isCreator: true})
      .then((res: any) => {
        console.log(res);
        getData();
        setMessages({ ...messages, message: '' })
        if (messageBoxRef.current) {
          messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
        }
      })
      .catch((err: any) => {
        toast.error(err.response.data.message);
      });
  };

  useEffect(() => {
  }, []);

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
    user &&
    user.id &&
    chat.length > 0 && (
      <div className='flex text-dark h-[calc(100vh_-_81px)]'>
        <div className='w-1/3 flex flex-col divide-y divide-primary-light-200'>

          <Box p={5}>
            <TextInput
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftSection={<Icon icon="uiw:search" />}
              placeholder="Cari Chat"
              variant="unstyled"
            />
          </Box>

          <Card p={0} h="100%" className={`!overflow-y-auto`}>
            {(searchQuery && searchedChats.length == 0) && (
              <Card>
                <Text size="sm" c="gray">Chat tidak ditemukan</Text>
              </Card>
            )}

            {(searchQuery ? searchedChats : chat)
              .filter((item: InboxListProps) => item.to.id == user?.id)
              .sort((a, b) => {
                const aUnread = a.chats.some(chat => chat.status === "unread");
                const bUnread = b.chats.some(chat => chat.status === "unread");
                if (aUnread && !bUnread) return -1;
                if (!aUnread && bUnread) return 1;
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
                />
              ))}
          </Card>
        </div>
        <div className='w-full flex flex-col divide-y divide-primary-light-200 border-l border-l-primary-light-200'>
          {messagerName !== '' && (
            <div className='flex items-center py-4 px-3 h-16 gap-3'>
              <ImageM src={chat.find(e => e.from.id == selected)?.from.has_creator?.image_url ?? '/images/layanan-pelanggan.png'} className="rounded-full shrink-0" w={36} h={36} radius={999}/>
              <div>
                <p className='font-semibold'>{messagerName}</p>
              </div>
            </div>
          )}
          <div ref={messageBoxRef} className=' py-4 px-3 h-full gap-3 bg-chat overflow-y-scroll'>
            {(() => {
              let lastDate: string | null = null; // Deklarasi tipe data yang lebih spesifik
              return chat
                .filter(
                  (chatitem: any) =>
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
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((chat, index) => {
                  const currentDate = formatDateDiff(chat.createdAt);
                  const showDateLabel = currentDate !== lastDate;

                  if (showDateLabel) {
                    lastDate = currentDate;
                  }

                  return (
                    <div key={index}>
                      {/* Label Tanggal */}
                      {showDateLabel && (
                        <div className='flex justify-center'>
                          <Chip size='sm'>{currentDate}</Chip>
                        </div>
                      )}
                      {/* Pesan Masuk */}
                      <div
                        className={`flex flex-col gap-2 px-16 ${
                          chat.user_id == user.id ? 'items-end' : ''
                        }`}
                      >
                        <div
                          className={`${
                            chat.user_id == user.id
                              ? 'bg-white text-dark'
                              : 'bg-primary-base text-white'
                          } rounded-xl max-w-56 w-fit p-2 py-1.5 shadow-md flex justify-between my-1 items-end`}
                        >
                          <p className='flex-grow'>{chat.message}</p>
                          <span
                            className={`text-[11px] ml-2 ${
                              chat.user_id == user.id ? 'text-grey' : 'text-primary-light-200'
                            }`}
                          >
                            {new Date(chat.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </span>
                          {chat.user_id == user.id && (
                            <Icon
                              icon={chat.status == "read" ? "solar:check-read-linear" : "ci:check"}
                              className={`text-grey text-[18px] ml-[3px]`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
            })()}
          </div>
          {selected ? (
            <div className='sticky flex justify-center bottom-0 bg-white py-3 border border-primary-light-200'>
              <form onSubmit={sendMessage} className={`w-full px-[20px]`}>
                <div className='flex gap-2'>
                  {/* <button className='text-dark-grey w-10 h-10 hover:bg-primary-light-200 rounded-full'>
                    <FontAwesomeIcon icon={faPaperclip} />
                  </button> */}
                  <div className='flex-grow'>
                    <InputField
                      type='text'
                      placeholder='Ketik pesan anda'
                      fullWidth
                      value={messages.message}
                      onChange={(e) => setMessages({ ...messages, message: e.target.value })}
                    />
                  </div>
                  <button
                    className='text-white bg-primary-dark w-10 h-10 hover:bg-primary-base flex items-center justify-center rounded-full'
                    onClick={sendMessage}
                  >
                    <Image src={paperplane} alt='paperplane' />
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    )
  );
};

export default Chat;
