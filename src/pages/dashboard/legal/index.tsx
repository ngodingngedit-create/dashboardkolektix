import InputField from '@/components/Input';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import filePlus from '../../../assets/icon/filePlus.png';
import { Checkbox } from '@nextui-org/react';
import Button from '@/components/Button';
import { Post, Get, Put } from '@/utils/REST';
import useLoggedUser from '@/utils/useLoggedUser';
import { toast } from 'react-toastify';

interface FormLegalProps {
  creator_id: number;
  no_identity: string;
  no_npwp: string;
  name_identity: string;
  address_identity: string;
  name_npwp: string;
  address_npwp: string;
  file_identity: string;
  file_npwp: string;
  type: string;
  status: 'active' | 'inactive';
  is_snk: boolean;
}

const Legal = () => {
  const [ktpImg, setKtpImg] = useState<string | null>(null);
  const [npwpImg, setNpwpImg] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const userData = useLoggedUser();
  const [form, setForm] = useState<FormLegalProps>({
    creator_id: 0,
    no_identity: '',
    no_npwp: '',
    name_identity: '',
    address_identity: '',
    name_npwp: '',
    address_npwp: '',
    file_identity: '',
    file_npwp: '',
    type: '',
    status: 'active',
    is_snk: false,
  });

  useEffect(() => {
    if (userData) {
      setForm({ ...form, creator_id: userData.has_creator.id });
      getData(userData.has_creator.id);
    }
  }, [userData]);

  const getData = (id: number) => {
    Get(`creator-information-legal/${id}`, {})
      .then((res: any) => {
        console.log(res);
        if (res.data) {
          setHasData(true);
          const { file_identity, file_npwp, ...rest } = res.data;
          setForm(rest);
          setKtpImg(res.data.file_identity_url);
          setNpwpImg(res.data.file_npwp_url);
          // setImage(res.data.image_url);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onSubmit = () => {
    Post('creator-information-legal', form)
      .then((res) => {
        console.log(res);
        toast.success('Berhasil menyimpan data');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onUpdate = () => {
    Put(`creator-information-legal/${form.creator_id}`, form)
      .then((res) => {
        console.log(res);
        toast.success('Berhasil mengupdate data');
        getData(form.creator_id);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleImage = (e: any, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      if (type === 'ktp') {
        reader.onloadend = () => {
          setKtpImg(reader.result as string);
          setForm({ ...form, file_identity: reader.result as string });
        };
      } else {
        reader.onloadend = () => {
          setNpwpImg(reader.result as string);
          setForm({ ...form, file_npwp: reader.result as string });
        };
      }
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className='max-w-4xl mx-auto text-dark py-5'>
      <div className='px-4 sm:px-8 md:px-12 lg:px-0'>
        <p className='font-semibold text-base'>
          Status Dokumen <span className='text-danger'>Belum Diverifikasi</span>
        </p>
        <div className='grid grid-cols-2 gap-4 my-5'>
          <div className='border-2 border-primary-light-200 w-full rounded-lg'>
            <div className='border-b-2 border-b-primary-light-200 p-4'>
              <h6>KTP</h6>
            </div>
            <div className='p-4'>
              <label className='w-full border-2 border-primary-light-200 rounded-lg border-dashed bg-chat flex flex-col items-center justify-center h-60 gap-4 cursor-pointer'>
                <input type='file' className='hidden' onChange={(e: any) => handleImage(e, 'ktp')} />
                {ktpImg ? (
                  <Image
                    src={ktpImg}
                    alt='image'
                    className='object-cover rounded-lg'
                    width={500}
                    height={500}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <>
                    <Image src={filePlus} alt='image-plus' />
                    <h3 className='font-semibold text-medium text-center'>
                      Unggah dokumen KTP disini
                    </h3>
                  </>
                )}
              </label>
            </div>
            <div className='p-4 flex flex-col gap-3'>
              <InputField
                type='text'
                label='Nomor KTP'
                value={form.no_identity}
                required
                fullWidth
                placeholder='Ketik 16 digit nomor KTP'
                onChange={(e: any) => setForm({ ...form, no_identity: e.target.value })}
              />
              <InputField
                type='text'
                label='Nama (Sesuai KTP)'
                value={form.name_identity}
                required
                fullWidth
                placeholder='Ketik nama sesuai KTP'
                onChange={(e: any) => setForm({ ...form, name_identity: e.target.value })}
              />
              <InputField
                type='text'
                label='Alamat (Sesuai KTP)'
                value={form.address_identity}
                required
                fullWidth
                placeholder='Ketik alamat sesuai KTP'
                onChange={(e: any) => setForm({ ...form, address_identity: e.target.value })}
              />
            </div>
          </div>
          <div className='border-2 border-primary-light-200 w-full rounded-lg'>
            <div className='border-b-2 border-b-primary-light-200 p-4 '>
              <h6>NPWP</h6>
            </div>
            <div className='p-4'>
              <label className='w-full border-2 border-primary-light-200 rounded-lg border-dashed bg-chat flex flex-col items-center justify-center h-60 gap-4 cursor-pointer'>
                <input type='file' className='hidden' onChange={(e: any) => handleImage(e, 'npwp')} />
                {npwpImg ? (
                  <Image
                    src={npwpImg}
                    alt='image'
                    className='object-cover rounded-lg'
                    width={500}
                    height={500}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <>
                    <Image src={filePlus} alt='image-plus' />
                    <h3 className='font-semibold text-medium text-center'>
                      Unggah dokumen NPWP disini
                    </h3>
                  </>
                )}
              </label>
            </div>
            <div className='p-4 flex flex-col gap-3'>
              <InputField
                type='text'
                label='Nomor NPWP'
                value={form.no_npwp}
                required
                fullWidth
                placeholder='Ketik 16 digit nomor NPWP'
                onChange={(e: any) => setForm({ ...form, no_npwp: e.target.value })}
              />
              <InputField
                type='text'
                label='Nama (Sesuai NPWP)'
                value={form.name_npwp}
                required
                fullWidth
                placeholder='Ketik nama sesuai NPWP'
                onChange={(e: any) => setForm({ ...form, name_npwp: e.target.value })}
              />
              <InputField
                type='text'
                label='Alamat (Sesuai NPWP)'
                value={form.address_npwp}
                required
                fullWidth
                placeholder='Ketik alamat sesuai NPWP'
                onChange={(e: any) => setForm({ ...form, address_npwp: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className='border-b-2 border-primary-light-200 pb-3 mb-4'>
          <div>
            <p className='text-grey'>
              Harap perhatikan kesesuaian antara identitas pada KTP dan NPWP. Jika terdapat
              ketidaksesuaian antara KTP dan NPWP, faktur pajak akan diterbitkan sesuai dengan
              identitas pada NPWP. Jika dokumen NPWP tidak diunggah, Anda dianggap tidak memiliki
              NPWP.
            </p>
          </div>
          <div className='flex items-center gap-3 my-4 '>
            <Checkbox
              color='primary'
              radius='sm'
              checked={form.is_snk}
              onChange={(e: any) => setForm({ ...form, is_snk: e.target.checked })}
            />
            <p className='text-grey'>
              Dengan ini saya menyatakan bahwa semua informasi yang disampaikan dalam seluruh lampiran
              ini adalah benar. Jika ditemukan atau dibuktikan adanya kesalahan, penipuan, atau
              pemalsuan informasi yang saya sampaikan, Kolektix dibebaskan dari setiap akibat yang
              timbul dari penggunaan data atau dokumen tersebut.
            </p>
          </div>
        </div>
      </div>
      <div className='w-full flex justify-end px-2'>
        {hasData ? (
          <Button label='Update Dokumen' color='primary' onClick={onUpdate} />
        ) : (
          <Button label='Kirim Dokumen' color='primary' onClick={onSubmit} />
        )}
      </div>
    </div>
  );
};

export default Legal;
