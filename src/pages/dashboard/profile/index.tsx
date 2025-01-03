import InputField from '@/components/Input';
import Image from 'next/image';
import { Get, Post, Put } from '@/utils/REST';
import { useEffect, useState } from 'react';
import imagePlus from '../../../assets/icon/camera-plus.png';
import Button from '@/components/Button';
import useLoggedUser from '@/utils/useLoggedUser';
import { toast } from 'react-toastify';
import { Tab, Tabs } from '@nextui-org/react';
import { Card } from '@mantine/core';
import ChangePassword from '@/components/ProfileComponent/ChangePassword';

interface FormProfileProps {
    user_id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    no_identity: number | null;
    image: string;
}

const Profile = () => {
    const [form, setForm] = useState<FormProfileProps>({
        user_id: 0,
        name: '',
        email: '',
        phone: '',
        address: '',
        no_identity: null,
        image: ''
    });
    const [hasData, setHasData] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const user = useLoggedUser();

    const getData = (id: number) => {
        Get(`user-profile/${id}`, {})
            .then((res: any) => {
                console.log(res);
                if (res.data) {
                    setHasData(true);
                    const { image, ...rest } = res.data;
                    setForm(rest);
                    setImage(res.data.image_url);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const onSubmit = () => {
        setLoading(true);
        Post('user-profile', form)
            .then((res) => {
                toast.success('Berhasil menyimpan data');
                setLoading(false);
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    };

    const onUpdate = () => {
        Put(`user-profile/${form.user_id}`, form)
            .then((res) => {
                console.log(res);
                toast.success('Berhasil mengupdate data');
                getData(form.user_id);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        if (user) {
            setForm({ ...form, user_id: user.id ?? 0 });
            getData(user.id ?? 0);
        }
    }, [user]);

    // const handleFile = (e: any) => {
    //   const file = e.target.files?.[0];
    //   const fileURL = URL.createObjectURL(file);
    //   console.log(fileURL);
    //   setImage(fileURL);
    //   setForm({ ...form, image: file.name });
    // };

    const handleFile = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm({ ...form, image: reader.result as string });
                setImage(reader.result as string);
                // console.log(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card>
            <Tabs
                variant="solid"
                aria-label="Tabs variants"
                className="border border-b-2 border-primary-light-200 border-x-0 border-t-0"
                classNames={{
                    tabList: 'pb-0 self-center font-semibold rounded-b-none bg-white',
                    tab: 'p-5',
                    cursor: '!bg-[#0B387C0D] rounded-[5px_5px_0_0] border-b-2 border-b-primary-base'
                }}
            >
                <Tab key="profile" title="Profile Saya">
                    <div className="max-w-3xl mx-auto pt-5 text-dark h-[90vh] px-4 sm:px-8 md:px-12 lg:px-0">
                        <div className="border-2 border-primary-light-200 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <label className="w-20 h-20 border-2 border-primary-light-200 rounded-lg bg-primary-light flex flex-col items-center justify-center gap-4 cursor-pointer">
                                    <input type="file" className="hidden" onChange={handleFile} accept="image/png, image/gif, image/jpeg" />
                                    {image ? (
                                        <Image src={image} alt="image" className="object-cover rounded-lg" width={100} height={100} style={{ width: '100%', height: '100%' }} />
                                    ) : (
                                        <>
                                            <Image src={imagePlus} alt="image-plus" className="w-8 h-8" />
                                        </>
                                    )}
                                </label>
                                <div className="flex flex-col gap-3">
                                    <p className="font-semibold">Foto Profil</p>
                                    <p className="text-grey text-xs">Direkomendasikan tidak lebih dari 2mb</p>
                                </div>
                            </div>
                            <InputField type="text" label="Nama" value={form.name} placeholder="Masukkan Nama" fullWidth onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            <InputField type="text" label="Email" value={form.email} placeholder="Masukkan Email" fullWidth onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            {/* <div className='grid grid-cols-2 gap-3'>
                      <InputField type='text' label='Tempat Lahir' placeholder='Tempat Lahir' fullWidth onChange={(e) => setForm({...form, address: e.target.value})}/>
                      <InputField type='date' label='Email' placeholder='Masukkan Email' fullWidth />
                    </div> */}
                            <InputField type="num" label="NIK" value={form.no_identity} placeholder="Masukkan NIK" fullWidth onChange={(e) => setForm({ ...form, no_identity: e.target.value })} />
                            <InputField type="number" label="Nomor Telepon" value={form.phone} placeholder="Masukkan No Telepon" fullWidth onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            <InputField type="text" label="Alamat" value={form.address} placeholder="Masukkan Alamat" fullWidth onChange={(e) => setForm({ ...form, address: e.target.value })} />
                            <div className="py-5 bottom-0 flex justify-end">{hasData ? <Button label="Update Dokumen" color="primary" onClick={onUpdate} disabled={loading} /> : <Button label="Kirim Dokumen" color="primary" onClick={onSubmit} disabled={loading} />}</div>
                        </div>
                    </div>
                </Tab>
                <Tab  key="change-password" title="Ganti Password">
                  <ChangePassword />
                </Tab>
            </Tabs>
        </Card>
    );
};

export default Profile;
