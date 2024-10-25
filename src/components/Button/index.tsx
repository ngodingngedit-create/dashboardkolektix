import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import React from 'react';

interface ButtonProps {
  className?: string;
  onClick?: () => void;
  color?: 'primary' | 'secondary';
  variant?: 'outlined' | 'contained';
  disabled?: boolean;
  fullWidth?: boolean;
  label?: string;
  startIcon?: IconProp;
}

const Button = ({
  onClick,
  className,
  color,
  disabled,
  fullWidth,
  label,
  startIcon,
}: ButtonProps) => {
  return (
    <>
      <button
        disabled={disabled}
        className={`${
          color === 'primary'
            ? 'bg-primary-dark text-white hover:bg-primary-base'
            : color === 'secondary'
            ? 'bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-200'
            : 'bg-primary-base'
        } ${
          fullWidth && 'w-full'
        }  px-4 py-2 font-semibold text-sm rounded-3xl disabled:bg-primary-disabled disabled:cursor-not-allowed transition-background ${className}`}
        onClick={onClick}
      >
        {startIcon ? (
          <p>
            <span>
              <FontAwesomeIcon icon={startIcon} className='mr-1 text-center text-sm' />
            </span>
            {label}
          </p>
        ) : (
          label
        )}
      </button>
    </>
  );
};

export default Button;
