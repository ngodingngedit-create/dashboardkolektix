import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import filePlus from '../../../assets/icon/filePlus.png';
import imagePlus from '../../../assets/icon/camera-plus.png';
import { Get, Post, Put } from '@/utils/REST';
import useLoggedUser from '@/utils/useLoggedUser';
import { notifications } from '@mantine/notifications';
import { useListState } from '@mantine/hooks';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
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
import { Tab, Tabs } from '@nextui-org/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowsRotate,
  faIdCard,
  faPencil,
  faPlus,
  faSave,
  faSearch,
  faSort,
  faSortDown,
  faSortUp,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormCreatorProfileProps {
  creator_id: number;
  name: string;
  name_event_organizer: string;
  email: string;
  phone: string;
  address: string;
  image: string;
}

interface CreatorProfileRecord {
  id: number;
  creator_id: number;
  name: string;
  name_event_organizer?: string;
  email: string;
  phone: string;
  phone_number?: string;
  address: string;
  location?: string;
  image_url?: string;
}

interface FormKTPProps {
  no_identity: string;
  name_identity: string;
  address_identity: string;
  file_identity: string;
}

interface FormNPWPProps {
  no_npwp: string;
  name_npwp: string;
  address_npwp: string;
  file_npwp: string;
}

interface LegalRecord {
  id?: number;
  creator_id: number;
  no_identity: string;
  no_npwp: string;
  name_identity: string;
  address_identity: string;
  name_npwp: string;
  address_npwp: string;
  file_identity_url?: string;
  file_npwp_url?: string;
  file_identity: string;
  file_npwp: string;
  type: string;
  status: 'active' | 'inactive';
  is_snk: boolean;
}

type FormType = 'ktp' | 'npwp' | null;

// ─── Main Component ───────────────────────────────────────────────────────────

const ProfileCreator = () => {
  const [loading, setLoading] = useListState<string>();
  const userData = useLoggedUser();

  // ── Tab 1: Profil Creator ──────────────────────────────────────────────────
  const [profileList, setProfileList] = useState<CreatorProfileRecord[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<CreatorProfileRecord | null>(null);
  const [hasProfileData, setHasProfileData] = useState(false);
  const [searchProfile, setSearchProfile] = useState('');
  const [sortProfile, setSortProfile] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'name',
    direction: 'asc',
  });

  const profileForm = useForm<FormCreatorProfileProps>({
    initialValues: {
      creator_id: 0,
      name: '',
      name_event_organizer: '',
      email: '',
      phone: '',
      address: '',
      image: '',
    },
  });

  const getProfileData = () => {
    if (loading.includes('getprofile')) return;
    setLoading.append('getprofile');
    Get(`creator-data/profile-creator`, {})
      .then((res: any) => {
        // Handle result wrapping whether { data: ... } or direct obj
        const resultData = res.data?.data || res.data;
        if (resultData) {
          setHasProfileData(true);
          setProfileList(Array.isArray(resultData) ? resultData : [resultData]);
        } else {
          setProfileList([]);
          setHasProfileData(false);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading.filter((e) => e !== 'getprofile'));
  };

  const handleAddProfile = () => {
    setSelectedProfile(null);
    setIsEditMode(false);
    setImagePreview(null);
    profileForm.reset();
    profileForm.setValues({ creator_id: userData?.has_creator?.id ?? 0, name: '', name_event_organizer: '', email: '', phone: '', address: '', image: '' });
    setIsFormVisible(true);
  };

  const handleEditProfile = async (profile: CreatorProfileRecord) => {
    setSelectedProfile(profile);
    setIsEditMode(true);
    setImagePreview(profile.image_url || null);
    profileForm.setValues({
      creator_id: profile.id || profile.creator_id,
      name: profile.name,
      name_event_organizer: profile.name_event_organizer || profile.name || '',
      email: profile.email,
      phone: profile.phone_number || profile.phone || '',
      address: profile.location || profile.address || '',
      image: '',
    });
    setIsFormVisible(true);

    if (profile.image_url) {
      setLoading.append('loadimage');
      try {
        const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(profile.image_url)}`);
        const data = await response.json();
        if (data && data.base64) {
          profileForm.setFieldValue('image', data.base64);
        } else {
          console.error('Failed to convert image via proxy:', data?.error);
        }
      } catch (err) {
        console.error('Failed to request image base64 proxy:', err);
      } finally {
        setLoading.filter((e) => e !== 'loadimage');
      }
    }
  };

  const handleProfileFile = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        profileForm.setFieldValue('image', reader.result as string);
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProfile = () => {
    const rawValues = profileForm.values;
    const payload: any = {
      ...rawValues,
      name_event_organizer: rawValues.name_event_organizer,
      phone_number: rawValues.phone,
    };
    const id = userData?.has_creator?.id ?? 0;
    if (isEditMode && selectedProfile) {
      setLoading.append('submitprofile');
      Put(`creator/${selectedProfile.id}`, payload)
        .then(() => {
          notifications.show({ title: 'Berhasil', message: 'Berhasil mengupdate profil creator', color: 'green' });
          getProfileData();
          setIsFormVisible(false);
        })
        .catch(() => notifications.show({ title: 'Gagal', message: 'Gagal mengupdate profil creator', color: 'red' }))
        .finally(() => setLoading.filter((e) => e !== 'submitprofile'));
    } else {
      setLoading.append('submitprofile');
      Post('creator', payload)
        .then(() => {
          notifications.show({ title: 'Berhasil', message: 'Berhasil menyimpan profil creator', color: 'green' });
          getProfileData();
          setIsFormVisible(false);
        })
        .catch(() => notifications.show({ title: 'Gagal', message: 'Gagal menyimpan profil creator', color: 'red' }))
        .finally(() => setLoading.filter((e) => e !== 'submitprofile'));
    }
  };

  const filteredProfile = useMemo(() => {
    let result = [...profileList];
    if (searchProfile) {
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchProfile.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchProfile.toLowerCase()) ||
          (item.phone_number || item.phone || '').includes(searchProfile)
      );
    }
    if (sortProfile.key && sortProfile.direction) {
      result.sort((a: any, b: any) => {
        const valA = (a[sortProfile.key] || '').toString().toLowerCase();
        const valB = (b[sortProfile.key] || '').toString().toLowerCase();
        if (valA < valB) return sortProfile.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortProfile.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [profileList, searchProfile, sortProfile]);

  const requestSortProfile = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortProfile.key === key && sortProfile.direction === 'asc') direction = 'desc';
    else if (sortProfile.key === key && sortProfile.direction === 'desc') direction = null;
    setSortProfile({ key, direction });
  };

  const getProfileSortIcon = (key: string) => {
    if (sortProfile.key !== key || !sortProfile.direction) return faSort;
    return sortProfile.direction === 'asc' ? faSortUp : faSortDown;
  };

  // ── Tab 2: Informasi Legal ─────────────────────────────────────────────────
  const [ktpList, setKtpList] = useState<LegalRecord[]>([]);
  const [npwpList, setNpwpList] = useState<LegalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<LegalRecord | null>(null);
  const [isLegalEditMode, setIsLegalEditMode] = useState(false);
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [ktpImageFile, setKtpImageFile] = useState<File | null>(null);
  const [ktpImagePreview, setKtpImagePreview] = useState<string | null>(null);
  const [npwpImageFile, setNpwpImageFile] = useState<File | null>(null);
  const [npwpImagePreview, setNpwpImagePreview] = useState<string | null>(null);
  const [searchKtp, setSearchKtp] = useState('');
  const [searchNpwp, setSearchNpwp] = useState('');
  const [sortKtp, setSortKtp] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'name_identity', direction: 'asc' });
  const [sortNpwp, setSortNpwp] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'name_npwp', direction: 'asc' });
  const [hasLegalData, setHasLegalData] = useState(false);

  const ktpForm = useForm<FormKTPProps>({
    initialValues: { no_identity: '', name_identity: '', address_identity: '', file_identity: '' },
    validate: {
      no_identity: (v) => (!v ? 'Nomor KTP harus diisi' : null),
      name_identity: (v) => (!v ? 'Nama harus diisi' : null),
      address_identity: (v) => (!v ? 'Alamat harus diisi' : null),
    },
  });

  const npwpForm = useForm<FormNPWPProps>({
    initialValues: { no_npwp: '', name_npwp: '', address_npwp: '', file_npwp: '' },
    validate: {
      no_npwp: (v) => (!v ? 'Nomor NPWP harus diisi' : null),
      name_npwp: (v) => (!v ? 'Nama harus diisi' : null),
      address_npwp: (v) => (!v ? 'Alamat harus diisi' : null),
    },
  });

  const getLegalData = (id: number) => {
    if (loading.includes('getlegal')) return;
    setLoading.append('getlegal');
    Get(`creator-information-legal/${id}`, {})
      .then((res: any) => {
        if (res.data) {
          setHasLegalData(true);
          const record: LegalRecord = res.data;
          if (record.no_identity) setKtpList([record]);
          else setKtpList([]);
          if (record.no_npwp) setNpwpList([record]);
          else setNpwpList([]);
        } else {
          setKtpList([]);
          setNpwpList([]);
          setHasLegalData(false);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading.filter((e) => e !== 'getlegal'));
  };

  const handleAddKTP = () => { setSelectedRecord(null); setIsLegalEditMode(false); ktpForm.reset(); setKtpImageFile(null); setKtpImagePreview(null); setActiveForm('ktp'); };
  const handleAddNPWP = () => { setSelectedRecord(null); setIsLegalEditMode(false); npwpForm.reset(); setNpwpImageFile(null); setNpwpImagePreview(null); setActiveForm('npwp'); };

  const handleEditKTP = (record: LegalRecord) => {
    setSelectedRecord(record);
    setIsLegalEditMode(true);
    ktpForm.setValues({ no_identity: record.no_identity, name_identity: record.name_identity, address_identity: record.address_identity, file_identity: '' });
    setKtpImagePreview(record.file_identity_url || null);
    setKtpImageFile(null);
    setActiveForm('ktp');
  };

  const handleEditNPWP = (record: LegalRecord) => {
    setSelectedRecord(record);
    setIsLegalEditMode(true);
    npwpForm.setValues({ no_npwp: record.no_npwp, name_npwp: record.name_npwp, address_npwp: record.address_npwp, file_npwp: '' });
    setNpwpImagePreview(record.file_npwp_url || null);
    setNpwpImageFile(null);
    setActiveForm('npwp');
  };

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });

  const handleSubmitKTP = async (values: FormKTPProps) => {
    let fileBase64 = values.file_identity;
    if (ktpImageFile) {
      try { fileBase64 = await convertToBase64(ktpImageFile); } catch { return; }
    }
    const payload = {
      creator_id: userData?.has_creator?.id ?? 0,
      no_identity: values.no_identity,
      name_identity: values.name_identity,
      address_identity: values.address_identity,
      file_identity: fileBase64,
      no_npwp: selectedRecord?.no_npwp || '',
      name_npwp: selectedRecord?.name_npwp || '',
      address_npwp: selectedRecord?.address_npwp || '',
      file_npwp: selectedRecord?.file_npwp || '',
      type: 'ktp',
      status: 'active',
      is_snk: true,
    };
    setLoading.append('submitlegal');
    try {
      if (hasLegalData && selectedRecord) {
        await Put(`creator-information-legal/${userData?.has_creator?.id ?? 0}`, payload);
        notifications.show({ title: 'Berhasil', message: 'Data KTP berhasil diperbarui', color: 'green' });
      } else {
        await Post('creator-information-legal', payload);
        notifications.show({ title: 'Berhasil', message: 'Data KTP berhasil disimpan', color: 'green' });
      }
      getLegalData(userData?.has_creator?.id ?? 0);
      setActiveForm(null);
    } catch {
      notifications.show({ title: 'Gagal', message: 'Gagal menyimpan data KTP', color: 'red' });
    } finally {
      setLoading.filter((e) => e !== 'submitlegal');
    }
  };

  const handleSubmitNPWP = async (values: FormNPWPProps) => {
    let fileBase64 = values.file_npwp;
    if (npwpImageFile) {
      try { fileBase64 = await convertToBase64(npwpImageFile); } catch { return; }
    }
    const payload = {
      creator_id: userData?.has_creator?.id ?? 0,
      no_identity: selectedRecord?.no_identity || '',
      name_identity: selectedRecord?.name_identity || '',
      address_identity: selectedRecord?.address_identity || '',
      file_identity: selectedRecord?.file_identity || '',
      no_npwp: values.no_npwp,
      name_npwp: values.name_npwp,
      address_npwp: values.address_npwp,
      file_npwp: fileBase64,
      type: 'npwp',
      status: 'active',
      is_snk: true,
    };
    setLoading.append('submitlegal');
    try {
      if (hasLegalData && selectedRecord) {
        await Put(`creator-information-legal/${userData?.has_creator?.id ?? 0}`, payload);
        notifications.show({ title: 'Berhasil', message: 'Data NPWP berhasil diperbarui', color: 'green' });
      } else {
        await Post('creator-information-legal', payload);
        notifications.show({ title: 'Berhasil', message: 'Data NPWP berhasil disimpan', color: 'green' });
      }
      getLegalData(userData?.has_creator?.id ?? 0);
      setActiveForm(null);
    } catch {
      notifications.show({ title: 'Gagal', message: 'Gagal menyimpan data NPWP', color: 'red' });
    } finally {
      setLoading.filter((e) => e !== 'submitlegal');
    }
  };

  const getLegalSortIcon = (cfg: typeof sortKtp, key: string) => {
    if (cfg.key !== key || !cfg.direction) return faSort;
    return cfg.direction === 'asc' ? faSortUp : faSortDown;
  };
  const requestSortKtp = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortKtp.key === key && sortKtp.direction === 'asc') direction = 'desc';
    else if (sortKtp.key === key && sortKtp.direction === 'desc') direction = null;
    setSortKtp({ key, direction });
  };
  const requestSortNpwp = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortNpwp.key === key && sortNpwp.direction === 'asc') direction = 'desc';
    else if (sortNpwp.key === key && sortNpwp.direction === 'desc') direction = null;
    setSortNpwp({ key, direction });
  };

  const filteredKtp = useMemo(() => {
    let result = [...ktpList];
    if (searchKtp) result = result.filter((r) => String(r.name_identity || '').toLowerCase().includes(searchKtp.toLowerCase()) || String(r.no_identity || '').includes(searchKtp));
    if (sortKtp.key && sortKtp.direction) {
      result.sort((a: any, b: any) => {
        const vA = (a[sortKtp.key] || '').toString().toLowerCase();
        const vB = (b[sortKtp.key] || '').toString().toLowerCase();
        if (vA < vB) return sortKtp.direction === 'asc' ? -1 : 1;
        if (vA > vB) return sortKtp.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [ktpList, searchKtp, sortKtp]);

  const filteredNpwp = useMemo(() => {
    let result = [...npwpList];
    if (searchNpwp) result = result.filter((r) => String(r.name_npwp || '').toLowerCase().includes(searchNpwp.toLowerCase()) || String(r.no_npwp || '').includes(searchNpwp));
    if (sortNpwp.key && sortNpwp.direction) {
      result.sort((a: any, b: any) => {
        const vA = (a[sortNpwp.key] || '').toString().toLowerCase();
        const vB = (b[sortNpwp.key] || '').toString().toLowerCase();
        if (vA < vB) return sortNpwp.direction === 'asc' ? -1 : 1;
        if (vA > vB) return sortNpwp.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [npwpList, searchNpwp, sortNpwp]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (userData) {
      const creatorId = userData.has_creator?.id ?? 0;
      getProfileData();
      getLegalData(creatorId);
    }
  }, [userData]);

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Profil Creator
  // ══════════════════════════════════════════════════════════════════════════

  const renderProfileList = () => (
    <Stack gap={20}>
      <Flex justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={2} size="h3">Profil Creator</Title>
          <Text size="sm" c="gray">Kelola informasi profil creator Anda</Text>
        </Stack>
        {!hasProfileData && (
          <Button onClick={handleAddProfile} leftSection={<FontAwesomeIcon icon={faPlus} />} color="blue" size="md" radius="xl">
            Tambah Profil
          </Button>
        )}
        {hasProfileData && (
          <Button onClick={() => profileList[0] && handleEditProfile(profileList[0])} leftSection={<FontAwesomeIcon icon={faPencil} />} color="blue" size="md" radius="xl">
            Edit Profil
          </Button>
        )}
      </Flex>

      <Card withBorder p="md" radius="md" shadow="sm">
        <Flex justify="space-between" align="center" mb="lg">
          <Flex gap={10}>
            <Button variant="filled" color="blue" size="sm" onClick={() => getProfileData()} loading={loading.includes('getprofile')}>
              <FontAwesomeIcon icon={faArrowsRotate} />
            </Button>
          </Flex>
          <TextInput
            placeholder="Cari nama, email, atau telepon..."
            leftSection={<FontAwesomeIcon icon={faSearch} size="xs" />}
            value={searchProfile}
            onChange={(e) => setSearchProfile(e.target.value)}
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
                  { label: 'Nama Creator', sortable: true, key: 'name_event_organizer' },
                  { label: 'Email', sortable: true, key: 'email' },
                  { label: 'Telepon', sortable: false },
                  { label: 'Aksi', sortable: false },
                ].map((col, i) => (
                  <th
                    key={i}
                    onClick={() => col.sortable && requestSortProfile(col.key!)}
                    style={{
                      padding: '12px 14px',
                      textAlign: ['No', 'Foto', 'Aksi'].includes(col.label) ? 'center' : 'left',
                      fontSize: '11px', fontWeight: 700, color: '#495057',
                      textTransform: 'uppercase', borderBottom: '2px solid #e9ecef',
                      letterSpacing: '0.5px', cursor: col.sortable ? 'pointer' : 'default',
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
                          icon={getProfileSortIcon(col.key!)}
                          size="xs"
                          style={{ color: sortProfile.key === col.key ? '#228be6' : '#adb5bd', opacity: sortProfile.key === col.key ? 1 : 0.5 }}
                        />
                      )}
                    </Flex>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading.includes('getprofile') ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}><Text c="dimmed">Memuat data...</Text></td></tr>
              ) : filteredProfile.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                    <Stack align="center" gap={10}>
                      <Text c="dimmed" fw={500}>Belum ada data profil creator</Text>
                      <Text size="xs" c="gray">Klik &quot;Tambah Profil&quot; untuk membuat profil baru</Text>
                    </Stack>
                  </td>
                </tr>
              ) : (
                filteredProfile.map((item, idx) => (
                  <tr
                    key={item.creator_id}
                    style={{ borderBottom: '1px solid #f1f3f5' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                  >
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}><Text size="xs" fw={700}>{idx + 1}</Text></td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} width={44} height={44}
                          style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid #f1f3f5', margin: '0 auto', display: 'block' }} />
                      ) : (
                        <Box w={44} h={44} bg="gray.1"
                          style={{ borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e9ecef', margin: '0 auto' }}>
                          <Text size="xs" c="gray">?</Text>
                        </Box>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}><Text size="sm" fw={600}>{item.name || '-'}</Text></td>
                    <td style={{ padding: '12px 14px' }}><Text size="sm" fw={600}>{item.name_event_organizer || '-'}</Text></td>
                    <td style={{ padding: '12px 14px' }}><Text size="sm" c="gray.7">{item.email || '-'}</Text></td>
                    <td style={{ padding: '12px 14px' }}><Text size="sm" c="gray.7">{item.phone_number || item.phone || '-'}</Text></td>
                    <td style={{ padding: '12px 14px', position: 'sticky', right: 0, backgroundColor: 'inherit', zIndex: 5, boxShadow: '-2px 0 5px rgba(0,0,0,0.02)', borderLeft: '1px solid #f1f3f5' }}>
                      <Flex gap={8} justify="center">
                        <Tooltip label="Edit Profil Creator">
                          <ActionIcon variant="subtle" color="blue" onClick={() => handleEditProfile(item)}>
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

  const renderProfileForm = () => (
    <Stack gap={25}>
      <Flex align="center" gap={15}>
        <ActionIcon variant="light" color="gray" onClick={() => setIsFormVisible(false)} size="lg" radius="md">
          <FontAwesomeIcon icon={faArrowLeft} />
        </ActionIcon>
        <Stack gap={0}>
          <Title order={2} size="h3">{isEditMode ? 'Edit Profil Creator' : 'Tambah Profil Creator Baru'}</Title>
          <Text size="xs" c="dimmed">Isi formulir di bawah untuk mengelola data profil creator Anda</Text>
        </Stack>
      </Flex>

      <Card withBorder padding="xl" radius="md" shadow="sm">
        <Stack gap="lg">
          <Flex align="center" gap={15}>
            <label className="w-20 h-20 border-2 border-primary-light-200 rounded-lg bg-primary-light flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden">
              <input type="file" className="hidden" onChange={handleProfileFile} accept="image/png, image/gif, image/jpeg" />
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
            <TextInput label="Nama Pribadi" placeholder="Masukkan Nama Pribadi" value={profileForm.values.name} onChange={(e) => profileForm.setFieldValue('name', e.target.value)} />
            <TextInput label="Nama Event Organizer" placeholder="Masukkan Nama Event Organizer" value={profileForm.values.name_event_organizer} onChange={(e) => profileForm.setFieldValue('name_event_organizer', e.target.value)} />
            <TextInput label="Email" placeholder="Masukkan Email" value={profileForm.values.email} onChange={(e) => profileForm.setFieldValue('email', e.target.value)} />
            <TextInput label="Nomor Telepon" placeholder="Masukkan No Telepon" value={profileForm.values.phone} onChange={(e) => profileForm.setFieldValue('phone', e.target.value)} />
            <TextInput label="Alamat" placeholder="Masukkan Alamat" value={profileForm.values.address} onChange={(e) => profileForm.setFieldValue('address', e.target.value)} className="md:col-span-2" />
          </div>
        </Stack>
      </Card>

      <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-8 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
        <Flex justify="flex-end" gap="md">
          <Button variant="subtle" color="gray" onClick={() => setIsFormVisible(false)} size="md" leftSection={<FontAwesomeIcon icon={faXmark} />}>
            Batalkan
          </Button>
          <Button color="blue" size="md" loading={loading.includes('submitprofile') || loading.includes('loadimage')}
            leftSection={!loading.includes('submitprofile') && !loading.includes('loadimage') && <FontAwesomeIcon icon={faSave} />}
            onClick={handleSubmitProfile}>
            {isEditMode ? 'Simpan Perubahan' : 'Konfirmasi & Simpan'}
          </Button>
        </Flex>
      </Box>
    </Stack>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Informasi Legal (identik dengan dashboard/legal)
  // ══════════════════════════════════════════════════════════════════════════

  const renderLegalTable = (
    title: string,
    data: LegalRecord[],
    type: 'ktp' | 'npwp',
    onAdd: () => void,
    onEdit: (r: LegalRecord) => void,
    search: string,
    setSearch: (v: string) => void,
    sort: typeof sortKtp,
    requestSort: (key: string) => void
  ) => {
    const cols = type === 'ktp'
      ? [
          { label: 'No', sortable: false },
          { label: 'File', sortable: false },
          { label: 'Nomor KTP', sortable: true, key: 'no_identity' },
          { label: 'Nama', sortable: true, key: 'name_identity' },
          { label: 'Alamat', sortable: false },
          { label: 'Status', sortable: false },
          { label: 'Aksi', sortable: false },
        ]
      : [
          { label: 'No', sortable: false },
          { label: 'File', sortable: false },
          { label: 'Nomor NPWP', sortable: true, key: 'no_npwp' },
          { label: 'Nama', sortable: true, key: 'name_npwp' },
          { label: 'Alamat', sortable: false },
          { label: 'Status', sortable: false },
          { label: 'Aksi', sortable: false },
        ];

    return (
      <Card withBorder p="md" radius="md" shadow="sm">
        <Flex justify="space-between" align="center" mb="lg">
          <Flex align="center" gap={12}>
            <Box
              w={32} h={32} bg={type === 'ktp' ? 'blue.7' : 'teal.7'}
              style={{ borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <FontAwesomeIcon icon={faIdCard} style={{ color: '#fff' }} size="sm" />
            </Box>
            <Text fw={700} size="lg" c="gray.9">{title}</Text>
          </Flex>
          <Flex gap={10} align="center">
            <Button variant="filled" color="blue" size="sm"
              onClick={() => getLegalData(userData?.has_creator?.id ?? 0)} loading={loading.includes('getlegal')}>
              <FontAwesomeIcon icon={faArrowsRotate} />
            </Button>
            <TextInput
              placeholder={`Cari ${title}...`}
              leftSection={<FontAwesomeIcon icon={faSearch} size="xs" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 240 }}
            />
          </Flex>
        </Flex>

        <Box style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                {cols.map((col, i) => (
                  <th
                    key={i}
                    onClick={() => col.sortable && requestSort(col.key!)}
                    style={{
                      padding: '12px 14px',
                      textAlign: ['No', 'File', 'Status', 'Aksi'].includes(col.label) ? 'center' : 'left',
                      fontSize: '11px', fontWeight: 700, color: '#495057',
                      textTransform: 'uppercase', borderBottom: '2px solid #e9ecef',
                      letterSpacing: '0.5px', cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      position: col.label === 'Aksi' ? 'sticky' : 'static',
                      right: col.label === 'Aksi' ? 0 : 'auto',
                      backgroundColor: col.label === 'Aksi' ? '#f8f9fa' : 'transparent',
                      zIndex: col.label === 'Aksi' ? 10 : 1,
                    }}
                  >
                    <Flex align="center" gap={6} justify={['No', 'File', 'Status', 'Aksi'].includes(col.label) ? 'center' : 'flex-start'}>
                      {col.label}
                      {col.sortable && (
                        <FontAwesomeIcon
                          icon={getLegalSortIcon(sort, col.key!)}
                          size="xs"
                          style={{ color: sort.key === col.key ? '#228be6' : '#adb5bd', opacity: sort.key === col.key ? 1 : 0.5 }}
                        />
                      )}
                    </Flex>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading.includes('getlegal') ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}><Text c="dimmed">Memuat data...</Text></td></tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                    <Stack align="center" gap={10}>
                      <Image src={filePlus} alt="empty" width={40} height={40} />
                      <Text c="dimmed" fw={500}>Belum ada data {type === 'ktp' ? 'KTP' : 'NPWP'}</Text>
                    </Stack>
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: '1px solid #f1f3f5' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                  >
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}><Text size="xs" fw={700}>{idx + 1}</Text></td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {(type === 'ktp' ? item.file_identity_url : item.file_npwp_url) ? (
                        <Image
                          src={(type === 'ktp' ? item.file_identity_url : item.file_npwp_url)!}
                          alt="doc" width={50} height={35}
                          style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #e9ecef', margin: '0 auto', display: 'block' }}
                        />
                      ) : (
                        <Box w={50} h={35} bg="gray.1" style={{ borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e9ecef', margin: '0 auto' }}>
                          <Text size="10px" c="gray">N/A</Text>
                        </Box>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Text size="sm" style={{ fontFamily: 'monospace', letterSpacing: 1 }}>
                        {type === 'ktp' ? item.no_identity : item.no_npwp}
                      </Text>
                    </td>
                    <td style={{ padding: '12px 14px' }}><Text size="sm" fw={600}>{type === 'ktp' ? item.name_identity : item.name_npwp}</Text></td>
                    <td style={{ padding: '12px 14px' }}>
                      <Text size="sm" c="gray.7" lineClamp={2} style={{ maxWidth: 220 }}>
                        {type === 'ktp' ? item.address_identity : item.address_npwp}
                      </Text>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <Badge variant="filled" color={item.status === 'active' ? 'green' : 'red'} size="sm">
                        {item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 14px', position: 'sticky', right: 0, backgroundColor: 'inherit', zIndex: 5, boxShadow: '-2px 0 5px rgba(0,0,0,0.02)', borderLeft: '1px solid #f1f3f5' }}>
                      <Flex gap={8} justify="center">
                        <Tooltip label={`Edit ${type === 'ktp' ? 'KTP' : 'NPWP'}`}>
                          <ActionIcon variant="subtle" color="blue" onClick={() => onEdit(item)}>
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
    );
  };

  const renderKTPForm = () => (
    <Stack gap={25}>
      <Flex align="center" gap={15}>
        <ActionIcon variant="light" color="gray" onClick={() => setActiveForm(null)} size="lg" radius="md">
          <FontAwesomeIcon icon={faArrowLeft} />
        </ActionIcon>
        <Stack gap={0}>
          <Title order={2} size="h3">{isLegalEditMode ? 'Edit Data KTP' : 'Tambah Data KTP'}</Title>
          <Text size="xs" c="dimmed">Isi formulir di bawah untuk mengelola data KTP Anda</Text>
        </Stack>
      </Flex>

      <form id="ktp-form-creator" onSubmit={ktpForm.onSubmit(handleSubmitKTP)}>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <Stack gap="lg">
            <Box>
              <Text size="sm" fw={500} mb={8}>Foto / Scan KTP</Text>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed #dee2e6', borderRadius: 12, height: 200, cursor: 'pointer',
                backgroundColor: '#f8f9fa', overflow: 'hidden', position: 'relative'
              }}>
                <input type="file" style={{ display: 'none' }} accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setKtpImageFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setKtpImagePreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {ktpImagePreview ? (
                  <Image src={ktpImagePreview} alt="ktp" fill style={{ objectFit: 'contain' }} />
                ) : (
                  <Stack align="center" gap={8}>
                    <Image src={filePlus} alt="upload" width={40} height={40} />
                    <Text size="sm" c="gray" fw={500}>Unggah dokumen KTP disini</Text>
                  </Stack>
                )}
              </label>
            </Box>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput label="Nomor KTP" placeholder="Ketik 16 digit nomor KTP" required {...ktpForm.getInputProps('no_identity')} />
              <TextInput label="Nama (Sesuai KTP)" placeholder="Ketik nama sesuai KTP" required {...ktpForm.getInputProps('name_identity')} />
              <TextInput label="Alamat (Sesuai KTP)" placeholder="Ketik alamat sesuai KTP" required className="md:col-span-2" {...ktpForm.getInputProps('address_identity')} />
            </div>
          </Stack>
        </Card>

        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-8 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={() => setActiveForm(null)} size="md" leftSection={<FontAwesomeIcon icon={faXmark} />}>Batalkan</Button>
            <Button type="submit" form="ktp-form-creator" color="blue" size="md" loading={loading.includes('submitlegal')}
              leftSection={!loading.includes('submitlegal') && <FontAwesomeIcon icon={faSave} />}>
              {isLegalEditMode ? 'Simpan Perubahan' : 'Konfirmasi & Simpan'}
            </Button>
          </Flex>
        </Box>
      </form>
    </Stack>
  );

  const renderNPWPForm = () => (
    <Stack gap={25}>
      <Flex align="center" gap={15}>
        <ActionIcon variant="light" color="gray" onClick={() => setActiveForm(null)} size="lg" radius="md">
          <FontAwesomeIcon icon={faArrowLeft} />
        </ActionIcon>
        <Stack gap={0}>
          <Title order={2} size="h3">{isLegalEditMode ? 'Edit Data NPWP' : 'Tambah Data NPWP'}</Title>
          <Text size="xs" c="dimmed">Isi formulir di bawah untuk mengelola data NPWP Anda</Text>
        </Stack>
      </Flex>

      <form id="npwp-form-creator" onSubmit={npwpForm.onSubmit(handleSubmitNPWP)}>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <Stack gap="lg">
            <Box>
              <Text size="sm" fw={500} mb={8}>Foto / Scan NPWP</Text>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed #dee2e6', borderRadius: 12, height: 200, cursor: 'pointer',
                backgroundColor: '#f8f9fa', overflow: 'hidden', position: 'relative'
              }}>
                <input type="file" style={{ display: 'none' }} accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNpwpImageFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setNpwpImagePreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {npwpImagePreview ? (
                  <Image src={npwpImagePreview} alt="npwp" fill style={{ objectFit: 'contain' }} />
                ) : (
                  <Stack align="center" gap={8}>
                    <Image src={filePlus} alt="upload" width={40} height={40} />
                    <Text size="sm" c="gray" fw={500}>Unggah dokumen NPWP disini</Text>
                  </Stack>
                )}
              </label>
            </Box>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput label="Nomor NPWP" placeholder="Ketik 16 digit nomor NPWP" required {...npwpForm.getInputProps('no_npwp')} />
              <TextInput label="Nama (Sesuai NPWP)" placeholder="Ketik nama sesuai NPWP" required {...npwpForm.getInputProps('name_npwp')} />
              <TextInput label="Alamat (Sesuai NPWP)" placeholder="Ketik alamat sesuai NPWP" required className="md:col-span-2" {...npwpForm.getInputProps('address_npwp')} />
            </div>
          </Stack>
        </Card>

        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-8 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={() => setActiveForm(null)} size="md" leftSection={<FontAwesomeIcon icon={faXmark} />}>Batalkan</Button>
            <Button type="submit" form="npwp-form-creator" color="teal" size="md" loading={loading.includes('submitlegal')}
              leftSection={!loading.includes('submitlegal') && <FontAwesomeIcon icon={faSave} />}>
              {isLegalEditMode ? 'Simpan Perubahan' : 'Konfirmasi & Simpan'}
            </Button>
          </Flex>
        </Box>
      </form>
    </Stack>
  );

  const renderLegalList = () => (
    <Stack gap={30}>
      <Flex justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={1} size="h2">Informasi Legal</Title>
          <Text size="sm" c="gray">Kelola data KTP dan NPWP untuk verifikasi akun Anda</Text>
        </Stack>
        <Flex gap={10}>
          {ktpList.length === 0 && (
            <Button onClick={handleAddKTP} leftSection={<FontAwesomeIcon icon={faPlus} />} color="blue" size="md" radius="xl">
              Tambah KTP
            </Button>
          )}
          {npwpList.length === 0 && (
            <Button onClick={handleAddNPWP} leftSection={<FontAwesomeIcon icon={faPlus} />} color="teal" size="md" radius="xl">
              Tambah NPWP
            </Button>
          )}
        </Flex>
      </Flex>

      {renderLegalTable('Data KTP', filteredKtp, 'ktp', handleAddKTP, handleEditKTP, searchKtp, setSearchKtp, sortKtp, requestSortKtp)}
      {renderLegalTable('Data NPWP', filteredNpwp, 'npwp', handleAddNPWP, handleEditNPWP, searchNpwp, setSearchNpwp, sortNpwp, requestSortNpwp)}
    </Stack>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <Card>
      <Tabs
        variant="solid"
        aria-label="Profil Creator Tabs"
        className="border border-b-2 border-primary-light-200 border-x-0 border-t-0"
        classNames={{
          tabList: 'pb-0 self-center font-semibold rounded-b-none bg-white',
          tab: 'p-5',
          cursor: '!bg-[#0B387C0D] rounded-[5px_5px_0_0] border-b-2 border-b-primary-base',
        }}
      >
        {/* ── Tab 1: Profil Creator ── */}
        <Tab key="profil-creator" title="Profil Creator">
          <div className="p-5 pb-[100px]">
            <LoadingOverlay visible={loading.includes('submitprofile')} overlayProps={{ blur: 2 }} />
            {isFormVisible ? renderProfileForm() : renderProfileList()}
          </div>
        </Tab>

        {/* ── Tab 2: Informasi Legal ── */}
        <Tab key="informasi-legal" title="Informasi Legal">
          <div className="p-5 pb-[100px] min-h-screen bg-[#fcfcfc]">
            <LoadingOverlay visible={loading.includes('submitlegal')} overlayProps={{ blur: 2 }} />
            {activeForm === 'ktp' ? renderKTPForm() : activeForm === 'npwp' ? renderNPWPForm() : renderLegalList()}
          </div>
        </Tab>
      </Tabs>
    </Card>
  );
};

export default ProfileCreator;
