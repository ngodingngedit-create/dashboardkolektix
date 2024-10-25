import React from 'react';
import { DateInput, TimeInput, DatePicker } from '@nextui-org/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faClock } from '@fortawesome/free-regular-svg-icons';
import { parseDate, parseTime, getLocalTimeZone, today, maxDate } from '@internationalized/date';
interface InputProps {
  onChange?: (e: any) => void;
  placeholder?: string;
  type: string;
  fullWidth?: boolean;
  label?: string;
  required?: boolean;
  value?: any;
  disabled?: boolean;
  size?: 'sm' | 'lg';
  maxDateVal?: string;
  minDateVal?: string;
  inputProps?: any;
}

const InputField = ({
  onChange,
  maxDateVal,
  minDateVal,
  placeholder,
  type,
  fullWidth,
  label,
  required,
  value,
  disabled,
  size,
}: InputProps) => {
  const handleKeyPress = (event: any) => {
    const key = event.key;
    if (
      !/[0-9]/.test(key) &&
      key !== 'Backspace' &&
      key !== 'ArrowLeft' &&
      key !== 'ArrowRight' &&
      key !== 'Delete' &&
      key !== 'Tab'
    ) {
      event.preventDefault();
    }
  };
  return (
    <div className='text-dark'>
      {label && (
        <p className='mb-1 text-grey'>
          {label}
          {required && <span className='text-danger'> *</span>}{' '}
        </p>
      )}
      {type === 'number' && (
        <input
          type='text'
          className={`border-primary-light-200 ${
            size === 'lg' ? 'py-2 px-3' : 'px-3 py-2 text-sm'
          }  shadow-sm border focus:outline-primary-disabled rounded-lg ${
            fullWidth ? 'w-full' : 'w-80'
          }`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyPress}
          maxLength={16}
        />
      )}
      {type === 'num' && (
        <input
          type='number'
          className={`border-primary-light-200 ${
            size === 'lg' ? 'py-2 px-3' : 'px-3 py-2 text-sm'
          }  shadow-sm border focus:outline-primary-disabled rounded-lg ${
            fullWidth ? 'w-full' : 'w-80'
          }`}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
        />
      )}
      {type === 'text' && (
        <input
          type='text'
          className={`border-primary-light-200 ${
            size === 'lg' ? 'py-2 px-3' : 'px-3 py-2 text-sm'
          } shadow-sm border focus:outline-primary-disabled rounded-lg disabled:bg-light-grey ${
            fullWidth ? 'w-full' : 'w-80'
          }`}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}
      {type === 'date' && (
        <DatePicker
          className='w-full'
          aria-label='date'
          value={value && parseDate(value)}
          minValue={minDateVal ? parseDate(minDateVal) : today(getLocalTimeZone())}
          maxValue={maxDateVal ? parseDate(maxDateVal) : parseDate('9999-12-31')}
          variant='bordered'
          radius='sm'
          fullWidth={fullWidth}
          dateInputClassNames={{
            inputWrapper:
              'py-2 border border-primary-light-200 hover:border-primary-disabled focus:outline-primary-disabled',
          }}
          // startContent={<FontAwesomeIcon icon={faCalendar} className='text-dark' />}
          onChange={onChange}
        />
      )}
      {type === 'textarea' && (
        <textarea
          className={`border-primary-light-200 px-3 py-2 border-2 focus:outline-primary-disabled rounded-lg ${
            fullWidth ? 'w-full' : 'w-80'
          }`}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
        />
      )}
      {type === 'time' && (
        <TimeInput
          startContent={<FontAwesomeIcon icon={faClock} className='text-dark' />}
          classNames={{
            inputWrapper: 'border-2 shadow-sm border-primary-light-200 bg-white rounded-lg',
          }}
          aria-label='time'
          fullWidth={fullWidth}
          defaultValue={value && parseTime(value)}
          hourCycle={24}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default InputField;
