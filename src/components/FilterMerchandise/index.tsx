import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu, MenuButton, MenuItem, Transition, MenuItems } from '@headlessui/react';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import style from '../Home/index.module.css';

type FilterMerchandiseProps = {

};

const FilterMerchandise: React.FC<FilterMerchandiseProps> = ({  }) => {
    const [inputValue, setInputValue] = useState('');

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // setInputValue(value);
        // setNameFilter(value);
    };

    return (
        <div className="flex items-center justify-center w-full bg-transparent relative lg:mt-[-4rem] lg:mb-[30px]">
            <div className="bg-white border rounded-full w-full max-w-[900px]" style={{ borderColor: '#d0d0d0' }}>
                <div className="flex py-2 px-4">
                    <div className="flex flex-col h-full px-2 w-full">
                        <p className="text-xs">Merchandise</p>
                        <input type="text" className={`${style.customInput} py-2 w-full text-sm text-dark-grey text-start mx-auto hover:text-primary-base hover:bg-white h-full font-extralight`} placeholder="Cari Merchandise" value={inputValue} onChange={handleNameChange} />
                    </div>
                    <div className="w-px h-12 bg-[#d0d0d0] mx-4 shrink-0"></div>
                    <div className="flex flex-col h-full px-2 w-full">
                        <p className="text-xs">Lokasi</p>
                        <input type="text" className={`${style.customInput} py-2 w-full text-sm text-dark-grey text-start mx-auto hover:text-primary-base hover:bg-white h-full font-extralight`} placeholder="Pilih Lokasi" value={inputValue} onChange={handleNameChange} />
                    </div>
                    <div className="w-px h-12 bg-[#d0d0d0] mx-4 shrink-0"></div>
                    <div className="flex flex-col h-full px-2 w-full">
                        <p className="text-xs">Harga</p>
                        <input type="text" className={`${style.customInput} py-2 w-full text-sm text-dark-grey text-start mx-auto hover:text-primary-base hover:bg-white h-full font-extralight`} placeholder="Masukan Harga" value={inputValue} onChange={handleNameChange} />
                    </div>

                    {/* <Menu>
                        <div className="flex flex-col justify-center mx-auto h-full border-l-1 w-36 px-2">
                            <p className="text-xs px-4">Industri</p>
                            <MenuButton className="rounded-full px-4 py-2 text-sm font-medium text-dark-grey flex flex-col justify-center hover:text-primary-base hover:bg-white h-full">
                                <p className="font-extralight">Pilih Industri</p>
                            </MenuButton>
                        </div>
                        <Transition enter="transition ease-out duration-75" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-100" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <MenuItems anchor="bottom end" className="w-52 z-50 origin-top-right rounded-xl border border-white/5 bg-white p-1 text-sm/6 text-dark [--anchor-gap:var(--spacing-1)] focus:outline-none">
                                {categories.map((item: string, index: number) => (
                                    <MenuItem key={index}>
                                        {({ active }) => (
                                            <button className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-white/10" onClick={() => setCategoryFilter(item)}>
                                                {item}
                                            </button>
                                        )}
                                    </MenuItem>
                                ))}
                            </MenuItems>
                        </Transition>
                    </Menu> */}

                    <div>
                        <button className="bg-primary-base rounded-full w-12 h-12">
                            <FontAwesomeIcon icon={faSearch} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterMerchandise;
