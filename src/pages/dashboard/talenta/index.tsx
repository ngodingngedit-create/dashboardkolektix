import { Get, Post } from '@/utils/REST';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import imagePlus from '../../../assets/icon/camera-plus.png';
import InputField from '@/components/Input';
import Select from '@/components/Input/Select';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/Button';
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toast
import React from 'react';

interface FormTalentaProps {
  name: string;
  email: string;
  profesi: string;
  location: string;
  description: string;
  image: string;
  img?: string;
  document?: File | null;
}

const Talenta = () => {
  const [form, setForm] = useState<FormTalentaProps>({
    name: '',
    email: '',
    profesi: '',
    location: '',
    description: '',
    image: '',
    img: '',
    document: null,
  });

  const [image, setImage] = useState<string | null>(null);
  const [imageIcon, setImageIcon] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch existing data
  const getTalentData = () => {
    setLoading(true);
    Get('talent', {})
      .then((res: any) => {
        console.log('Talenta', res);
        const talent = res.data[0];
        setForm({
          name: talent.name || '',
          email: talent.email || '',
          profesi: talent.has_category?.name || '',
          location: talent.location || '',
          description: talent.description || '',
          image: talent.image_url || '',
          img: '',
          document: null,
        });
        setImage(talent.image_url || '');
        setLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
  };

  // Function to post data to API
  const postTalentData = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('profesi', form.profesi);
    formData.append('location', form.location);
    formData.append('description', form.description);
    formData.append('image', form.image);
    if (form.document) {
      formData.append('document', form.document);
    }

    Post('talent', formData)
      .then((res: any) => {
        console.log('Response from API:', res);
        setLoading(false);
        toast.success('Data berhasil disimpan'); // Show success toast
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
        toast.error('Gagal menyimpan data'); // Show error toast
      });
  };

  useEffect(() => {
    getTalentData();
  }, []);

  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result as string });
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileIcon = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, img: reader.result as string });
        setImageIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, document: file });
    }
  };

  return (
    <>
      <div className='w-full'>
        <div className='max-w-3xl mx-auto pt-10 text-dark h-[90vh] px-4 sm:px-8 md:px-12 lg:px-0 mb-96'>
          <div className='border-2 border-primary-light-200 rounded-xl flex flex-col gap-3'>
            {/* Image Upload */}
            <label className='w-full h-52 border-2 border-primary-light-200 bg-primary-light flex flex-col items-center justify-center gap-4 cursor-pointer'>
              <input
                type='file'
                className='hidden'
                onChange={handleFile}
                accept='image/png, image/gif, image/jpeg'
              />
              {image ? (
                <Image
                  src={image}
                  alt='image'
                  className='object-cover'
                  width={100}
                  height={100}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <>
                  <Image src={imagePlus} alt='image-plus' className='w-8 h-8' />
                </>
              )}
            </label>

            <div className='px-4'>
              {/* Icon Upload */}
              <label className='w-20 h-20 border-2 border-primary-light-200 rounded-full bg-primary-light flex flex-col items-center justify-center gap-4 cursor-pointer absolute -mt-16'>
                <input
                  type='file'
                  className='hidden'
                  onChange={handleFileIcon}
                  accept='image/png, image/gif, image/jpeg'
                />
                {imageIcon ? (
                  <Image
                    src={imageIcon}
                    alt='image'
                    className='object-cover rounded-full'
                    width={100}
                    height={100}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <>
                    <Image src={imagePlus} alt='image-plus' className='w-8 h-8' />
                  </>
                )}
              </label>

              <div className='py-10'>
                {/* Form Fields */}
                <InputField
                  type='text'
                  label='Nama'
                  value={form.name}
                  placeholder='Masukkan Nama'
                  fullWidth
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <InputField
                  type='text'
                  label='Email'
                  value={form.email}
                  placeholder='Masukkan Email'
                  fullWidth
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <InputField
                  type='text'
                  label='Profesi'
                  value={form.profesi}
                  placeholder='Masukkan Profesi'
                  fullWidth
                  onChange={(e) => setForm({ ...form, profesi: e.target.value })}
                />
                {/* Select Fields */}
                <Select
                  label='Kategori'
                  size='lg'
                  options={[
                    { label: 'Option 1', key: 'option-1' },
                    { label: 'Option 2', key: 'option-2' },
                    { label: 'Option 3', key: 'option-3' },
                  ]}
                />
                <InputField
                  type='textarea'
                  label='Tentang Saya'
                  value={form.description}
                  fullWidth
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                {/* Document Upload */}
                <div className='mt-4'>
                  <p className='mb-2 text-grey'>CV/Portofolio</p>
                  <label className='flex items-center cursor-pointer'>
                    <input
                      type='file'
                      className='hidden'
                      onChange={handleDocumentUpload}
                      accept='.pdf,.doc,.docx'
                    />
                    <button className='text-primary-base border border-primary-disabled px-4 py-2 text-sm rounded-xl flex items-center gap-2'>
                      <FontAwesomeIcon icon={faUpload} />
                      Upload
                    </button>
                    <p className='ml-2 text-grey text-xs'>DOC DOCX PDF (2MB)</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-end border-t border-light-grey fixed bottom-0 right-0 p-4 bg-white w-full'>
          <Button
            label='Simpan'
            color='primary'
            className='w-full h-10 md:w-40 text-dark disabled:bg-gray-400 disabled:text-gray-400 disabled:opacity-50'
            onClick={postTalentData}
            disabled={loading}
          />
        </div>
      </div>
      <ToastContainer /> {/* Add ToastContainer to the render */}
    </>
  );
};

export default Talenta;
