import Images from '@/components/Images';
import Link from 'next/link';

interface VenueCardProps {
  title: string;
  image: string;
  location: string;
  price: number;
}
const VenueCard = ({ title, image, location, price }: VenueCardProps) => {
  return (
    <div className='w-48 flex flex-col text-dark text-sm gap-1'>
      {/* <Image src={foto} alt='fotos'  /> */}
      {image && (
        <Link href={`/venue/detail`}>
          <Images
            src={image}
            type='venue'
            alt={title}
            className='w-48 h-48 object-cover rounded-md'
          />
        </Link>
      )}
      <p className='font-semibold'>{title}</p>
      <p className='text-sm text-grey'>{location}</p>
      <p className='text-primary-dark text-xs'>Mulai dari</p>
      <p className='font-semibold'>
        Rp {price.toLocaleString('id-ID')} <span className='text-grey'>/Hari</span>
      </p>
    </div>
  );
};

export default VenueCard;
