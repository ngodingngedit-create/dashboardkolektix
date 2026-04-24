import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import React from 'react';
import { LoadingOverlay } from '@mantine/core';

interface ButtonProps {
  className?: string;
  onClick?: () => void;
  color?: 'primary' | 'secondary';
  variant?: 'outlined' | 'contained';
  disabled?: boolean;
  fullWidth?: boolean;
  label?: string;
  startIcon?: IconProp;
  loading?: boolean;
}

const Button = ({
  onClick,
  className,
  color,
  disabled,
  fullWidth,
  label,
  startIcon,
  loading,
}: ButtonProps) => {
  return (
    <>
      <button
        disabled={disabled}
        className={`
          ${loading ? 'pointer-events-none' : ''}
        ${
          color === 'primary'
            ? 'bg-primary-dark text-white hover:bg-primary-base'
            : color === 'secondary'
            ? 'bg-white border border-primary-light-200 text-primary-base hover:bg-primary-light-200'
            : 'bg-primary-base'
        } ${
          fullWidth && 'w-full'
        } relative px-4 py-2 font-semibold text-sm rounded-3xl disabled:bg-primary-disabled disabled:cursor-not-allowed transition-background ${className}`}
        onClick={onClick}
      >
        <LoadingOverlay visible={loading} loaderProps={{  size: 'sm', color: '#0b387c' }} />
        {startIcon ? (
          <p>
            <span>
              <FontAwesomeIcon icon={startIcon} className={`${label ? 'mr-1' : ''} text-center text-sm`} />
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
