import Image from 'next/image';
import { Get, Post, Put } from '@/utils/REST';
import { useEffect, useMemo, useState } from 'react';
import imagePlus from '../../../assets/icon/camera-plus.png';
import useLoggedUser from '@/utils/useLoggedUser';
import { Tab, Tabs } from '@nextui-org/react';
import {
  ActionIcon,
  Box,
  Button as MantineButton,
  Card,
  Flex,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useListState } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import ChangePassword from '@/components/ProfileComponent/ChangePassword';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowsRotate,
  faPencil,
  faPlus,
  faSave,
  faSearch,
  faSort,
  faSortDown,
  faSortUp,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

interface FormProfileProps {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  no_identity: number | null;
  image: string;
}

interface ProfileRecord {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  no_identity: number | null;
  image_url?: string;
}

const Profile = () => {
  const [loading, setLoading] = useListState<string>();
  const [profileList, setProfileList] = useState<ProfileRecord[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileRecord | null>(null);
  const [hasData, setHasData] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'name',
    direction: 'asc',
  });
  const user = useLoggedUser();

  const form = useForm<FormProfileProps>({
    initialValues: {
      user_id: 0,
      name: '',
      email: '',
      phone: '',
      address: '',
      no_identity: null,
      image: '',
    },
  });

  const getData = (id: number) => {
    if (loading.includes('getdata')) return;
    setLoading.append('getdata');
    Get(`user-profile/${id}`, {})
      .then((res: any) => {
        if (res.data) {
          setHasData(true);
          setProfileList([res.data]);
          setImage(res.data.image_url);
        } else {
          setProfileList([]);
          setHasData(false);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading.filter((e) => e !== 'getdata'));
  };

  const handleAddClick = () => {
    setSelectedProfile(null);
    setIsEditMode(false);
    setImagePreview(null);
    form.reset();
    form.setValues({ user_id: user?.id ?? 0, name: '', email: '', phone: '', address: '', no_identity: null, image: '' });
    setIsFormVisible(true);
  };

  const handleEditClick = (profile: ProfileRecord) => {
    setSelectedProfile(profile);
    setIsEditMode(true);
    setImagePreview(profile.image_url || null);
    form.setValues({
      user_id: profile.user_id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      no_identity: profile.no_identity,
      image: '',
    });
    setIsFormVisible(true);
  };

  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setFieldValue('image', reader.result as string);
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const values = form.values;
    if (isEditMode && selectedProfile) {
      setLoading.append('submit');
      Put(`user-profile/${selectedProfile.user_id}`, values)
        .then(() => {
          notifications.show({ title: 'Berhasil', message: 'Berhasil mengupdate profil', color: 'green' });
          getData(selectedProfile.user_id);
          setIsFormVisible(false);
        })
        .catch(() => notifications.show({ title: 'Gagal', message: 'Gagal mengupdate profil', color: 'red' }))
        .finally(() => setLoading.filter((e) => e !== 'submit'));
    } else {
      setLoading.append('submit');
      Post('user-profile', values)
        .then(() => {
          notifications.show({ title: 'Berhasil', message: 'Berhasil menyimpan profil', color: 'green' });
          if (user) getData(user.id ?? 0);
          setIsFormVisible(false);
        })
        .catch(() => notifications.show({ title: 'Gagal', message: 'Gagal menyimpan profil', color: 'red' }))
        .finally(() => setLoading.filter((e) => e !== 'submit'));
    }
  };

  useEffect(() => {
    if (user) {
      form.setFieldValue('user_id', user.id ?? 0);
      getData(user.id ?? 0);
    }
  }, [user]);

  const filteredData = useMemo(() => {
    let result = [...profileList];
    if (searchValue) {
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.phone?.includes(searchValue)
      );
    }
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a: any, b: any) => {
        const valA = (a[sortConfig.key] || '').toString().toLowerCase();
        const valB = (b[sortConfig.key] || '').toString().toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [profileList, searchValue, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key || !sortConfig.direction) return faSort;
    return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
  };

  // ─── Table / List View ────────────────────────────────────────────────────
  const renderProfileList = () => (
    <Stack gap={20}>
      <Flex justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={2} size="h3">Profile Saya</Title>
          <Text size="sm" c="gray">Kelola informasi profil akun Anda</Text>
        </Stack>
        {!hasData && (
          <MantineButton
            onClick={handleAddClick}
            leftSection={<FontAwesomeIcon icon={faPlus} />}
            color="blue"
            size="md"
            radius="xl"
          >
            Tambah Profile
          </MantineButton>
        )}
        {hasData && (
          <MantineButton
            onClick={() => profileList[0] && handleEditClick(profileList[0])}
            leftSection={<FontAwesomeIcon icon={faPencil} />}
            color="blue"
            size="md"
            radius="xl"
          >
            Edit Profile
          </MantineButton>
        )}
      </Flex>

      <Card withBorder p="md" radius="md" shadow="sm">
        <Flex justify="space-between" align="center" mb="lg">
          <Flex gap={10}>
            <MantineButton
              variant="filled"
              color="blue"
              size="sm"
              onClick={() => user && getData(user.id ?? 0)}
              loading={loading.includes('getdata')}
            >
              <FontAwesomeIcon icon={faArrowsRotate} />
            </MantineButton>
          </Flex>
          <TextInput
            placeholder="Cari nama, email, atau telepon..."
            leftSection={<FontAwesomeIcon icon={faSearch} size="xs" />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ width: 300 }}
          />
        </Flex>

        <Box style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                {[
                  { label: 'No', sortable: false },
                  { label: 'Foto', sortable: false },
                  { label: 'Nama', sortable: true, key: 'name' },
                  { label: 'Email', sortable: true, key: 'email' },
                  { label: 'Telepon', sortable: false },
                  { label: 'NIK', sortable: false },
                  { label: 'Aksi', sortable: false },
                ].map((col, i) => (
                  <th
                    key={i}
                    onClick={() => col.sortable && requestSort(col.key!)}
                    style={{
                      padding: '12px 14px',
                      textAlign: ['No', 'Foto', 'Aksi'].includes(col.label) ? 'center' : 'left',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#495057',
                      textTransform: 'uppercase',
                      borderBottom: '2px solid #e9ecef',
                      letterSpacing: '0.5px',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      position: col.label === 'Aksi' ? 'sticky' : 'static',
                      right: col.label === 'Aksi' ? 0 : 'auto',
                      backgroundColor: col.label === 'Aksi' ? '#f8f9fa' : 'transparent',
                      zIndex: col.label === 'Aksi' ? 10 : 1,
                    }}
                  >
                    <Flex align="center" gap={6} justify={['No', 'Foto', 'Aksi'].includes(col.label) ? 'center' : 'flex-start'}>
                      {col.label}
                      {col.sortable && (
                        <FontAwesomeIcon
                          icon={getSortIcon(col.key!)}
                          size="xs"
                          style={{ color: sortConfig.key === col.key ? '#228be6' : '#adb5bd', opacity: sortConfig.key === col.key ? 1 : 0.5 }}
                        />
                      )}
                    </Flex>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading.includes('getdata') ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}>
                    <Text c="dimmed">Memuat data...</Text>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                    <Stack align="center" gap={10}>
                      <Text c="dimmed" fw={500}>Belum ada data profil</Text>
                      <Text size="xs" c="gray">Klik &quot;Tambah Profile&quot; untuk membuat profil baru</Text>
                    </Stack>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr
                    key={item.user_id}
                    style={{ borderBottom: '1px solid #f1f3f5' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                  >
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <Text size="xs" fw={700}>{idx + 1}</Text>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={44}
                          height={44}
                          style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid #f1f3f5', margin: '0 auto', display: 'block' }}
                        />
                      ) : (
                        <Box
                          w={44} h={44} bg="gray.1"
                          style={{ borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e9ecef', margin: '0 auto' }}
                        >
                          <Text size="xs" c="gray">?</Text>
                        </Box>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Text size="sm" fw={600}>{item.name || '-'}</Text>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Text size="sm" c="gray.7">{item.email || '-'}</Text>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Text size="sm" c="gray.7">{item.phone || '-'}</Text>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Text size="sm" c="gray.7">{item.no_identity || '-'}</Text>
                    </td>
                    <td style={{ padding: '12px 14px', position: 'sticky', right: 0, backgroundColor: 'inherit', zIndex: 5, boxShadow: '-2px 0 5px rgba(0,0,0,0.02)', borderLeft: '1px solid #f1f3f5' }}>
                      <Flex gap={8} justify="center">
                        <Tooltip label="Edit Profile">
                          <ActionIcon variant="subtle" color="blue" onClick={() => handleEditClick(item)}>
                            <FontAwesomeIcon icon={faPencil} size="sm" />
                          </ActionIcon>
                        </Tooltip>
                      </Flex>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Card>
    </Stack>
  );

  // ─── Form View ────────────────────────────────────────────────────────────
  const renderProfileForm = () => (
    <Stack gap={25}>
      <Flex align="center" gap={15}>
        <ActionIcon variant="light" color="gray" onClick={() => setIsFormVisible(false)} size="lg" radius="md">
          <FontAwesomeIcon icon={faArrowLeft} />
        </ActionIcon>
        <Stack gap={0}>
          <Title order={2} size="h3">
            {isEditMode ? `Edit Profile` : 'Tambah Profile Baru'}
          </Title>
          <Text size="xs" c="dimmed">Isi formulir di bawah untuk mengelola data profil Anda</Text>
        </Stack>
      </Flex>

      <Card withBorder padding="xl" radius="md" shadow="sm">
        <Stack gap="lg">
          {/* Photo */}
          <Flex align="center" gap={15}>
            <label className="w-20 h-20 border-2 border-primary-light-200 rounded-lg bg-primary-light flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden">
              <input type="file" className="hidden" onChange={handleFile} accept="image/png, image/gif, image/jpeg" />
              {imagePreview ? (
                <Image src={imagePreview} alt="preview" width={80} height={80} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              ) : (
                <Image src={imagePlus} alt="image-plus" className="w-8 h-8" />
              )}
            </label>
            <Stack gap={3}>
              <Text fw={600}>Foto Profil</Text>
              <Text size="xs" c="gray">Direkomendasikan tidak lebih dari 2mb</Text>
            </Stack>
          </Flex>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              label="Nama"
              placeholder="Masukkan Nama"
              value={form.values.name}
              onChange={(e) => form.setFieldValue('name', e.target.value)}
            />
            <TextInput
              label="Email"
              placeholder="Masukkan Email"
              value={form.values.email}
              onChange={(e) => form.setFieldValue('email', e.target.value)}
            />
            <TextInput
              label="NIK"
              placeholder="Masukkan NIK"
              value={form.values.no_identity?.toString() || ''}
              onChange={(e) => form.setFieldValue('no_identity', e.target.value as any)}
            />
            <TextInput
              label="Nomor Telepon"
              placeholder="Masukkan No Telepon"
              value={form.values.phone}
              onChange={(e) => form.setFieldValue('phone', e.target.value)}
            />
            <TextInput
              label="Alamat"
              placeholder="Masukkan Alamat"
              value={form.values.address}
              onChange={(e) => form.setFieldValue('address', e.target.value)}
              className="md:col-span-2"
            />
          </div>
        </Stack>
      </Card>

      {/* Floating Footer */}
      <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-8 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
        <Flex justify="flex-end" gap="md">
          <MantineButton
            variant="subtle"
            color="gray"
            onClick={() => setIsFormVisible(false)}
            size="md"
            leftSection={<FontAwesomeIcon icon={faXmark} />}
          >
            Batalkan
          </MantineButton>
          <MantineButton
            color="blue"
            size="md"
            loading={loading.includes('submit')}
            leftSection={!loading.includes('submit') && <FontAwesomeIcon icon={faSave} />}
            onClick={handleSubmit}
          >
            {isEditMode ? 'Simpan Perubahan' : 'Konfirmasi & Simpan'}
          </MantineButton>
        </Flex>
      </Box>
    </Stack>
  );

  return (
    <Card>
      <Tabs
        variant="solid"
        aria-label="Tabs variants"
        className="border border-b-2 border-primary-light-200 border-x-0 border-t-0"
        classNames={{
          tabList: 'pb-0 self-center font-semibold rounded-b-none bg-white',
          tab: 'p-5',
          cursor: '!bg-[#0B387C0D] rounded-[5px_5px_0_0] border-b-2 border-b-primary-base',
        }}
      >
        <Tab key="profile" title="Profile Saya">
          <div className="p-5 pb-[100px]">
            <LoadingOverlay visible={loading.includes('submit')} overlayProps={{ blur: 2 }} />
            {isFormVisible ? renderProfileForm() : renderProfileList()}
          </div>
        </Tab>
        <Tab key="change-password" title="Ganti Password">
          <ChangePassword />
        </Tab>
      </Tabs>
    </Card>
  );
};

export default Profile;
