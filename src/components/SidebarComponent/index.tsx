import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '../../assets/images/logo-creator-white.png';
import LogoSquare from '../../assets/images/logosquare.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useLoggedUser from '@/utils/useLoggedUser';
import { faChevronCircleDown, faBell as Bell, faTicket, faBars, faClose, faHome, faHouse, faBriefcase, faGift, faStar, faLocationDot, faBuildingColumns, faChevronLeft, faChevronRight, faUpload, faEye, faTableColumns, faRightFromBracket, faSquareArrowUpRight } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import { faBell, faFileLines, faIdBadge, faCalendar, faArrowAltCircleRight, faMap, faArrowAltCircleLeft, faCalendarDays, faBookmark, faEdit, faMessage, IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { UserProps } from '@/utils/globalInterface';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Fade from '../Transition';
import Avatar from '../../assets/images/avatar.jpg';
import Image from 'next/image';
import Button from '../Button';
import Burgers from '../Burgers';
import { truncate } from 'fs';
import { useParams } from 'next/navigation';
import { Get } from '@/utils/REST';
import config from '@/Config';
import axios from 'axios';
import { useClickOutside } from '@mantine/hooks';
import { Flex, Stack, Text, Tooltip } from '@mantine/core';
import { Icon } from '@iconify/react/dist/iconify.js';

type SidebarData = {
    id: number;
    name: string;
    icon?: IconDefinition;
    iconify?: string;
    link?: string;
    role: UserProps['role'];
    submenu?: Omit<SidebarData, 'submenu'>;
}[];

const profileData: SidebarData[number]['submenu'] = [
    {
        id: 1,
        name: 'Profile Saya',
        icon: faIdBadge,
        link: '/dashboard/profile',
        role: 'Pembeli'
    },
    {
        id: 2,
        name: 'Profile Creator',
        icon: faIdBadge,
        link: '/dashboard/profile',
        role: 'Creator'
    },
    {
        id: 3,
        name: 'Alamat Saya',
        icon: faMap,
        link: '/dashboard/profile/address',
        role: 'Pembeli'
    },
    {
        id: 4,
        name: 'Alamat Saya',
        icon: faMap,
        link: '/dashboard/profile/address',
        role: 'Creator'
    },
    {
        id: 5,
        name: 'Informasi Legal',
        icon: faFileLines,
        link: '/dashboard/legal',
        role: 'Creator'
    },
    {
        id: 6,
        name: 'Rekening Saya',
        icon: faBuildingColumns,
        link: '/dashboard/bank',
        role: 'Creator'
    }
];

const sidebarData: SidebarData = [
    { id: 1, name: 'Dashboard', icon: faHome, link: '/dashboard', role: 'Creator', iconify: undefined },
    { id: 1, name: 'Dashboard', icon: faHome, link: '/dashboard', role: 'Staff', iconify: undefined },
    { id: 1, name: 'Dashboard', icon: faHome, link: '/dashboard/user', role: 'Pembeli', iconify: undefined },
    { id: 1, name: 'Dashboard', icon: faHome, link: '/dashboard/admin', role: 'Admin', iconify: undefined },
    { id: 1, name: 'Event', iconify: 'mdi:event-star', link: '/dashboard/admin/event', role: 'Admin' },
    { id: 1, name: 'Bookmark', link: '/dashboard/bookmark', role: 'Pembeli', iconify: 'material-symbols:bookmark' },
    { id: 2, name: 'Tiket Saya', icon: faTicket, link: '/dashboard/my-ticket', role: 'Pembeli' },
    { id: 3, name: 'Event', iconify: 'mdi:event-star', role: 'Staff', submenu: [
        {
            id: 1,
            name: 'Event Saya',
            icon: faCalendar,
            link: '/dashboard/my-event',
            role: 'Staff'
        },
        {
            id: 1,
            name: 'Check In Event',
            iconify: 'lets-icons:in',
            link: '/dashboard/my-event/checkin',
            role: 'Staff'
        },
        {
            id: 1,
            name: 'Report Event',
            iconify: 'carbon:report',
            link: '/dashboard/my-event/report',
            role: 'Staff'
        }
    ] },
    { id: 3, name: 'Event', iconify: 'mdi:event-star', role: 'Creator', submenu: [
        {
            id: 1,
            name: 'Event Saya',
            icon: faCalendar,
            link: '/dashboard/my-event',
            role: 'Creator'
        },
        {
            id: 1,
            name: 'Check In Event',
            iconify: 'lets-icons:in',
            link: '/dashboard/my-event/checkin',
            role: 'Creator'
        },
        {
            id: 1,
            name: 'Report Event',
            iconify: 'carbon:report',
            link: '/dashboard/my-event/report',
            role: 'Creator'
        }
    ] },
    { id: 4, name: 'Lowongan', icon: faBriefcase, link: '/dashboard/vacancy', role: 'Creator' },
    { id: 20, name: 'Transaksi Lainnya', iconify: 'icon-park-solid:transaction', link: '/dashboard/transaction', role: 'Pembeli' },
    { id: 5, name: 'Profile Talenta', icon: faStar, link: '/dashboard/talenta', role: 'Pembeli' },
    { id: 6, name: 'Merchandise', icon: faGift, role: 'Creator', submenu: [
        {
            id: 1,
            name: 'Kelola Merchandise',
            icon: faGift,
            link: '/dashboard/merch',
            role: 'Creator'
        },
        {
            id: 1,
            name: 'POS Merchandise',
            iconify: 'hugeicons:cashier',
            link: '/dashboard/merch-pos',
            role: 'Creator'
        }
    ]},
    { id: 7, name: 'Venue', icon: faLocationDot, role: 'Creator', submenu: [
        {
            id: 1,
            name: 'Kelola Venue',
            icon: faLocationDot,
            link: '/dashboard/venue',
            role: 'Creator'
        },
        {
            id: 1,
            name: 'Buat Booking Venue',
            iconify: 'fluent:form-48-regular',
            link: '/dashboard/venue-pos',
            role: 'Creator'
        }
    ]},
    { id: 8, name: 'Pesan', icon: faMessage, link: '/dashboard/chat', role: 'Pembeli' },
    { id: 8, name: 'Pesan', icon: faMessage, link: '/dashboard/chat-creator', role: 'Creator' },
    { id: 9, name: 'Account Saya', icon: faIdBadge, role: 'Creator', submenu: profileData },
    { id: 9, name: 'Account Saya', icon: faIdBadge, role: 'Pembeli', submenu: profileData }
];

const SidebarComponent = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const { slug } = router.query;
    const users = useLoggedUser();
    const { route } = router;
    const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
    const [openMenu, setOpenMenu] = useState<{ [key: number]: boolean }>({});
    const [userData, setUserData] = useState<UserProps>();
    const [hasCreator, setHasCreator] = useState<boolean>(false);
    const [pop, setIsPop] = useState<boolean>(true);
    const [role, setRole] = useState<UserProps['role']>('Pembeli');
    const [open, setOpen] = useState<boolean>(false);
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const [hasNotification, setHasNotification] = useState<boolean>(false);
    const [collapse, setCollapse] = useState<boolean>(false);
    const current = Cookies.get('hasCreator');
    const params = useParams();
    const [withdrawData, setWithdrawData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const outsideClick = useClickOutside(() => {
        if (window?.innerWidth < 768) {
            setCollapse(false);
        }
    });
    const outsideClickMenu = useClickOutside(() => {
        setShowUserMenu(false);
    });

    const getWithdrawData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.wsUrl}api/withdraw`);
            const result = response.data;

            if (Array.isArray(result.data)) {
                console.log('Data withdraw:', result.data);
                setWithdrawData(result.data);
            } else {
                console.warn('Fetched data is not an array:', result);
                setWithdrawData([]);
            }
        } catch (err) {
            console.error('Error fetching withdraw data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getWithdrawData();
    }, []);

    const toggleSubmenu = (id: number) => {
        setOpenMenu((prevState) => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };
    useEffect(() => {
        if (users) {
            setUserData(users);
            if (route === '/dashboard/user') {
                setRole('Pembeli');
            } else {
                if (users.has_creator || users?.role == 'Staff') {
                    setHasCreator(true);
                }
                setRole(users?.role ?? 'Pembeli');
            }
        }
    }, [users]);

    // useEffect(() => {
    //     if (current === 'true' && hasCreator) {
    //         setRole(users?.role ?? 'Creator');
    //     } else {
    //         setRole('Pembeli');
    //     }
    // }, [current, hasCreator]);

    useEffect(() => {
        // if (route === '/dashboard/user') {
        //     setRole('Pembeli');
        // }
    }, [route]);

    const [visible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (!collapse) {
            timeout = setTimeout(() => {
                setIsVisible(false);
            }, 75);
        } else {
            timeout = setTimeout(() => {
                setIsVisible(true);
            }, 400);
        }

        return () => clearTimeout(timeout);
    }, [collapse]);

    const handleLogout = () => {
        Cookies.remove('token', { path: '/' });
        Cookies.remove('user_data', { path: '/' });
        Cookies.remove('prevPath', { path: '/' });
        Cookies.remove('ticketCount', { path: '/' });
        if (route !== '/') {
            router.push('/').then(() => window.location.reload());
        } else {
            window.location.reload();
        }
    };

    const handleItemClick = () => {
        setCollapse(false);
    };

    return (
        <div>
            <div className="flex max-w-[100vw] !overflow-x-hidden">
                <nav
                    ref={outsideClick}
                    className={`
                        fixed md:static shrink-0
                        flex flex-col
                        bg-primary-darker duration-300 left-0 h-[100vh]
                        overflow-y-hidden scrollbar-gutter transition-all ease-in-out delay-150 z-50
                        ${collapse ? 'w-[280px]' : 'w-0 md:w-[65px]'}
                    `}
                >
                    <ul className={`w-full flex-grow overflow-x-hidden ${collapse ? '' : 'overflow-y-hidden'}`}>
                        <li className={`${collapse ? 'px-5 py-4' : 'px-3 py-3'} bg-[#031f4d]`}>
                            <Link href="/" className="flex items-center justify-center">
                                {collapse ? <Image src={Logo} alt="Logo" className="w-1/2" /> : <Image src={LogoSquare} alt="Logo" className={` ${collapse ? 'opacity-0' : 'opacity-100 '} transition-all delay-300 ease-in-out w-[40px] h-[40px] object-contain`} />}
                            </Link>
                        </li>
                        <li className="border border-[#1b3a6a] border-x-0 border-t-0 p-2 mb-3 mt-2">
                            <div className="flex items-center gap-3 px-3 [&_*]:!text-white w-full">
                                <Image src={Avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                                {visible && (
                                    <>
                                        <div className={`w-full ${collapse ? 'opacity-100 delay-200' : 'opacity-0 delay-75'} transition-opacity `}>
                                            <p className="text-sm">{userData && userData.has_creator ? userData.has_creator?.name : userData?.name}</p>
                                            <p className="text-[10px] ">{role}</p>
                                        </div>
                                        <div>
                                            {hasCreator && role != "Staff" && (
                                                <button className={`bg-[#1b3a6a] w-8 h-8 rounded-md ${collapse ? 'opacity-100 delay-200' : 'opacity-0 delay-75'} transition-opacity `} onClick={() => setIsPop(!pop)}>
                                                    <FontAwesomeIcon icon={faChevronCircleDown} className={`${pop ? 'rotate-0' : 'rotate-180'}  ${collapse ? 'opacity-100' : 'opacity-0'} transition-transform delay-100 ease-in-out duration-200 text-white`} />
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className={`${(collapse ? pop : true) ? 'opacity-0 h-0' : 'opacity-100'} ${role == 'Staff' ? '!hidden' : ''} transition-all delay-100 ease-in-out duration-200 p-4 [&_*]:!text-white`}>
                                <div className="flex justify-between mb-2">
                                    <Flex align="center" gap={7}>
                                        <Icon icon="hugeicons:money-03" />
                                        <p className="text-sm">Saldo</p>
                                    </Flex>
                                    <p className="text-sm ">Rp.0</p>
                                </div>
                                <div className="flex justify-between">
                                    <Flex align="center" gap={7}>
                                        <Icon icon="ph:money-wavy" />
                                        <p className="text-sm">Kredit</p>
                                    </Flex>
                                    <p className="text-sm ">Rp.0</p>
                                </div>
                                <div className="items-center">
                                    <Link href={'/dashboard/withdraw'}>
                                        <button
                                            className="w-full bg-[#1b3a6a] text-white py-2 rounded-md mt-3 text-xs"
                                            onClick={() => setIsPop(!pop)} // Menutup kolaps ketika tombol Detail diklik
                                        >
                                            Detail
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </li>

                        <>
                            {sidebarData
                                .filter((el) => el.role === role)
                                .map((el) => (
                                    <Tooltip label={el.name} position="right" bg="white" c="gray.8" className={`shadow-lg ${collapse ? '!opacity-0' : ''}`} key={el.id}>
                                    <li key={el.id} className={`${router.pathname === el.link ? 'bg-[#1b3a6a] border-l-3 border-white text-white' : 'pl-[3px]  text-primary-light-200'} list-none transition-transform-colors`}>
                                        {el.link ? (
                                            <Link href={el.link} className="" onClick={handleItemClick}>
                                                <div className="flex px-5 items-center hover:bg-[#1b3a6a] py-3">
                                                    <div className="w-5 h-5 flex justify-center items-center">
                                                        {el.iconify ? (
                                                            <Icon icon={el.iconify ?? ''} className={`h-5 w-5`} />
                                                        ) : el.icon && <FontAwesomeIcon icon={el.icon} className="w-5 h-5" />}
                                                    </div>
                                                    {visible && <p className={`text-sm ml-3 ${collapse ? 'opacity-100 ' : 'opacity-0 '} transition-opacity delay-700`}>{el.name}</p>}
                                                </div>
                                            </Link>
                                        ) : (
                                            <div onClick={() => {toggleSubmenu(el.id); setCollapse(true);}} className="cursor-pointer">
                                                <div className="flex px-5 items-center justify-between hover:bg-[#1b3a6a] py-3">
                                                    <div className="flex items-center">
                                                        <div className="w-5 h-5 flex justify-center items-center">
                                                            <div className="w-5 h-5 flex justify-center items-center">
                                                                {el.iconify ? (
                                                                    <Icon icon={el.iconify ?? ''} className={`h-5 w-5`} />
                                                                ) : el.icon && <FontAwesomeIcon icon={el.icon} className="w-5 h-5" />}
                                                            </div>
                                                        </div>
                                                        {visible && <p className={`text-sm ml-3 ${collapse ? 'opacity-100 ' : 'opacity-0 '} transition-opacity delay-700`}>{el.name}</p>}
                                                    </div>
                                                    {el.submenu && visible && (
                                                        <button>
                                                            <FontAwesomeIcon icon={faChevronLeft} className={`${openMenu[el.id] ? '-rotate-90' : ''} transition-transform`} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {el.submenu && (
                                            <ul className={`${openMenu[el.id] && visible ? 'max-h-80' : 'max-h-0'} ml-[10px] transition-max-height duration-150 ease-in-out`}>
                                                {el.submenu
                                                    .filter((subEl) => subEl.role === role)
                                                    .map((subEl, i) => (
                                                        <li key={i} className={`list-none ${openMenu[el.id] && visible ? 'visible opacity-100' : 'invisible opacity-0'} ${router.pathname === subEl.link ? 'bg-[#1b3a6a] border-l-3 border-white text-white' : 'pl-[3px] hover:bg-[#1b3a6a] text-primary-light-200'} py-3 transition-transform-colors-opacity`}>
                                                            <Link href={subEl.link ?? '#'} onClick={handleItemClick}>
                                                                <div className="flex px-5 items-center">
                                                                    <div className="w-5 h-5 flex justify-center items-center">
                                                                        {subEl.iconify ? (
                                                                            <Icon icon={subEl.iconify ?? ''} className={`h-5 w-5 text-white`} />
                                                                        ) : subEl.icon && <FontAwesomeIcon icon={subEl.icon} className="w-5 h-5" />}
                                                                    </div>
                                                                    {visible && <p className={`text-sm ml-3 ${collapse ? 'opacity-100 delay-200' : 'opacity-0 delay-75'} transition-opacity`}>{subEl.name}</p>}
                                                                </div>
                                                            </Link>
                                                        </li>
                                                    ))}
                                            </ul>
                                        )}
                                    </li>
                                    </Tooltip>
                                ))}
                        </>
                    </ul>
                    <button onClick={() => setCollapse(!collapse)} className="sticky bottom-0 pl-[3px] bg-[#031f4d] hover:bg-[#1b3a6a] text-primary-light-200 py-4 text-sm transition-transform-colors w-full">
                        <div className="flex items-center justify-center px-5">
                            {visible && <p className={`${collapse ? 'w-full' : 'w-0 hidden'} overflow-hidden transition-all delay-700`}>Persingkat Menu </p>}
                            <FontAwesomeIcon icon={faChevronLeft} className={`${collapse ? 'rotate-0' : 'rotate-180'} transition-all ease-in-out`} />
                        </div>
                    </button>
                </nav>
                <div className="w-full overflow-x-hidden">
                    <div className={`transition-all ease-in-out delay-150 overflow-y-auto max-h-[100vh] max-w-[100%]`}>
                        <div className="pr-6 py-3 border border-x-0 border-t-0 border-primary-light-200 text-dark flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Burgers isOpen={collapse} setIsOpen={setCollapse} />
                                {/* <h3>
                                    {route === '/dashboard'
                                        ? 'Dashboard'
                                        : route === '/dashboard/my-ticket'
                                        ? 'Tiket Saya'
                                        : route === '/dashboard/profile'
                                        ? 'Informasi Dasar'
                                        : route === '/dashboard/legal'
                                        ? 'Informasi Legal'
                                        : route === '/dashboard/bank'
                                        ? 'Informasi Legal'
                                        : route === '/dashboard/bank'
                                        ? 'Rekening'
                                        : route === '/dashboard/vacancy'
                                        ? 'Lowongan'
                                        : route === '/dashboard/my-event/checkin'
                                        ? 'Check In Event'
                                        : route === '/dashboard/my-event'
                                        ? 'Event Saya'
                                        : route === '/dashboard/chat'
                                        ? 'Pesan'
                                        : ''}
                                </h3> */}
                            </div>
                            <div className="!overflow-x-hidden flex-grow">
                                <Flex gap={8} align="center" justify="end">
                                    <Fade isShowing={showNotifications}>
                                        <div className={`absolute right-10 top-10 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg  ${showNotifications ? 'opacity-100' : 'opacity-0'}`} role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex={-1}>
                                            {hasNotification ? (
                                                <>
                                                    <Link href="#" className="block px-4 py-2 text-sm text-dark" role="menuitem" tabIndex={-1} id="user-menu-item-0">
                                                        Your Profile
                                                    </Link>
                                                    <Link href="#" className="block px-4 py-2 text-sm text-dark" role="menuitem" tabIndex={-1} id="user-menu-item-1">
                                                        Settings
                                                    </Link>
                                                    <Link href="#" className="block px-4 py-2 text-sm text-dark" role="menuitem" tabIndex={-1} id="user-menu-item-2">
                                                        Sign out
                                                    </Link>
                                                </>
                                            ) : (
                                                <div className="p-3">
                                                    <p className="text-dark text-sm">Belum ada notifikasi</p>
                                                </div>
                                            )}
                                        </div>
                                    </Fade>
                                    <button type="button" className="relative rounded-full bg-gray-800 w-9 h-9 text-primary-dark border border-primary-light-200 hover:bg-primary-light-200" onClick={() => router.push('/')}>
                                        <FontAwesomeIcon icon={faHome} />
                                    </button>
                                    <button type="button" className="relative rounded-full bg-gray-800 w-9 h-9 text-primary-dark border border-primary-light-200 hover:bg-primary-light-200" onClick={() => setShowNotifications(!showNotifications)}>
                                        <FontAwesomeIcon icon={showNotifications ? Bell : faBell} />
                                    </button>
                                    {role === 'Creator' && route !== '/dashboard/my-event/[slug]' ? (
                                        <Button label="Buat Event" color="secondary" onClick={() => router.push('/create-event')} />
                                    ) : (
                                        role === 'Creator' && (
                                            <>
                                                <Button label="Edit" color="secondary" onClick={() => router.push(`/edit-event/${params.slug}`)} startIcon={faEdit} />
                                                <Button color="primary" startIcon={faEye} className="mr-0" onClick={() => router.push(`/event/${params.slug}`)} />
                                            </>
                                        )
                                    )}
                                    <div>
                                        <div className="bg-white rounded-full px-2 py-1.5 w-20 border border-primary-light-200">
                                            <button type="button" className="w-full relative flex max-w-xs items-center rounded-full text-sm justify-around" id="user-menu-button" aria-expanded="false" aria-haspopup="true" onClick={() => setShowUserMenu(!showUserMenu)}>
                                                <FontAwesomeIcon icon={faBars} className="text-primary-base" />
                                                <Image className="h-6 w-6 rounded-full border border-primary-light-200" src={Avatar} alt="" />
                                            </button>
                                        </div>
                                        <Fade isShowing={showUserMenu}>
                                            <div ref={outsideClickMenu} className={`absolute right-2 z-10 mt-5 w-48 origin-top-right divide-y divide-primary-light-200 rounded-md bg-white shadow-lg transition-opacity duration-200 ${showUserMenu ? 'opacity-100' : 'opacity-0'}`} role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex={-1}>
                                                <Stack px={15} py={10} gap={5}>
                                                    <Text size="sm" c="gray.8" fw={600}>Hi, {users?.name}</Text>
                                                    <Text size="xs" c="gray" mt={-3}>{users?.email}</Text>
                                                </Stack>
                                                {hasCreator && !!!userData?.force_creator && (
                                                    <button
                                                        className="px-4 pb-2 pt-3 text-xs text-dark w-full flex justify-start hover:bg-primary-light rounded-t-md"
                                                        role="menuitem"
                                                        onClick={() => {
                                                            setShowUserMenu(!showUserMenu);
                                                            role === 'Creator' ? setRole('Pembeli') : setRole('Creator');
                                                            role === 'Creator' ? router.push('/dashboard/user') : router.push('/dashboard');
                                                            role === 'Creator' ? Cookies.set('hasCreator', 'false') : Cookies.set('hasCreator', 'true');
                                                            role === 'Creator'
                                                                ? toast.success('Beralih ke dashboard pembeli', {
                                                                    autoClose: 2000,
                                                                    hideProgressBar: true
                                                                })
                                                                : toast.success('Beralih ke dashboard creator', {
                                                                    autoClose: 2000,
                                                                    hideProgressBar: true
                                                                });
                                                        }}
                                                        tabIndex={-1}
                                                        id="user-menu-item-0"
                                                    >
                                                        <FontAwesomeIcon icon={faSquareArrowUpRight} className="mr-2" />
                                                        Beralih ke {role === 'Creator' ? 'Pembeli' : 'Creator'}
                                                    </button>
                                                )}

                                                {!['Staff', 'Admin'].includes(role ?? '') && (
                                                    <>
                                                        <Link href="/dashboard/my-ticket" className="block px-4 pb-2 pt-3 text-xs text-dark hover:bg-primary-light rounded-t-md" role="menuitem" tabIndex={-1} id="user-menu-item-0">
                                                            <FontAwesomeIcon icon={faCalendarDays} className="mr-2" />
                                                            Transaksi
                                                        </Link>

                                                        <Link href="/dashboard/bookmark" className="block px-4 pb-2 pt-3 text-xs text-dark hover:bg-primary-light rounded-t-md" role="menuitem" tabIndex={-1} id="user-menu-item-0">
                                                            <FontAwesomeIcon icon={faBookmark} className="mr-2" />
                                                            Bookmark
                                                        </Link>
                                                    </>
                                                )}

                                                <button className="block px-4 pt-2 pb-3 w-full text-start text-xs text-dark hover:bg-primary-light rounded-b-md" role="menuitem" tabIndex={-1} onClick={handleLogout} id="user-menu-item-2">
                                                    <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                                                    Keluar
                                                </button>
                                            </div>
                                        </Fade>
                                    </div>
                                </Flex>
                            </div>
                        </div>
                        <div className="max-w-[100vw] overflow-x-hidden">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidebarComponent;
