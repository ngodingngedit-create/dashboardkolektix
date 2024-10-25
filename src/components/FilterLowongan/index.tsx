import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import style from '../Home/index.module.css';
type FilterLowonganProps = {
  setNameFilter: (name: string) => void;
};

const FilterLowongan: React.FC<FilterLowonganProps> = ({ setNameFilter }) => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputValue(value);
    setNameFilter(value);
  };

  const handleSearchClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className='flex items-center drop-shadow-2xl justify-center w-full bg-transparent relative lg:top-[-5rem] lg:mt-0'>
      <div className='bg-white rounded-full w-full max-w-[900px]'>
        <div className='flex justify-between p-2'>
          <div className='flex flex-col h-full px-2 w-36'>
            <p className='text-xs px-4'>Lowongan</p>
            <input
              type='text'
              className={`${style.customInput} px-4 py-2 text-sm text-dark-grey flex flex-col justify-center mx-auto hover:text-primary-base hover:bg-white h-full font-extralight`}
              placeholder='Cari profesi atau skill'
              value={inputValue}
              onChange={handleNameChange}
            />
          </div>
          <div>
            <button
              className='bg-primary-base rounded-full w-12 h-12 flex items-center justify-center'
              onClick={handleSearchClick}
              disabled={loading}
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className='text-white animate-spin' />
              ) : (
                <FontAwesomeIcon icon={faSearch} className='text-white' />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterLowongan;
