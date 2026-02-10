import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faCalendarDays, 
  faShirt, 
  faSearch,
  faUser,
  faHeart,
  faShoppingCart,
  faBell
} from '@fortawesome/free-solid-svg-icons';
import { faUser as faUserRegular } from '@fortawesome/free-regular-svg-icons';
import useWindowSize from '@/utils/useWindowSize';
import Cookies from 'js-cookie';
import useLoggedUser from '@/utils/useLoggedUser';
import { Indicator } from '@mantine/core';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  activeIcon?: any;
  path: string;
  activePaths: string[];
  badgeCount?: number;
  isAction?: boolean;
}

const NavbarBottom: React.FC = () => {
  const router = useRouter();
  const { pathname } = router;
  const { width } = useWindowSize();
  const users = useLoggedUser();
  const isLoggedIn = !!users?.name;
  
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Ambil jumlah cart dari cookies
  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(Cookies.get('_cart') ?? '[]') as { qty: number }[];
      const total = cartItems.reduce((sum, item) => sum + (item.qty || 0), 0);
      setCartCount(total);
    };

    updateCartCount();
    
    // Update cart count setiap 2 detik untuk real-time
    const interval = setInterval(updateCartCount, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Hanya 4 item: Home, Event, Merch, Search
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: faHome,
      activeIcon: faHome,
      path: '/',
      activePaths: ['/', '/home']
    },
    {
      id: 'event',
      label: 'Event',
      icon: faCalendarDays,
      activeIcon: faCalendarDays,
      path: '/event',
      activePaths: ['/event', '/event/']
    },
    {
      id: 'merch',
      label: 'Merch',
      icon: faShirt,
      activeIcon: faShirt,
      path: '/merchandise',
      activePaths: ['/merchandise', '/merchandise/'],
      badgeCount: cartCount
    },
    {
      id: 'search',
      label: 'Cari',
      icon: faSearch,
      activeIcon: faSearch,
      path: '/search',
      activePaths: ['/search'],
      isAction: true
    }
  ];

  const isActive = (item: NavItem) => {
    return item.activePaths.some(path => 
      pathname === path || 
      (path !== '/' && pathname.startsWith(path))
    );
  };

  const handleSearchClick = () => {
    // Fokus ke input search di navbar utama
    const searchButton = document.querySelector('button[aria-label="Search"], button[title*="Cari"]') as HTMLButtonElement;
    if (searchButton) {
      searchButton.click();
    } else {
      // Fallback: buka modal search dengan URL
      router.push('/search');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item);
    const IconComponent = active && item.activeIcon ? item.activeIcon : item.icon;
    
    const content = (
      <div className="relative flex flex-col items-center justify-center">
        {item.badgeCount && item.badgeCount > 0 ? (
          <Indicator
            inline
            label={item.badgeCount > 99 ? '99+' : item.badgeCount}
            size={item.badgeCount > 9 ? 20 : 18}
            color="red"
            offset={5}
            withBorder
            className="!absolute -top-1 -right-1"
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              active 
                ? 'bg-gradient-to-br from-primary-light-100 to-primary-light-200 shadow-md' 
                : 'hover:bg-gray-100'
            }`}>
              <FontAwesomeIcon 
                icon={IconComponent} 
                className={`text-lg transition-colors duration-300 ${
                  active ? 'text-primary-dark' : 'text-gray-500'
                }`}
              />
            </div>
          </Indicator>
        ) : (
          <div className={`p-2 rounded-xl transition-all duration-300 ${
            active 
              ? 'bg-gradient-to-br from-primary-light-100 to-primary-light-200 shadow-md' 
              : 'hover:bg-gray-100'
          }`}>
            <FontAwesomeIcon 
              icon={IconComponent} 
              className={`text-lg transition-colors duration-300 ${
                active ? 'text-primary-dark' : 'text-gray-500'
              }`}
            />
          </div>
        )}
        
        <span className={`text-[10px] sm:text-xs mt-1 transition-all duration-300 ${
          active 
            ? 'font-bold text-primary-dark scale-105' 
            : 'font-medium text-gray-600'
        }`}>
          {item.label}
        </span>
        
        {/* Active indicator */}
        {active && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="w-6 h-1 bg-gradient-to-r from-primary-base to-primary-dark rounded-full"></div>
          </div>
        )}
      </div>
    );

    if (item.isAction) {
      return (
        <button
          key={item.id}
          onClick={item.id === 'search' ? handleSearchClick : undefined}
          className="flex-1 flex justify-center"
          aria-label={item.label}
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.path}
        className="flex-1 flex justify-center"
      >
        {content}
      </Link>
    );
  };

  return (
    <>
      {/* Spacer untuk menghindari konten tertutup */}
      <div className="h-16 md:hidden"></div>
      
      {/* Navbar Bottom - Hanya 4 item */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 md:hidden ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-xl' 
          : 'bg-white border-t border-gray-100 shadow-lg'
      }`}>
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map(renderNavItem)}
        </div>
        
        {/* Safe area untuk device dengan notch */}
        <div className="h-safe-bottom bg-inherit"></div>
      </div>
      
      <style jsx>{`
        .h-safe-bottom {
          height: env(safe-area-inset-bottom, 0px);
          background-color: inherit;
          backdrop-filter: inherit;
        }
        
        /* Smooth transition untuk backdrop blur */
        .backdrop-blur-lg {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        /* Gradient text untuk label aktif */
        .text-gradient {
          background: linear-gradient(135deg, #0B387C 0%, #3B82F6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* Animasi pulse untuk badge */
        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .pulse-animation {
          animation: pulse-gentle 2s infinite;
        }
      `}</style>
    </>
  );
};

export default NavbarBottom;