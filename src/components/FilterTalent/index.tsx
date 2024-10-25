import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu, MenuButton, MenuItem, Transition, MenuItems } from '@headlessui/react';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import style from '../Home/index.module.css';


type FilterTalentProps = {
  setNameFilter: (name: string) => void;
  setCategoryFilter: (category: string) => void;
  categories: string[]; 
};


const FilterTalent: React.FC<FilterTalentProps> = ({ setNameFilter, setCategoryFilter, categories }) => {
  const [inputValue, setInputValue] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputValue(value);
    setNameFilter(value);
  };

  return (
    <div className='flex items-center drop-shadow-2xl justify-center w-full bg-transparent relative lg:top-[-5rem] lg:mt-0'>
    <div className='bg-white rounded-full w-full max-w-[900px]'>
      <div className='flex p-2'>
        <div className='flex flex-col h-full px-2 w-36'>
          <p className='text-xs px-4'>Nama Talent</p>
          <input
            type='text'
            className={`${style.customInput} px-4 py-2 text-sm text-dark-grey flex flex-col justify-center mx-auto hover:text-primary-base hover:bg-white h-full font-extralight`}
            placeholder='Cari Nama Talent'
            value={inputValue}
            onChange={handleNameChange}
          />
        </div>
        <div className='w-px h-12 bg-gray-200 mx-4'></div>
        <Menu>
          <div className='flex flex-col justify-center mx-auto h-full border-l-1 w-36 px-2'>
            <p className='text-xs px-4'>Industri</p>
            <MenuButton className='rounded-full px-4 py-2 text-sm font-medium text-dark-grey flex flex-col justify-center hover:text-primary-base hover:bg-white h-full'>
              <p className='font-extralight'>Pilih Industri</p>
            </MenuButton>
          </div>
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
              {categories.map((item: string, index: number) => (
                <MenuItem key={index}>
                  {({ active }) => (
                    <button
                      className='group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10'
                      onClick={() => setCategoryFilter(item)}
                    >
                      {item}
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Transition>
        </Menu>
  
        {/* Search Button */}
        <div>
          <button className='bg-primary-base rounded-full w-12 h-12'>
            <FontAwesomeIcon icon={faSearch} className='text-white' />
          </button>
        </div>
      </div>
    </div>
  </div>
  
  );
};

export default FilterTalent;
