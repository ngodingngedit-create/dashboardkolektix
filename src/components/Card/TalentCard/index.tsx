import Foto from '@images/Foto=2.png';
import Image from 'next/image';
import Images from '@/components/Images';
import { useState } from 'react';
import Button from '@/components/Button';
import { useRouter } from 'next/router';

interface TalentCardProps {
  name: string;
  image: string;
  skills: string;
  id: number;
}

const TalentCard = ({ name, image, skills, id }: TalentCardProps) => {
  const [bookmark, setBookmark] = useState<boolean>(false);
  const router = useRouter();
  return (
    <div className='min-w-52 max-w-52 bg-white rounded-xl shadow-md border-1.5 border-primary-light-200 ml-1 md:ml-0'>
      <div className=''>
        <div className='h-24 rounded-t-lg relative'>
          <div className='bg-primary-disabled w-full h-16 rounded-t-lg'></div>
          <Images
            path={image}
            type='talent'
            alt='talent'
            className='w-14 h-14 rounded-full object-cover mx-auto left-0 right-0 bottom-0 absolute border-3 border-white'
          />
          {/* <Image
            src={Foto}
            alt='foto'
            className='w-14 h-14 rounded-full object-cover mx-auto left-0 right-0 bottom-0 absolute border-3 border-white'
          /> */}
        </div>
        <div className='flex flex-col items-center gap-1 px-5 pt-2 justify-center text-center'>
          <p className='text-dark font-bold'>{name}</p>
          <a href='#'>
            <p className='mb-2 text-sm font-semibold tracking-tight text-grey'>{skills}</p>
          </a>
        </div>
        {/* <div className='my-4'>
          <p className='text-dark text-sm'>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptate, fuga aut. Placeat
            quibusdam aliquid delectus quae nemo, asperiores aspernatur quas?
          </p>
        </div> */}
        {/* <div className='flex justify-between text-dark items-center text-sm mt-3'>
          <button
            onClick={() => setBookmark(!bookmark)}
            className='inline-flex items-center  py-2 text-base font-medium text-center text-dark  rounded-lg '
          >
            <FontAwesomeIcon icon={bookmark ? bookmarkSolid : faBookmark} className=' text-dark' />
          </button>
          <div className='flex items-center gap-2 text-primary-base text-xs'>
            <Link href='#'>Selengkapnya ...</Link>
          </div>
        </div> */}
        <div className='p-2'>
          <Button
            fullWidth
            color='secondary'
            label='Lihat Profil'
            onClick={() => router.push(`/talent/${id}`)}
          />
        </div>
      </div>
    </div>
  );
};

export default TalentCard;
