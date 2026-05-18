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
import { Stack, Select, TextInput, Textarea, InputWrapper, TagsInput, Flex, Card, Text, Box, Checkbox } from '@mantine/core';
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
  is_insurance: boolean;
}

type TalentCategoryList = {
  id: number;
  name: string;
  description: string;
}

const isBrowser = typeof window !== 'undefined';

export const formTalentaSchema = z.object({
  name: z.string().nonempty("Nama tidak boleh kosong."),
  email: z.string().email("Format email tidak valid."),
  phone: z.string().min(10, { message: "Format tidak sesuai" }).nonempty("Nomor telepon tidak boleh kosong."),
  work_skill: z.string().nonempty("Keahlian kerja tidak boleh kosong."),
  location: z.string().nonempty("Lokasi tidak boleh kosong."),
  category: z.number().int().positive("Kategori harus berupa bilangan bulat positif."),
  description: z.string({ message: 'Gambar tidak boleh kosong' }).nonempty("Deskripsi tidak boleh kosong."),
  image: isBrowser ? z.instanceof(Blob, { message: 'Gambar tidak boleh kosong' }).refine(blob => blob.size > 0, "Gambar tidak boleh kosong.") : z.string(),
  image_thumbnail: isBrowser ? z.instanceof(Blob).refine(blob => blob.size > 0, "Thumbnail gambar tidak boleh kosong.") : z.string(),
  document: isBrowser ? z.instanceof(File).nullable() : z.any().nullable(),
  is_insurance: z.boolean().optional(),
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
      is_insurance: false,
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
          is_insurance: talent.is_insurance === 1 || talent.is_insurance === true || false,
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
    formData.append('is_insurance', form.values.is_insurance ? '1' : '0');

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
      <div className='w-full min-h-screen bg-slate-50/50 pb-32'>
        <div className='w-full pt-8 px-4 sm:px-6 md:px-8 text-dark mb-10'>

          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Profil Talenta Saya</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola data profil, keahlian, dan portofolio Anda sebagai talenta</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>

            {/* Left Column: Visual Assets & File */}
            <div className='lg:col-span-1 flex flex-col gap-6'>

              {/* Media Card */}
              <Card withBorder shadow="sm" radius="md" p={0} className="overflow-hidden bg-white border-light-grey">
                {/* Cover Image Upload */}
                <InputWrapper error={form.errors.image}>
                  <label className='w-full h-44 bg-primary-light flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group border-b border-light-grey'>
                    <input
                      type='file'
                      className='hidden'
                      onChange={e => e.target.files && form.setValues({ image: e.target.files[0] })}
                      accept='image/png, image/gif, image/jpeg'
                    />
                    {form.values.image ? (
                      <>
                        <Image
                          src={form.values.image instanceof Blob ? URL.createObjectURL(form.values.image) : form.values.image}
                          alt='cover image'
                          className='object-cover w-full h-full'
                          width={100}
                          height={100}
                          style={{ width: '100%', height: '100%' }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                          <FontAwesomeIcon icon={faUpload} />
                          <span className="text-xs font-semibold">Ganti Foto Sampul</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Image src={imagePlus} alt='image-plus' className='w-8 h-8 opacity-70' />
                        <span className="text-xs font-semibold text-gray-500">Unggah Foto Sampul</span>
                      </div>
                    )}
                  </label>
                </InputWrapper>

                {/* Avatar Icon Upload */}
                <div className='px-6 pb-6'>
                  <InputWrapper error={form.errors.image_thumbnail}>
                    <label className='w-24 h-24 border-4 border-white rounded-full bg-primary-light flex flex-col items-center justify-center cursor-pointer -mt-12 overflow-hidden shadow-md relative group z-10'>
                      <input
                        type='file'
                        className='hidden'
                        onChange={e => e.target.files && form.setValues({ image_thumbnail: e.target.files[0] })}
                        accept='image/png, image/gif, image/jpeg'
                      />
                      {form.values.image_thumbnail ? (
                        <>
                          <Image
                            src={form.values.image_thumbnail instanceof Blob ? URL.createObjectURL(form.values.image_thumbnail) : form.values.image_thumbnail}
                            alt='avatar'
                            className='object-cover rounded-full w-full h-full'
                            width={100}
                            height={100}
                            style={{ width: '100%', height: '100%' }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold rounded-full">
                            Ganti
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Image src={imagePlus} alt='image-plus' className='w-6 h-6 opacity-70' />
                        </div>
                      )}
                    </label>
                  </InputWrapper>

                  <div className='mt-4'>
                    <h3 className="text-base font-bold text-gray-800">Media Profil</h3>
                    <p className="text-xs text-gray-400 mt-1">Gunakan foto beresolusi tinggi untuk profil dan sampul halaman talenta Anda.</p>
                  </div>
                </div>
              </Card>

              {/* CV / Portfolio Card */}
              <Card withBorder shadow="sm" radius="md" p="lg" className="bg-white border-light-grey">
                <h3 className="text-base font-bold text-gray-800 mb-2">CV & Portofolio</h3>
                <p className="text-xs text-gray-400 mb-4">Unggah dokumen pendukung untuk mempermudah verifikasi keahlian Anda.</p>

                <label className='flex flex-col items-center justify-center border border-dashed border-gray-300 hover:border-primary-base rounded-xl p-5 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors'>
                  <input
                    type='file'
                    className='hidden'
                    onChange={e => e.target.files && form.setValues({ document: e.target.files[0] })}
                    accept='.pdf,.doc,.docx'
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary-base">
                      <FontAwesomeIcon icon={faUpload} />
                    </div>
                    <span className="text-sm font-semibold text-primary-base">Upload Berkas</span>
                    {form.values.document ? (
                      <span className="text-xs text-green-600 font-medium text-center mt-1">
                        Selected: {(form.values.document as File).name}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 text-center">
                        PDF, DOC, DOCX (Maksimal 2MB)
                      </span>
                    )}
                  </div>
                </label>
              </Card>
            </div>

            {/* Right Column: Form Fields */}
            <div className='lg:col-span-2'>
              <Card withBorder shadow="sm" radius="md" p="xl" className="bg-white border-light-grey">
                <h3 className="text-lg font-bold text-gray-800 mb-6 pb-3 border-b border-light-grey">Detail Informasi</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <TextInput
                      label='Nama Lengkap'
                      value={form.values.name}
                      placeholder='Masukkan nama lengkap'
                      onChange={(e) => form.setValues({ name: e.target.value })}
                      error={form.errors.name}
                    />
                  </div>

                  <TextInput
                    type='text'
                    label='Email'
                    value={form.values.email}
                    placeholder='Masukkan alamat email aktif'
                    onChange={(e) => form.setValues({ email: e.target.value })}
                    error={form.errors.email}
                  />

                  <TextInput
                    type='text'
                    label='No. Telepon / WhatsApp'
                    value={form.values.phone}
                    placeholder='Contoh: 0812XXXXXXXX'
                    onChange={(e) => form.setValues({ phone: e.target.value })}
                    error={form.errors.phone}
                  />

                  <TextInput
                    label='Lokasi / Domisili'
                    value={form.values.location}
                    placeholder='Contoh: Jakarta Selatan, DKI Jakarta'
                    onChange={(e) => form.setValues({ location: e.target.value })}
                    error={form.errors.location}
                  />

                  <Select
                    label='Kategori Utama'
                    placeholder="Pilih Kategori"
                    data={category ? category.map(e => ({ label: e.name, value: String(e.id) })) : []}
                    value={String(form.values.category)}
                    onChange={e => form.setValues({ category: parseInt(e as string) })}
                    error={form.errors.category}
                  />

                  <div className="md:col-span-2">
                    <TagsInput
                      type='text'
                      label='Keahlian / Skill'
                      description="Tekan Enter setelah menulis keahlian untuk menambahkan"
                      value={Boolean(form.values.work_skill) ? form.values.work_skill.split(',') : []}
                      placeholder='Contoh: Master of Ceremony, Live Singing'
                      onChange={(e) => form.setValues({ work_skill: e.join(',') })}
                      error={form.errors.work_skill}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Textarea
                      autosize
                      minRows={4}
                      label='Deskripsi / Bio Diri'
                      value={form.values.description}
                      placeholder='Ceritakan pengalaman kerja, pencapaian, dan kepribadian profesional Anda...'
                      onChange={(e) => form.setValues({ description: e.target.value })}
                      error={form.errors.description}
                    />
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <Checkbox
                      label="Menggunakan Asuransi"
                      description="Setiap transaksi akan dikurangi Rp 2.000 untuk biaya asuransi talent"
                      checked={form.values.is_insurance}
                      onChange={(e) => form.setValues({ is_insurance: e.currentTarget.checked })}
                    />
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </div>

        {/* Sticky Action Footer */}
        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-6 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <div className="w-full flex justify-end">
            <Button
              label='Simpan Profil'
              color='primary'
              className='w-full md:w-auto px-8 h-10 text-dark font-semibold disabled:bg-gray-400 disabled:text-gray-400 disabled:opacity-50'
              onClick={postTalentData}
              disabled={loading}
            />
          </div>
        </Box>
      </div>
      <ToastContainer /> {/* Add ToastContainer to the render */}
    </>
  );
};

export default Talenta;
