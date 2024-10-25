import Image from 'next/image';
import config from '@/Config';
import kolektix from '../../assets/images/kolektix-square.webp';
import { useState } from 'react';
import { Modal, ModalBody, ModalContent } from '@nextui-org/react';

interface ImagesProps {
  type: string;
  path: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const ImagesWithModal = ({ path, alt, width, height, className, type }: ImagesProps) => {
  const [open, setOpen] = useState(false);
  return path ? (
    <>
      <div className='relative  text-white'>
        <Image
          src={`${config.assetUrl}${type}/${path}`}
          alt={alt ? alt : 'images'}
          className={
            className
              ? `${className} hover:brightness-50 cursor-pointer transition-all`
              : 'w-full object-cover '
          }
          onClick={() => setOpen(!open)}
          width={width ? width : 200}
          height={height ? height : 200}
        />
        {/* <div className='absolute left-[45%] top-1/2 text-xl hover:opacity-100 opacity-0 transition-opacity cursor-default'>
          Perbesar
        </div> */}
      </div>
      <Modal
        isOpen={open}
        onOpenChange={setOpen}
        size='4xl'
        backdrop='blur'
        shadow='lg'
        radius='sm'
      >
        <ModalContent>
          <ModalBody>
            <div className='flex items-center justify-center my-6 mx-2'>
              <Image
                src={`${config.assetUrl}${type}/${path}`}
                alt={alt ? alt : 'images'}
                className='w-full object-cover rounded-md'
                width={width ? width : 200}
                height={height ? height : 200}
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  ) : (
    <Image
      src={kolektix}
      alt={alt ? alt : 'images'}
      className={className ? `${className}` : 'w-full object-cover'}
      width={width ? width : 200}
      height={height ? height : 200}
    />
  );
};

export default ImagesWithModal;
