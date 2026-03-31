import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import filePlus from '../../../assets/icon/filePlus.png';
import { Post, Get, Put } from '@/utils/REST';
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

const Legal = () => {
  const [loading, setLoading] = useListState<string>();
  const [ktpList, setKtpList] = useState<LegalRecord[]>([]);
  const [npwpList, setNpwpList] = useState<LegalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<LegalRecord | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeForm, setActiveForm] = useState<FormType>(null); // 'ktp' | 'npwp' | null
  const [ktpImageFile, setKtpImageFile] = useState<File | null>(null);
  const [ktpImagePreview, setKtpImagePreview] = useState<string | null>(null);
  const [npwpImageFile, setNpwpImageFile] = useState<File | null>(null);
  const [npwpImagePreview, setNpwpImagePreview] = useState<string | null>(null);
  const [searchKtp, setSearchKtp] = useState('');
  const [searchNpwp, setSearchNpwp] = useState('');
  const [sortKtp, setSortKtp] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'name_identity', direction: 'asc' });
  const [sortNpwp, setSortNpwp] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'name_npwp', direction: 'asc' });
  const [hasData, setHasData] = useState(false);
  const userData = useLoggedUser();

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

  useEffect(() => {
    if (userData) {
      getData(userData.has_creator?.id ?? 0);
    }
  }, [userData]);

  const getData = (id: number) => {
    if (loading.includes('getdata')) return;
    setLoading.append('getdata');
    Get(`creator-information-legal/${id}`, {})
      .then((res: any) => {
        if (res.data) {
          setHasData(true);
          const record: LegalRecord = res.data;
          // KTP has data if no_identity exists
          if (record.no_identity) setKtpList([record]);
          else setKtpList([]);
          // NPWP has data if no_npwp exists
          if (record.no_npwp) setNpwpList([record]);
          else setNpwpList([]);
        } else {
          setKtpList([]);
          setNpwpList([]);
          setHasData(false);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading.filter((e) => e !== 'getdata'));
  };

  const handleAddKTP = () => {
    setSelectedRecord(null);
    setIsEditMode(false);
    ktpForm.reset();
    setKtpImageFile(null);
    setKtpImagePreview(null);
    setActiveForm('ktp');
  };

  const handleAddNPWP = () => {
    setSelectedRecord(null);
    setIsEditMode(false);
    npwpForm.reset();
    setNpwpImageFile(null);
    setNpwpImagePreview(null);
    setActiveForm('npwp');
  };

  const handleEditKTP = (record: LegalRecord) => {
    setSelectedRecord(record);
    setIsEditMode(true);
    ktpForm.setValues({
      no_identity: record.no_identity,
      name_identity: record.name_identity,
      address_identity: record.address_identity,
      file_identity: '',
    });
    setKtpImagePreview(record.file_identity_url || null);
    setKtpImageFile(null);
    setActiveForm('ktp');
  };

  const handleEditNPWP = (record: LegalRecord) => {
    setSelectedRecord(record);
    setIsEditMode(true);
    npwpForm.setValues({
      no_npwp: record.no_npwp,
      name_npwp: record.name_npwp,
      address_npwp: record.address_npwp,
      file_npwp: '',
    });
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
      // Preserve NPWP data if editing
      no_npwp: selectedRecord?.no_npwp || '',
      name_npwp: selectedRecord?.name_npwp || '',
      address_npwp: selectedRecord?.address_npwp || '',
      file_npwp: selectedRecord?.file_npwp || '',
      type: 'ktp',
      status: 'active',
      is_snk: true,
    };

    setLoading.append('submit');
    try {
      if (hasData && selectedRecord) {
        await Put(`creator-information-legal/${userData?.has_creator?.id ?? 0}`, payload);
        notifications.show({ title: 'Berhasil', message: 'Data KTP berhasil diperbarui', color: 'green' });
      } else {
        await Post('creator-information-legal', payload);
        notifications.show({ title: 'Berhasil', message: 'Data KTP berhasil disimpan', color: 'green' });
      }
      getData(userData?.has_creator?.id ?? 0);
      setActiveForm(null);
    } catch {
      notifications.show({ title: 'Gagal', message: 'Gagal menyimpan data KTP', color: 'red' });
    } finally {
      setLoading.filter((e) => e !== 'submit');
    }
  };

  const handleSubmitNPWP = async (values: FormNPWPProps) => {
    let fileBase64 = values.file_npwp;
    if (npwpImageFile) {
      try { fileBase64 = await convertToBase64(npwpImageFile); } catch { return; }
    }

    const payload = {
      creator_id: userData?.has_creator?.id ?? 0,
      // Preserve KTP data if editing
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

    setLoading.append('submit');
    try {
      if (hasData && selectedRecord) {
        await Put(`creator-information-legal/${userData?.has_creator?.id ?? 0}`, payload);
        notifications.show({ title: 'Berhasil', message: 'Data NPWP berhasil diperbarui', color: 'green' });
      } else {
        await Post('creator-information-legal', payload);
        notifications.show({ title: 'Berhasil', message: 'Data NPWP berhasil disimpan', color: 'green' });
      }
      getData(userData?.has_creator?.id ?? 0);
      setActiveForm(null);
    } catch {
      notifications.show({ title: 'Gagal', message: 'Gagal menyimpan data NPWP', color: 'red' });
    } finally {
      setLoading.filter((e) => e !== 'submit');
    }
  };

  // sort helpers
  const getSortIcon = (cfg: typeof sortKtp, key: string) => {
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

  // ─── Table helper ─────────────────────────────────────────────────────────
  const renderTable = (
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
            <Button
              variant="filled"
              color="blue"
              size="sm"
              onClick={() => getData(userData?.has_creator?.id ?? 0)}
              loading={loading.includes('getdata')}
            >
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
                    <Flex align="center" gap={6} justify={['No', 'File', 'Status', 'Aksi'].includes(col.label) ? 'center' : 'flex-start'}>
                      {col.label}
                      {col.sortable && (
                        <FontAwesomeIcon
                          icon={getSortIcon(sort, col.key!)}
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
              {loading.includes('getdata') ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}>
                    <Text c="dimmed">Memuat data...</Text>
                  </td>
                </tr>
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
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <Text size="xs" fw={700}>{idx + 1}</Text>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {(type === 'ktp' ? item.file_identity_url : item.file_npwp_url) ? (
                        <Image
                          src={(type === 'ktp' ? item.file_identity_url : item.file_npwp_url)!}
                          alt="doc"
                          width={50}
                          height={35}
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
                    <td style={{ padding: '12px 14px' }}>
                      <Text size="sm" fw={600}>{type === 'ktp' ? item.name_identity : item.name_npwp}</Text>
                    </td>
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

  // ─── KTP Form View ────────────────────────────────────────────────────────
  const renderKTPForm = () => (
    <Stack gap={25}>
      <Flex align="center" gap={15}>
        <ActionIcon variant="light" color="gray" onClick={() => setActiveForm(null)} size="lg" radius="md">
          <FontAwesomeIcon icon={faArrowLeft} />
        </ActionIcon>
        <Stack gap={0}>
          <Title order={2} size="h3">{isEditMode ? 'Edit Data KTP' : 'Tambah Data KTP'}</Title>
          <Text size="xs" c="dimmed">Isi formulir di bawah untuk mengelola data KTP Anda</Text>
        </Stack>
      </Flex>

      <form id="ktp-form" onSubmit={ktpForm.onSubmit(handleSubmitKTP)}>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <Stack gap="lg">
            {/* KTP Image Upload */}
            <Box>
              <Text size="sm" fw={500} mb={8}>Foto / Scan KTP</Text>
              <label
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed #dee2e6', borderRadius: 12, height: 200, cursor: 'pointer',
                  backgroundColor: '#f8f9fa', overflow: 'hidden', position: 'relative'
                }}
              >
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
              <TextInput
                label="Nomor KTP"
                placeholder="Ketik 16 digit nomor KTP"
                required
                {...ktpForm.getInputProps('no_identity')}
              />
              <TextInput
                label="Nama (Sesuai KTP)"
                placeholder="Ketik nama sesuai KTP"
                required
                {...ktpForm.getInputProps('name_identity')}
              />
              <TextInput
                label="Alamat (Sesuai KTP)"
                placeholder="Ketik alamat sesuai KTP"
                required
                className="md:col-span-2"
                {...ktpForm.getInputProps('address_identity')}
              />
            </div>
          </Stack>
        </Card>

        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-8 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={() => setActiveForm(null)} size="md" leftSection={<FontAwesomeIcon icon={faXmark} />}>
              Batalkan
            </Button>
            <Button type="submit" form="ktp-form" color="blue" size="md" loading={loading.includes('submit')}
              leftSection={!loading.includes('submit') && <FontAwesomeIcon icon={faSave} />}>
              {isEditMode ? 'Simpan Perubahan' : 'Konfirmasi & Simpan'}
            </Button>
          </Flex>
        </Box>
      </form>
    </Stack>
  );

  // ─── NPWP Form View ───────────────────────────────────────────────────────
  const renderNPWPForm = () => (
    <Stack gap={25}>
      <Flex align="center" gap={15}>
        <ActionIcon variant="light" color="gray" onClick={() => setActiveForm(null)} size="lg" radius="md">
          <FontAwesomeIcon icon={faArrowLeft} />
        </ActionIcon>
        <Stack gap={0}>
          <Title order={2} size="h3">{isEditMode ? 'Edit Data NPWP' : 'Tambah Data NPWP'}</Title>
          <Text size="xs" c="dimmed">Isi formulir di bawah untuk mengelola data NPWP Anda</Text>
        </Stack>
      </Flex>

      <form id="npwp-form" onSubmit={npwpForm.onSubmit(handleSubmitNPWP)}>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <Stack gap="lg">
            {/* NPWP Image Upload */}
            <Box>
              <Text size="sm" fw={500} mb={8}>Foto / Scan NPWP</Text>
              <label
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed #dee2e6', borderRadius: 12, height: 200, cursor: 'pointer',
                  backgroundColor: '#f8f9fa', overflow: 'hidden', position: 'relative'
                }}
              >
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
              <TextInput
                label="Nomor NPWP"
                placeholder="Ketik 16 digit nomor NPWP"
                required
                {...npwpForm.getInputProps('no_npwp')}
              />
              <TextInput
                label="Nama (Sesuai NPWP)"
                placeholder="Ketik nama sesuai NPWP"
                required
                {...npwpForm.getInputProps('name_npwp')}
              />
              <TextInput
                label="Alamat (Sesuai NPWP)"
                placeholder="Ketik alamat sesuai NPWP"
                required
                className="md:col-span-2"
                {...npwpForm.getInputProps('address_npwp')}
              />
            </div>
          </Stack>
        </Card>

        <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-8 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
          <Flex justify="flex-end" gap="md">
            <Button variant="subtle" color="gray" onClick={() => setActiveForm(null)} size="md" leftSection={<FontAwesomeIcon icon={faXmark} />}>
              Batalkan
            </Button>
            <Button type="submit" form="npwp-form" color="teal" size="md" loading={loading.includes('submit')}
              leftSection={!loading.includes('submit') && <FontAwesomeIcon icon={faSave} />}>
              {isEditMode ? 'Simpan Perubahan' : 'Konfirmasi & Simpan'}
            </Button>
          </Flex>
        </Box>
      </form>
    </Stack>
  );

  // ─── Main Render ──────────────────────────────────────────────────────────
  const renderList = () => (
    <Stack gap={30}>
      {/* Page Header */}
      <Flex justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={1} size="h2">Dokumen Legal</Title>
          <Text size="sm" c="gray">Kelola data KTP dan NPWP untuk verifikasi akun Anda</Text>
        </Stack>
        <Flex gap={10}>
          <Button
            onClick={handleAddKTP}
            leftSection={<FontAwesomeIcon icon={faPlus} />}
            color="blue"
            size="md"
            radius="xl"
          >
            Tambah KTP
          </Button>
          <Button
            onClick={handleAddNPWP}
            leftSection={<FontAwesomeIcon icon={faPlus} />}
            color="teal"
            size="md"
            radius="xl"
          >
            Tambah NPWP
          </Button>
        </Flex>
      </Flex>

      {/* KTP Table */}
      {renderTable('Data KTP', filteredKtp, 'ktp', handleAddKTP, handleEditKTP, searchKtp, setSearchKtp, sortKtp, requestSortKtp)}

      {/* NPWP Table */}
      {renderTable('Data NPWP', filteredNpwp, 'npwp', handleAddNPWP, handleEditNPWP, searchNpwp, setSearchNpwp, sortNpwp, requestSortNpwp)}
    </Stack>
  );

  return (
    <div className="p-[20px] md:p-[30px] pb-[100px] min-h-screen bg-[#fcfcfc]">
      <LoadingOverlay visible={loading.includes('submit')} overlayProps={{ blur: 2 }} />
      {activeForm === 'ktp' ? renderKTPForm() : activeForm === 'npwp' ? renderNPWPForm() : renderList()}
    </div>
  );
};

export default Legal;
