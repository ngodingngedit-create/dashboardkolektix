import { Icon } from '@iconify/react/dist/iconify.js';
import { Flex } from '@mantine/core';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';

const CreatorTitle = ({
  image,
  creator,
  location,
}: {
  image: StaticImageData | string;
  creator: string;
  location: string;
}) => {
  return (
    <Link className='flex items-center gap-3' href={`/creator/${creator}`}>
      <Image
        width={50}
        height={50}
        src={image}
        alt='image'
        className='w-8 h-8 border border-primary-light-200 rounded-full object-contain'
      />
      <div>
        <Flex gap={8} align="center">
          <p className='font-semibold'>{creator}</p>
          <Icon icon="tdesign:verified-filled" className={`text-primary-base`}/>
        </Flex>
        <p className='text-grey text-xs'>{location}</p>
      </div>
    </Link>
  );
};

export default CreatorTitle;
