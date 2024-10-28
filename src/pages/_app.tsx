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
import { MantineProvider, MantineTheme, Modal, ModalProps, createTheme } from '@mantine/core';

import '@mantine/core/styles.css';
import { ModalsProvider } from '@mantine/modals';

config.autoAddCss = false;

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <main className={inter.className}>
      <NextUIProvider locale='en-UK'>
        <MantineProvider>
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
