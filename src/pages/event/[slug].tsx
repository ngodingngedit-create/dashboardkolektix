import Head from 'next/head';
import bank from '@images/bca.png';
import config from '@/Config';
import Image from 'next/image';
import { useLocalStorage } from 'usehooks-ts';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo, createContext, Dispatch, SetStateAction } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TicketProps, TransactionProps, EventProps } from '@/utils/globalInterface';
import Countdown, { CountdownRendererFn } from 'react-countdown';
import { Get, Post } from '@/utils/REST';
import Link from 'next/link';
import ModalTransaction from '@/components/ModalTransaction';
import { faBookmark as faBookmarkOutlined, faCopy } from '@fortawesome/free-regular-svg-icons';
import { formatDate, formatYear } from '@/utils/useFormattedDate';
import { faArrowLeft, faCalendar, faCheck, faClock, faLocationDot, faShareNodes, faTicket } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { Progress, Spinner } from '@nextui-org/react';
import xendit from '../../assets/images/xendit.png';
import DescriptionBlock from '@/components/Detail/DescriptionBlock';
import TermsConditionBlock from '@/components/Detail/TermsConditionBlock';
import TicketViewBlock from '@/components/Detail/TicketViewBlock';
import useWindowSize from '@/utils/useWindowSize';
import { toast } from 'react-toastify';
import Images from '@/components/Images';
import InputField from '@/components/Input';
import Button from '@/components/Button';
import { useParams, useSearchParams } from 'next/navigation';
import FirstStep from '@/components/Payment/FirstStep';
import SecondStep from '@/components/Payment/SecondStep';
import ThirdStep from '@/components/Payment/ThirdStep';
import ImagesWithModal from '@/components/Images/ImagesWithModal';
import AuthModal from '@/components/AuthModal';
import React from 'react';
import ChatBox from '@/components/chat';
import { validateHeaderName } from 'node:http';
import { Flex, Stack, Text, Image as ImageM, ActionIcon, Box, Card, AspectRatio } from '@mantine/core';
import { Icon } from '@iconify/react/dist/iconify.js';
import { randomId, useClickOutside, useInterval, useListState, useTimeout } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import moment from 'moment';
import fetch from '@/utils/fetch';
import { BookmarkListResponse, BookmarkRequest } from '@/types/bookmark';
import Cookies from 'js-cookie';
import useLoggedUser from '@/utils/useLoggedUser';
import { faBookmark as bookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { modals } from '@mantine/modals';
import { SeatmapData } from '@/utils/formInterface';
import { useTranslation } from 'react-i18next';

interface Form {
    nik: string;
    full_name: string;
    email: string;
    countryCode: string;
    no_telp: string;
    is_pemesan: number;
    identity_type_id: number;
    event_ticket_id: number;
}

interface ErrorForm {
    nik: boolean;
    nama: boolean;
    email: boolean;
    countryCode: boolean;
    phone: boolean;
}

interface FormTicket {
    id?: number;
    event_id: number;
    event_ticket_id: number;
    name: string;
    price: number;
    subtotal_price: number;
    qty_ticket: number;
    payment_status: string;
    seat_number?: string[];
}

interface Transaction {
    data: TransactionProps;
}

const people = [
    { id: 1, name: '+62' },
    { id: 2, name: '+1' },
    { id: 3, name: '+2' },
    { id: 4, name: '+3' },
    { id: 5, name: '+4' }
];

export const Context = createContext<{
    seatmapData?: SeatmapData[];
    seatmapOpen?: number;
    setSeatmapOpen?: Dispatch<SetStateAction<number | undefined>>;
    ticket?: FormTicket[];
    setTicket?: Dispatch<SetStateAction<FormTicket[]>>;
    eventData?: EventProps;
    counts?: { [key: string]: number | string[] };
    setCounts?: Dispatch<SetStateAction<{ [key: string]: number | string[] }>>;
}>({});

const EventDetails = () => {
    const { t } = useTranslation();
    const { width } = useWindowSize();
    const [menu, setMenu] = useState(1);
    const [step, setStep] = useState(0);
    const [isFormValid, setIsFormValid] = useState(false);
    const [selectedDate, setSelectedDate] = useState<number>(0);
    const [ticket, setTicket] = useState<FormTicket[]>([]);
    const [firstLoad, setFirstLoad] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [transactionData, setTransactionData] = useState<TransactionProps | null>(null);
    const [xenditInvoice, setXenditInvoice] = useState<any>(null);
    const isBrowser = () => typeof window !== 'undefined';
    const [selected, setSelected] = useState(people[1]);
    const [payment, setPayment] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<any>(null);
    const [venueLayout, setVenueLayout] = useState<any>(null);
    const [paymentList, setPaymentList] = useState<PaymentMethod[]>([]);
    const [form, setForm] = useState<Form[]>([]);
    const [error, setError] = useState<ErrorForm>({
        nik: false,
        nama: false,
        email: false,
        countryCode: true,
        phone: false
    });
    const [bank, setBank] = useState<string>('');
    const [data, setData] = useState<TicketProps[]>([]);
    const [detail, setDetail] = useState<EventProps>();
    const [counts, setCounts] = useState<{ [key: string]: number | string[] }>({});
    const [isLogin, setIsLogin] = useState<boolean>(false);
    const [triggered, setTriggered] = useState<boolean>(false);
    const [showModalTransaction, setShowModalTransaction] = useState<boolean>(false);
    const totalCount = Object.values(counts).reduce((sum, count) => (sum as number) + ((typeof count == 'number' ? count : count.length) as number), 0) as number;
    const router = useRouter();
    const { slug } = router.query;
    const selectedTab = Number(Cookies.get('selected'));
    const key = 'key';
    const initialValue = { transactionStorage: 'value' };
    const [alert, setAlert] = useState('');
    const [openChat, setOpenChat] = useState(false);
    const [bookmark, setBookmark] = useState(false);
    const [loadings, setLoadings] = useListState<string>();
    const [seatmapOpen, setSeatmapOpen] = useState<number>();
    const [voucher, setVoucher] = useState<{id:number, name: string; amount: number }[]>([]);
    const user = useLoggedUser();

    const clickOutsideChat = useClickOutside(() => {
        if (isLogin && openChat) {
            setTimeout(() => {
                setOpenChat(false);
            }, 500);
        }
    });

    useEffect(() => {
        const bookmarked = user?.bookmarked?.find(e => Boolean(e.event_id) && e.event_id == detail?.id);
        setBookmark(Boolean(bookmarked));
    }, [user]);

    const toggleBookmark = () => {
        if (!bookmark) {
            toggleBookmarkFetch();
            setBookmark(true);
        } else {
            modals.openConfirmModal({
                centered: true,
                title: 'Hapus dari bookmark',
                children: 'Apakah kamu yakin ingin menghapus event ini dari bookmark?',
                labels: { cancel: 'Batal', confirm: 'Hapus' },
                onConfirm: () => {
                    toggleBookmarkFetch(false);
                    setBookmark(false);
                }
            })
        }
    }

    const toggleBookmarkFetch = async (status: boolean = true) => {
        if (!status) {
            const bookid = user?.bookmarked?.find(e => e.event_id == detail?.id)?.id;
            if (!bookid) {
                toast.error('Gagal Menghapus');
                return;
            }

            await fetch<any, any>({
                url: 'bookmark/' + bookid,
                method: 'DELETE',
                before: () => setLoadings.append('bookmark'),
                success: () => {
                    const data = JSON.parse(Cookies.get('bookmarked') ?? '[]') as BookmarkListResponse[];
                    Cookies.set('bookmarked', JSON.stringify(data.filter(e => e.event_id != detail?.id)));
                    toast.info('Berhasil menghapus ke bookmark');
                },
                complete: () => setLoadings.filter(e => e != 'bookmark'),
                error: () => toast.error('Gagal Menghapus')
            });
            return;
        }

        await fetch<BookmarkRequest, BookmarkListResponse>({
            url: 'bookmark-user',
            method: 'POST',
            data: {
                module_id: 1,
                type: 'Event',
                event_id: detail?.id ?? 0
            },
            before: () => setLoadings.append('bookmark'),
            success: ({ data: newData }) => {
                const data = JSON.parse(Cookies.get('bookmarked') ?? '[]') as BookmarkListResponse[];
                Cookies.set('bookmarked', JSON.stringify([...data, newData]));
                toast.info('Berhasil menambahkan ke bookmark')
            },
            complete: () => setLoadings.filter(e => e != 'bookmark'),
        });
    }

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard
            .writeText(url)
            .then(() => {
                setAlert('Tautan berhasil disalin!'); // Pass a string value to setAlert
                setTimeout(() => setAlert(''), 1000); // Sembunyikan alert setelah 3 detik
            })
            .catch((error) => {
                console.error('Gagal menyalin tautan:', error);
            });
    };

    const countdownRenderer: CountdownRendererFn = ({ minutes, seconds, completed }) => {
        if (completed) {
            return <p>Time Out</p>;
        } else {
            return (
                <p className="font-semibold">
                    {String(minutes).padStart(2, '0')} : {String(seconds).padStart(2, '0')}
                </p>
            );
        }
    };

    const [localStorage, setLocalStorage] = useLocalStorage(key, initialValue, {
        initializeWithValue: false
    });

    const openDatabase = (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('myDatabase', 1);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('transactionStore')) {
                    db.createObjectStore('transactionStore', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    };

    const saveDataToIndexedDB = async (data: object) => {
        try {
            const db = await openDatabase();
            const transaction = db.transaction('transactionStore', 'readwrite');
            const store = transaction.objectStore('transactionStore');

            store.put({ id: 'transactionStorage', data });

            transaction.oncomplete = () => {
                //console.log('Data berhasil disimpan ke IndexedDB');
                router.push('/transaction-woauth');
            };

            transaction.onerror = (error) => {
                console.error('Kesalahan saat menyimpan data ke IndexedDB:', error);
            };
        } catch (error) {
            console.error('Kesalahan saat membuka database IndexedDB:', error);
        }
    };

    const setLocalStorageValue = () => {
        //console.log('Menghapus data dari IndexedDB');

        openDatabase()
            .then((db) => {
                const transaction = db.transaction('transactionStore', 'readwrite');
                const store = transaction.objectStore('transactionStore');
                store.delete('transactionStorage');

                transaction.oncomplete = () => {
                    //console.log('Data berhasil dihapus dari IndexedDB');
                };

                transaction.onerror = (error) => {
                    console.error('Kesalahan saat menghapus data dari IndexedDB:', error);
                };
            })
            .catch((error) => {
                console.error('Kesalahan saat membuka database IndexedDB:', error);
            });

        const dataToStore = {
            detail,
            ticket,
            totalSubtotalPrice,
            totalCount,
            form,
            countdowns: Date.now() + 15 * 60 * 1000
        };

        saveDataToIndexedDB(dataToStore);
    };

    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(xenditInvoice.bank_account_number);
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            setIsCopied(false);
        }
    };

    useEffect(() => {
        if (detail?.one_id_one_ticket) {
            if (totalCount > 0) {
                const initialForm = Array.from({ length: totalCount + 1 }, (_, index) => ({
                    nik: '',
                    full_name: '',
                    email: '',
                    countryCode: '',
                    no_telp: '',
                    is_pemesan: index ? 0 : 1,
                    identity_type_id: 1,
                    event_ticket_id: 1
                }));
                setForm(initialForm);
            }
        } else {
            setForm([
                {
                    nik: '',
                    full_name: '',
                    email: '',
                    countryCode: '',
                    no_telp: '',
                    is_pemesan: 0,
                    identity_type_id: 1,
                    event_ticket_id: 1
                }
            ]);
        }
    }, [totalCount, detail?.one_id_one_ticket]);

    useEffect(() => {
        const availableIndex = data.findIndex((ticket) => ticket.is_soldout === 0 && ticket.is_finish === 0);
        if (selectedTab) {
            setSelectedDate(selectedTab);
            //console.log(selectedTab);
        } else if (availableIndex !== -1 && selectedDate === null) {
            setSelectedDate(availableIndex);
            //console.log(`Available Index: ${availableIndex}`);
        }
    }, [selectedTab, data]);

    const ticketCount = Cookies.get('ticketCount');
    const prevPath = Cookies.get('prevPath');
    const getData = () => {
        setFirstLoad(true);
        Get(`event/${slug}`, {})
            .then((res: any) => {
                //console.log('Response Data:', res.data); // Log data respons

                setVenueLayout(res.data.has_venue_layout);
                setDetail({...res.data, seatmap: res?.data?.seatmap ? JSON.parse(res?.data?.seatmap) : undefined});
                setData(res.data.has_event_ticket.map((e: any) => ({...e, avaliable_seat_number: e?.avaliable_seat_number?.split(',')})));
                ticketCount && prevPath === router.asPath ? setCounts(JSON.parse(ticketCount)) : initializeCounts(res.data.has_event_ticket);
                ticketCount && setMenu(2);
                if (!triggered) {
                    triggerCounter(res.data.id);
                }
                setFirstLoad(false);
            })
            .catch((err: any) => {
                //console.log('Error:', err); // Log error

                setFirstLoad(false);
            });
    };

    const handleShowModal = () => {
        setShowModalTransaction(!showModalTransaction);
    };
    useEffect(() => {
        const userData = Cookies.get('token');
        userData !== undefined ? setIsLogin(true) : setIsLogin(false);
    }, []);


    // SUBMIT DATA
    const submitData = () => {
        console.log('submitData');
        console.log('voucher', voucher);
        setLoading(true);
        if (payment !== '') {
            getPaymentMethodById(payment);
        }

        const userData: string | undefined = Cookies.get('user_data');
        const userId = userData ? JSON.parse(userData).id : '';
        const now = new Date();
        now.setTime(now.getTime() + 24 * 60 * 60 * 1000);
        const isoString = now.toISOString();

        var payload: { [key: string]: any } = {
            user_id: userId,
            event_id: detail?.id,
            admin_fee: detail?.admin_fee ?? 0,
            payment_status: 'pending',
            vouchers: voucher.length > 0 ? voucher.map(v => ({
                voucher_id: v.id,
                voucher_code: v.name,
                voucher_amount: v.amount
            })) : [],
            identities: form,
            tickets: ticket.map(e => ({...e, seatnumber_ticket: JSON.stringify(e.seat_number)})),
            grandtotal: detail ? totalSubtotalPrice + detail.admin_fee * totalCount + (detail.ppn || 0) - voucher.reduce((sum, v) => sum + v.amount, 0) : 0,
            bank_code: bank ?? 'xendit',
            expiration_date: isoString,
            payment_method: (paymentList?.find(e => e?.payment_name?.toLowerCase() == 'xendit') ?? { id: 0 }).id.toString()
        };

        if (payment) payload.payment_method = payment;

        setLoading(true);
        Post('transaction', payload)
            .then((res: any) => {
                if (res?.isFree) {
                    router.push('/success/' + res.invoice_no);
                    return;
                }

                setTransactionData(res.data);

                if (res.xendit_invoice && res.xendit_invoice.va_number) {
                    //console.log(res.xendit_invoice);
                    setXenditInvoice(res.xendit_invoice.va_number[0]);
                }

                if (res.data) {
                    setStep(100);
                    scrollToTop();
                }
            })
            .catch((err: any) => {
                if (err?.response?.data?.out_of_stock) {
                    // toast.error(`Maaf, tiket yang tersedia tidak mencukupi`);
                    notifications.show({
                        color: 'red',
                        position: 'top-right',
                        message: `Maaf, tiket yang tersedia tidak mencukupi`
                    });
                    // router.push('/event');
                } else {
                    // toast.error(err?.response?.data?.message || err?.message || 'Terjadi kesalahan.');
                    notifications.show({
                        color: 'red',
                        position: 'top-right',
                        message: err.response?.data?.message
                    });
                }
                if ((err?.response?.data?.message ?? err?.message) === 'The account is not registered yet') {
                    router.push('/auth');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const initializeCounts = (data: TicketProps[]) => {
        const initialCount: Record<number, number> = {};
        data.forEach((item) => {
            initialCount[item.id] = 0;
        });
        setCounts(initialCount);
    };

    const updateDataBasedOnCounts = () => {
        const newData: FormTicket[] = Object.keys(counts)
            .filter((id) => (typeof counts[parseInt(id)] == 'number' ? counts[parseInt(id)] : (counts[parseInt(id)] as string[]).length) as number > 0)
            .map((id, idx) => ({
                id: parseInt(id),
                event_id: detail?.id ?? 0,
                event_ticket_id: parseInt(id),
                price: data[data.findIndex((el) => el.id === parseInt(id))].price,
                name: data[data.findIndex((el) => el.id === parseInt(id))].name,
                subtotal_price: data[data.findIndex((el) => el.id === parseInt(id))].price * (typeof counts[id] == 'number' ? counts[id] : counts[id].length),
                qty_ticket: (typeof counts[parseInt(id)] == 'number' ? counts[parseInt(id)] : (counts[parseInt(id)] as string[]).length) as number,
                payment_status: 'pending',
                seat_number: (typeof counts[parseInt(id)] == 'object' ? counts[parseInt(id)] : undefined) as (string[] | undefined)
            }));

        setTicket(newData);
        // //console.log(newData, 'aw');
    };

    const triggerCounter = (id: string) => {
        if (data) {
            setFirstLoad(true);
            if (!triggered) {
                Post('event-counter', { event_id: id })
                    .then((res) => {
                        //console.log(res);
                        setFirstLoad(false);
                        setTriggered(true);
                    })
                    .catch((err) => {
                        //console.log(err);
                        setTriggered(true);
                        setFirstLoad(false);
                    });
            }
        }
    };

    let totalPrice = 0;
    let totalQty = 0;

    ticket.forEach((item) => {
        totalPrice += item.price;
        totalQty += item.qty_ticket;
    });

    let totalSubtotalPrice = 0;

    ticket.forEach((item) => {
        totalSubtotalPrice += item.subtotal_price;
    });
    useEffect(() => {
        if (slug) {
            getData();
            getPaymentMethod();
        }
        //eslint-disable-next-line
    }, [slug]);

    useEffect(() => {
        if (data.length > 0) {
            updateDataBasedOnCounts();
        }
        //eslint-disable-next-line
    }, [counts]);

    function scrollToTop() {
        if (!isBrowser()) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const isOnePayment = (detail?.has_event_payment_method.length ?? 2) <= 1;

    const submitForm = () => {

        console.log('submitForm');

        if (detail) {
            if (isOnePayment) {
                console.log('isOnePayment');
                setPayment((paymentList?.find(e => e?.id === 4) ?? { id: 0 }).id.toString())
                submitData();
            } else {
                setStep(66);
            }
        }
        scrollToTop();
    };

    const getPaymentMethodById = (id: string) => {
        setLoading(true);
        Get(`payment-method/${id}`, {})
            .then((res: any) => {
                // //console.log(res);
                setPaymentMethod(res.data);
            })
            .catch((err: any) => {
                //console.log(err);
                setLoading(false);
            });
    };

    const getPaymentMethod = () => {
        setFirstLoad(true);
        Get(`payment-method`, {})
            .then((res: any) => {
                //console.log(res, 'metod');
                setPaymentList(res);
                setFirstLoad(false);
            })
            .catch((err: any) => {
                //console.log(err);
                setFirstLoad(false);
            });
    };

    const renderer: CountdownRendererFn = ({ minutes, seconds, completed }) => {
        if (completed) {
            router.back();
        } else {
            return (
            <p className='font-semibold'>
                {String(minutes).padStart(2, '0')} : {String(seconds).padStart(2, '0')}
            </p>
            );
        }
    };

    const params = useSearchParams();
    const stepParams = params.get('step');
    const [authModalVisible, setAuthModalVisible] = useState(false);

    const handleChatClick = () => {
        const userData = Cookies.get('user_data');

        if (userData) {
            // If user is logged in, navigate to /chat
            router.push('/chat');
        } else {
            // If user is not logged in, show the AuthModal
            setAuthModalVisible(true);
        }
    };

    useEffect(() => {
        if (slug) {
            if (step > 32) {
                slug && router.push(`/event/${slug}?step=${step}`);
            } else {
                router.push(`/event/${slug}`);
            }
        }
        //eslint-disable-next-line
    }, [step, slug]);

    function padToTwoDigits(num: number) {
        return num.toString().padStart(2, '0');
    }
    const now = new Date();
    const targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    useEffect(() => {
        if (step !== 100) {
            const unloadCallback = (e: any) => {
                e.preventDefault();
                e.returnValue = '';
                return '';
            };
            window.addEventListener('beforeunload', unloadCallback);
            return () => window.removeEventListener('beforeunload', unloadCallback);
        }
    }, [step]);

    const dayName = days[targetDate.getDay()];
    const day = padToTwoDigits(targetDate.getDate());
    const month = months[targetDate.getMonth()];
    const year = targetDate.getFullYear();
    const hours = padToTwoDigits(targetDate.getHours());
    const minutes = padToTwoDigits(targetDate.getMinutes());

    const formattedDate = `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}`;
    
    const isGratis = useMemo(() => {
        if (data) {
            const total = data.reduce((q, n) => q + (n.price ?? 0), 0);
            return total <= 0;
        } else {
            return false;
        }
    }, [data]);

    function isCurrentTimeBetween(startDate: string, endDate: string): boolean {
        const start = moment(startDate, 'YYYY-MM-DD HH:mm:ss');
        const end = moment(endDate, 'YYYY-MM-DD HH:mm:ss');
        const now = moment();

        return now.isBetween(start, end, undefined, '[]');
    }

    function isDatePassed(dateString: string) {
        const date = moment(dateString, 'YYYY-MM-DD HH:mm:ss');
        return date.isBefore(moment());
    }

    const countdownTime = useMemo(() => {
        const targetDate = new Date();
        targetDate.setMinutes(targetDate.getMinutes() + 15);

        return targetDate;
    }, []);

    const addVoucher = (data:{id:number, name: string; amount: number }) => {
        console.log("add Voucher", data);
        //setVoucher(...voucher, data);
        setVoucher((prevVouchers) => [...prevVouchers, data]); 
    }

    useEffect(() => {
        console.log('voucher', voucher);
    }, [voucher]);

    return !firstLoad && detail ? (
        detail && (
            <Context.Provider value={{ seatmapData: detail.seatmap, seatmapOpen, setSeatmapOpen, ticket, setTicket, counts, setCounts, eventData: detail }}>
            <div className="text-dark w-full">
                <div ref={clickOutsideChat} className={`${openChat ? '' : 'hidden'}`}>
                    <ChatBox toggleOpenTab={() => setOpenChat(!openChat)} openTab={openChat} creatorIdOpen={parseInt(detail.creator_id)} />
                    <AuthModal visible={openChat && !isLogin} onClose={() => setOpenChat(false)} />
                </div>
                <Head>
                    <meta name="author" content="PT.Kolektix Maju Bersama" />
                    <meta name="copyright" content="&copy;2024 kolektix Maju Bersama" />
                    <meta name="description" content={detail ? detail?.description.replace(/(<([^>]+)>)/gi, '') : ''} />
                    {/* <meta
                      name='keywords'
                      content='kolektix, amis, konser amis, amis darurat judi, malas tour, amis malas tour 2024, konser amis kolektix, beli konser amis, tiket konser band, amis, darurat judi, bagaimana &amp; jika kristen masuk sorga , majelis agama, konser amis, Kolektix &amp; Amis Kolaborasi'
                    /> */}
                    <meta name="robots" content="index, follow" />
                    <meta name="googlebot" content="index, follow" />
                    <title>Kolektix.com | {detail?.name}</title>
                </Head>
                {menu === 1 && (
                    <>
                        <div className="fixed bottom-0 opacity-90 w-full bg-white border-2 border-t-primary-light border-x-0 border-b-0 drop-shadow-md z-30">
                            <div className="flex justify-between items-center py-3 px-5">
                                <p className="text-sm font-bold">{detail?.name}</p>
                                <Link href="#ticket-picker">
                                    <button
                                        className="bg-primary-base text-white px-4 py-2 font-semibold text-sm rounded-md disabled:bg-primary-disabled disabled:cursor-not-allowed"
                                        onClick={() => {
                                            setMenu(2);
                                        }}
                                    >
                                        {isGratis ? t('registrationTicketTab') : t('openTicketTab')}
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
                {step !== 0 &&
                    step !== 2 &&
                    stepParams !== null &&
                    width &&
                    (width < 768 ? (
                        <>
                            <div className="w-full sticky top-0 bg-primary-base z-50">
                                <div className="flex items-center justify-between px-5 py-3">
                                    <div className="flex items-center">
                                        <button onClick={() => (step === 100 ? setStep(66) : step === 33 ? (ticketCount ? window.location.reload() : setStep(0)) : setStep(33))}>
                                            <FontAwesomeIcon icon={faArrowLeft} className="mr-3 text-white" />
                                        </button>
                                        <div>
                                            <p className="text-white text-xs mb-1">{step === 33 ? '1 ' : step === 66 ? '2 ' : '3 '}dari 3</p>
                                            <p className="text-white text-sm font-semibold">{step === 33 ? 'Informasi Pribadi' : step === 66 ? 'Konfirmasi' : 'Pembayaran'}</p>
                                        </div>
                                    </div>
                                    <div className="">
                                        <button
                                            disabled={loading}
                                            className="text-white text-xs mb-1"
                                            // onClick={() => (step === 33 ? setStep(66) : setStep(100))}
                                        >
                                            {t('next')}
                                        </button>
                                        <p className="text-white text-sm">{step === 33 ? 'Konfirmasi' : 'Pembayaran'}</p>
                                    </div>
                                </div>

                                <Progress size="sm" color="success" aria-label="Loading..." value={step} />
                            </div>
                            <div className="w-full fixed flex justify-between gap-3 bottom-0 bg-white border-t-2 border-t-primary-light-200 z-50 p-5">
                                <div className='hidden lg:flex items-center gap-0 md:gap-3 bg-[#EA4D3E] text-white px-3 py-2 rounded-md'>
                                    <Countdown date={countdownTime} renderer={renderer} />
                                    <div className='w-[1px] mx-1 md:mx-0 h-5 bg-primary-light-200'></div>
                                    <p className='text-xs'>{t('completeYourOrder')}</p>
                                </div>
                                <Flex align="center" gap={10}>
                                    <Button color="secondary" label={t('previous')} onClick={() => (step === 100 ? setStep(66) : step === 33 ? (ticketCount ? window.location.reload() : setStep(0)) : setStep(33))} />
                                    {step === 66 ? (
                                        <Button color="primary" label={t('next')} loading={loading} disabled={loading || payment === ''} onClick={submitData} />
                                    ) : step === 100 && transactionData ? (
                                        <Button
                                            color="primary"
                                            label="Bayar Sekarang"
                                            disabled={loading || payment === ''}
                                            onClick={
                                                payment === '4' && transactionData.xendit_url
                                                    ? () => {
                                                        setLoading(true);
                                                        router.push(transactionData.xendit_url);
                                                    }
                                                    : payment === '3'
                                                    ? () => {
                                                        setStep(3);
                                                        scrollToTop();
                                                    }
                                                    : () => {
                                                        setStep(2);
                                                        scrollToTop();
                                                    }
                                            }
                                        />
                                    ) : (
                                        <Button color="primary" label={t('next')} loading={loading} disabled={!isFormValid || loading} onClick={() => (step === 33 ? isOnePayment ? submitForm() : ((detail ? totalSubtotalPrice + detail.admin_fee * totalCount + (detail.ppn || 0) : 0) == 0 ? submitData() : setStep(66)) : setStep(100))}/>// onClick={() => (step === 33 ? isOnePayment ? setStep(66) : submitForm() : setStep(100))} />
                                    )}
                                </Flex>
                            </div>
                        </>
                    ) : (
                        <div className="w-full fixed flex justify-between gap-3 bottom-0 bg-white border-t-2 border-t-primary-light-200 z-50 p-5">
                            <div className='hidden lg:flex items-center gap-0 md:gap-3 bg-[#EA4D3E] text-white px-3 py-2 rounded-md'>
                                <Countdown date={countdownTime} renderer={renderer} />
                                <div className='w-[1px] mx-1 md:mx-0 h-5 bg-primary-light-200'></div>
                                <p className='text-xs'>{t('completeYourOrder')}</p>
                            </div>
                            <Flex align="center" gap={10}>
                                <Button color="secondary" label={t('previous')} onClick={() => (step === 100 ? setStep(66) : step === 33 ? (ticketCount ? window.location.reload() : setStep(0)) : setStep(33))} />
                                {step === 66 ? (
                                    <Button color="primary" label={t('next')} loading={loading} disabled={loading || payment === ''} onClick={submitData} />
                                ) : step === 100 && transactionData ? (
                                    <Button
                                        color="primary"
                                        label="Bayar Sekarang"
                                        disabled={loading || payment === ''}
                                        onClick={
                                            payment === '4' && transactionData.xendit_url
                                                ? () => {
                                                    setLoading(true);
                                                    router.push(transactionData.xendit_url);
                                                }
                                                : payment === '3'
                                                ? () => {
                                                    setStep(3);
                                                    scrollToTop();
                                                }
                                                : () => {
                                                    setStep(2);
                                                    scrollToTop();
                                                }
                                        }
                                    />
                                ) : (
                                    <Button disabled={!isFormValid || loading} color="primary" loading={loading} label={t('next')} onClick={() => (step === 33 ? isOnePayment ? submitForm() : ((detail ? totalSubtotalPrice + detail.admin_fee * totalCount + (detail.ppn || 0) : 0) == 0 ? submitData() : setStep(66)) : setStep(100))} />
                                )}
                            </Flex>
                        </div>
                    ))}

                {step === 0 &&
                    stepParams === null &&
                    (width && width > 768 ? (
                        <>
                            <div className="bg-primary-dark">
                                <div className="max-w-7xl mx-auto">
                                    <Flex justify="space-between" align="end" className="px-8 pt-20 pb-3">
                                        <div>
                                            <p className={`text-white/70 mb-[-10px]`}>{detail?.has_category_event?.name}</p>
                                            <h3 className="text-white font-bold my-4 text-2xl">{detail?.name}</h3>
                                        </div>

                                        {!isDatePassed(`${detail?.start_date} ${detail?.start_time}:00`) && (
                                            <Stack gap={12} align="end">
                                                <Text size="xs" c="white">{t('eventStartsIn')}</Text>
                                                <EventCountdown startdate={detail?.start_date} starttime={detail?.start_time} />
                                            </Stack>
                                        )}
                                    </Flex>
                                    <div className="flex justify-between px-8 gap-5 h-full items-stretch">
                                          <Stack w="100%">
                                            <Box pos="relative">
                                                {detail && detail.image && <ImagesWithModal type="event" path={detail?.image} width={1000} height={1000} alt="banner" className="w-full h-72 object-fill lg:rounded-3xl md:rounded-2xl rounded-full" />}

                                                {isCurrentTimeBetween(`${detail?.start_date} ${detail?.start_time}:00`, `${detail?.end_date} ${detail?.end_time}:00`) && (
                                                    <Card className={`!absolute z-20 top-3 right-3 w-fit !rounded-full !border !border-white/50 backdrop-blur-sm`} p="4px 16px 4px 30px" bg="#00000030">
                                                        <Flex gap={10} align="center">
                                                            <Icon icon="ph:dot-duotone" className={`absolute top-2/4 left-0 -translate-y-2/4 !text-[40px] mr-[-20px] animate-pulse !text-red-500`} />
                                                            <Icon icon="mynaui:video" className={`!text-[24px] !text-red-500`} />
                                                            <Text fw={600} c="white" size="xs">Live Event</Text>
                                                        </Flex>
                                                    </Card>
                                                )}
                                            </Box>

                                            <div className="flex justify-between items-center text-white px-5 py-4">
                                                <div className="flex items-center gap-4">
                                                    {detail.has_event_social_meida?.instagram && (
                                                        <Link href={detail.has_event_social_meida?.instagram} target="_blank" rel="noreferrer" className="flex items-center">
                                                            <FontAwesomeIcon icon={faInstagram} className="mr-2 text-lg " />
                                                            <p className=" font-normal text-sm mr-3">{detail.has_event_social_meida.ig_name}</p>
                                                        </Link>
                                                    )}
                                                    {/* {detail.has_event_social_meida?.facebook && (
                                                      <Link
                                                        href={detail.has_event_social_meida?.facebook}
                                                        target='_blank'
                                                        rel='noreferrer'
                                                        className='flex items-center'
                                                      >
                                                        <FontAwesomeIcon icon={faFacebook} className='mr-2 text-lg ' />
                                                        <p className=' font-normal text-sm'>{detail.name}</p>
                                                      </Link>
                                                    )} */}
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="relative">
                                                        <button onClick={handleShare} className="flex items-center">
                                                            <FontAwesomeIcon icon={faShareNodes} className="mr-3 text-xl" />
                                                        </button>
                                                        {alert && <div className="absolute top-0 left-0 mt-2 bg-dark text-white shadow-lg animate-fade-in-out">Copy</div>}
                                                    </div>
                                                    {isLogin && (
                                                        <Box onClick={toggleBookmark}>
                                                            <FontAwesomeIcon  icon={bookmark ? bookmarkSolid : faBookmarkOutlined} className="text-xl " />
                                                        </Box>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-5 max-w-5xl pb-4 flex-grow">
                                                <button onClick={() => setMenu(1)} className={`cursor-pointer ${menu === 1 ? 'font-semibold text-[#82b3ff]' : 'text-white'}`}>
                                                    {t('description')}
                                                </button>
                                                <button onClick={() => setMenu(2)} className={`cursor-pointer ${menu === 2 ? 'font-semibold text-[#82b3ff]' : 'text-white'}`}>
                                                    {t('ticket')}
                                                </button>
                                                <button onClick={() => setMenu(3)} className={`cursor-pointer ${menu === 3 ? 'font-semibold text-[#82b3ff]' : 'text-white'}`}>
                                                    {t('termAndCondition')}
                                                </button>
                                            </div>
                                          </Stack>
                                        
                                        <Stack className={`w-full md:max-w-[300px] pb-[20px]`} gap={10}>
                                          <div className="px-[25px] pt-[15px] pb-[10px] bg-white rounded-3xl dark:bg-gray-800 dark:border-gray-700 shadow-md h-fit flex flex-col">
                                            <Stack gap={12}>
                                              <Flex align="center" gap={10}>
                                                <Icon icon="solar:calendar-bold" className={`text-primary-base text-[20px]`} />
                                                <Text>{detail && `${formatDate(detail.start_date)} ${detail.start_date !== detail.end_date ? '- ' + formatDate(detail.end_date) : ''} ${formatYear(detail.end_date)}`}</Text>
                                              </Flex>
                                              <Flex align="center" gap={10}>
                                                <Icon icon="tabler:clock-filled" className={`text-primary-base text-[20px]`} />
                                                <Text>{detail?.start_time.toString()} - {detail?.end_time.toString()}</Text>
                                              </Flex>
                                              <Link href={detail?.location_map ?? "#"} target="_blank">
                                                <Flex align="center" gap={10}>
                                                    <Icon icon="tdesign:location-filled" className={`text-primary-base text-[20px]`} />
                                                    <Text>{detail?.location_name}</Text>
                                                </Flex>
                                              </Link>
                                              <Text size="sm" c="gray">{t('organizedBy')}</Text>
                                              <ImageM src={`${config.assetUrl}creator/${detail?.has_creator?.image}`} alt="image" radius={8} mt={-5} w="30%" miw={100} mah={300} />
                                            </Stack>
                                          </div>

                                          <Button label="Chat" color="secondary" className={`!text-[18px] !font-[600]`} onClick={() => setOpenChat(!openChat)}/>
                                          <Button onClick={() => setMenu(2)} label={ isGratis ? t('registrationTicketTab') : t('buyTicket') } color="secondary" className={`${menu === 2 && 'hidden'} !text-[18px] !font-[600]`}/>
                                        </Stack>
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 max-w-7xl mx-auto text-dark">
                                {menu === 1 && <DescriptionBlock data={detail?.description} />}
                                {menu === 2 && (
                                    <div id="ticket-view">
                                        <TicketViewBlock venue={venueLayout} maxOrder={detail.max_buy_ticket} isGratis={isGratis} selected={selectedDate} setSelected={setSelectedDate} counts={counts} setCounts={setCounts} data={data} isLogin={isLogin} totalCount={totalCount} storeLocalStorage={setLocalStorageValue} totalSubtotalPrice={totalSubtotalPrice} setStep={setStep} scrollToTop={scrollToTop} />
                                    </div>
                                )}
                                {menu === 3 && <TermsConditionBlock data={detail?.term_condition} />}
                            </div>
                        </>
                    ) : (
                        <>
                            <Box className={`!relative`}>
                                {detail && detail.image && <Images type="event" path={detail?.image} width={1000} height={1000} alt="banner" className="w-full rounded-3xl p-4 mt-16 lg:mt-0" />}

                                {(isCurrentTimeBetween(`${detail?.start_date} ${detail?.start_time}:00`, `${detail?.end_date} ${detail?.end_time}:00`)) && (
                                    <Card className={`!absolute z-20 top-7 right-7 w-fit !rounded-full !border !border-white/50 backdrop-blur-sm`} p="4px 16px 4px 30px" bg="#00000030">
                                        <Flex gap={10} align="center">
                                            <Icon icon="ph:dot-duotone" className={`absolute top-2/4 left-0 -translate-y-2/4 !text-[40px] mr-[-20px] animate-pulse !text-red-500`} />
                                            <Icon icon="mynaui:video" className={`!text-[24px] !text-red-500`} />
                                            <Text fw={600} c="white" size="xs">Live Event</Text>
                                        </Flex>
                                    </Card>
                                )}

                            </Box>

                            <Flex justify="space-between" gap={10} px={20} display="none">
                                <Box>
                                </Box>

                                {/* {!isDatePassed(`${detail?.start_date} ${detail?.start_time}:00`) && (
                                    <Flex align="center" gap={5} className={` bottom-7 right-7`}>
                                        {timeToEvent.map((e, i) => (
                                            // <AspectRatio key={i}>
                                                <Card key={i} radius={10} p={0} className={`border border-black/50 backdrop-blur-sm`} py={5} px={10}>
                                                    <Flex align="center" justify="center" h="100%" gap={3} c="black">
                                                        <Text fw={600} size="14px">{e[0]}</Text>
                                                        <Text size="9px">{e[1]}</Text>
                                                    </Flex>
                                                </Card>
                                            // </AspectRatio>
                                        ))}
                                    </Flex>
                                )} */}
                            </Flex>

                            <div className="p-5 pt-2 border-primary-light-200 border-2 border-x-0 border-t-0 border-dashed">
                                <Flex gap={10} justify="space-between" mb={5} align="center">
                                  {/* <Stack gap={5}> */}
                                    <p className={`opacity-70`}>{detail?.has_category_event?.name}</p>
                                    {detail.has_event_social_meida?.ig_name	 && (
                                        <Link href={detail.has_event_social_meida?.instagram + '/' + detail.has_event_social_meida?.ig_name} target="_blank" rel="noreferrer" className="flex items-center">
                                            <Flex gap={8} align="center">
                                                <FontAwesomeIcon icon={faInstagram} className="!text-[24px] text-primary-base" />
                                                <Text size="sm" className={`!text-primary-base`}>{detail.has_event_social_meida?.ig_name}</Text>
                                            </Flex>
                                        </Link>
                                    )}
                                  {/* </Stack> */}
                                </Flex>
                                <h3 className="mb-3">{detail?.name}</h3>
                                <p className="mb-3 font-normal text-sm">
                                    <FontAwesomeIcon icon={faCalendar} className="mr-3 text-grey" />
                                    <span className="text-dark">{detail && `${formatDate(detail?.start_date)}  ${detail.end_date !== detail.start_date ? '-' + formatDate(detail?.end_date) : ''}`}</span>
                                </p>
                                <p className="mb-3 font-normal text-sm">
                                    <FontAwesomeIcon icon={faClock} className="mr-3 text-grey" />
                                    <span className="text-dark">
                                        {detail?.start_time} - {detail?.end_time}
                                    </span>
                                </p>
                                <Link href={detail?.location_map ?? "#"} target="_blank">
                                    <p className="mb-3 font-normal text-sm">
                                        <FontAwesomeIcon icon={faLocationDot} className="mr-3 text-grey" />
                                        <span className="text-dark">{detail?.location_name}</span>
                                    </p>
                                </Link>
                            </div>
                            <div className="p-5 border-primary-light-200 border-2 border-t-0 border-x-0 flex items-center gap-3">
                                <Image src={`${config.assetUrl}creator/${detail?.has_creator?.image}`} alt="image" className="w-10 h-10 border border-grey rounded-full object-contain" width={200} height={200} />
                                <div className={`w-full`}>
                                    <p>{t('organizedBy')}</p>
                                    <p className="font-semibold">{detail?.has_creator?.name}</p>
                                </div>
                                <ActionIcon color="#0B387C" variant="transparent" size="lg">
                                    <Icon icon="fluent:chat-12-regular" className={`!text-[30px]`} onClick={() => setOpenChat(!openChat)}/>
                                </ActionIcon>
                            </div>
                            <div className="flex bg-white items-center justify-center sticky mb-5 top-16 text-sm z-20">
                                <div className="flex gap-5 w-full border-2 text-grey border-primary-light-200 border-x-0 border-t-0 px-8">
                                    <button onClick={() => setMenu(1)} className={` py-2 cursor-pointer ${menu === 1 && 'font-semibold text-dark border-2 border-b-primary-base border-x-0 border-t-0 py-3'}`}>
                                        {t('description')}
                                    </button>
                                    <button onClick={() => setMenu(2)} className={`py-2 cursor-pointer ${menu === 2 && 'font-semibold text-dark border-2 border-b-primary-base border-x-0 border-t-0 py-3'}`}>
                                        {isGratis ? t('ticketRegistration') : t('ticket')}
                                    </button>
                                    <button onClick={() => setMenu(3)} className={`py-2 cursor-pointer ${menu === 3 && 'font-semibold text-dark border-2 border-b-primary-base border-x-0 border-t-0 py-3'}`}>
                                        {t('termAndCondition')}
                                    </button>
                                </div>
                            </div>
                            <div className="px-5 w-full text-dark">
                                {menu === 1 && <DescriptionBlock data={detail?.description} />}
                                {menu === 2 && <TicketViewBlock venue={venueLayout} maxOrder={detail.max_buy_ticket} isGratis={isGratis} selected={selectedDate} setSelected={setSelectedDate} counts={counts} setCounts={setCounts} data={data} isLogin={isLogin} totalCount={totalCount} storeLocalStorage={setLocalStorageValue} totalSubtotalPrice={totalSubtotalPrice} setStep={setStep} scrollToTop={scrollToTop} />}
                                {menu === 3 && <TermsConditionBlock data={detail?.term_condition} />}
                            </div>
                        </>
                    ))}


                {stepParams === '33' && <FirstStep 
                                            //onSubmitVoucher={e => setVoucher(e)} 
                                            onSubmitVoucher={addVoucher}
                                            detail={detail} 
                                            ticket={ticket} 
                                            totalSubtotalPrice={totalSubtotalPrice} 
                                            totalCount={totalCount} 
                                            form={form} 
                                            setForm={setForm} 
                                            error={error} 
                                            onSubmit={submitForm} 
                                            setFormValid={setIsFormValid} 
                                        />}
                {stepParams === '66' && <SecondStep voucher={voucher} detail={detail} ticket={ticket} totalSubtotalPrice={totalSubtotalPrice} totalCount={totalCount} onSubmit={submitData} payment={payment} setPayment={setPayment} setBank={setBank} loading={loading} paymentList={detail.has_event_payment_method.map(e => e.has_payment_method)} />}
                {stepParams === '100' && <ThirdStep voucher={voucher} scrollToTop={scrollToTop} setLoading={setLoading} setStep={setStep} transactionData={transactionData} xenditInvoice={xenditInvoice} loading={loading} />}
                {step === 2 && transactionData && (
                    <div className="bg-primary-light px-4 sm:px-6 md:px-8 lg:px-8 mt-20 mb-4">
                        {detail && detail.image_url && <Image src={detail?.image_url} width={1000} height={1000} alt="banner" className="w-full h-72 object-cover lg:rounded-3xl md:rounded-2xl rounded-medium" />}

                        <div className="bg-white mt-4">
                            <div className="border-b-2 p-3 border-primary-light">
                                <Countdown date={targetDate} intervalDelay={0} precision={3} renderer={renderer} autoStart={true} />
                            </div>
                            <div className="border-b-2 p-3 border-primary-light flex gap-3"></div>
                        </div>

                        <div className="bg-white mt-1">
                            <div className="border-b-2 p-3 border-primary-light flex gap-3">
                                <div className="flex items-center gap-3">
                                    <p className=" font-semibold">{paymentMethod.payment_name}</p>
                                    <Image src={bank} alt="BCA" />
                                </div>
                            </div>
                            <div className="bg-white mt-1">
                                <div className="border-b-2 p-3 border-primary-light flex flex-col gap-2">
                                    <div>
                                        <p className="text-xs text-grey mb-1">Kode Invoice</p>
                                        <p className="text-sm mb-1">{transactionData.invoice_no}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-grey mb-1">No. Rekening</p>
                                        <p className="text-sm mb-1">{paymentMethod.account_no}</p>
                                        <p className="text-xs mb-1">Atas Nama {paymentMethod.account_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-grey mb-1">Total Pembayaran</p>
                                        <p className="text-sm mb-1">{`Rp${transactionData.grandtotal.toLocaleString('id-ID')}`}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white mt-1">
                            <div className="border-b-2 p-3 border-primary-light flex flex-col gap-2">
                                <div className="flex justify-between">
                                    <p className="text-xs text-grey mb-1">Regular Ticket {`x(${transactionData.total_qty})`}</p>
                                    <p className="text-xs mb-1">Rp {transactionData.total_price.toLocaleString('id-ID')}</p>
                                </div>
                                {voucher && (
                                    <div className="flex justify-between">
                                        {voucher.map((v) => (
                                            <p key={v.id} className="text-xs text-grey mb-1">Voucher {v.name}</p>
                                        ))}
                                        <p className="text-xs mb-1">Rp {voucher.reduce((sum, v) => sum + v.amount, 0).toLocaleString('id-ID')}</p>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-grey mb-1">Pajak</p>
                                    <p className="text-xs mb-1">Rp {transactionData.ppn ? transactionData.ppn.toLocaleString('id-ID') : 0}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-grey mb-1">Biaya Admin</p>
                                    <p className="text-xs mb-1">
                                        Rp {transactionData.admin_fee ? transactionData.admin_fee.toLocaleString('id-ID') : 0}
                                    </p>
                                </div>
                                <div className="border-t-2 border-primary-light">
                                    <div className="flex items-center justify-between font-semibold">
                                        <p>Total Pembayaran</p>
                                        <p>{`Rp ${(transactionData.grandtotal - (voucher ? voucher.reduce((sum, v) => sum + v.amount, 0) : 0)).toLocaleString('id-ID')}`}</p>
                                    </div>
                                    {transactionData.xendit_url ? (
                                        <button className="w-full bg-primary-dark text-white py-2 rounded-lg my-3" onClick={() => router.push(transactionData.xendit_url)}>
                                            {loading ? <Spinner color="default" size="sm" /> : 'Checkout'}
                                        </button>
                                    ) : (
                                        <button className="w-full bg-primary-dark text-white py-2 rounded-lg my-3" onClick={() => handleShowModal()}>
                                            {loading ? <Spinner color="default" size="sm" /> : 'Upload Bukti Pembayaran'}
                                        </button>
                                    )}
                                    <ModalTransaction id={transactionData.id} invoice={transactionData.invoice_no} isOpen={showModalTransaction} setIsOpen={setShowModalTransaction} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {step === 3 && transactionData && xenditInvoice && (
                    <div className="bg-primary-light max-w-xl pt-16 mx-auto">
                        {detail && detail.image_url && <Image src={detail?.image_url} width={1000} height={1000} alt="banner" className="w-full" />}

                        <div className="bg-white">
                            <div className="border-b-2 p-3 border-primary-light">
                                <Countdown date={targetDate} intervalDelay={0} precision={3} renderer={renderer} autoStart={true} />
                            </div>
                            <div className="border-b-2 p-3 border-primary-light flex gap-3"></div>
                        </div>

                        <div className="bg-white mt-1">
                            <div className="border-b-2 p-3 border-primary-light flex gap-3">
                                <div className="flex items-center gap-3">
                                    <p className="font-semibold">{xenditInvoice.bank_code}</p>
                                    {/* <Image src={paymen} alt='BCA' /> */}
                                </div>
                            </div>
                            <div className="bg-white mt-1">
                                <div className="border-b-2 p-3 border-primary-light flex flex-col gap-2">
                                    <div>
                                        <p className="text-xs text-grey mb-1">Kode Invoice</p>
                                        <p className="text-sm mb-1">{transactionData.invoice_no}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-grey mb-1">No. Virtual Account</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm mb-1">{xenditInvoice.bank_account_number}</p>
                                            <button onClick={handleCopy} className="hover:bg-primary-light-200 p-1 rounded-md">
                                                <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} />
                                            </button>
                                        </div>
                                        {/* <p className='text-xs mb-1'>Atas Nama {paymentMethod.account_name}</p> */}
                                    </div>
                                    <div>
                                        <p className="text-xs text-grey mb-1">Total Pembayaran</p>
                                        <p className="text-sm mb-1">{`Rp${xenditInvoice.transfer_amount.toLocaleString('id-ID')}`}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white mt-1">
                            <div className="border-b-2 p-3 border-primary-light flex flex-col gap-2">
                                <div className="flex justify-between">
                                    <p className="text-xs text-grey mb-1">Regular Ticket {`x(${transactionData.total_qty})`}</p>
                                    <p className="text-xs mb-1">Rp {transactionData.total_price.toLocaleString('id-ID')}</p>
                                </div>
                                {voucher && (
                                    <div className="flex justify-between">
                                        {voucher.map((v) => (
                                            <p key={v.id} className="text-xs text-grey mb-1">Voucher {v.name}</p>
                                        ))}
                                        <p className="text-xs mb-1">Rp {voucher.reduce((sum, v) => sum + v.amount, 0).toLocaleString('id-ID')}</p>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-grey mb-1">Pajak</p>
                                    <p className="text-xs mb-1">Rp {transactionData.ppn ? transactionData.ppn.toLocaleString('id-ID') : 0}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-grey mb-1">Biaya Admin</p>
                                    <p className="text-xs mb-1">
                                        Rp {transactionData.admin_fee ? transactionData.admin_fee.toLocaleString('id-ID') : 0}
                                    </p>
                                </div>
                                <div className="border-t-2 border-primary-light">
                                    <div className="flex items-center justify-between font-semibold">
                                        <p>Total Pembayaran</p>
                                        <p>{`Rp${(transactionData.grandtotal - (voucher ? voucher.reduce((sum, v) => sum + v.amount, 0) : 0)).toLocaleString('id-ID')}`}</p>
                                    </div>
                                    <Link href={`/success/${transactionData.invoice_no}`} target="_blank">
                                        <button className="w-full bg-primary-dark text-white py-2 rounded-lg my-3">{loading ? <Spinner color="default" size="sm" /> : 'Cek Status Pembayaran'}</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            </Context.Provider>
        )
    ) : (
        <Spinner color="primary" size="lg" className="min-h-screen flex items-center justify-center" />
    );
};

const EventCountdown = ({ startdate, starttime }: { startdate?: string, starttime?: string}) => {
    const { t } = useTranslation();
    const [timoutHash, setTimeoutHash] = useState('');
    const interval = useInterval(() => setTimeoutHash(randomId()), 1000);

    useEffect(() => {
        interval.start();
    }, []);

    const timeToEvent = useMemo((): [number, string][] => {
        const date = `${startdate} ${starttime}`;
        const targetDate = new Date(date);
        const now = new Date();
        const diffInSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);

        if (diffInSeconds < 0) {
            return []; // Jika tanggal sudah lewat, kembalikan array kosong
        }

        const secondsInMinute = 60;
        const secondsInHour = 3600;
        const secondsInDay = 86400;

        const days = Math.floor(diffInSeconds / secondsInDay);
        const hours = Math.floor((diffInSeconds % secondsInDay) / secondsInHour);
        const minutes = Math.floor((diffInSeconds % secondsInHour) / secondsInMinute);
        const seconds = diffInSeconds % secondsInMinute;

        const result: [number, string][] = [];
        if (days > 0) result.push([days, t('hari')]);
        result.push([hours, t('jam')]);
        result.push([minutes, t('menit')]);
        result.push([seconds, t('detik')]);
        return result;
    }, [timoutHash]);

    return (
        <Flex align="center" gap={5} className={`! bottom-3 right-3`} mb={10}>
            {timeToEvent.map((e, i) => (
                <AspectRatio key={i}>
                    <Card w={42} radius={10} p={0} className={`border border-white/50 backdrop-blur-sm !bg-black/20`} key={i}>
                        <Stack align="center" justify="center" h="100%" gap={3} c="white">
                            <Text fw={600} size="16px">{e[0]}</Text>
                            <Text size="9px">{e[1]}</Text>
                        </Stack>
                    </Card>
                </AspectRatio>
            ))}
        </Flex>
    );
}

export default EventDetails;
