import Image, { StaticImageData } from 'next/image';

const CreatorTitle = ({
  image,
  creator,
  location,
}: {
  image: StaticImageData;
  creator: string;
  location: string;
}) => {
  return (
    <div className='flex items-center gap-3'>
      <Image
        src={image}
        alt='image'
        className='w-8 h-8 border border-primary-light-200 rounded-full object-contain'
      />
      <div>
        <p className='font-semibold'>{creator}</p>
        <p className='text-grey text-xs'>{location}</p>
      </div>
    </div>
  );
};

export default CreatorTitle;
