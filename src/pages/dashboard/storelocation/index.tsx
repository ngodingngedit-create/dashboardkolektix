import { Get, Post, Put, Delete } from "@/utils/REST";
import { useEffect, useState, useCallback, useRef } from "react";
import useLoggedUser from "@/utils/useLoggedUser";
import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Card,
    Flex,
    LoadingOverlay,
    Modal,
    Select,
    Stack,
    Text,
    TextInput,
    Title,
    Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useListState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faArrowsRotate,
    faCrosshairs,
    faMapMarkerAlt,
    faPencil,
    faPlus,
    faSave,
    faStore,
    faTrash,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

const GOOGLE_MAPS_API_KEY = "AIzaSyBxZekg89Ut1U72fFpQldJAenvgTy197As";
const GOOGLE_MAPS_MAP_ID = "795838f77e7bb079c78f5aac";

interface Province { id: number; name: string; }
interface City { id: number; province_id: number; name: string; }
interface Subdistrict { id: number; city_id: number; name: string; }

interface StoreLocation {
    id: number;
    slug_url: string;
    store_name: string;
    full_address: string;
    phone: string;
    postal_code: string;
    province_id: number;
    city_id: number;
    subdistrict_id: number;
    latitude: number | null;
    longitude: number | null;
    is_active: number;
    is_pinpoin: number | null;
    province?: { id: number; name: string };
    city?: { id: number; name: string };
    subdistrict?: { id: number; name: string };
}

interface FormValues {
    store_name: string;
    full_address: string;
    province_id: number | null;
    city_id: number | null;
    subdistrict_id: number | null;
    postal_code: string;
    phone: string;
    latitude: string;
    longitude: string;
}

const DEFAULT_LAT = -6.2088;
const DEFAULT_LNG = 106.8456;

// Load Google Maps script once
let googleMapsScriptLoaded = false;
const loadGoogleMapsScript = (): Promise<void> => {
    if (googleMapsScriptLoaded || (window as any).google?.maps) {
        googleMapsScriptLoaded = true;
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&map_ids=${GOOGLE_MAPS_MAP_ID}`;
        script.async = true;
        script.defer = true;
        script.onload = () => { googleMapsScriptLoaded = true; resolve(); };
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// ─── Google Map Component ──────────────────────────────────────────────────
const MapPicker = ({
    lat, lng, onPick,
}: { lat: number; lng: number; onPick: (lat: number, lng: number) => void }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadGoogleMapsScript().then(() => setIsLoaded(true)).catch(console.error);
    }, []);

    useEffect(() => {
        if (!isLoaded || !mapRef.current) return;
        const google = (window as any).google;

        if (!googleMapRef.current) {
            googleMapRef.current = new google.maps.Map(mapRef.current, {
                center: { lat, lng },
                zoom: 14,
                mapId: GOOGLE_MAPS_MAP_ID,
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            });

            markerRef.current = new google.maps.Marker({
                position: { lat, lng },
                map: googleMapRef.current,
                draggable: true,
            });

            googleMapRef.current.addListener("click", (e: any) => {
                const newLat = e.latLng.lat();
                const newLng = e.latLng.lng();
                markerRef.current.setPosition({ lat: newLat, lng: newLng });
                onPick(newLat, newLng);
            });

            markerRef.current.addListener("dragend", (e: any) => {
                onPick(e.latLng.lat(), e.latLng.lng());
            });
        } else {
            googleMapRef.current.setCenter({ lat, lng });
            markerRef.current.setPosition({ lat, lng });
        }
    }, [isLoaded, lat, lng]);

    return (
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #dee2e6" }}>
            {!isLoaded && (
                <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa" }}>
                    <Text c="dimmed" size="sm">Memuat peta...</Text>
                </div>
            )}
            <div ref={mapRef} style={{ height: 320, display: isLoaded ? "block" : "none" }} />
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
const StoreLocationPage = () => {
    const [loading, setLoading] = useListState<string>();
    const [dataList, setDataList] = useState<StoreLocation[]>([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StoreLocation | null>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<StoreLocation | null>(null);

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);

    const [mapLat, setMapLat] = useState(DEFAULT_LAT);
    const [mapLng, setMapLng] = useState(DEFAULT_LNG);
    const [creatorSlugUrl, setCreatorSlugUrl] = useState<string | null>(null);

    const user = useLoggedUser();

    const form = useForm<FormValues>({
        initialValues: {
            store_name: "", full_address: "",
            province_id: null, city_id: null, subdistrict_id: null,
            postal_code: "", phone: "", latitude: "", longitude: "",
        },
        validate: {
            store_name: (v) => (!v ? "Wajib diisi" : null),
            full_address: (v) => (!v ? "Wajib diisi" : null),
            province_id: (v) => (v === null ? "Pilih provinsi" : null),
            city_id: (v) => (v === null ? "Pilih kota" : null),
            subdistrict_id: (v) => (v === null ? "Pilih kecamatan" : null),
            postal_code: (v) => (!v ? "Wajib diisi" : null),
            phone: (v) => (!v ? "Wajib diisi" : null),
        },
    });

    // ─── Data Fetching ─────────────────────────────────────────────────────────
    const getData = useCallback((slugUrl: string) => {
        if (!slugUrl) return;
        setLoading.append("getdata");
        Get(`store-locations/creator/${slugUrl}`, {})
            .then((res: any) => setDataList(res.data ?? []))
            .catch(() => notifications.show({ title: "Gagal", message: "Gagal memuat data", color: "red" }))
            .finally(() => setLoading.filter((e) => e !== "getdata"));
    }, []);

    const getCreatorSlugUrl = useCallback(() => {
        if (!user?.has_creator?.id) return;
        Get("creator", {})
            .then((res: any) => {
                const creators: any[] = res.data ?? [];
                const matched = creators.find((c: any) => c.id === user.has_creator?.id);
                if (matched?.slug_url) {
                    setCreatorSlugUrl(matched.slug_url);
                    getData(matched.slug_url);
                }
            })
            .catch(() => { });
    }, [user, getData]);

    const getProvinces = () => {
        Get("province", {}).then((res: any) => setProvinces(res.data ?? [])).catch(() => { });
    };

    const getCities = (provinceId: number) => {
        form.setFieldValue("city_id", null);
        form.setFieldValue("subdistrict_id", null);
        setCities([]);
        setSubdistricts([]);
        Get(`city?province_id=${provinceId}`, {}).then((res: any) => setCities(res.data ?? [])).catch(() => { });
    };

    const getSubdistricts = (cityId: number) => {
        form.setFieldValue("subdistrict_id", null);
        setSubdistricts([]);
        Get(`sub-district?city_id=${cityId}`, {}).then((res: any) => setSubdistricts(res.data ?? [])).catch(() => { });
    };

    useEffect(() => {
        if (user) { getCreatorSlugUrl(); getProvinces(); }
    }, [user]);

    // ─── Map Handler ────────────────────────────────────────────────────────────
    const handleMapPick = (lat: number, lng: number) => {
        setMapLat(lat);
        setMapLng(lng);
        form.setFieldValue("latitude", lat.toFixed(7));
        form.setFieldValue("longitude", lng.toFixed(7));
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(({ coords }) => {
            handleMapPick(coords.latitude, coords.longitude);
        });
    };

    // ─── CRUD ──────────────────────────────────────────────────────────────────
    const handleAddClick = () => {
        setSelectedItem(null);
        setIsEditMode(false);
        form.reset();
        setCities([]);
        setSubdistricts([]);
        setMapLat(DEFAULT_LAT);
        setMapLng(DEFAULT_LNG);
        setIsFormVisible(true);
    };

    const handleEditClick = (item: StoreLocation) => {
        setSelectedItem(item);
        setIsEditMode(true);
        form.setValues({
            store_name: item.store_name, full_address: item.full_address,
            province_id: item.province_id, city_id: item.city_id, subdistrict_id: item.subdistrict_id,
            postal_code: item.postal_code, phone: item.phone,
            latitude: item.latitude ? String(item.latitude) : "",
            longitude: item.longitude ? String(item.longitude) : "",
        });
        if (item.province_id) Get(`city?province_id=${item.province_id}`, {}).then((res: any) => setCities(res.data ?? []));
        if (item.city_id) Get(`sub-district?city_id=${item.city_id}`, {}).then((res: any) => setSubdistricts(res.data ?? []));
        const lat = item.latitude ?? DEFAULT_LAT;
        const lng = item.longitude ?? DEFAULT_LNG;
        setMapLat(lat);
        setMapLng(lng);
        setIsFormVisible(true);
    };

    const handleSubmit = () => {
        const { hasErrors } = form.validate();
        if (hasErrors) return;

        const payload = { ...form.values };
        setLoading.append("submit");
        const req = isEditMode && selectedItem
            ? Put(`store-locations/${selectedItem.id}`, payload)
            : Post("store-locations", payload);

        req
            .then(() => {
                notifications.show({ title: "Berhasil", message: isEditMode ? "Berhasil diperbarui" : "Berhasil ditambahkan", color: "green" });
                if (creatorSlugUrl) getData(creatorSlugUrl);
                setIsFormVisible(false);
            })
            .catch(() => notifications.show({ title: "Gagal", message: "Gagal menyimpan data", color: "red" }))
            .finally(() => setLoading.filter((e) => e !== "submit"));
    };

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        setLoading.append("delete");
        Delete(`store-locations/${deleteTarget.id}`, {})
            .then(() => {
                notifications.show({ title: "Berhasil", message: "Lokasi berhasil dihapus", color: "green" });
                getData(creatorSlugUrl ?? '');
                setDeleteModal(false);
                setDeleteTarget(null);
            })
            .catch(() => notifications.show({ title: "Gagal", message: "Gagal menghapus data", color: "red" }))
            .finally(() => setLoading.filter((e) => e !== "delete"));
    };

    // ─── Render List ───────────────────────────────────────────────────────────
    const renderList = () => (
        <Stack gap={20}>
            <Flex justify="space-between" align="center">
                <Stack gap={0}>
                    <Title order={2} size="h3">Lokasi Toko</Title>
                    <Text size="sm" c="gray">Kelola lokasi toko / gudang Anda</Text>
                </Stack>
                <Button onClick={handleAddClick} leftSection={<FontAwesomeIcon icon={faPlus} />} color="blue" radius="xl">
                    Tambah Lokasi
                </Button>
            </Flex>

            <Card withBorder p="md" radius="md" shadow="sm">
                <Flex justify="flex-end" mb="md">
                    <Button variant="light" color="blue" size="sm" onClick={() => creatorSlugUrl && getData(creatorSlugUrl)}
                        loading={loading.includes("getdata")} leftSection={<FontAwesomeIcon icon={faArrowsRotate} />}>
                        Refresh
                    </Button>
                </Flex>

                <Box style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa" }}>
                                {["No", "Nama Toko", "Alamat", "Kota", "Telepon", "Pinpoin", "Status", "Aksi"].map((col, i) => (
                                    <th key={i} style={{
                                        padding: "12px 14px",
                                        textAlign: ["No", "Pinpoin", "Status", "Aksi"].includes(col) ? "center" : "left",
                                        fontSize: "11px", fontWeight: 700, color: "#495057",
                                        textTransform: "uppercase", borderBottom: "2px solid #e9ecef", letterSpacing: "0.5px",
                                        position: col === "Aksi" ? "sticky" : "static", right: col === "Aksi" ? 0 : "auto",
                                        backgroundColor: col === "Aksi" ? "#f8f9fa" : "transparent",
                                        zIndex: col === "Aksi" ? 10 : 1, whiteSpace: "nowrap",
                                    }}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading.includes("getdata") ? (
                                <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center" }}>
                                    <Text c="dimmed">Memuat data...</Text>
                                </td></tr>
                            ) : dataList.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: "60px", textAlign: "center" }}>
                                    <Stack align="center" gap={10}>
                                        <FontAwesomeIcon icon={faStore} size="2x" color="#adb5bd" />
                                        <Text c="dimmed" fw={500}>Belum ada lokasi toko</Text>
                                        <Text size="xs" c="gray">Klik &quot;Tambah Lokasi&quot; untuk menambah lokasi baru</Text>
                                    </Stack>
                                </td></tr>
                            ) : (
                                dataList.map((item, idx) => (
                                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f3f5" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                                            <Text size="xs" fw={700}>{idx + 1}</Text>
                                        </td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <Text size="sm" fw={600}>{item.store_name}</Text>
                                            <Text size="xs" c="dimmed">{item.slug_url}</Text>
                                        </td>
                                        <td style={{ padding: "12px 14px", maxWidth: 200 }}>
                                            <Text size="sm" c="gray.7" lineClamp={2}>{item.full_address}</Text>
                                        </td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <Text size="sm" c="gray.7">{item.city?.name ?? "-"}</Text>
                                            <Text size="xs" c="dimmed">{item.province?.name ?? ""}</Text>
                                        </td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <Text size="sm" c="gray.7">{item.phone ?? "-"}</Text>
                                        </td>
                                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                                            {item.is_pinpoin ? (
                                                <FontAwesomeIcon icon={faMapMarkerAlt} color="#228be6" />
                                            ) : (
                                                <Text size="xs" c="dimmed">-</Text>
                                            )}
                                        </td>
                                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                                            <Badge color={item.is_active ? "green" : "gray"} variant="light" size="sm">
                                                {item.is_active ? "Aktif" : "Non-aktif"}
                                            </Badge>
                                        </td>
                                        <td style={{ padding: "12px 14px", position: "sticky", right: 0, backgroundColor: "inherit", zIndex: 5, boxShadow: "-2px 0 5px rgba(0,0,0,0.02)", borderLeft: "1px solid #f1f3f5" }}>
                                            <Flex gap={8} justify="center">
                                                <Tooltip label="Edit">
                                                    <ActionIcon variant="subtle" color="blue" onClick={() => handleEditClick(item)}>
                                                        <FontAwesomeIcon icon={faPencil} size="sm" />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Hapus">
                                                    <ActionIcon variant="subtle" color="red" onClick={() => { setDeleteTarget(item); setDeleteModal(true); }}>
                                                        <FontAwesomeIcon icon={faTrash} size="sm" />
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

    // ─── Render Form ───────────────────────────────────────────────────────────
    const renderForm = () => (
        <Stack gap={25}>
            <Flex align="center" gap={15}>
                <ActionIcon variant="light" color="gray" onClick={() => setIsFormVisible(false)} size="lg" radius="md">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </ActionIcon>
                <Stack gap={0}>
                    <Title order={2} size="h3">{isEditMode ? "Edit Lokasi Toko" : "Tambah Lokasi Toko"}</Title>
                    <Text size="xs" c="dimmed">Isi formulir di bawah untuk mengelola lokasi toko</Text>
                </Stack>
            </Flex>

            <Card withBorder padding="xl" radius="md" shadow="sm">
                <Stack gap="xl">
                    {/* Info Toko */}
                    <div>
                        <Text fw={600} size="sm" mb="sm" c="gray.7" tt="uppercase" style={{ letterSpacing: "0.4px" }}>Informasi Toko</Text>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <TextInput label="Nama Toko" placeholder="Masukkan nama toko" required {...form.getInputProps("store_name")} />
                            <TextInput label="Nomor Telepon" placeholder="08xxxxxxxxxx" required {...form.getInputProps("phone")} />
                            <TextInput label="Alamat Lengkap" placeholder="Masukkan alamat lengkap" required className="md:col-span-2" {...form.getInputProps("full_address")} />
                        </div>
                    </div>

                    {/* Wilayah */}
                    <div>
                        <Text fw={600} size="sm" mb="sm" c="gray.7" tt="uppercase" style={{ letterSpacing: "0.4px" }}>Wilayah</Text>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Select
                                label="Provinsi" placeholder="Pilih provinsi" required searchable
                                data={provinces.map((p) => ({ value: String(p.id), label: p.name }))}
                                value={form.values.province_id ? String(form.values.province_id) : null}
                                onChange={(v) => { if (!v) return; form.setFieldValue("province_id", Number(v)); getCities(Number(v)); }}
                                error={form.errors.province_id as string}
                            />
                            <Select
                                label="Kota / Kabupaten" placeholder={cities.length ? "Pilih kota" : "Pilih provinsi dulu"} required searchable
                                disabled={cities.length === 0}
                                data={cities.map((c) => ({ value: String(c.id), label: c.name }))}
                                value={form.values.city_id ? String(form.values.city_id) : null}
                                onChange={(v) => { if (!v) return; form.setFieldValue("city_id", Number(v)); getSubdistricts(Number(v)); }}
                                error={form.errors.city_id as string}
                            />
                            <Select
                                label="Kecamatan" placeholder={subdistricts.length ? "Pilih kecamatan" : "Pilih kota dulu"} required searchable
                                disabled={subdistricts.length === 0}
                                data={subdistricts.map((s) => ({ value: String(s.id), label: s.name }))}
                                value={form.values.subdistrict_id ? String(form.values.subdistrict_id) : null}
                                onChange={(v) => { if (!v) return; form.setFieldValue("subdistrict_id", Number(v)); }}
                                error={form.errors.subdistrict_id as string}
                            />
                            <TextInput label="Kode Pos" placeholder="16511" required {...form.getInputProps("postal_code")} />
                        </div>
                    </div>

                    {/* Koordinat & Maps */}
                    <div>
                        <Flex justify="space-between" align="center" mb="sm">
                            <Text fw={600} size="sm" c="gray.7" tt="uppercase" style={{ letterSpacing: "0.4px" }}>Koordinat Lokasi</Text>
                            <Button size="xs" variant="light" color="blue" leftSection={<FontAwesomeIcon icon={faCrosshairs} />} onClick={handleUseCurrentLocation}>
                                Gunakan Lokasi Saya
                            </Button>
                        </Flex>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                            <TextInput
                                label="Latitude"
                                placeholder="-6.2088"
                                {...form.getInputProps("latitude")}
                                onChange={(e) => {
                                    form.setFieldValue("latitude", e.target.value);
                                    const lat = parseFloat(e.target.value);
                                    if (!isNaN(lat)) setMapLat(lat);
                                }}
                            />
                            <TextInput
                                label="Longitude"
                                placeholder="106.8456"
                                {...form.getInputProps("longitude")}
                                onChange={(e) => {
                                    form.setFieldValue("longitude", e.target.value);
                                    const lng = parseFloat(e.target.value);
                                    if (!isNaN(lng)) setMapLng(lng);
                                }}
                            />
                        </div>
                        <Text size="xs" c="dimmed" mb="xs">Klik pada peta atau seret pin untuk menentukan lokasi</Text>
                        <MapPicker lat={mapLat} lng={mapLng} onPick={handleMapPick} />
                    </div>
                </Stack>
            </Card>

            {/* Sticky Footer */}
            <Box className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-grey px-5 md:px-8 py-4 shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
                <Flex justify="flex-end" gap="md">
                    <Button variant="subtle" color="gray" onClick={() => setIsFormVisible(false)} leftSection={<FontAwesomeIcon icon={faXmark} />}>
                        Batalkan
                    </Button>
                    <Button color="blue" loading={loading.includes("submit")}
                        leftSection={!loading.includes("submit") ? <FontAwesomeIcon icon={faSave} /> : undefined}
                        onClick={handleSubmit}>
                        {isEditMode ? "Simpan Perubahan" : "Konfirmasi & Simpan"}
                    </Button>
                </Flex>
            </Box>
        </Stack>
    );

    return (
        <div className="p-5 pb-[120px] text-black">
            <LoadingOverlay visible={loading.includes("submit") || loading.includes("delete")} overlayProps={{ blur: 2 }} />
            {isFormVisible ? renderForm() : renderList()}

            {/* Delete Modal */}
            <Modal
                opened={deleteModal}
                onClose={() => setDeleteModal(false)}
                title={<Text fw={600}>Hapus Lokasi Toko</Text>}
                size="sm" radius="md" centered
            >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        Apakah Anda yakin ingin menghapus{" "}
                        <Text span fw={600} c="dark">{deleteTarget?.store_name}</Text>? Tindakan ini tidak dapat dibatalkan.
                    </Text>
                    <Flex gap="md" justify="flex-end">
                        <Button variant="subtle" color="gray" onClick={() => setDeleteModal(false)}>Batal</Button>
                        <Button color="red" loading={loading.includes("delete")} onClick={handleDeleteConfirm}>Ya, Hapus</Button>
                    </Flex>
                </Stack>
            </Modal>
        </div>
    );
};

export default StoreLocationPage;
