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
import { Box, Card, Text, TextInput } from '@mantine/core';
import { Icon } from '@iconify/react/dist/iconify.js';

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
        <div className='w-10 h-10 rounded-full bg-primary-base'></div>
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
        setMessages({
          ...messages,
          from: users.id,
        });
      }
    }
  }, [users]);

  const getData = () => {
    Get('inbox', {})
      .then((res: any) => {
        setChat(res);
        console.log(res);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const sendMessage = (form?: React.FormEvent) => {
    form?.preventDefault();
    Post('inbox-chat', messages)
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
    getData();
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

          {(searchQuery && searchedChats.length == 0) && (
            <Card>
              <Text size="sm" c="gray">Chat tidak ditemukan</Text>
            </Card>
          )}

          {(searchQuery ? searchedChats : chat)
            .filter((item: InboxListProps) => item.from.id !== user?.id)
            .map((item: InboxListProps) => (
              <ChatList
                name={item.from.name}
                lastMsg={item.chats[0].message}
                time={formatDate(item.chats[0].created_at)}
                countMsg={item.chats.filter(e => e.status == "unread").length}
                key={item.from.id}
                setSelected={setSelected}
                selected={selected}
                id={item.from.id}
                setName={setName}
                setMessages={setMessages}
                messages={messages}
                inbox={item.id}
              />
            ))}
        </div>
        <div className='w-full flex flex-col divide-y divide-primary-light-200 border-l border-l-primary-light-200'>
          {messagerName !== '' && (
            <div className='flex items-center py-4 px-3 h-16 gap-3'>
              <div className='w-10 h-10 rounded-full bg-primary-base'></div>
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
                          chat.fromId !== user.id ? 'items-end' : ''
                        }`}
                      >
                        <div
                          className={`${
                            chat.fromId !== user.id
                              ? 'bg-white text-dark'
                              : 'bg-primary-base text-white'
                          } rounded-xl max-w-56 w-fit p-2 py-1.5 shadow-md flex justify-between my-1 items-end`}
                        >
                          <p className='flex-grow'>{chat.message}</p>
                          <span
                            className={`text-[11px] ml-2 ${
                              chat.fromId !== user.id ? 'text-grey' : 'text-primary-light-200'
                            }`}
                          >
                            {new Date(chat.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </span>
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
                  <button onClick={sendMessage} className={`flex items-center justify-center`}>
                      <FontAwesomeIcon icon={faPaperPlane} className="text-white bg-primary-base w-6 h-6 ms-2 rounded-full p-2" />
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
