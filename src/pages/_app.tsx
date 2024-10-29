import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import type { AppProps } from 'next/app';
import { NextUIProvider } from '@nextui-org/react';
import { ToastContainer } from 'react-toastify';
import ChatBox from '@/components/chat';
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
import { useRouter } from 'next/router';
import { MantineProvider, MantineTheme, Modal, ModalProps, Table, createTheme } from '@mantine/core';

import '@mantine/core/styles.css';
import { ModalsProvider } from '@mantine/modals';

config.autoAddCss = false;

const theme = createTheme({
  components: {
    Table: Table.extend({
        defaultProps:{
            className: `
                [&_thead]:!bg-[#f0f0f0] [&_*]:text-[14px] [&_tr:hover]:bg-gray-50 [&_th]:bg-gray-100 [&_th]:font-[500]
                [&_tr_.hoverBtn]:opacity-0 [&_tr:hover_.hoverBtn]:opacity-100 
            `,
            horizontalSpacing: 20
        }
    }),
  }
})

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <main className={inter.className}>
      <NextUIProvider locale='en-UK'>
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <ToastContainer />
            {router.pathname.startsWith('/dashboard') ? (
              <SidebarComponent>
                <Component {...pageProps} />
              </SidebarComponent>
            ) : router.pathname.startsWith('/auth') ? (
              <Component {...pageProps} />
            ) : (
              <NavbarComponent>
                <Component {...pageProps} />
              </NavbarComponent>
            )}
          </ModalsProvider>
        </MantineProvider>
      </NextUIProvider>
      {/* <ChatBox /> */}
    </main>
  );
}
