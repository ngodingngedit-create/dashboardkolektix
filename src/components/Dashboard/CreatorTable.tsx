import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@iconify/react/dist/iconify.js';

interface CreatorTableProps {
  title: string;
  icon?: string;
  value: number;
  currency?: boolean;
  yBorderNone?: boolean;
  xBorderNone?: boolean;
}

const CreatorTable = ({ title, value, currency, xBorderNone, yBorderNone, icon }: CreatorTableProps) => {
  return (
    <div
      className={`overflow-hidden relative flex flex-col justify-between gap-2 p-4 border border-primary-light-200 rounded-md ${
        currency ? 'col-span-1 lg:col-span-2' : 'col-span-1'
      } ${xBorderNone ? '!border-l-0' : ''} ${yBorderNone ? '!border-t-0' : ''} bg-white shadow-sm`}
    >
      <div className="flex justify-between items-center">
        <p className="text-dark-grey text-xs font-medium">{title}</p>
        {!currency && (
          <div className="flex items-center gap-2">
            <p className="text-primary-base text-xs font-semibold">Detail</p>
            <div className="w-4 h-4 rounded-full flex items-center justify-center border border-primary-base">
              <FontAwesomeIcon icon={faArrowRight} className="text-primary-base text-[9px]" />
            </div>
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold">
        {currency ? 'Rp. ' : ''}
        {value.toLocaleString()} {/* Ensure number formatting */}
      </h3>
      {icon && <Icon icon={icon} className={`absolute text-[64px] opacity-15 bottom-[-15px] right-[5px] text-primary-disabled`} />}
    </div>
  );
};

export default CreatorTable;
