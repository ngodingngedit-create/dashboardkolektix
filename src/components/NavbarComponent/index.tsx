import { ReactNode, useState, useEffect, useMemo, useContext } from 'react';
import Logo from '@images/logo.png';
import useWindowSize from '@/utils/useWindowSize';
import Image from 'next/image';
import FilterMenu from '../FilterMenu';
import Footer from '../FooterComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faBookmark, faStar } from '@fortawesome/free-regular-svg-icons';
import {
  faBell as Bell,
  faBars,
  faXmark,
  faSearch,
  faCalendarDays,
  faEnvelope,
  faCirclePlus,
  faTableColumns,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { UserProps } from '@/utils/globalInterface';
import top from '../../assets/images/Ellipse 40.png';
import avatar from '../../assets/images/avatar.jpg';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import useLoggedUser from '@/utils/useLoggedUser';
import Fade from '../Transition';
import Link from 'next/link';
import Lowongan from '../../pages/lowongan/index';
import Merchandise from '../../pages/merchandise/index';
import Talenta from '../../pages/dashboard/talenta/index';
import React from 'react';
import { ActionIcon, Box, Button, Indicator, Menu, Flex, Image as ImageM, UnstyledButton, Card, Avatar, Text } from '@mantine/core';
import { useClickOutside, useHotkeys } from '@mantine/hooks';
import { Icon } from '@iconify/react/dist/iconify.js';
import { AppMainContext } from '@/pages/_app';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';

export default function NavbarComponent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const users = useLoggedUser();
  const { route } = router;
  const { width } = useWindowSize();
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserProps>();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showSideMenu, setShowSideMenu] = useState<boolean>(false);
  const [showSideBar, setShowSideBar] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [navbarBackground, setNavbarBackground] = useState<boolean>(false);
  const [hasNotification, setHasNotification] = useState<boolean>(false);
  const [bgNav, setBgNav] = useState<boolean>(false);
  const { cartCount } = useContext(AppMainContext);
  const { t, i18n } = useTranslation();

  const outsideClickMenu = useClickOutside(() => {
    setShowUserMenu(false);
  });

  const handleNotification = () => {
    setShowNotifications(!showNotifications);
  };

  const handleSideMenu = () => {
    setShowSideMenu(!showSideMenu);
  };

  const handleSideBar = () => {
    setShowSideBar(!showSideBar);
  };

  const handleFilter = () => {
    setShowFilter(!showFilter);
  };

  const handleLogout = () => {
    modals.openConfirmModal({
      title: 'Keluar Akun',
      centered: true,
      children: 'Apakah kamu yakin ingin keluar akun?',
      labels: { cancel: "Batal", confirm: "Keluar" },
      onConfirm: () => {
        Cookies.remove('token', { path: '/' });
        Cookies.remove('user_data', { path: '/' });
        Cookies.remove('prevPath', { path: '/' });
        Cookies.remove('ticketCount', { path: '/' });
        if (route !== '/') {
          router.push('/').then(() => window.location.reload());
        } else {
          window.location.reload();
        }
      }
    })
  };

  useEffect(() => {
    if (users) {
      setUserData(users);
      console.log(users);
    }
  }, [users]);

  const token = Cookies.get('token');
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setNavbarBackground(true);
      } else {
        setNavbarBackground(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    token !== undefined ? setIsLogin(true) : setIsLogin(false);
  }, []);

  useEffect(() => {
    navbarActive();
  }, [route]);

  const navbarActive = () => {
    let active = false;
    route === '/' ||
    route === '/event' ||
    route === '/venue' ||
    route === '/talent' ||
    route === '/lowongan' ||
    route === '/merchandise'
      ? (active = true)
      : (active = false);
    setBgNav(active);
  };

  useHotkeys([
    ['ctrl+F', () => setShowFilter(!showFilter)]
  ]);

  // const cartCount = (JSON.parse(Cookies.get('_cart') ?? '[]') as { qty: number }[]).reduce((q, n) => q + n.qty, 0);

  return (
    <div>
      <nav
        className={`${
          width && width > 768
            ? navbarBackground || !bgNav || showFilter
              ? 'bg-primary-dark'
              : 'bg-transparent'
            : 'bg-primary-dark'
        } transition-colors duration-300 sticky top-0 w-full z-50`}
      >
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='flex items-center flex-1'>
              <div className='mr-2 w-8 md:hidden'>
                <button
                  type='button'
                  className='relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-white hover:bg-gray-700 hover:text-white'
                  aria-controls='mobile-menu'
                  aria-expanded='false'
                  onClick={handleSideMenu}
                >
                  <FontAwesomeIcon icon={showSideMenu ? faXmark : faBars} />
                </button>
              </div>
              <div className='mr-2 w-8 hidden md:inline lg:inline'>
                <button
                  type='button'
                  className='relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-white hover:bg-gray-700 hover:text-white'
                  aria-controls='mobile-menu'
                  aria-expanded='false'
                  onClick={handleSideBar}
                >
                  <FontAwesomeIcon icon={showSideBar ? faXmark : faBars} />
                </button>
              </div>
              <div className='flex-shrink-0'>
                <Link href='/'>
                  <Image className='w-20 md:w-20' src={Logo} alt='Kolektix Logo' />
                </Link>
              </div>
            </div>
            <div className='flex items-center justify-center flex-1'>
              <div className='bg-primary-dark flex items-center drop-shadow-2xl rounded-full'>
                <div className='md:block hidden'>
                  <div className='flex items-baseline space-x-4 p-1'>
                    <Link
                      href='/event'
                      className={`rounded-md px-3 py-2 text-sm font-medium ${
                        route === '/event' ? 'text-white' : 'text-primary-light-200'
                      } hover:text-white`}
                    >
                      Event
                    </Link>
                    <Link
                      href='/talent'
                      className={`rounded-md px-3 py-2 text-sm font-medium ${
                        route === '/talent' ? 'text-white' : 'text-primary-light-200'
                      } hover:text-white`}
                    >
                      Talenta
                    </Link>
                    <Link
                      href='/lowongan'
                      className={`rounded-md px-3 py-2 text-sm font-medium ${
                        route === '/lowongan' ? 'text-white' : 'text-primary-light-200'
                      } hover:text-white`}
                    >
                      Lowongan
                    </Link>
                    <Link
                      className={`rounded-md px-3 py-2 text-sm font-medium ${
                        route === '/merchandise' ? 'text-white' : 'text-primary-light-200'
                      } hover:text-white`}
                      href='/merchandise'
                    >
                      Merchandise
                    </Link>
                    <Link
                      className={`rounded-md px-3 py-2 text-sm font-medium ${
                        route === '/venue' ? 'text-white' : 'text-primary-light-200'
                      } hover:text-white`}
                      href='/venue'
                    >
                      Venue
                    </Link>
                    <div className='w-10'>
                      <button className='bg-white rounded-full w-8 h-8' onClick={handleFilter}>
                        <FontAwesomeIcon icon={faSearch} className='text-primary' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex items-center justify-end flex-1 gap-[15px]'>
              <div className=''>
                <div className='flex items-center'>
                  {!(route.startsWith('/event/')) && !(route.startsWith('/transaction-woauth')) && (
                    <button
                      type='button'
                      className='relative rounded-full font-semibold flex items-center bg-white px-2 py-1 text-center text-primary-base hover:text-primary-dark mx-2 text-sm md:px-3 md:py-1.5'
                    >
                      <Link href={!userData?.has_creator ? '/register/creator' : '/create-event'} className='flex items-center'>
                        <FontAwesomeIcon icon={faCirclePlus} className={`text-[24px]`} />
                        <span className='ml-1 hidden lg:inline whitespace-nowrap'>Buat Event</span>
                      </Link>
                    </button>
                  )}

                  {(route.startsWith('/merch-order') || route.startsWith('/merch-cart') || route.startsWith('/merchandise')) && (
                    <Indicator label={String(cartCount)} size="lg" offset={8} color="red">
                      <button
                        type='button'
                        className='mr-2 relative rounded-full bg-gray-800 p-1 text-white hover:text-white mt-1'
                        onClick={() => router.push('/merch-cart')}
                      >
                        <Icon icon={'ant-design:shopping-cart-outlined'} className={`text-[26px]`} />
                      </button>
                    </Indicator>
                  )}

                  {/* {users?.id && (
                    <button
                      type='button'
                      className='relative rounded-full bg-gray-800 p-1 text-white hover:text-white mt-1'
                      onClick={handleNotification}
                    >
                      <FontAwesomeIcon icon={showNotifications ? Bell : faBell} className={`text-[24px]`} />
                    </button>
                  )} */}

                  <div className='relative ml-3'>
                    {isLogin ? (
                      <div className='bg-white hidden rounded-full md:px-3 px-10 py-0.5 md:py-1.5 md:w-20 w-16'>
                          <button
                            type='button'
                            className='w-full relative flex max-w-xs items-center rounded-full text-sm justify-around'
                            id='user-menu-button'
                            aria-expanded='false'
                            aria-haspopup='true'
                            onClick={() => setShowUserMenu(!showUserMenu)}
                          >
                            <FontAwesomeIcon icon={faBars} className='text-primary-base' />
                            <Image
                              className='h-6 w-6 rounded-full border border-primary-light-200'
                              src={avatar}
                              alt=''
                            />
                          </button>
                      </div>
                    ) : (
                      <>
                        {/* <Button
                          size="compact-lg"
                          radius="xl"
                          bg="white"
                          className={`!text-primary-base`}
                          onClick={() => router.push('/auth')}
                        >
                          Login
                        </Button> */}
                        {/* <button
                          type='button'
                          className='w-full relative flex items-center rounded-full justify-around text-[20px] text-primary-base font-semibold hover:text-primary-dark'
                          id='user-menu-button'
                          aria-expanded='false'
                          aria-haspopup='true'
                          
                        >
                          Login
                        </button> */}
                      </>
                    )}

                    <Flex gap={15} align="center">
                      <Menu offset={20} width="250px" radius={10}>
                        <Menu.Target>
                          <Card bg="gray.3" p={i18n.language.toLowerCase() == 'id' ? 7 : '10px 7px'} radius={999}>
                            <Icon
                              icon={i18n.language.toLowerCase() == 'id' ? "twemoji:flag-indonesia" : "flag:us-4x3"}
                              className={`${i18n.language.toLowerCase() == 'id' ? 'text-[24px]' : 'text-[18px]'}`} />
                          </Card>
                        </Menu.Target>
                        <Menu.Dropdown w={150}>
                          <Menu.Label>Bahasa</Menu.Label>
                          <Menu.Item bg={i18n.language.toLowerCase() == 'id' ? 'gray.1' : undefined} onClick={() => i18n.changeLanguage('id')}>
                            <Flex align="center" gap={10}>
                              <Icon icon="twemoji:flag-indonesia" className={`text-[24px]`} />
                              <Text>Indonesia</Text>
                            </Flex>
                          </Menu.Item>
                          <Menu.Item bg={i18n.language.toLowerCase() == 'en' ? 'gray.1' : undefined} onClick={() => i18n.changeLanguage('en')}>
                            <Flex align="center" gap={10}>
                              <Icon icon="flag:us-4x3" className={`text-[16px]`} />
                              <Text>English</Text>
                            </Flex>
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>

                      <Menu offset={20} width="250px" radius={10}>
                        <Menu.Target>
                          <UnstyledButton>
                            <Card p={isLogin ? 0 : 8} c={isLogin ? "#02255A" : "white"} bg={isLogin ? "white" : "#02255A"} radius="xl">
                              {isLogin ? (
                                <Flex gap={15} align="center" py={4} pl={16} pr={4}>
                                  <Icon icon="uiw:menu" className={`text-[18px]`} />
                                  <Avatar size={30} src={users?.has_creator?.image_url} />
                                </Flex>
                              ) : (
                                <Icon icon="solar:login-2-broken" className={`text-[24px] mr-[4px]`} />
                              )}
                            </Card>
                          </UnstyledButton>
                        </Menu.Target>
                        <Menu.Dropdown>
                          {/* <Menu.Label className={`md:!hidden`}>Event</Menu.Label>
                          <Menu.Item className={`md:!hidden`} leftSection={<Icon icon="uiw:plus"/>} color="#0B387C" component={Link} href={Boolean(userData?.has_creator) ? "/create-event" : "/register/creator"}>Buat Event</Menu.Item>
                          <Menu.Divider className={`md:!hidden`}/> */}
                          <Menu.Label>Akun</Menu.Label>
                          {!isLogin ? (
                            <>
                              <Menu.Item leftSection={<Icon icon="solar:login-2-broken"/>} color="#0B387C" component={Link} href="/auth">Login / Daftar</Menu.Item>
                              {/* <Menu.Item leftSection={<Icon icon="hugeicons:account-setting-03" className={`text-[18px]`}/>} color="#0B387C" component={Link} href="/auth-creator">Login Creator</Menu.Item> */}
                              {/* <Menu.Item leftSection={<Icon icon="uiw:user-add"/>}component={Link} href="/register">Daftar</Menu.Item> */}
                            </>
                          ) : (
                            <>
                              <Menu.Item leftSection={<Icon icon="gg:list"/>} component={Link} href="/dashboard/my-ticket">Transaksi</Menu.Item>
                              <Menu.Item leftSection={<Icon icon="gg:list"/>} component={Link} href={users?.force_creator ? "/dashboard/" : "/dashboard/user"}>Dashboard</Menu.Item>
                              <Menu.Item leftSection={<Icon icon="lucide:bookmark"/>} component={Link} href="/dashboard/bookmark">Bookmark</Menu.Item>
                              <Menu.Item leftSection={<Icon icon="solar:logout-2-broken"/>} color="red" onClick={handleLogout}>Logout</Menu.Item>
                            </>
                          )}
                          <Menu.Divider className={`md:!hidden`}/>
                          <Menu.Label className={`md:!hidden`}>Halaman</Menu.Label>
                          <Menu.Item className={`md:!hidden`} rightSection={<Icon icon="uiw:right" className={`!text-grey`}/>} component={Link} href="/event">Event</Menu.Item>
                          <Menu.Item className={`md:!hidden`} rightSection={<Icon icon="uiw:right" className={`!text-grey`}/>} component={Link} href="/talent">Talenta</Menu.Item>
                          <Menu.Item className={`md:!hidden`} rightSection={<Icon icon="uiw:right" className={`!text-grey`}/>} component={Link} href="/lowongan">Lowongan</Menu.Item>
                          <Menu.Item className={`md:!hidden`} rightSection={<Icon icon="uiw:right" className={`!text-grey`}/>} component={Link} href="/merchandise">Merchandise</Menu.Item>
                          <Menu.Item className={`md:!hidden`} rightSection={<Icon icon="uiw:right" className={`!text-grey`}/>} component={Link} href="/venue">Venue</Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Flex>
                    <Fade isShowing={showNotifications}>
                      <div
                        className={`absolute right-10 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg  ${
                          showNotifications ? 'opacity-100' : 'opacity-0'
                        }`}
                        role='menu'
                        aria-orientation='vertical'
                        aria-labelledby='user-menu-button'
                        tabIndex={-1}
                      >
                        {hasNotification ? (
                          <>
                            <Link
                              href='#'
                              className='block px-4 py-2 text-sm text-dark'
                              role='menuitem'
                              tabIndex={-1}
                              id='user-menu-item-0'
                            >
                              Your Profile
                            </Link>
                            <Link
                              href='#'
                              className='block px-4 py-2 text-sm text-dark'
                              role='menuitem'
                              tabIndex={-1}
                              id='user-menu-item-1'
                            >
                              Settings
                            </Link>
                            <Link
                              href='#'
                              className='block px-4 py-2 text-sm text-dark'
                              role='menuitem'
                              tabIndex={-1}
                              id='user-menu-item-2'
                            >
                              Sign out
                            </Link>
                          </>
                        ) : (
                          <div className='p-3'>
                            <p className='text-dark text-sm'>Belum ada notifikasi</p>
                          </div>
                        )}
                      </div>
                    </Fade>
                    <Fade isShowing={showUserMenu} ref={outsideClickMenu}>
                      <div
                        className={`absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-primary-light-200 rounded-md bg-white shadow-lg transition-all duration-200 ${
                          showUserMenu ? 'opacity-100' : 'opacity-0'
                        }`}
                        role='menu'
                        aria-orientation='vertical'
                        aria-labelledby='user-menu-button'
                        tabIndex={-1}
                      >
                        <Link
                          href='/dashboard/my-ticket'
                          className='block px-4 pb-2 pt-3 text-xs text-dark hover:bg-primary-light rounded-t-md'
                          role='menuitem'
                          tabIndex={-1}
                          id='user-menu-item-0'
                        >
                          <FontAwesomeIcon icon={faCalendarDays} className='mr-2' />
                          Transaksi
                        </Link>
                        <Link
                          href='/dashboard/my-ticket'
                          className='block px-4 py-2 text-xs text-dark hover:bg-primary-light'
                          role='menuitem'
                          tabIndex={-1}
                          id='user-menu-item-1'
                        >
                          <FontAwesomeIcon icon={faTableColumns} className='mr-2' />
                          Dashboard
                        </Link>
                        {users?.id && (
                          <Link
                            href='/dashboard/bookmark'
                            className='block px-4 pb-2 pt-3 text-xs text-dark hover:bg-primary-light rounded-t-md'
                            role='menuitem'
                            tabIndex={-1}
                            id='user-menu-item-0'
                          >
                            <FontAwesomeIcon icon={faBookmark} className='mr-2' />
                            Bookmark
                          </Link>
                        )}
                        {/* <a
                          href='#'
                          className='block px-4 py-2 text-xs text-dark hover:bg-primary-light'
                          role='menuitem'
                          tabIndex={-1}
                          id='user-menu-item-2'
                        >
                          <FontAwesomeIcon icon={faEnvelope} className='mr-2' />
                          Inbox
                        </a> */}
                        <button
                          className='block px-4 pt-2 pb-3 w-full text-start text-xs text-dark hover:bg-primary-light rounded-b-md'
                          role='menuitem'
                          tabIndex={-1}
                          onClick={handleLogout}
                          id='user-menu-item-2'
                        >
                          <FontAwesomeIcon icon={faRightFromBracket} className='mr-2' />
                          Keluar
                        </button>
                      </div>
                    </Fade>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showSideMenu && (
          <div className='' id='mobile-menu'>
            <div className='border-t border-gray-700 pb-3 pt-4'>
              <div className='flex items-center px-5'>
              {isLogin ? (
                <>
                  <div className='flex-shrink-0'>
                    <Image
                      className='h-6 w-6 rounded-full border border-primary-light-200'
                      src={avatar}
                      alt=''
                    />
                  </div>
                  <div className='ml-3'>
                    <div className='text-base font-medium leading-none text-white'>
                      {/* {userData.name} */}
                    </div>
                    <div className='text-sm font-medium leading-none text-white'>
                      {userData && userData.email}
                    </div>
                  </div>
                </>
              ) : (
                <div className='space-y-1 flex flex-col px-2'>
                  <Link
                    href='/event'
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      route === '/event' ? 'text-white' : 'text-primary-light-200'
                    } hover:text-white`}
                  >
                    Event
                  </Link>
                  <Link
                    href='/talent'
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      route === '/talent' ? 'text-white' : 'text-primary-light-200'
                    } hover:text-white`}
                  >
                    Talenta
                  </Link>
                  <Link
                    href='/lowongan'
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      route === '/lowongan' ? 'text-white' : 'text-primary-light-200'
                    } hover:text-white`}
                  >
                    Lowongan
                  </Link>
                  <Link
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      route === '/merchandise' ? 'text-white' : 'text-primary-light-200'
                    } hover:text-white`}
                    href='/merchandise'
                  >
                    Merchandise
                  </Link>
                  <Link
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      route === '/venue' ? 'text-white' : 'text-primary-light-200'
                    } hover:text-white`}
                    href='/venue'
                  >
                    Venue
                  </Link>
                </div>
              )}
              </div>
              {isLogin && (
                <div className='mt-3 space-y-1 flex flex-col px-2'>
                  <Link
                    href='/event'
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      route === '/event' ? 'text-white' : 'text-primary-light-200'
                    } hover:text-white`}
                  >
                    Event
                  </Link>
                  <Link
                    href='/talent'
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      route === '/talent' ? 'text-white' : 'text-primary-light-200'
                    } hover:text-white`}
                  >
                    Talenta
                  </Link>
                  <Link
                    href='/lowongan'
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      route === '/lowongan' ? 'text-white' : 'text-primary-light-200'
                    } hover:text-white`}
                  >
                    Lowongan
                  </Link>
                  <Link
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      route === '/merchandise' ? 'text-white' : 'text-primary-light-200'
                    } hover:text-white`}
                    href='/merchandise'
                  >
                    Merchandise
                  </Link>
                  <Link
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      route === '/venue' ? 'text-white' : 'text-primary-light-200'
                    } hover:text-white`}
                    href='/venue'
                  >
                    Venue
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      {showSideBar &&(
        <div className='fixed inset-0 flex'>
          <div
            className={`fixed top-0 left-0 w-1/5 bg-black opacity-80 p-4 transition-transform duration-700 ease-in-out transform ${showSideBar ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ height: '100vh', zIndex: 30 }}
          >
            <div className="flex items-center">
              <button
                type='button'
                className='relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-white hover:bg-gray-700 hover:text-white'
                aria-controls='mobile-menu'
                aria-expanded={showSideBar}
                onClick={handleSideBar}
              >
                <FontAwesomeIcon icon={showSideBar ? faXmark : faBars} />
              </button>
              <div className='flex-shrink-0 ms-4'>
                <Link href='/'>
                  <Image className='w-14 md:w-20' src={Logo} alt='Kolektix Logo' />
                </Link>
              </div>
            </div>
            <div className='mt-4 p-4 rounded-lg'>
              <p className='text-white text-lg font-semibold mb-4'>Konten Sidebar</p>
              <ul className='space-y-2'>
              <li className="flex items-center space-x-2 p-2 text-lg transition duration-300 hover:bg-gray-700 rounded-lg">
                <FontAwesomeIcon icon={faCalendarDays} className="text-white" />
                <Link href='/event' className='text-white hover:text-white block transition'>
                  Event
                </Link>
              </li>
              <li className="flex items-center space-x-2 p-2 text-lg transition duration-300 hover:bg-gray-700 rounded-lg">
                <FontAwesomeIcon icon={faStar} className="text-white" />
                <Link href='/talent' className='text-white hover:text-white block transition'>
                  Talenta
                </Link>
              </li>
                <li>
                  <Link href='/lowongan' className='block text-white hover:text-white hover:bg-gray-700 p-2 rounded-lg transition'>
                    Lowongan
                  </Link>
                </li>
                <li>
                  <Link href='/merchandise' className='block text-white hover:text-white hover:bg-gray-700 p-2 rounded-lg transition'>
                    Merchandise
                  </Link>
                </li>
                <li>
                  <Link href='/venue' className='block text-white hover:text-white hover:bg-gray-700 p-2 rounded-lg transition'>
                    Venue
                  </Link>
                </li>
              </ul>
            </div>
        </div>
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-700 ease-in-out ${showSideBar ? 'opacity-100' : 'opacity-0'}`}
        style={{ zIndex: 20 }}  // Adjust zIndex as needed
        onClick={handleSideBar}
      />
        </div>
      )}
        <Fade isShowing={showFilter}>
          <FilterMenu />
        </Fade>
      </nav>
      <main>
        <div className='margin-min'>
          {route === '/event' ||
          route === '/venue' ||
          route === '/talent' ||
          route === '/merchandise' ||
          route === '/lowongan' ? (
            <Box className={`h-[80px]`}>
              <Image src={top} alt='top' className='z-30 mx-auto opacity-0 md:!opacity-100 !w-[1920px] min-w-[100%]' quality={100} />
            </Box>
          ) : (
            <></>
          )}

          {children}
        </div>
      </main>
      {!route.startsWith('/event') && !route.startsWith('/transaction-woauth') && !route.startsWith('/create-event') && !route.startsWith('/merch-order') && !route.startsWith('/merchandise/') && !route.startsWith('/merch-cart') && !route.startsWith('/venue/') && !route.startsWith('/venue-order') && <Footer />}
    </div>
  );
}
