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
        <p className='font-semibold'>{creator}</p>
        <p className='text-grey text-xs'>{location}</p>
      </div>
    </Link>
  );
};

export default CreatorTitle;
