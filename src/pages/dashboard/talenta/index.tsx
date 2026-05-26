import { Get, Post } from '@/utils/REST';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import imagePlus from '../../../assets/icon/camera-plus.png';
// import InputField from '@/components/Input';
import { faUpload, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/Button';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import { Stack, Select, TextInput, Textarea, InputWrapper, Card, Text, Box, Checkbox, NumberInput, MultiSelect, Switch, ActionIcon, Divider, Group, FileInput, Tabs, Badge, Grid } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import useLoggedUser from '@/utils/useLoggedUser';

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = error => reject(error);
});

interface Portfolio {
  title: string;
  description: string;
  type: string;
  file: File | string | null;
  url: string;
  event_name: string;
  event_date: string;
  is_featured: boolean;
  sort_order: number;
}

interface Experience {
  company_name: string;
  event_name: string;
  role_name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_present: boolean;
}

interface Banner {
  title: string;
  description: string;
  image: File | string | null;
  mobile_image: File | string | null;
  link_url: string;
  button_label: string;
  sort_order: number;
  is_primary: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

interface FormTalentaProps {
  talenta_category_id: number;
  verify_status_id: number;
  name: string;
  email: string;
  phone: string;
  bio: string;
  description: string;
  location: string;
  expected_salary: number | '';
  expected_salary_min: number | '';
  expected_salary_max: number | '';
  salary_status: string;
  experience_year: number | '';
  is_verified: boolean;
  is_available: boolean;
  is_featured: boolean;
  skills: string[];
  image: File | string | null;
  portfolios: Portfolio[];
  experiences: Experience[];
  banners: Banner[];
}

type TalentCategoryList = {
  id: number;
  name: string;
  description: string;
}

type TalentSkillList = {
  id: number;
  name: string;
  slug: string;
}

const isBrowser = typeof window !== 'undefined';

export const formTalentaSchema = z.object({
  name: z.string().nonempty("Nama tidak boleh kosong."),
  email: z.string().email("Format email tidak valid."),
  phone: z.string().min(10, { message: "Format tidak sesuai" }).nonempty("Nomor telepon tidak boleh kosong."),
  bio: z.string().nonempty("Bio tidak boleh kosong."),
  description: z.string().nonempty("Deskripsi tidak boleh kosong."),
  location: z.string().nonempty("Lokasi tidak boleh kosong."),
  expected_salary: z.number().or(z.literal('')).optional(),
  expected_salary_min: z.number().or(z.literal('')).optional(),
  expected_salary_max: z.number().or(z.literal('')).optional(),
  salary_status: z.string().optional(),
  experience_year: z.number().or(z.literal('')).optional(),
  talenta_category_id: z.number().int().optional(),
  verify_status_id: z.number().int().optional(),
  is_verified: z.boolean().optional(),
  is_available: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
  image: z.any().optional(),
  portfolios: z.array(z.any()).optional(),
  experiences: z.array(z.any()).optional(),
  banners: z.array(z.any()).optional(),
});

const Talenta = () => {
  const form = useForm<FormTalentaProps>({
    initialValues: {
      talenta_category_id: 1,
      verify_status_id: 1,
      name: '',
      email: '',
      phone: '',
      bio: '',
      description: '',
      location: '',
      expected_salary: '',
      expected_salary_min: '',
      expected_salary_max: '',
      salary_status: 'month',
      experience_year: '',
      is_verified: false,
      is_available: true,
      is_featured: false,
      skills: [],
      image: null,
      portfolios: [],
      experiences: [],
      banners: [],
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
  const [skillsList, setSkillsList] = useState<TalentSkillList[]>();
  const [formState, setFormState] = useState<"store" | "update">("store");
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const user = useLoggedUser();

  useEffect(() => {
    setIsr(true);
  }, []);

  const getDropdownMaster = () => {
    Get('talentas/dropdown-master', {})
      .then((res: any) => {
        if (res.data) {
          if (res.data.skills) setSkillsList(res.data.skills);
          if (res.data.categories) setCategory(res.data.categories);
        }
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
        if (talent) {
          form.setValues({
            talenta_category_id: talent.talenta_category_id || 1,
            verify_status_id: talent.verify_status_id || 1,
            name: talent.name || '',
            email: talent.email || '',
            phone: talent.phone || '',
            bio: talent.bio || '',
            description: talent.description || '',
            location: talent.location || '',
            expected_salary: talent.expected_salary || '',
            salary_status: talent.salary_status || 'month',
            experience_year: talent.experience_year || '',
            is_verified: talent.is_verified === 1 || talent.is_verified === true,
            is_available: talent.is_available === 1 || talent.is_available === true,
            is_featured: talent.is_featured === 1 || talent.is_featured === true,
            skills: talent.skills ? talent.skills.map((s: any) => String(s.id || s)) : [],
            image: talent.image || null,
            portfolios: talent.portfolios || [],
            experiences: talent.experiences || [],
            banners: talent.banners || [],
          });
          setFormState('update');
          setIsEditMode(false);
        }
        setLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
  };

  // Function to post data to API
  const postTalentData = async () => {
    setLoading(true);

    const valid = form.validate();
    if (valid.hasErrors && !user) {
      setLoading(false);
      return;
    }

    try {
      const mappedSkills = form.values.skills.map(s => Number(s));

      const portfoliosWithBase64 = await Promise.all(
        form.values.portfolios.map(async (p) => {
          let base64File = p.file;
          if (p.file instanceof File) {
            base64File = await toBase64(p.file);
          }
          return {
            ...p,
            is_featured: p.is_featured ? 1 : 0,
            file: base64File
          };
        })
      );

      const bannersWithBase64 = await Promise.all(
        form.values.banners.map(async (b) => {
          let base64Image = b.image;
          if (b.image instanceof File) {
            base64Image = await toBase64(b.image);
          }
          let base64MobileImage = b.mobile_image;
          if (b.mobile_image instanceof File) {
            base64MobileImage = await toBase64(b.mobile_image);
          }
          return {
            ...b,
            is_primary: b.is_primary ? 1 : 0,
            is_active: b.is_active ? 1 : 0,
            image: base64Image,
            mobile_image: base64MobileImage
          };
        })
      );

      const experiencesMapped = form.values.experiences.map(e => ({
        ...e,
        is_present: e.is_present ? 1 : 0,
        end_date: e.is_present ? null : e.end_date
      }));

      let base64MainImage = form.values.image;
      if (form.values.image instanceof File) {
        base64MainImage = await toBase64(form.values.image);
      }

      const payload = {
        image: base64MainImage,
        talenta_category_id: form.values.talenta_category_id,
        verify_status_id: form.values.verify_status_id,
        name: form.values.name,
        email: form.values.email,
        phone: form.values.phone,
        bio: form.values.bio,
        description: form.values.description,
        location: form.values.location,
        expected_salary: form.values.expected_salary,
        expected_salary_min: form.values.expected_salary_min !== '' ? String(form.values.expected_salary_min) : null,
        expected_salary_max: form.values.expected_salary_max !== '' ? String(form.values.expected_salary_max) : null,
        salary_status: form.values.salary_status,
        experience_year: form.values.experience_year,
        is_verified: form.values.is_verified ? 1 : 0,
        is_available: form.values.is_available ? 1 : 0,
        is_featured: form.values.is_featured ? 1 : 0,
        skills: mappedSkills,
        portfolios: portfoliosWithBase64,
        experiences: experiencesMapped,
        banners: bannersWithBase64
      };

      Post('talenta', payload)
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
    } catch (e) {
      console.log("Error constructing payload:", e);
      setLoading(false);
      toast.error('Gagal memproses data file');
    }
  };

  useEffect(() => {
    if (isr) {
      getTalentData();
      if (!skillsList || !category) getDropdownMaster();
    }
  }, [isr]);

  return (
    <>
      <div className='w-full min-h-screen bg-slate-50/50 pb-32'>
        <div className='w-full pt-8 px-4 sm:px-6 md:px-8 text-dark mb-10'>

          {/* Header Section */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Profil Talenta Saya</h1>
              <p className="text-sm text-gray-500 mt-1">Kelola data profil, keahlian, dan portofolio Anda sebagai talenta</p>
            </div>
            {formState === 'update' && (
              <div>
                {!isEditMode ? (
                  <Button label="Edit Profil Talenta" color="secondary" className="px-6 h-10" onClick={() => setIsEditMode(true)} />
                ) : (
                  <Button label="Batal Edit" color="secondary" className="px-6 h-10 bg-red-500 text-white hover:bg-red-600 border-none" onClick={() => setIsEditMode(false)} />
                )}
              </div>
            )}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>

            {/* Form Container */}
            <div className='lg:col-span-12'>
              {!isEditMode ? (
                <Card withBorder shadow="sm" p="xl" radius="md" className="bg-white">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 flex flex-col items-center text-center">
                      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm mb-4">
                        <img src={typeof form.values.image === 'string' ? form.values.image : 'https://placehold.co/400x400?text=No+Photo'} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">{form.values.name || '-'}</h2>
                      <p className="text-gray-500 font-medium mb-1">{form.values.email}</p>
                      <p className="text-gray-500 text-sm mb-2">{form.values.phone}</p>
                      <Badge color="blue" variant="light" size="lg" className="mt-1 mb-4" tt="uppercase">
                        {category?.find(c => c.id === form.values.talenta_category_id)?.name || 'Talenta'}
                      </Badge>
                      
                      <div className="flex gap-2 mt-2 flex-wrap justify-center">
                        {form.values.skills.map((skillId, idx) => {
                          const skillName = skillsList?.find(s => s.id === Number(skillId))?.name || skillId;
                          return <Badge key={idx} color="gray" variant="outline">{skillName}</Badge>;
                        })}
                      </div>
                    </div>
                    <div className="w-full md:w-2/3 flex flex-col gap-6">
                      <div>
                        <Text size="sm" fw={600} c="dimmed" tt="uppercase" className="mb-1">Bio Singkat</Text>
                        <Text size="md" fw={500} c="dark.8">{form.values.bio || '-'}</Text>
                      </div>
                      <div>
                        <Text size="sm" fw={600} c="dimmed" tt="uppercase" className="mb-1">Deskripsi Lengkap</Text>
                        <Text size="md" className="whitespace-pre-wrap">{form.values.description || '-'}</Text>
                      </div>
                      <Divider />
                      <Grid>
                        <Grid.Col span={6}>
                          <Text size="sm" fw={600} c="dimmed" tt="uppercase">Lokasi Domisili</Text>
                          <Text size="md" fw={500}>{form.values.location || '-'}</Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <Text size="sm" fw={600} c="dimmed" tt="uppercase">Tahun Pengalaman</Text>
                          <Text size="md" fw={500}>{form.values.experience_year ? `${form.values.experience_year} Tahun` : '-'}</Text>
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <Text size="sm" fw={600} c="dimmed" tt="uppercase">Ekspektasi Gaji</Text>
                          <Text size="md" fw={500} c="green.7">Rp {Number(form.values.expected_salary || 0).toLocaleString('id-ID')} / {form.values.salary_status}</Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <Text size="sm" fw={600} c="dimmed" tt="uppercase">Ketersediaan</Text>
                          <Text size="md" fw={500}>{form.values.is_available ? 'Tersedia' : 'Tidak Tersedia'}</Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <Text size="sm" fw={600} c="dimmed" tt="uppercase">Status Verifikasi</Text>
                          <Text size="md" fw={500}>{form.values.is_verified ? 'Terverifikasi' : 'Belum Diverifikasi'}</Text>
                        </Grid.Col>
                      </Grid>
                    </div>
                  </div>
                </Card>
              ) : (
              <Tabs defaultValue="informasi-dasar" variant="outline" classNames={{ root: 'w-full', panel: 'pt-6' }}>
                <Tabs.List>
                  <Tabs.Tab value="informasi-dasar">Informasi Dasar</Tabs.Tab>
                  <Tabs.Tab value="profil-profesional">Profil Profesional</Tabs.Tab>
                  <Tabs.Tab value="portofolio">Portofolio</Tabs.Tab>
                  <Tabs.Tab value="pengalaman">Pengalaman</Tabs.Tab>
                  <Tabs.Tab value="banner">Banner / Promosi</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="informasi-dasar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Foto Utama (Profil / Cover)</label>
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/png,image/jpeg"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const file = e.target.files[0];
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error('Ukuran file maksimal 2MB');
                                e.target.value = '';
                                return;
                              }
                              form.setFieldValue('image', file);
                            }
                          }}
                        />
                        {form.values.image ? (
                          <div className="relative w-full h-full group">
                            <img src={form.values.image instanceof File ? URL.createObjectURL(form.values.image) : form.values.image} alt="Preview" className="w-full h-full object-contain p-2" />
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              <FontAwesomeIcon icon={faUpload} className="text-white text-3xl mb-2" />
                              <p className="text-white text-sm font-medium">Ganti Gambar</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                            <FontAwesomeIcon icon={faUpload} className="text-primary-base text-3xl mb-3" />
                            <p className="mb-2 text-sm font-semibold text-gray-900">Unggah foto utama / avatar</p>
                            <p className="text-xs text-gray-500">Direkomendasikan ukuran 1:1 dan tidak lebih dari 2mb</p>
                          </div>
                        )}
                      </label>
                    </div>

                    <TextInput
                      label='Nama Lengkap'
                      value={form.values.name}
                      placeholder='Yogi Saputra'
                      onChange={(e) => form.setValues({ name: e.target.value })}
                      error={form.errors.name}
                    />

                    <TextInput
                      type='text'
                      label='Email'
                      value={form.values.email}
                      placeholder='yogisaputra@gmail.com'
                      onChange={(e) => form.setValues({ email: e.target.value })}
                      error={form.errors.email}
                    />

                    <TextInput
                      type='text'
                      label='No. Telepon / WhatsApp'
                      value={form.values.phone}
                      placeholder='081234567890'
                      onChange={(e) => form.setValues({ phone: e.target.value })}
                      error={form.errors.phone}
                    />

                    <TextInput
                      label='Lokasi'
                      value={form.values.location}
                      placeholder='Jakarta, Indonesia'
                      onChange={(e) => form.setValues({ location: e.target.value })}
                      error={form.errors.location}
                    />

                    <div className="md:col-span-2">
                      <TextInput
                        label='Bio'
                        value={form.values.bio}
                        placeholder='Professional drummer...'
                        onChange={(e) => form.setValues({ bio: e.target.value })}
                        error={form.errors.bio}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Textarea
                        autosize
                        minRows={3}
                        label='Deskripsi Lengkap'
                        value={form.values.description}
                        placeholder='Experienced session drummer...'
                        onChange={(e) => form.setValues({ description: e.target.value })}
                        error={form.errors.description}
                      />
                    </div>
                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="profil-profesional">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Select
                      label='Kategori Utama'
                      placeholder="Pilih Kategori"
                      data={category ? category.map(e => ({ label: e.name, value: String(e.id) })) : []}
                      value={String(form.values.talenta_category_id)}
                      onChange={e => form.setValues({ talenta_category_id: parseInt(e as string) })}
                    />

                    <MultiSelect
                      label='Keahlian / Skill'
                      placeholder="Pilih skill"
                      data={skillsList ? skillsList.map(e => ({ label: e.name, value: String(e.id) })) : []}
                      value={form.values.skills}
                      onChange={e => form.setValues({ skills: e })}
                      searchable
                    />

                    <NumberInput
                      label='Ekspektasi Gaji'
                      value={form.values.expected_salary}
                      placeholder='15000000'
                      onChange={(v) => form.setValues({ expected_salary: v as number | '' })}
                    />

                    <NumberInput
                      label='Ekspektasi Gaji Minimum'
                      value={form.values.expected_salary_min}
                      placeholder='100000'
                      onChange={(v) => form.setValues({ expected_salary_min: v as number | '' })}
                    />
                    
                    <NumberInput
                      label='Ekspektasi Gaji Maksimum'
                      value={form.values.expected_salary_max}
                      placeholder='150000'
                      onChange={(v) => form.setValues({ expected_salary_max: v as number | '' })}
                    />

                    <Select
                      label='Status Gaji (Periode)'
                      data={[
                        { label: 'Per Bulan', value: 'month' },
                        { label: 'Per Event', value: 'event' },
                        { label: 'Per Jam', value: 'hour' }
                      ]}
                      value={form.values.salary_status}
                      onChange={(v) => form.setValues({ salary_status: v || 'month' })}
                    />

                    <NumberInput
                      label='Tahun Pengalaman'
                      value={form.values.experience_year}
                      placeholder='10'
                      onChange={(v) => form.setValues({ experience_year: v as number | '' })}
                    />

                    <div className="md:col-span-2 flex flex-wrap gap-6 mt-2">
                      <Switch
                        label="Tersedia (Available)"
                        checked={form.values.is_available}
                        onChange={(e) => form.setValues({ is_available: e.currentTarget.checked })}
                      />
                    </div>
                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="portofolio">
                  <Group justify="space-between" mb="md">
                    <h4 className="text-md font-semibold text-gray-700">Manajemen Portofolio</h4>
                    <Button
                      onClick={() => form.insertListItem('portfolios', { title: '', description: '', type: 'image', file: null, url: '', event_name: '', event_date: '', is_featured: false, sort_order: 1 })}
                      className="px-4 py-2 text-white"
                      label="Tambah Portofolio"
                    />
                  </Group>

                  {form.values.portfolios.length === 0 && <Text size="sm" color="dimmed">Belum ada portofolio.</Text>}

                  <Stack gap="md">
                    {form.values.portfolios.map((portfolio, index) => (
                      <Card key={index} withBorder shadow="sm" p="md" className="bg-slate-50 relative">
                        <div className="absolute top-4 right-4">
                          <ActionIcon color="red" onClick={() => form.removeListItem('portfolios', index)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </ActionIcon>
                        </div>
                        <h5 className="font-semibold text-sm mb-4">Portofolio #{index + 1}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <TextInput
                            label="Judul"
                            {...form.getInputProps(`portfolios.${index}.title`)}
                          />
                          <Select
                            label="Tipe"
                            data={[{ label: 'Image', value: 'image' }, { label: 'Video', value: 'video' }]}
                            {...form.getInputProps(`portfolios.${index}.type`)}
                          />
                          <div className="md:col-span-2 mt-2">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">File Portofolio (Gambar / Video)</label>
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative">
                              <input
                                type="file"
                                className="hidden"
                                accept="image/png,image/jpeg,video/mp4"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    const file = e.target.files[0];
                                    if (file.size > 2 * 1024 * 1024) {
                                      toast.error('Ukuran file maksimal 2MB');
                                      e.target.value = '';
                                      return;
                                    }
                                    form.setFieldValue(`portfolios.${index}.file`, file);
                                  }
                                }}
                              />
                              {form.values.portfolios[index].file && String(form.values.portfolios[index].file instanceof File ? form.values.portfolios[index].file.type : form.values.portfolios[index].file).includes('image') ? (
                                <div className="relative w-full h-full group">
                                  <img src={form.values.portfolios[index].file instanceof File ? URL.createObjectURL(form.values.portfolios[index].file) : form.values.portfolios[index].file as string} alt="Preview" className="w-full h-full object-contain p-2" />
                                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                    <FontAwesomeIcon icon={faUpload} className="text-white text-3xl mb-2" />
                                    <p className="text-white text-sm font-medium">Ganti Gambar</p>
                                  </div>
                                </div>
                              ) : form.values.portfolios[index].file ? (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                  <FontAwesomeIcon icon={faUpload} className="text-primary-base text-3xl mb-3" />
                                  <p className="text-sm text-green-600 font-medium mt-3 bg-green-50 px-3 py-1 rounded-full border border-green-200 line-clamp-1 max-w-[90%]">
                                    File Video Terpilih: {form.values.portfolios[index].file instanceof File ? form.values.portfolios[index].file.name : 'Video sudah tersimpan'}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">Klik untuk mengganti file video</p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                  <FontAwesomeIcon icon={faUpload} className="text-primary-base text-3xl mb-3" />
                                  <p className="mb-2 text-sm font-semibold text-gray-900">Unggah file portofolio</p>
                                  <p className="text-xs text-gray-500">Direkomendasikan ukuran 724 x 340px dan tidak lebih dari 5mb</p>
                                </div>
                              )}
                            </label>
                          </div>
                          <TextInput
                            label="URL / Link"
                            {...form.getInputProps(`portfolios.${index}.url`)}
                          />
                          <TextInput
                            label="Nama Event"
                            {...form.getInputProps(`portfolios.${index}.event_name`)}
                          />
                          <TextInput
                            label="Tanggal Event"
                            type="date"
                            {...form.getInputProps(`portfolios.${index}.event_date`)}
                          />
                          <NumberInput
                            label="Urutan Tampil"
                            {...form.getInputProps(`portfolios.${index}.sort_order`)}
                          />
                          <Switch
                            label="Featured Portofolio"
                            className="mt-8"
                            checked={form.values.portfolios[index].is_featured}
                            onChange={(e) => form.setFieldValue(`portfolios.${index}.is_featured`, e.currentTarget.checked)}
                          />
                          <div className="md:col-span-2">
                            <Textarea
                              label="Deskripsi Portofolio"
                              {...form.getInputProps(`portfolios.${index}.description`)}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="pengalaman">
                  <Group justify="space-between" mb="md">
                    <h4 className="text-md font-semibold text-gray-700">Daftar Pengalaman</h4>
                    <Button
                      onClick={() => form.insertListItem('experiences', { company_name: '', event_name: '', role_name: '', description: '', start_date: '', end_date: '', is_present: false })}
                      className="px-4 py-2 text-white"
                      label="Tambah Pengalaman"
                    />
                  </Group>

                  {form.values.experiences.length === 0 && <Text size="sm" color="dimmed">Belum ada pengalaman.</Text>}

                  <Stack gap="md">
                    {form.values.experiences.map((exp, index) => (
                      <Card key={index} withBorder shadow="sm" p="md" className="bg-slate-50 relative">
                        <div className="absolute top-4 right-4">
                          <ActionIcon color="red" onClick={() => form.removeListItem('experiences', index)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </ActionIcon>
                        </div>
                        <h5 className="font-semibold text-sm mb-4">Pengalaman #{index + 1}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <TextInput
                            label="Nama Perusahaan / Organisasi"
                            {...form.getInputProps(`experiences.${index}.company_name`)}
                          />
                          <TextInput
                            label="Nama Event / Project"
                            {...form.getInputProps(`experiences.${index}.event_name`)}
                          />
                          <TextInput
                            label="Peran / Role"
                            {...form.getInputProps(`experiences.${index}.role_name`)}
                          />
                          <div className="flex gap-4">
                            <TextInput
                              className="flex-1"
                              label="Tanggal Mulai"
                              type="date"
                              {...form.getInputProps(`experiences.${index}.start_date`)}
                            />
                            <TextInput
                              className="flex-1"
                              label="Tanggal Selesai"
                              type="date"
                              disabled={form.values.experiences[index].is_present}
                              {...form.getInputProps(`experiences.${index}.end_date`)}
                            />
                          </div>
                          <Switch
                            label="Sampai Sekarang"
                            className="mt-8"
                            checked={form.values.experiences[index].is_present}
                            onChange={(e) => {
                              form.setFieldValue(`experiences.${index}.is_present`, e.currentTarget.checked);
                              if (e.currentTarget.checked) {
                                form.setFieldValue(`experiences.${index}.end_date`, '');
                              }
                            }}
                          />
                          <div className="md:col-span-2">
                            <Textarea
                              label="Deskripsi Peran"
                              {...form.getInputProps(`experiences.${index}.description`)}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="banner">
                  <Group justify="space-between" mb="md">
                    <h4 className="text-md font-semibold text-gray-700">Banner / Promosi</h4>
                    <Button
                      onClick={() => form.insertListItem('banners', { title: '', description: '', image: null, mobile_image: null, link_url: '', button_label: '', sort_order: 1, is_primary: false, is_active: true, start_date: '', end_date: '' })}
                      className="px-4 py-2 text-white"
                      label="Tambah Banner"
                    />
                  </Group>

                  {form.values.banners.length === 0 && <Text size="sm" color="dimmed">Belum ada banner promosi.</Text>}

                  <Stack gap="md">
                    {form.values.banners.map((banner, index) => (
                      <Card key={index} withBorder shadow="sm" p="md" className="bg-slate-50 relative">
                        <div className="absolute top-4 right-4">
                          <ActionIcon color="red" onClick={() => form.removeListItem('banners', index)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </ActionIcon>
                        </div>
                        <h5 className="font-semibold text-sm mb-4">Banner #{index + 1}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <TextInput
                            label="Judul Banner"
                            {...form.getInputProps(`banners.${index}.title`)}
                          />
                          <TextInput
                            label="Label Tombol"
                            {...form.getInputProps(`banners.${index}.button_label`)}
                          />
                          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1 block">Image Desktop (Gambar/Poster)</label>
                              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative">
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/png,image/jpeg"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                      const file = e.target.files[0];
                                      if (file.size > 2 * 1024 * 1024) {
                                        toast.error('Ukuran file maksimal 2MB');
                                        e.target.value = '';
                                        return;
                                      }
                                      form.setFieldValue(`banners.${index}.image`, file);
                                    }
                                  }}
                                />
                                {form.values.banners[index].image ? (
                                  <div className="relative w-full h-full group">
                                    <img src={form.values.banners[index].image instanceof File ? URL.createObjectURL(form.values.banners[index].image) : form.values.banners[index].image as string} alt="Preview" className="w-full h-full object-contain p-2" />
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                      <FontAwesomeIcon icon={faUpload} className="text-white text-3xl mb-2" />
                                      <p className="text-white text-sm font-medium">Ganti Gambar</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                    <FontAwesomeIcon icon={faUpload} className="text-primary-base text-3xl mb-3" />
                                    <p className="mb-2 text-sm font-semibold text-gray-900">Unggah gambar/poster/banner</p>
                                    <p className="text-xs text-gray-500">Direkomendasikan ukuran 724 x 340px dan tidak lebih dari 2mb</p>
                                  </div>
                                )}
                              </label>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1 block">Image Mobile</label>
                              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative">
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/png,image/jpeg"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                      const file = e.target.files[0];
                                      if (file.size > 2 * 1024 * 1024) {
                                        toast.error('Ukuran file maksimal 2MB');
                                        e.target.value = '';
                                        return;
                                      }
                                      form.setFieldValue(`banners.${index}.mobile_image`, file);
                                    }
                                  }}
                                />
                                {form.values.banners[index].mobile_image ? (
                                  <div className="relative w-full h-full group">
                                    <img src={form.values.banners[index].mobile_image instanceof File ? URL.createObjectURL(form.values.banners[index].mobile_image) : form.values.banners[index].mobile_image as string} alt="Preview" className="w-full h-full object-contain p-2" />
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                      <FontAwesomeIcon icon={faUpload} className="text-white text-3xl mb-2" />
                                      <p className="text-white text-sm font-medium">Ganti Gambar</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                    <FontAwesomeIcon icon={faUpload} className="text-primary-base text-3xl mb-3" />
                                    <p className="mb-2 text-sm font-semibold text-gray-900">Unggah gambar mobile</p>
                                    <p className="text-xs text-gray-500">Ukuran vertikal direkomendasikan</p>
                                  </div>
                                )}
                              </label>
                            </div>
                          </div>
                          <TextInput
                            label="URL Tujuan"
                            {...form.getInputProps(`banners.${index}.link_url`)}
                          />
                          <NumberInput
                            label="Urutan"
                            {...form.getInputProps(`banners.${index}.sort_order`)}
                          />
                          <TextInput
                            label="Tanggal Tayang Mulai"
                            type="datetime-local"
                            {...form.getInputProps(`banners.${index}.start_date`)}
                          />
                          <TextInput
                            label="Tanggal Tayang Selesai"
                            type="datetime-local"
                            {...form.getInputProps(`banners.${index}.end_date`)}
                          />
                          <div className="md:col-span-2 flex gap-6 mt-2">
                            <Switch
                              label="Banner Utama (Primary)"
                              checked={form.values.banners[index].is_primary}
                              onChange={(e) => form.setFieldValue(`banners.${index}.is_primary`, e.currentTarget.checked)}
                            />
                            <Switch
                              label="Banner Aktif"
                              checked={form.values.banners[index].is_active}
                              onChange={(e) => form.setFieldValue(`banners.${index}.is_active`, e.currentTarget.checked)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Textarea
                              label="Deskripsi Banner"
                              {...form.getInputProps(`banners.${index}.description`)}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </Stack>
                </Tabs.Panel>
              </Tabs>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        {isEditMode && (
          <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-6 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            <div className="w-full flex justify-end">
              <Button
                label={formState === 'update' ? 'Perbarui Profil' : 'Simpan Profil'}
                color='primary'
                className='w-full md:w-auto px-8 h-10 text-dark font-semibold disabled:bg-gray-400 disabled:text-gray-400 disabled:opacity-50'
                onClick={postTalentData}
                disabled={loading}
              />
            </div>
          </Box>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default Talenta;
