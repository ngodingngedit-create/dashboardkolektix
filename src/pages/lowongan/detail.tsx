import React from 'react';
import Foto from '../../assets/images/Foto=1.png';
import Image from 'next/image';
import CardSection from '@/components/Card/CardSection';
import { Chip, Breadcrumbs, BreadcrumbItem } from '@nextui-org/react';
import Button from '@/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';

const skills = [
  'Audio Operator',
  'FOH',
  'Midas/X32 Mixer',
  'Steinberg Cubase',
  'Studio One',
  'Live Mixing',
];

const VacancyDetail = () => {
  return (
    <div className='max-w-5xl min-h-screen mx-auto pb-20 pt-24 px-4 sm:px-8 md:px-12 lg:px-0'>
      <Breadcrumbs className='mb-3' color='primary'>
        <BreadcrumbItem>Beranda</BreadcrumbItem>
        <BreadcrumbItem>Lowongan</BreadcrumbItem>
        <BreadcrumbItem>Sound Engineer</BreadcrumbItem>
      </Breadcrumbs>
      <div className='text-dark flex flex-col divide-y divide-primary-light-200'>
        <div className='flex flex-col md:flex-row justify-between'>
          <div className='flex gap-3 py-3'>
            <div>
              <Image src={Foto} alt='creator' className='w-20 h-20 lg:w-30 lg:h-20 object-cover rounded-sm' />
            </div>
            <div className='flex flex-col'>
              <div className='mb-2'>
                <p className='font-semibold text-primary-base'>Sound Engineer</p>
                <p className='tracking-tight text-dark my-0.5'>Mahaka Production</p>
                <p className='text-grey'>Jakarta Selatan</p>
              </div>
              <div className='flex flex-col gap-2'>
                <p className='text-grey text-xs'>
                  Type <span className='text-dark'>Full-Time</span>
                </p>
              </div>
            </div>
          </div>
          <div className='flex gap-2 items-start mt-4 md:mt-0 mb-4 lg:mb-0 md:mb-0 justify-end lg:justify-normal md:justify-normal'>
            <Button color='primary' label='Lamar Pekerjaan' />
            <button className='w-10 h-10 border border-primary-light-200 hover:bg-primary-light-200 rounded-full bg-white text-primary-dark'>
              <FontAwesomeIcon icon={faBookmark} />
            </button>
          </div>
        </div>
        <div className='flex flex-col md:flex-row items-center gap-4 py-3'>
          <p className='text-xs'>
            <span className='text-grey'>Tanggal Dibuat</span> 3 Jul 2024
          </p>
          <p className='hidden md:block text-xs'>&bull;</p>
          <p className='text-xs'>
            <span className='text-grey'>Update Terakhir</span> 13 Jul 2024
          </p>
        </div>
        <div className='py-5 grid grid-cols-1 md:grid-cols-5 gap-8'>
          <div className='col-span-1 md:col-span-3 flex flex-col gap-5'>
            <CardSection title='Deskripsi Pekerjaan'>
              <p>
                For more than 6 years, Cahaya Bangsa Nusantara has been dedicated to providing
                excellent service and completing every need. we are ready to help businesses of all
                levels to expand their business throughout Asia within easy reach. Located in the
                golden triangle of Jakarta Kuningan, a building that offers many facilities and easy
                access, we offer a variety of services, ranging from auditorium rentals, function
                halls, company rental establishment services, virtual offices and the right local
                business partner connections. Our solutions are customized to the needs of our
                clients because every business is unique. CBN arranges everything to meet your needs
                and help make your wishes come true, more than just a service provider, but a
                reliable partner in the process of growing your company towards success.
              </p>
            </CardSection>
            <CardSection title='Skill Yang Dibutuhkan'>
              {skills.map((el, idx) => (
                <Chip
                  color='default'
                  size='sm'
                  key={idx}
                  classNames={{ base: 'mr-2 mb-2', content: 'font-semibold' }}
                >
                  {el}
                </Chip>
              ))}
            </CardSection>
          </div>
          <div className='col-span-1 md:col-span-2'>
            <CardSection title='Tentang Perusahaan'>
              <p>
                For more than 6 years, Cahaya Bangsa Nusantara has been dedicated to providing
                excellent service and completing every need. we are ready to help businesses of all
                levels to expand their business throughout Asia within easy reach. Located in the
                golden triangle of Jakarta Kuningan, a building that offers many facilities and easy
                access, we offer a variety of services, ranging from auditorium rentals, function
                halls, company rental establishment services, virtual offices and the right local
                business partner connections. Our solutions are customized to the needs of our
                clients because every business is unique. CBN arranges everything to meet your needs
                and help make your wishes come true, more than just a service provider, but a
                reliable partner in the process of growing your company towards success.
              </p>
            </CardSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacancyDetail;
