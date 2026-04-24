// import '@/styles/globals.css';
// import { Inter } from 'next/font/google';
// import type { AppProps } from 'next/app';
// import { NextUIProvider } from '@nextui-org/react';
// import { ToastContainer } from 'react-toastify';
// import ChatBox from '@/components/chat';
// import 'react-toastify/ReactToastify.min.css';
// const inter = Inter({
//   weight: ['100', '200', '300', '400', '500', '600', '800'],
//   subsets: ['latin'],
//   variable: '--font-inter',
// });
// import SidebarComponent from '@/components/SidebarComponent';
// import '@fortawesome/fontawesome-svg-core/styles.css';
// import { config } from '@fortawesome/fontawesome-svg-core';
// import NavbarComponent from '@/components/NavbarComponent';
// import { useRouter } from 'next/router';
// import { Input, MantineProvider, MantineTheme, TextInput, Select, Textarea, TagsInput, ModalProps, NumberFormatter, NumberInput, Table, createTheme, Button, ActionIcon, Tooltip, ColorInput } from '@mantine/core';

// import '@mantine/core/styles.css';
// import '@mantine/notifications/styles.css';
// import '@mantine/carousel/styles.css';
// import '@mantine/dates/styles.css';
// import { Notifications } from '@mantine/notifications';
// import { ModalsProvider } from '@mantine/modals';
// import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';
// import Cookies from 'js-cookie';
// import { DateInput } from '@mantine/dates';
// import appWithTranslation from './i18n';

// config.autoAddCss = false;

// const theme = createTheme({
//   colors: {
//     "blue": [
//       "#edf3fc",
//       "#d9e3f3",
//       "#afc6e9",
//       "#82a6e1",
//       "#5d8bd9",
//       "#477ad6",
//       "#3b72d5",
//       "#2e61bd",
//       "#2656a9",
//       "#184a96"
//     ]
//   },
//   components: {
//     Notifications: Notifications.extend({
//       defaultProps: {
//         position: 'top-right'
//       }
//     }),
//     Button: Button.extend({
//       defaultProps: {
//         radius: "xl",
//         color: "#0B387C",
//       }
//     }),
//     ActionIcon: ActionIcon.extend({
//       defaultProps: {
//         color: "#0B387C",
//       }
//     }),
//     ColorInput: ColorInput.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     Input: Input.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     DateInput: DateInput.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     TextInput: TextInput.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     TagsInput: TagsInput.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     Textarea: Textarea.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     NumberInput: NumberInput.extend({
//       defaultProps: {
//         radius: 10,
//         thousandSeparator: '.',
//         decimalSeparator: ','
//       }
//     }),
//     Select: Select.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     NumberFormatter: NumberFormatter.extend({
//       defaultProps: {
//         prefix: "Rp ",
//         thousandSeparator: ".",
//         decimalSeparator: ",",
//         className: `whitespace-nowrap`
//       }
//     }),
//     Table: Table.extend({
//         defaultProps: {
//             className: `
//                 [&_thead]:!bg-[#f0f0f0] [&_*]:text-[14px] [&_tbody_td]:bg-white [&_tr:hover_td]:!bg-gray-50 [&_th]:!bg-gray-100
//                 [&_tr_.hoverBtn]:opacity-0 [&_tr:hover_.hoverBtn]:opacity-100
//             `,
//             horizontalSpacing: 20,
//         }
//     }),
//     Modal: {
//       styles: (theme: MantineTheme) => ({
//         content: {
//           borderRadius: '12px',
//           boxShadow: theme.shadows.md,
//           border: `1px solid ${theme.colors.gray[3]}`,
//           width: '600px',
//           maxWidth: '90%',
//         },
//         header: {
//           borderBottom: `1px solid ${theme.colors.gray[3]}`,
//           padding: 0,
//         },
//         title: {
//           padding: '0 0 0 20px',
//           width: '100%',
//           fontSize: theme.fontSizes.md,
//           fontWeight: 500,
//         },
//         body: {
//           padding: theme.spacing.md,
//           overflowY: 'auto',
//         },
//         close: {
//           color: theme.colors.dark[7],
//           position: 'absolute',
//           top: '50%',
//           right: '10px',
//           transform: 'translateY(-50%)',
//           '& svg': {
//             fontSize: '24px',
//           },
//           '&:hover': {
//             backgroundColor: theme.colors.gray[0],
//           },
//         },
//       }),
//     },
//     Tooltip: Tooltip.extend({
//       defaultProps: {
//         bg: 'gray.1',
//         c: 'gray.7'
//       }
//     })
//   }
// })

// type Context = {
//   cartCount: number;
//   setCartCount?: Dispatch<SetStateAction<number>>;
// }

// export const AppMainContext = createContext<Context>({
//   cartCount: 0
// });

// function App({ Component, pageProps }: AppProps) {
//   const router = useRouter();
//   const [cartCount, setCartCount] = useState(0);

//   useEffect(() => {
//     const totalCartCount = (JSON.parse(Cookies.get('_cart') ?? '[]') as { qty: number }[]).reduce((q, n) => q + n.qty, 0);
//     setCartCount(totalCartCount)
//   }, [])

//   return (
//     <main className={inter.className}>
//       <NextUIProvider locale='en-UK'>
//         <ToastContainer className={`z-[999]`} />
//         <MantineProvider theme={theme}>
//           <Notifications />
//           <ModalsProvider>
//             {router.pathname.startsWith('/dashboard') ? (
//               <SidebarComponent>
//                 <Component {...pageProps} />
//               </SidebarComponent>
//             ) : router.pathname.startsWith('/login') ||
//               router.pathname.startsWith('/creator') ||
//               router.pathname.startsWith('/login') ||
//               router.pathname.startsWith('/sample')
//             ? (
//               <Component {...pageProps} />
//             ) : (
//               <AppMainContext.Provider value={{ cartCount, setCartCount }}>
//                 <NavbarComponent>
//                   <Component {...pageProps} />
//                 </NavbarComponent>
//               </AppMainContext.Provider>
//             )}
//           </ModalsProvider>
//         </MantineProvider>
//       </NextUIProvider>
//       {/* <ChatBox /> */}
//     </main>
//   );
// }

// export default appWithTranslation(App);

// DOUBLE RENDER KALAU INI

// import '@/styles/globals.css';
// import { Inter } from 'next/font/google';
// import type { AppProps } from 'next/app';
// import { NextUIProvider } from '@nextui-org/react';
// import { ToastContainer } from 'react-toastify';
// import ChatBox from '@/components/chat';
// import 'react-toastify/ReactToastify.min.css';
// const inter = Inter({
//   weight: ['100', '200', '300', '400', '500', '600', '800'],
//   subsets: ['latin'],
//   variable: '--font-inter',
// });
// import SidebarComponent from '@/components/SidebarComponent';
// import '@fortawesome/fontawesome-svg-core/styles.css';
// import { config } from '@fortawesome/fontawesome-svg-core';
// import NavbarComponent from '@/components/NavbarComponent';
// import NavbarBottom from '@/components/NavbarBottom'; // <-- Tambahkan import ini
// import { useRouter } from 'next/router';
// import { Input, MantineProvider, MantineTheme, TextInput, Select, Textarea, TagsInput, ModalProps, NumberFormatter, NumberInput, Table, createTheme, Button, ActionIcon, Tooltip, ColorInput } from '@mantine/core';

// import '@mantine/core/styles.css';
// import '@mantine/notifications/styles.css';
// import '@mantine/carousel/styles.css';
// import '@mantine/dates/styles.css';
// import { Notifications } from '@mantine/notifications';
// import { ModalsProvider } from '@mantine/modals';
// import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';
// import Cookies from 'js-cookie';
// import { DateInput } from '@mantine/dates';
// import appWithTranslation from './i18n';

// config.autoAddCss = false;

// const theme = createTheme({
//   colors: {
//     "blue": [
//       "#edf3fc",
//       "#d9e3f3",
//       "#afc6e9",
//       "#82a6e1",
//       "#5d8bd9",
//       "#477ad6",
//       "#3b72d5",
//       "#2e61bd",
//       "#2656a9",
//       "#184a96"
//     ]
//   },
//   components: {
//     Notifications: Notifications.extend({
//       defaultProps: {
//         position: 'top-right'
//       }
//     }),
//     Button: Button.extend({
//       defaultProps: {
//         radius: "xl",
//         color: "#0B387C",
//       }
//     }),
//     ActionIcon: ActionIcon.extend({
//       defaultProps: {
//         color: "#0B387C",
//       }
//     }),
//     ColorInput: ColorInput.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     Input: Input.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     DateInput: DateInput.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     TextInput: TextInput.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     TagsInput: TagsInput.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     Textarea: Textarea.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     NumberInput: NumberInput.extend({
//       defaultProps: {
//         radius: 10,
//         thousandSeparator: '.',
//         decimalSeparator: ','
//       }
//     }),
//     Select: Select.extend({
//       defaultProps: {
//         radius: 10
//       }
//     }),
//     NumberFormatter: NumberFormatter.extend({
//       defaultProps: {
//         prefix: "Rp ",
//         thousandSeparator: ".",
//         decimalSeparator: ",",
//         className: `whitespace-nowrap`
//       }
//     }),
//     Table: Table.extend({
//         defaultProps: {
//             className: `
//                 [&_thead]:!bg-[#f0f0f0] [&_*]:text-[14px] [&_tbody_td]:bg-white [&_tr:hover_td]:!bg-gray-50 [&_th]:!bg-gray-100
//                 [&_tr_.hoverBtn]:opacity-0 [&_tr:hover_.hoverBtn]:opacity-100
//             `,
//             horizontalSpacing: 20,
//         }
//     }),
//     Modal: {
//       styles: (theme: MantineTheme) => ({
//         content: {
//           borderRadius: '12px',
//           boxShadow: theme.shadows.md,
//           border: `1px solid ${theme.colors.gray[3]}`,
//           width: '600px',
//           maxWidth: '90%',
//         },
//         header: {
//           borderBottom: `1px solid ${theme.colors.gray[3]}`,
//           padding: 0,
//         },
//         title: {
//           padding: '0 0 0 20px',
//           width: '100%',
//           fontSize: theme.fontSizes.md,
//           fontWeight: 500,
//         },
//         body: {
//           padding: theme.spacing.md,
//           overflowY: 'auto',
//         },
//         close: {
//           color: theme.colors.dark[7],
//           position: 'absolute',
//           top: '50%',
//           right: '10px',
//           transform: 'translateY(-50%)',
//           '& svg': {
//             fontSize: '24px',
//           },
//           '&:hover': {
//             backgroundColor: theme.colors.gray[0],
//           },
//         },
//       }),
//     },
//     Tooltip: Tooltip.extend({
//       defaultProps: {
//         bg: 'gray.1',
//         c: 'gray.7'
//       }
//     })
//   }
// })

// type Context = {
//   cartCount: number;
//   setCartCount?: Dispatch<SetStateAction<number>>;
// }

// export const AppMainContext = createContext<Context>({
//   cartCount: 0
// });

// function App({ Component, pageProps }: AppProps) {
//   const router = useRouter();
//   const [cartCount, setCartCount] = useState(0);

//   useEffect(() => {
//     const totalCartCount = (JSON.parse(Cookies.get('_cart') ?? '[]') as { qty: number }[]).reduce((q, n) => q + n.qty, 0);
//     setCartCount(totalCartCount)
//   }, [])

//   // Tentukan halaman yang TIDAK menampilkan navbar bottom
//   const shouldShowNavbarBottom = () => {
//     const { pathname } = router;
    
//     // Halaman yang TIDAK menampilkan navbar bottom
//     const hideNavbarBottomPaths = [
//       '/dashboard',
//       '/login',
//       '/creator',
//       '/login',
//       '/sample',
//       '/create-event',
//       '/merch-cart',
//       '/merch-order',
//       '/transaction-woauth',
//       '/venue-order'
//     ];
    
//     // Cek apakah pathname dimulai dengan salah satu dari hideNavbarBottomPaths
//     const shouldHide = hideNavbarBottomPaths.some(path => 
//       pathname.startsWith(path)
//     );
    
//     // Juga cek jika ada /dashboard/ dalam pathname
//     const isDashboard = pathname.includes('/dashboard/');
    
//     return !shouldHide && !isDashboard;
//   };

//   return (
//     <main className={inter.className}>
//       <NextUIProvider locale='en-UK'>
//         <ToastContainer className={`z-[999]`} />
//         <MantineProvider theme={theme}>
//           <Notifications />
//           <ModalsProvider>
//             {router.pathname.startsWith('/dashboard') ? (
//               <SidebarComponent>
//                 <Component {...pageProps} />
//               </SidebarComponent>
//             ) : router.pathname.startsWith('/login') ||
//               router.pathname.startsWith('/creator') ||
//               router.pathname.startsWith('/login') ||
//               router.pathname.startsWith('/sample')
//             ? (
//               <Component {...pageProps} />
//             ) : (
//               <AppMainContext.Provider value={{ cartCount, setCartCount }}>
//                 <NavbarComponent>
//                   <Component {...pageProps} />
//                 </NavbarComponent>
//                 {/* Tambahkan NavbarBottom di sini */}
//                 {shouldShowNavbarBottom() && <NavbarBottom />}
//               </AppMainContext.Provider>
//             )}
//           </ModalsProvider>
//         </MantineProvider>
//       </NextUIProvider>
//       {/* <ChatBox /> */}
//     </main>
//   );
// }

// export default appWithTranslation(App);

import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import type { AppProps } from 'next/app';
import { NextUIProvider } from '@nextui-org/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/ReactToastify.min.css';
const inter = Inter({
  weight: ['100', '200', '300', '400', '500', '600', '800'],
  subsets: ['latin'],
  variable: '--font-inter',
});
import SidebarComponent from '@/components/SidebarComponent';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import NavbarComponent from '@/components/NavbarComponent';
import NavbarBottom from '@/components/NavbarBottom';
import { useRouter } from 'next/router';
import { Input, MantineProvider, MantineTheme, TextInput, Select, Textarea, TagsInput, ModalProps, NumberFormatter, NumberInput, Table, createTheme, Button, ActionIcon, Tooltip, ColorInput } from '@mantine/core';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/dates/styles.css';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { DateInput } from '@mantine/dates';
import appWithTranslation from './i18n';
import { useMediaQuery } from '@mantine/hooks';

config.autoAddCss = false;

const theme = createTheme({
  colors: {
    "blue": [
      "#edf3fc",
      "#d9e3f3",
      "#afc6e9",
      "#82a6e1",
      "#5d8bd9",
      "#477ad6",
      "#3b72d5",
      "#2e61bd",
      "#2656a9",
      "#184a96"
    ]
  },
  components: {
    Notifications: Notifications.extend({
      defaultProps: {
        position: 'top-right'
      }
    }),
    Button: Button.extend({
      defaultProps: {
        radius: "xl",
        color: "#0B387C",
      }
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        color: "#0B387C",
      }
    }),
    ColorInput: ColorInput.extend({
      defaultProps: {
        radius: 10
      }
    }),
    Input: Input.extend({
      defaultProps: {
        radius: 10
      }
    }),
    DateInput: DateInput.extend({
      defaultProps: {
        radius: 10
      }
    }),
    TextInput: TextInput.extend({
      defaultProps: {
        radius: 10
      }
    }),
    TagsInput: TagsInput.extend({
      defaultProps: {
        radius: 10
      }
    }),
    Textarea: Textarea.extend({
      defaultProps: {
        radius: 10
      }
    }),
    NumberInput: NumberInput.extend({
      defaultProps: {
        radius: 10,
        thousandSeparator: '.',
        decimalSeparator: ','
      }
    }),
    Select: Select.extend({
      defaultProps: {
        radius: 10
      }
    }),
    NumberFormatter: NumberFormatter.extend({
      defaultProps: {
        prefix: "Rp ",
        thousandSeparator: ".",
        decimalSeparator: ",",
        className: `whitespace-nowrap`
      }
    }),
    Table: Table.extend({
        defaultProps: {
            className: `
                [&_thead]:!bg-[#f0f0f0] [&_*]:text-[14px] [&_tbody_td]:bg-white [&_tr:hover_td]:!bg-gray-50 [&_th]:!bg-gray-100
                [&_tr_.hoverBtn]:opacity-0 [&_tr:hover_.hoverBtn]:opacity-100
            `,
            horizontalSpacing: 20,
        }
    }),
    Modal: {
      styles: (theme: MantineTheme) => ({
        content: {
          borderRadius: '12px',
          boxShadow: theme.shadows.md,
          border: `1px solid ${theme.colors.gray[3]}`,
          width: '600px',
          maxWidth: '90%',
        },
        header: {
          borderBottom: `1px solid ${theme.colors.gray[3]}`,
          padding: 0,
        },
        title: {
          padding: '0 0 0 20px',
          width: '100%',
          fontSize: theme.fontSizes.md,
          fontWeight: 500,
        },
        body: {
          padding: theme.spacing.md,
          overflowY: 'auto',
        },
        close: {
          color: theme.colors.dark[7],
          position: 'absolute',
          top: '50%',
          right: '10px',
          transform: 'translateY(-50%)',
          '& svg': {
            fontSize: '24px',
          },
          '&:hover': {
            backgroundColor: theme.colors.gray[0],
          },
        },
      }),
    },
    Tooltip: Tooltip.extend({
      defaultProps: {
        bg: 'gray.1',
        c: 'gray.7'
      }
    })
  }
})

type Context = {
  cartCount: number;
  setCartCount?: Dispatch<SetStateAction<number>>;
}

export const AppMainContext = createContext<Context>({
  cartCount: 0
});

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const totalCartCount = (JSON.parse(Cookies.get('_cart') ?? '[]') as { qty: number }[]).reduce((q, n) => q + n.qty, 0);
    setCartCount(totalCartCount)
  }, [])

  useEffect(() => {
    const userDataStr = Cookies.get('user_data');
    const token = Cookies.get('token');
    
    let userData = null;
    try {
      userData = userDataStr ? JSON.parse(userDataStr) : null;
    } catch (e) {
      console.error('Error parsing user_data:', e);
    }

    const isLoggedIn = !!token && !!userData;
    const role = userData?.role;
    const { pathname } = router;

    // Public paths that guests can access
    const publicPaths = ['/login'];

    if (!isLoggedIn) {
      // If not logged in and not on a public path, redirect to login
      if (!publicPaths.includes(pathname)) {
        router.push('/login');
      }
    } else {
      // If logged in and on login or home page, redirect to appropriate dashboard
      if (pathname === '/login' || pathname === '/') {
        if (role === 'Admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      }

      // Prevent non-admins from accessing admin dashboard
      if (pathname.startsWith('/dashboard/admin') && role !== 'Admin') {
        router.push('/dashboard');
      }

      // If accessing other top-level pages, force to dashboard as per user request
      const isOtherTopLevel = !pathname.startsWith('/dashboard') && !publicPaths.includes(pathname) && pathname !== '/';
      if (isOtherTopLevel) {
        router.push(role === 'Admin' ? '/dashboard/admin' : '/dashboard');
      }
    }
  }, [router.pathname]);

  // Tentukan apakah perlu menampilkan navbar bottom
  const shouldShowNavbarBottom = () => {
    const { pathname } = router;
    
    // Halaman yang TIDAK menampilkan navbar bottom
    const hideNavbarBottomPaths = [
      '/dashboard',
      '/login',
      '/creator',
      '/login',
      '/sample',
      '/dashboard/create-event',
      '/merch-cart',
      '/merch-order',
      '/transaction-woauth',
      '/venue-order'
    ];
    
    // Halaman event detail juga tidak tampilkan navbar bottom
    const isEventDetailPage = pathname.startsWith('/event/') && pathname !== '/event';
    
    const shouldHide = hideNavbarBottomPaths.some(path => 
      pathname.startsWith(path)
    ) || isEventDetailPage;
    
    const isDashboard = pathname.includes('/dashboard/');
    
    // Hanya tampilkan di mobile dan bukan halaman yang harus di-hide
    return isMobile && !shouldHide && !isDashboard;
  };

  return (
    <main className={inter.className}>
      <NextUIProvider locale='en-UK'>
        <ToastContainer className={`z-[999]`} />
        <MantineProvider theme={theme}>
          <Notifications />
          <ModalsProvider>
            {router.pathname.startsWith('/dashboard') ? (
              <SidebarComponent>
                <Component {...pageProps} />
              </SidebarComponent>
            ) : router.pathname.startsWith('/login') ||
              router.pathname.startsWith('/creator') ||
              router.pathname.startsWith('/login') ||
              router.pathname.startsWith('/sample')
            ? (
              <Component {...pageProps} />
            ) : (
              <AppMainContext.Provider value={{ cartCount, setCartCount }}>
                <NavbarComponent>
                  <Component {...pageProps} />
                </NavbarComponent>
                {/* NavbarBottom hanya tampil di mobile dan kondisi tertentu */}
                {shouldShowNavbarBottom() && <NavbarBottom />}
              </AppMainContext.Provider>
            )}
          </ModalsProvider>
        </MantineProvider>
      </NextUIProvider>
      {/* <ChatBox /> */}
    </main>
  );
}

export default appWithTranslation(App);