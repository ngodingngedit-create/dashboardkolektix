import Logo from '@images/logo.png';
import Image from 'next/image';
import Link from 'next/link';


const FooterData = [
  {
    id: 1,
    title: 'Tentang Kolektix',
    item: [
      { id: 1, name: 'Masuk', link: '/auth' },
      { id: 2, name: 'Biaya', link: '/' },
      { id: 3, name: 'Event', link: '/event' },
      { id: 4, name: 'Kebijakan Privasi', link: '/privacy' },
      { id: 5, name: 'Syarat & Ketentuan', link: '/terms' },
      { id: 6, name: 'Prosedur Pembatalan', link: '/terms/return-policy' },
      { id: 7, name: 'Syarat Pengembalian Dana', link: '/terms/refund' },
      { id: 7, name: 'Tiket Gelang', link: '/wristband' },
      { id: 8, name: 'Laporan', link: '/' },
      { id: 9, name: 'Setting', link: '/' },
    ],
  },
  {
    id: 2,
    title: 'Rayakan Event Kamu',
    item: [
      { id: 1, name: 'Cara Membuat Event' },
      { id: 2, name: 'Cara Mempublikasikan Event' },
      { id: 3, name: 'Cara Mencari Lowongan' },
      { id: 4, name: 'Cara Menjadi Talent' },
      { id: 5, name: 'Syarat & Ketentuan' },
      { id: 6, name: 'Cara Mempromosikan' },
    ],
  },
  {
    id: 3,
    title: 'Lokasi Event',
    item: [
      { id: 1, name: 'Jakarta' },
      { id: 2, name: 'Bandung' },
      { id: 3, name: 'Yogyakarta' },
      { id: 4, name: 'Semarang' },
      { id: 5, name: 'Solo' },
      { id: 6, name: 'Bali' },
      { id: 7, name: 'Yogyakarta' },
      { id: 8, name: 'Medan' },
    ],
  },
  {
    id: 4,
    title: 'Inspirasi Event',
    item: [
      { id: 1, name: 'Musik' },
      { id: 2, name: 'Olahraga' },
      { id: 3, name: 'Otomotif' },
      { id: 4, name: 'Teknologi' },
      { id: 5, name: 'Pendidikan' },
      { id: 6, name: 'Seni' },
      { id: 7, name: 'Pameran' },
      { id: 8, name: 'Medan' },
    ],
  },
];

const Footer = () => {
  return (
    <div className='px-4 sm:px-8 md:px-16 lg:px-32 py-8 md:py-14 bg-gradient-to-b from-primary-dark to-primary-darker text-white'>
      <div className='flex flex-col items-center md:items-start'>
        <Image src={Logo} alt='logo' className='w-1/2 md:w-1/4 lg:w-1/6' />
        <p className='mt-2 text-center md:text-left text-sm'>Masa Depan Tongkrongan</p>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8 md:mt-16 mb-8 md:mb-14'>
        {FooterData.map((el) => (
          <div key={el.id} className='flex flex-col gap-2'>
            <h3 className='mb-4 text-lg md:text-xl font-semibold'>{el.title}</h3>
            {el.item.map((items) => {
              if ('link' in items) {
                return (
                  <Link key={items.id} href={items.link} className='text-sm hover:underline'>
                    {items.name}
                  </Link>
                );
              } else {
                return (
                  <Link key={items.id} href="#" className='text-sm hover:underline'>
                    {items.name}
                  </Link>
                );
              }
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Footer;
