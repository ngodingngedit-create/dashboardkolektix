import { Get, Post } from '@/utils/REST';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import imagePlus from '../../../assets/icon/camera-plus.png';
import InputField from '@/components/Input';
// import Select from '@/components/Input/Select';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/Button';
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toast
import React from 'react';
import { Stack, Select, TextInput, Textarea, InputWrapper, TagsInput, Flex } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { user } from '@nextui-org/react';
import useLoggedUser from '@/utils/useLoggedUser';

interface FormTalentaProps {
  name: string;
  email: string;
  phone: string;
  work_skill: string;
  location: string;
  category: number;
  description: string;
  image: string | Blob;
  image_thumbnail: string | Blob;
  document: File | null;
}

type TalentCategoryList = {
  id: number;
  name: string;
  description: string;
}

export const formTalentaSchema = z.object({
  name: z.string().nonempty("Nama tidak boleh kosong."),
  email: z.string().email("Format email tidak valid."),
  phone: z.string().min(10, { message: "Format tidak sesuai" }).nonempty("Nomor telepon tidak boleh kosong."),
  work_skill: z.string().nonempty("Keahlian kerja tidak boleh kosong."),
  location: z.string().nonempty("Lokasi tidak boleh kosong."),
  category: z.number().int().positive("Kategori harus berupa bilangan bulat positif."),
  description: z.string({ message: 'Gambar tidak boleh kosong' }).nonempty("Deskripsi tidak boleh kosong."),
  image: z.instanceof(Blob, { message: 'Gambar tidak boleh kosong' }).refine(blob => blob.size > 0, "Gambar tidak boleh kosong."),
  image_thumbnail: z.instanceof(Blob).refine(blob => blob.size > 0, "Thumbnail gambar tidak boleh kosong."),
  document: z.instanceof(File).nullable(),
});

const Talenta = () => {
  const form = useForm<FormTalentaProps>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      location: '',
      work_skill: '',
      category: 0,
      description: '',
      image: '',
      image_thumbnail: '',
      document: null,
    },
    validate: zodResolver(formTalentaSchema),
    onValuesChange: values => {
      if (values.phone) values.phone = values.phone.replaceAll(/\D/g, '');
      return values;
    }
  });

  const [isr, setIsr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<TalentCategoryList[]>();
  const [formState, setFormState] = useState<"store" | "update">("store");
  const user = useLoggedUser();

  useEffect(() => {
    setIsr(true);
  }, []);

  const getCategory = () => {
    Get('talent-category', {})
      .then((res: any) => {
        setCategory(res.data);
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  // Function to fetch existing data
  const getTalentData = () => {
    setLoading(true);
    Get(`talent/${user?.id}`, {})
      .then((res: any) => {
        const talent = res.data[0];
        form.setValues({
          name: talent.name || '',
          email: talent.email || '',
          work_skill: talent.work_skill || '',
          category: talent.category || '',
          description: talent.description || '',
          image: talent.image_url || '',
          image_thumbnail: '',
          document: null,
        });
        setLoading(false);
        setFormState('update');
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
  };

  // Function to post data to API
  const postTalentData = () => {
    setLoading(true);

    const valid = form.validate();
    if (valid.hasErrors && !user) return;

    const formData = new FormData();
    formData.append('user_id', String(user?.id));
    formData.append('talent_category_id', String(form.values.category));
    formData.append('name', form.values.name);
    formData.append('email', form.values.email);
    formData.append('work_skill', form.values.work_skill);
    formData.append('location', form.values.location);
    formData.append('phone', form.values.phone);
    formData.append('description', form.values.description);
    formData.append('bio', form.values.description);

    if (form.values.image instanceof Blob) formData.append('image', form.values.image);
    if (form.values.image_thumbnail instanceof Blob) formData.append('image_thumbnail', form.values.image_thumbnail);
    if (form.values.document) formData.append('document', form.values.document);

    Post('talent', formData)
      .then((res: any) => {
        console.log('Response from API:', res);
        setLoading(false);
        toast.success('Data berhasil disimpan');
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
        toast.error('Gagal menyimpan data');
      });
  };

  useEffect(() => {
    if (isr) {
      getTalentData();
      if (!category) getCategory();
    }
  }, [isr]);

  return (
    <>
      <div className='w-full'>
        <div className='max-w-3xl mx-auto pt-10 text-dark px-4 sm:px-8 md:px-12 lg:px-0 mb-10'>
          <div className='border-2 border-primary-light-200 rounded-xl flex flex-col gap-3 overflow-hidden'>
            {/* Image Upload */}
            <InputWrapper error={form.errors.image} errorProps={{ style: { marginLeft: '130px' } }}>
              <label className='w-full h-52 border-2 border-primary-light-200 bg-primary-light flex flex-col items-center justify-center gap-4 cursor-pointer'>
                <input
                  type='file'
                  className='hidden'
                  onChange={e => e.target.files && form.setValues({ image: e.target.files[0] })}
                  accept='image/png, image/gif, image/jpeg'
                />
                {form.values.image ? (
                  <Image
                    src={form.values.image instanceof Blob ? URL.createObjectURL(form.values.image) : form.values.image}
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
            </InputWrapper>

            <div className='px-8'>
              {/* Icon Upload */}
              <InputWrapper error={form.errors.image_thumbnail}>
                <label className='w-20 h-20 border-2 border-primary-light-200 rounded-full bg-primary-light flex flex-col items-center justify-center gap-4 cursor-pointer -mt-14'>
                  <input
                    type='file'
                    className='hidden'
                    onChange={e => e.target.files && form.setValues({ image_thumbnail: e.target.files[0] })}
                    accept='image/png, image/gif, image/jpeg'
                  />
                  {form.values.image_thumbnail ? (
                    <Image
                      src={form.values.image_thumbnail instanceof Blob ? URL.createObjectURL(form.values.image_thumbnail) : form.values.image_thumbnail}
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
              </InputWrapper>

              <div className='pb-10 pt-5'>
                <Stack gap={15}>

                  {/* Form Fields */}
                  <TextInput
                    label='Nama'
                    value={form.values.name}
                    placeholder='Masukkan Nama'
                    onChange={(e) => form.setValues({ name: e.target.value })}
                    error={form.errors.name}
                  />

                  <Flex wrap="wrap" gap={15} className={`[&>*]:flex-grow`}>
                    <TextInput
                      type='text'
                      label='Email'
                      value={form.values.email}
                      placeholder='Masukkan Email'
                      onChange={(e) => form.setValues({ email: e.target.value })}
                      error={form.errors.email}
                    />

                    <TextInput
                      type='text'
                      label='No. Telepon'
                      value={form.values.phone}
                      placeholder='Masukkan No. Telepon'
                      onChange={(e) => form.setValues({ phone: e.target.value })}
                      error={form.errors.phone}
                    />
                  </Flex>

                  <TextInput
                    label='Lokasi'
                    value={form.values.location}
                    placeholder='Masukkan Lokasi'
                    onChange={(e) => form.setValues({ location: e.target.value })}
                    error={form.errors.location}
                  />

                  <TagsInput
                    type='text'
                    label='Skill'
                    description="Tekan Enter untuk menambahkan skill"
                    value={Boolean(form.values.work_skill) ? form.values.work_skill.split(',') : []}
                    placeholder='Masukkan skill'
                    onChange={(e) => form.setValues({ work_skill: e.join(',') })}
                    error={form.errors.work_skill}
                  />

                  {/* Select Fields */}
                  <Select
                    label='Kategori'
                    placeholder="Pilih Kategori"
                    data={category ? category.map(e => ({ label: e.name, value: String(e.id) })) : []}
                    value={String(form.values.category)}
                    onChange={e => form.setValues({ category: parseInt(e as string) })}
                    error={form.errors.category}
                  />

                  <Textarea
                    autosize
                    minRows={3}
                    label='Tentang Saya'
                    value={form.values.description}
                    onChange={(e) => form.setValues({ description: e.target.value })}
                    error={form.errors.description}
                  />

                  {/* Document Upload */}
                  <div className='mt-4'>
                    <p className='mb-2 text-grey'>CV/Portofolio</p>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='file'
                        className='hidden'
                        onChange={e => e.target.files && form.setValues({ document: e.target.files[0] })}
                        accept='.pdf,.doc,.docx'
                      />
                      <button className='text-primary-base border border-primary-disabled px-4 py-2 text-sm rounded-xl flex items-center gap-2'>
                        <FontAwesomeIcon icon={faUpload} />
                        Upload
                      </button>
                      <p className='ml-2 text-grey text-xs'>DOC DOCX PDF (2MB)</p>
                    </label>
                  </div>
                  <Button
                    label='Simpan Profil'
                    color='primary'
                    className='mt-[10px] w-full h-10 md:w-40 text-dark disabled:bg-gray-400 disabled:text-gray-400 disabled:opacity-50'
                    onClick={postTalentData}
                    disabled={loading}
                  />
                </Stack>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer /> {/* Add ToastContainer to the render */}
    </>
  );
};

export default Talenta;
