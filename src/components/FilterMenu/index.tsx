import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu, MenuButton, MenuItem, Transition, MenuItems } from '@headlessui/react';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const Data = [
  {
    id: 1,
    title: 'Lokasi',
    subtitle: 'Pilih Lokasi',
    items: [
      { id: 1, name: 'Jakarta' },
      { id: 2, name: 'Bandung' },
      { id: 3, name: 'Yogyakarta' },
      { id: 4, name: 'Semarang' },
      { id: 5, name: 'Solo' },
      { id: 6, name: 'Bali' },
      { id: 7, name: 'Medan' },
    ],
  },
  {
    id: 2,
    title: 'Kategori',
    subtitle: 'Pilih Kategori',
    items: [
      { id: 1, name: 'Musik' },
      { id: 2, name: 'Olahraga' },
      { id: 3, name: 'Seminar' },
      { id: 4, name: 'Pendidikan' },
      { id: 5, name: 'Game' },
      { id: 6, name: 'Teknologi' },
      { id: 7, name: 'Wisata' },
      { id: 8, name: 'Seni' },
    ],
  },
  {
    id: 3,
    title: 'Waktu',
    subtitle: 'Pilih Waktu',
    items: [
      { id: 1, name: 'Minggu Ini' },
      { id: 2, name: 'Minggu Depan' },
      { id: 3, name: 'Bulan Ini' },
      { id: 4, name: 'Bulan Depan' },
    ],
  },
  {
    id: 4,
    title: 'Harga',
    subtitle: 'Pilih Harga',
    items: [
      { id: 1, name: 'Semua Harga' },
      { id: 2, name: 'Berbayar' },
      { id: 3, name: 'Gratis' },
    ],
  },
  {
    id: 7,
    title: 'Tipe',
    subtitle: 'Pilih Tipe',
    items: [
      { id: 1, name: 'Offline' },
      { id: 2, name: 'Online' },
    ],
  },
];

const FilterMenu = () => {
  return (
    <div className='flex items-center drop-shadow-2xl justify-center pb-3 fixed w-full bg-gradient-to-b from-primary-dark to-primary-darker'>
      <div className='bg-[#02255A] rounded-full'>
        <div className='flex items-center h-20 p-2'>
          {Data.map((el: any, idx: number) => (
            <Menu key={el.id}>
              <MenuButton className='rounded-full px-4 py-2 text-sm font-medium text-white flex flex-col justify-center mx-auto hover:text-primary-base hover:bg-white h-full w-36'>
                <p className='text-xs'>{el.title}</p>
                <p className='font-extralight'>{el.subtitle}</p>
              </MenuButton>
              <Transition
                enter='transition ease-out duration-75'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='transition ease-in duration-100'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <MenuItems
                  anchor='bottom end'
                  className='w-52 z-50 origin-top-right rounded-xl border border-white/5 bg-white p-1 text-sm/6 text-dark [--anchor-gap:var(--spacing-1)] focus:outline-none'
                >
                  {el.items.map((item: any) => (
                    <MenuItem key={item.id}>
                      <button className='group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10 '>
                        {item.name}
                      </button>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Transition>
            </Menu>
          ))}
          <div className=''>
            <button className='bg-primary-base rounded-full w-16 h-16'>
              <FontAwesomeIcon icon={faSearch} className='text-white' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;
