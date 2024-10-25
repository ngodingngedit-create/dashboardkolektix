import { useState, useEffect } from 'react';
import Foto from '../../assets/images/Foto=1.png';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Get } from '@/utils/REST';
import CardSection from '@/components/Card/CardSection';
import InputField from '@/components/Input';
import InputSelect from '@/components/Input/Select';
import Button from '@/components/Button';
import { Chip, Breadcrumbs, BreadcrumbItem, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter } from '@nextui-org/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { TalentProps } from '@/utils/globalInterface';
import { formatDate, formatYear } from '@/utils/useFormattedDate';

const TalentDetail = () => {
  const [data, setData] = useState<TalentProps | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [description, setDescription] = useState('');
  const isFormValid = selectedPosition !== '' && description.trim() !== '';
  const router = useRouter();
  const { id } = router.query;
  const getData = () => {
    Get(`talent/${id}`, {})
      .then((res: any) => {
        console.log(res);
        setData(res.data);
      })
      .catch((err: any) => console.log(err));
  };
  useEffect(() => {
    if (id) {
      getData();
    }
  }, [id]);
  return (
    data && (
      <div className='max-w-5xl min-h-screen mx-auto pb-20 pt-24 px-4 sm:px-6 lg:px-8'>
        <Breadcrumbs className='mb-3' color='primary'>
          <BreadcrumbItem href='/'>Beranda</BreadcrumbItem>
          <BreadcrumbItem href='/talent'>Talent</BreadcrumbItem>
          <BreadcrumbItem>{data.name}</BreadcrumbItem>
        </Breadcrumbs>
      <div className='text-dark flex flex-col divide-y divide-primary-light-200'>
      <div className='flex flex-row justify-between items-center gap-4 py-3 flex-wrap'>
        <div className='flex flex-row items-center gap-4 flex-1'>
          <Image src={Foto} alt='creator' className='w-20 h-20 object-cover rounded-full' />
          <div className='flex flex-col gap-1'>
            <h3 className='text-lg font-bold text-center md:text-left'>{data.name}</h3>
            <p className='text-sm text-primary-dark text-center md:text-left'>{data.has_category.name}</p>
          </div>
        </div>
        <div className='flex gap-2 items-center'>
          <Button label='Hire Talent' color='primary' onClick={() => setShowModal(true)}  className='px-6 py-2' />
          <button className='w-10 h-10 border border-primary-light-200 hover:bg-primary-light-200 rounded-full bg-white text-primary-dark'>
            <FontAwesomeIcon icon={faBookmark} />
          </button>
        </div>
    </div>

        <div className='flex flex-col md:flex-row items-start md:items-center gap-4 py-3'>
          <p className='text-xs'>
            <span className='text-grey'>Tanggal Bergabung</span>{' '}
            {`${formatDate(data.created_at)} ${formatYear(data.created_at)}`}
          </p>
        </div>
        <div className='py-5 grid grid-cols-1 md:grid-cols-5 gap-8'>
          <div className='md:col-span-3 flex flex-col gap-5'>
            <CardSection title='Deskripsi Pekerjaan'>
              <>
                {data.description ? (
                  data.description
                ) : (
                  <p className='text-grey'>Tidak ada deskripsi</p>
                )}
              </>
            </CardSection>
          </div>
          <div className='md:col-span-2'>
            <CardSection title='Skills'>
              {data.work_skill.split(',').map((el, idx) => (
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
        </div>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} className='text-dark font-inter'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1 px-5'>Hire Talenta</ModalHeader>
        <ModalBody className='px-0'>
          <div className='flex items-center gap-4 border-t border-b border-primary-light-200 py-4 px-6'>
            <Image src={Foto} alt='creator' className='w-16 h-10 object-cover' />
            <div className='flex flex-col'>
              <p className='font-bold'>{data.name}</p>
              <p>{data.has_category.name}</p>
            </div>
          </div>

          <div className='flex flex-col gap-3 mt-4 px-6'>
            <InputSelect
              label="Select Position"
              placeholder="Select Position"
              aria-label="Select Position"
              className="w-full mt-2"
              options={[
                { key: 'Developer', label: 'Developer' },
                { key: 'Designer', label: 'Designer' },
                { key: 'Manager', label: 'Manager' },
              ]}
              onChange={(e) => setSelectedPosition(e.target.value)}
            />
            <InputField
              type='textarea'
              label='Keterangan'
              placeholder='Masukkan deskripsi'
              fullWidth
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
        <Button
          label='Hire Sekarang'
          color='primary'
          onClick={() => setShowModal(false)}
          className='w-full text-white disabled:bg-gray-400 disabled:text-gray-400 disabled:opacity-50'
          disabled={!isFormValid}
        />
        </ModalFooter>
      </ModalContent>
    </Modal>
    </div>
    )
  );
};

export default TalentDetail;