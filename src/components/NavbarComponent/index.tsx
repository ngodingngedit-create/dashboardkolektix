import { ReactNode, useState, useEffect, useMemo, useContext } from "react";
import Logo from "@images/logo.png";
import useWindowSize from "@/utils/useWindowSize";
import Image from "next/image";
import FilterMenu from "../FilterMenu";
import Footer from "../FooterComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBookmark, faStar } from "@fortawesome/free-regular-svg-icons";
import { faBell as Bell, faBars, faXmark, faSearch, faCalendarDays, faEnvelope, faCirclePlus, faTableColumns, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { UserProps } from "@/utils/globalInterface";
import top from "../../assets/images/Ellipse 40.png";
import avatar from "../../assets/images/avatar.jpg";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import useLoggedUser from "@/utils/useLoggedUser";
import Fade from "../Transition";
import Link from "next/link";
import React from "react";
import { ActionIcon, Box, Button, Indicator, Menu, Flex, Image as ImageM, UnstyledButton, Card, Avatar, Text, Stack, NavLink, Divider } from "@mantine/core";
import { useClickOutside, useHotkeys } from "@mantine/hooks";
import { Icon } from "@iconify/react/dist/iconify.js";
import { AppMainContext } from "@/pages/_app";
import { modals } from "@mantine/modals";
import { useTranslation } from "react-i18next";

// Helper function untuk deteksi domain di server-side
const getInitialDomainState = () => {
  if (typeof window === 'undefined') {
    return {
      isProduction: false,
      isCloud: false,
      domain: "",
      showAllDebug: false
    };
  }

  const hostname = window.location.hostname;
  const urlParams = new URLSearchParams(window.location.search);
  const debug = urlParams.get('debug');

  return {
    isProduction: hostname === 'kolektix.com' && debug !== 'showall',
    isCloud: hostname.includes('cloud') || hostname === 'localhost',
    domain: hostname,
    showAllDebug: debug === 'showall'
  };
};

export default function NavbarComponent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const users = useLoggedUser();
  const { asPath, route } = router;
  const { width } = useWindowSize();
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserProps>();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showSideMenu, setShowSideMenu] = useState<boolean>(false);
  const [showSideBar, setShowSideBar] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [hasNotification, setHasNotification] = useState<boolean>(false);
  const { cartCount } = useContext(AppMainContext);
  const { t, i18n } = useTranslation();

  const [domainState, setDomainState] = useState(getInitialDomainState);

  useEffect(() => {
    setDomainState(getInitialDomainState());
  }, [asPath]);

  const showTalentVenue = useMemo(() => {
    return domainState.showAllDebug || !domainState.isProduction;
  }, [domainState.isProduction, domainState.showAllDebug]);

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
    const wasClosed = !showFilter;
    setShowFilter(!showFilter);

    if (wasClosed) {
      setTimeout(() => {
        const searchInput = document.getElementById('search-filter-input') as HTMLInputElement;

        if (searchInput) {
          searchInput.focus();
          searchInput.select();
          return;
        }

        const modalElements = document.querySelectorAll('.mantine-Modal-inner, .mantine-Modal-content, [role="dialog"]');

        for (let i = 0; i < modalElements.length; i++) {
          const modal = modalElements[i];
          const input = modal.querySelector('input[type="text"], input[type="search"]') as HTMLInputElement;
          if (input) {
            input.focus();
            input.select();
            return;
          }
        }

        const allInputs = document.querySelectorAll('input[type="text"], input[type="search"]');

        for (let i = 0; i < allInputs.length; i++) {
          const input = allInputs[i] as HTMLInputElement;
          if (input.offsetParent !== null &&
            (input.placeholder?.toLowerCase().includes('cari') ||
              input.placeholder?.toLowerCase().includes('search'))) {
            input.focus();
            input.select();
            return;
          }
        }

        for (let i = 0; i < allInputs.length; i++) {
          const input = allInputs[i] as HTMLInputElement;
          if (input.offsetParent !== null) {
            input.focus();
            input.select();
            return;
          }
        }
      }, 200);
    }
  };

  useEffect(() => {
    setShowFilter(false);
  }, [asPath]);

  const handleLogout = () => {
    modals.openConfirmModal({
      title: "Keluar Akun",
      centered: true,
      children: "Apakah kamu yakin ingin keluar akun?",
      labels: { cancel: "Batal", confirm: "Keluar" },
      onConfirm: () => {
        Cookies.remove("token", { path: "/" });
        Cookies.remove("user_data", { path: "/" });
        Cookies.remove("prevPath", { path: "/" });
        Cookies.remove("ticketCount", { path: "/" });
        if (route !== "/login") {
          router.push("/login").then(() => window.location.reload());
        } else {
          window.location.reload();
        }
      },
    });
  };

  useEffect(() => {
    if (users) {
      setUserData(users);
    }
  }, [users]);

  const token = Cookies.get("token");

  useEffect(() => {
    token !== undefined ? setIsLogin(true) : setIsLogin(false);
  }, [token]);

  useHotkeys([["ctrl+F", () => {
    const wasClosed = !showFilter;
    setShowFilter(!showFilter);

    if (wasClosed) {
      setTimeout(() => {
        const searchInput = document.getElementById('search-filter-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }, 200);
    }
  }]]);

  // Cek apakah halaman saat ini adalah error page
  const isErrorPage = route === '/404' || route === '/_error' || asPath.includes('404');

  return (
    <div>
      <nav className="bg-primary-dark transition-colors duration-300 sticky top-0 w-full z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="mr-2 w-8">
                <button
                  type="button"
                  className="relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-white hover:bg-gray-700 hover:text-white"
                  aria-controls="mobile-menu"
                  aria-expanded="false"
                  onClick={handleSideBar}
                >
                  <FontAwesomeIcon icon={showSideBar ? faXmark : faBars} />
                </button>
              </div>
              <div className="flex-shrink-0">
                <Link href="/dashboard">
                  <Image className="w-20 md:w-20" src={Logo} alt="Kolektix Logo" />
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center flex-1">
              <div className="bg-primary-dark flex items-center drop-shadow-2xl rounded-full">
                <div className="md:block hidden">
                  <div className="flex items-baseline space-x-4 p-1">
                    <div className="w-10">
                      <button
                        className="bg-white rounded-full w-8 h-8 hover:bg-gray-100 transition-colors"
                        onClick={handleFilter}
                        aria-label="Search"
                        title="Cari (Ctrl+F)"
                      >
                        <FontAwesomeIcon icon={faSearch} className="text-primary" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end flex-1 gap-[15px]">
              <div className="">
                <div className="flex items-center">
                  {!route.startsWith("/event/") && !route.startsWith("/transaction-woauth") && (
                    <button type="button" className="relative rounded-full font-semibold flex items-center bg-white px-2 py-1 text-center text-primary-base hover:text-primary-dark mx-2 text-sm md:px-3 md:py-1.5">
                      <Link href={!userData?.has_creator ? "/register/creator" : "/create-event"} className="flex items-center">
                        <FontAwesomeIcon icon={faCirclePlus} className={`text-[24px]`} />
                        <span className="ml-1 hidden lg:inline whitespace-nowrap">Buat Event</span>
                      </Link>
                    </button>
                  )}

                  {(route.startsWith("/merch-order") || route.startsWith("/merch-cart") || route.startsWith("/merchandise")) && (
                    <Indicator label={String(cartCount)} size="lg" offset={8} color="red">
                      <button type="button" className="mr-2 relative rounded-full bg-gray-800 p-1 text-white hover:text-white mt-1" onClick={() => router.push("/merch-cart")}>
                        <Icon icon={"ant-design:shopping-cart-outlined"} className={`text-[26px]`} />
                      </button>
                    </Indicator>
                  )}

                  <div className="relative ml-3">
                    <Flex gap={15} align="center">
                      <Menu offset={20} width="250px" radius={10}>
                        <Menu.Target>
                          <Card bg="gray.3" p={i18n.language.toLowerCase() == "id" ? 7 : "10px 7px"} radius={999} className={`!shadow-[3px_3px_10px_#00000065] !overflow-visible`}>
                            <Icon icon={i18n.language.toLowerCase() == "id" ? "twemoji:flag-indonesia" : "flag:us-4x3"} className={`${i18n.language.toLowerCase() == "id" ? "text-[24px]" : "text-[18px]"}`} />
                          </Card>
                        </Menu.Target>
                        <Menu.Dropdown w={150}>
                          <Menu.Label>{t("language")}</Menu.Label>
                          <Menu.Item bg={i18n.language.toLowerCase() == "id" ? "gray.1" : undefined} onClick={() => i18n.changeLanguage("id")}>
                            <Flex align="center" gap={10}>
                              <Icon icon="twemoji:flag-indonesia" className={`text-[24px]`} />
                              <Text>Indonesia</Text>
                            </Flex>
                          </Menu.Item>
                          <Menu.Item bg={i18n.language.toLowerCase() == "en" ? "gray.1" : undefined} onClick={() => i18n.changeLanguage("en")}>
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
                            <Card p={0} c={"#02255A"} bg={"white"} radius="xl">
                              {isLogin ? (
                                <Flex gap={15} align="center" py={4} pl={16} pr={4}>
                                  <Icon icon="uiw:menu" className={`text-[18px]`} />
                                  <Avatar size={30} src={users?.has_creator?.image_url} />
                                </Flex>
                              ) : (
                                <Flex gap={15} align="center" py={4} pl={16} pr={4}>
                                  <Icon icon="uiw:menu" className={`text-[18px]`} />
                                  <Icon icon="qlementine-icons:user-16" className={`text-[30px] !text-dark-grey`} />
                                </Flex>
                              )}
                            </Card>
                          </UnstyledButton>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Label>Akun</Menu.Label>
                          {!isLogin ? (
                            <>
                              <Menu.Item leftSection={<Icon icon="solar:login-2-broken" />} color="#0B387C" component={Link} href="/login">
                                Login / Daftar
                              </Menu.Item>
                            </>
                          ) : (
                            <>
                              <Menu.Item leftSection={<Icon icon="gg:list" />} component={Link} href="/dashboard/my-ticket">
                                Transaksi
                              </Menu.Item>
                              <Menu.Item leftSection={<Icon icon="gg:list" />} component={Link} href={users?.force_creator && !!users.has_creator ? "/dashboard/" : "/dashboard/user"}>
                                Dashboard
                              </Menu.Item>
                              <Menu.Item leftSection={<Icon icon="lucide:bookmark" />} component={Link} href="/dashboard/bookmark">
                                Bookmark
                              </Menu.Item>
                              <Menu.Item leftSection={<Icon icon="solar:logout-2-broken" />} color="red" onClick={handleLogout}>
                                Logout
                              </Menu.Item>
                            </>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    </Flex>

                    <Fade isShowing={showNotifications}>
                      <div
                        className={`absolute right-10 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg  ${showNotifications ? "opacity-100" : "opacity-0"}`}
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button"
                        tabIndex={-1}
                      >
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

                    <Fade isShowing={showUserMenu} ref={outsideClickMenu}>
                      <div
                        className={`absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-primary-light-200 rounded-md bg-white shadow-lg transition-all duration-200 ${showUserMenu ? "opacity-100" : "opacity-0"}`}
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button"
                        tabIndex={-1}
                      >
                        <Link href="/dashboard/my-ticket" className="block px-4 pb-2 pt-3 text-xs text-dark hover:bg-primary-light rounded-t-md" role="menuitem" tabIndex={-1} id="user-menu-item-0">
                          <FontAwesomeIcon icon={faCalendarDays} className="mr-2" />
                          Transaksi
                        </Link>
                        <Link href="/dashboard/my-ticket" className="block px-4 py-2 text-xs text-dark hover:bg-primary-light" role="menuitem" tabIndex={-1} id="user-menu-item-1">
                          <FontAwesomeIcon icon={faTableColumns} className="mr-2" />
                          Dashboard
                        </Link>
                        {users?.id && (
                          <Link href="/dashboard/bookmark" className="block px-4 pb-2 pt-3 text-xs text-dark hover:bg-primary-light rounded-t-md" role="menuitem" tabIndex={-1} id="user-menu-item-0">
                            <FontAwesomeIcon icon={faBookmark} className="mr-2" />
                            Bookmark
                          </Link>
                        )}
                        <button className="block px-4 pt-2 pb-3 w-full text-start text-xs text-dark hover:bg-primary-light rounded-b-md" role="menuitem" tabIndex={-1} onClick={handleLogout} id="user-menu-item-2">
                          <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
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
          <div className="" id="mobile-menu">
            <div className="border-t border-gray-700 pb-3 pt-4">
              <div className="flex items-center px-5">
                {isLogin ? (
                  <>
                    <div className="flex-shrink-0">
                      <Image className="h-6 w-6 rounded-full border border-primary-light-200" src={avatar} alt="" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white"></div>
                      <div className="text-sm font-medium leading-none text-white">{userData && userData.email}</div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 flex flex-col px-2">
                    <Link href="/event" className={`rounded-md px-3 py-2 text-sm font-medium ${route === "/event" ? "text-white" : "text-primary-light-200"} hover:text-white`}>
                      Event
                    </Link>
                    {showTalentVenue && (
                      <Link href="/talent" className={`rounded-md px-3 py-2 text-sm font-medium ${route === "/talent" ? "text-white" : "text-primary-light-200"} hover:text-white`}>
                        Talenta
                      </Link>
                    )}
                    <Link className={`rounded-md px-3 py-2 text-sm font-medium ${route === "/merchandise" ? "text-white" : "text-primary-light-200"} hover:text-white`} href="/merchandise">
                      Merchandise
                    </Link>
                    {showTalentVenue && (
                      <Link className={`rounded-md px-3 py-2 text-sm font-medium ${route === "/venue" ? "text-white" : "text-primary-light-200"} hover:text-white`} href="/venue">
                        Venue
                      </Link>
                    )}
                  </div>
                )}
              </div>
              {isLogin && (
                <div className="mt-3 space-y-1 flex flex-col px-2">
                  <Link href="/event" className={`rounded-md px-3 py-2 text-sm font-medium ${route === "/event" ? "text-white" : "text-primary-light-200"} hover:text-white`}>
                    Event
                  </Link>
                  {showTalentVenue && (
                    <Link href="/talent" className={`rounded-md px-3 py-2 text-sm font-medium ${route === "/talent" ? "text-white" : "text-primary-light-200"} hover:text-white`}>
                      Talenta
                    </Link>
                  )}
                  <Link className={`rounded-md px-3 py-2 text-sm font-medium ${route === "/merchandise" ? "text-white" : "text-primary-light-200"} hover:text-white`} href="/merchandise">
                    Merchandise
                  </Link>
                  {showTalentVenue && (
                    <Link className={`rounded-md px-3 py-2 text-sm font-medium ${route === "/venue" ? "text-white" : "text-primary-light-200"} hover:text-white`} href="/venue">
                      Venue
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {showSideBar && (
          <div className="fixed inset-0 flex">
            <div className={`fixed top-0 left-0 w-[280px] bg-black opacity-80 p-4 transition-transform duration-700 ease-in-out transform ${showSideBar ? "translate-x-0" : "-translate-x-full"}`} style={{ height: "100vh", zIndex: 30 }}>
              <div className="flex items-center">
                <button
                  type="button"
                  className="relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-white hover:bg-gray-700 hover:text-white"
                  aria-controls="mobile-menu"
                  aria-expanded={showSideBar}
                  onClick={handleSideBar}
                >
                  <FontAwesomeIcon icon={showSideBar ? faXmark : faBars} />
                </button>
                <div className="flex-shrink-0 ms-4">
                  <Link href="/dashboard">
                    <Image className="w-14 md:w-20" src={Logo} alt="Kolektix Logo" />
                  </Link>
                </div>
              </div>
              <Stack mt={20} gap={10} className={`hover:[&>*]:!text-black`}>
                <NavLink
                  c="gray.1"
                  label="Search"
                  onClick={() => {
                    handleFilter();
                    setShowSideBar(false);
                  }}
                  leftSection={<Icon icon="tabler:search" className="text-[24px]" />}
                  style={{ cursor: "pointer" }}
                />
                <NavLink href="/event" c="gray.1" label="Event" leftSection={<Icon icon="tabler:calendar-event" className="text-[24px]" />} />
                <NavLink href="/merchandise" c="gray.1" label="Merchandise" leftSection={<Icon icon="tabler:shopping-bag" className="text-[24px]" />} />

                {showTalentVenue && (
                  <>
                    <NavLink href="/talent" c="gray.1" label="Talent" leftSection={<Icon icon="tabler:user" className="text-[24px]" />} />
                    <NavLink href="/venue" c="gray.1" label="Venue" leftSection={<Icon icon="tabler:building" className="text-[24px]" />} />
                  </>
                )}

                <Divider opacity={0.5} />
                <NavLink c="gray.1" label="Syarat & Ketentuan" leftSection={<Icon icon="fluent:info-32-regular" className={`text-[24px]`} />} />
                <NavLink c="gray.1" label="Kebijakan Privasi" leftSection={<Icon icon="fluent:info-32-regular" className={`text-[24px]`} />} />
                <NavLink c="gray.1" label="Bantuan" leftSection={<Icon icon="tabler:help" className={`text-[24px]`} />} />
                <NavLink c="gray.1" label="Kirim Masukan" leftSection={<Icon icon="material-symbols:feedback-outline-rounded" className={`text-[24px]`} />} />
              </Stack>
            </div>
            <div
              className={`fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-700 ease-in-out ${showSideBar ? "opacity-100" : "opacity-0"}`}
              style={{ zIndex: 20 }}
              onClick={handleSideBar}
            />
          </div>
        )}

        <Fade isShowing={showFilter}>
          <FilterMenu />
        </Fade>
      </nav>

      <main>
        <div className="margin-min">
          {!isErrorPage && (route === "/event" || route === "/venue" || route === "/talent" || route === "/merchandise") ? (
            <Box className={`h-[80px]`}>
              <Image src={top} alt="top" className="z-30 mx-auto opacity-0 md:!opacity-100 !w-[1920px] min-w-[100%]" quality={100} />
            </Box>
          ) : null}

          {children}
        </div>
      </main>

      {/* Footer - Hanya tampil di halaman yang benar dan bukan error page */}
      {!isErrorPage && route === "/" && <Footer />}
    </div>
  );
}