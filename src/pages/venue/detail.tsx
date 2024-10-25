import React from 'react';
import foto from '../../assets/images/Banner-amis.png';
import CreatorTitle from '@/components/Creator/CreatorTitle';
import Button from '@/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronLeft, faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { Chip } from '@nextui-org/react';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';
import InputField from '@/components/Input';

const facility = [
  'Free Wifi',
  'Toilet',
  'Ruangan Full AC',
  'Kursi',
  'Lighting',
  'Stage',
  'Parking Area',
  'Rest Area',
  'Sound System',
  'Back Stage',
];

const VenueDetail = () => {
  return (
    <div  className='max-w-5xl min-h-screen mx-auto py-20 px-4 sm:px-8 md:px-12 lg:px-0'>
      <div className=''>
        <Breadcrumbs>
          <BreadcrumbItem>Beranda</BreadcrumbItem>
          <BreadcrumbItem>List Venue</BreadcrumbItem>
          <BreadcrumbItem>Detail</BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <div className='flex w-full py-5 h-[500px] gap-2'>
        <Image src={foto} alt='Banner' className='w-1/2 object-cover rounded-md' />
        <div className='grid grid-cols-2 gap-2'>
          <Image src={foto} alt='Banner' className='h-full object-cover rounded-md' />
          <Image src={foto} alt='Banner' className='h-full object-cover rounded-md' />
          <Image src={foto} alt='Banner' className='h-full object-cover rounded-md' />
          <Image src={foto} alt='Banner' className='h-full object-cover rounded-md' />
        </div>
      </div>
      <div className='flex flex-col md:flex-row text-dark gap-3'>
        <div className='w-full md:w-2/3 flex flex-col gap-4'>
          <div>
            <h3 className='font-semibold mb-2'>Cahaya Bangsa Nusantara</h3>
            <p className='text-sm'>Jakarta</p>
          </div>
          <div className='border-y-primary-light-200 border-y flex justify-between items-center py-4'>
            <CreatorTitle image={foto} creator='Ismaya Group' location='Jakarta' />
            <Button label='Lihat Host' color='secondary' />
          </div>
        <div className='border-b border-b-primary-light-200 pb-4'>
          <h6 className='text-lg font-semibold mb-4'>Spesifikasi</h6>
        <div className='flex flex-col md:flex-row items-start md:items-center mt-4'>
          <div className='flex-1 border-b md:border-r border-primary-light-200 pb-4 md:pb-0 md:pr-4 md:mr-4'>
            <p className='text-grey text-sm mb-1'>Maksimal Kapasitas</p>
            <p className='font-semibold text-lg'>50.000</p>
          </div>
          <div className='flex-1 pt-4 md:pt-0'>
            <p className='text-grey text-sm mb-1'>Jumlah Kursi</p>
            <p className='font-semibold text-lg'>20.000</p>
          </div>
        </div>
        <div className='mt-4'>
          <p className='text-grey text-sm mb-2'>Fasilitas</p>
          <div className='flex flex-wrap'>
            {facility.map((el, idx) => (
              <Chip
                color='default'
                size='sm'
                key={idx}
                classNames={{ base: 'mr-2 mb-2', content: 'font-semibold' }}
              >
                {el}
              </Chip>
            ))}
          </div>
        </div>
</div>

    <div className='border-b border-b-primary-light-200 pb-4'>
      <h6>Tentang Venue</h6>
      <p className='mt-4'>
        For more than 6 years, Cahaya Bangsa Nusantara has been dedicated to providing
        excellent service and completing every need. we are ready to help businesses of all
        levels to expand their business throughout Asia within easy reach. Located in the
        golden triangle of Jakarta Kuningan, a building that offers many facilities and easy
        access, we offer a variety of services, ranging from auditorium rentals, function
        halls, company rental establishment services, virtual offices and the right local
        business partner connections. Our solutions are customized to the needs of our clients
        because every business is unique. CBN arranges everything to meet your needs and help
        make your wishes come true, more than just a service provider, but a reliable partner
        in the process of growing your company towards success.
      </p>
    </div>
    <div>
      <h6>Lokasi Venue</h6>
      <p className='text-grey mt-4'>
        Menara Kuningan, Gedung, Jl. H. R. Rasuna Said No.5, RT.6/RW.7, Kuningan, Karet
        Kuningan, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12940
      </p>
      <div className='mt-4'>
        <iframe
          src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.239516341929!2d106.82918257586827!3d-6.232123761033168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e8cbb9e497%3A0xc9b90fc0ac3963bc!2sMenara%20Kadin%20Indonesia%2C%20Jl.%20H.%20R.%20Rasuna%20Said%20Blok%20X-5%20No.Kav.%202-3%2C%20RT.1%2FRW.2%2C%20Kuningan%2C%20Kuningan%20Tim.%2C%20Kecamatan%20Setiabudi%2C%20Kota%20Jakarta%20Selatan%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2012950!5e0!3m2!1sid!2sid!4v1721144578839!5m2!1sid!2sid'
          width='100%'
          height='200'
          style={{ border: 0, borderRadius: 10 }}
          allowFullScreen={false}
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'
        ></iframe>
      </div>
    </div>
  </div>

  <div className='w-full md:w-1/3'>
    <div className='border border-primary-light-200 rounded-lg p-4 flex flex-col gap-2 shadow-sm'>
      <div>
        <p className='text-primary-base mb-1'>Mulai dari</p>
        <h6>
          Rp1.250.000<span className='text-grey'>/Hari</span>{' '}
        </h6>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-2 my-2'>
        <InputField type='text' size='sm' placeholder='Dari Tanggal' fullWidth />
        <InputField type='text' size='sm' placeholder='Sampai Tanggal' fullWidth />
      </div>
      <Button color='primary' label='Book' fullWidth />
    </div>
    <div className='border border-primary-light-200 rounded-lg flex flex-col gap-2 shadow-sm mt-7'>
      <div className='border-b border-primary-light-200 p-4'>
        <h6>Jadwal Event</h6>
      </div>
      <div className='px-4 py-2'>
        <div className='flex items-center justify-between'>
          <p className='text-xl font-semibold'>Mei 2024</p>
          <div className='grid grid-cols-2 gap-4'>
            <button className='w-8 h-8 rounded-full border border-primary-light-200'>
              <FontAwesomeIcon icon={faCircleChevronLeft} className='text-grey' />
            </button>
            <button className='w-8 h-8 rounded-full border border-primary-light-200'>
              <FontAwesomeIcon icon={faCircleChevronRight} className='text-grey' />
            </button>
          </div>
        </div>
        <div className='mt-4 flex flex-col md:flex-row items-center'>
          <div className='w-full md:w-[15%]'>
            <p>Sen</p>
            <p className='font-semibold text-lg'>15</p>
          </div>
          <div className='w-full md:w-[85%] border border-primary-light-200 rounded-md p-2 mt-2 md:mt-0'>
            <p className='font-semibold'>We The Fest</p>
            <p className='text-grey'>12:00 - 14:00</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default VenueDetail;
