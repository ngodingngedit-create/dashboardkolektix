import React from 'react';

interface CardSectionProps {
  title: string;
  children: React.ReactNode;
}

const CardSection = ({ title, children }: CardSectionProps) => {
  return (
    <div className='border border-primary-light-200 rounded-lg mx-auto w-full'>
      <div className='border-b border-primary-light-200 px-4 py-3 flex justify-between items-center'>
        <h3 className='text-medium font-semibold'>{title}</h3>
      </div>
      <div className='px-4 py-3'>{children}</div>
    </div>
  );
};

export default CardSection;
