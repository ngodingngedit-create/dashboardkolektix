import React from 'react';
import { Select, SelectItem } from '@nextui-org/react';

interface OptionProps {
  label: string;
  key: string;
}

interface InputSelectProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'lg';
  options: OptionProps[];
  onChange?: (e: any) => void;
  multiple?: boolean;
}

export default function InputSelect({
  label,
  required,
  options,
  onChange,
  placeholder,
  multiple = false, // Default value is false
}: InputSelectProps) {
  return (
    <div className="border-primary-light-200 h-auto text-sm mb-4">
      {label && (
        <p className="mb-1 text-grey">
          {label}
          {required && <span className="text-danger"> *</span>}
        </p>
      )}
      <Select
        size="sm"
        onChange={onChange}
        selectionMode={multiple ? 'multiple' : 'single'} // Added selection mode
        defaultSelectedKeys={options[0].key}
        placeholder={placeholder}
        classNames={{
          mainWrapper: 'border shadow-sm border-primary-light-200 bg-white rounded-lg',
          trigger: 'bg-white rounded-lg hover:bg-primary-light h-9',
        }}
      >
        {options.map((item) => (
          <SelectItem className="text-dark" key={item.key}>
            {item.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
