import { useEffect, useState } from 'react';
import Foto from '../../assets/images/amis-banner.png';
import Foto2 from '../../assets/images/Foto=1.png';
import Foto3 from '../../assets/images/Foto=2.png';
import Foto4 from '../../assets/images/Foto=3.png';
import CreatorTitle from '@/components/Creator/CreatorTitle';
import Image, { StaticImageData } from 'next/image';
import { faCirclePlus, faMinus, faPlus, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/Button';
import Router from 'next/router';
import { MerchListResponse } from '../dashboard/merch/type';
import { Get } from '@/utils/REST';
import { useListState } from '@mantine/hooks';
import { NumberFormatter } from '@mantine/core';

const colors = [
  { id: 1, color: 'Abu-Abu' },
  { id: 2, color: 'Hitam' },
  { id: 3, color: 'Merah' },
  { id: 1, color: 'Biru' },
  { id: 2, color: 'Hijau' },
  { id: 3, color: 'Putih' },
];

const images = [
  { id: 1, image: Foto },
  { id: 2, image: Foto2 },
  { id: 3, image: Foto3 },
  { id: 4, image: Foto4 },
];

const sizes = [
  { id: 1, size: 'S' },
  { id: 2, size: 'M' },
  { id: 3, size: 'L' },
  { id: 1, size: 'XL' },
  { id: 2, size: 'XXL' },
];

const MerchandiseDetail = () => {
  const { slug } = Router.query;
  const [mainData, setMainData] = useState<MerchListResponse>();
  const [colorOpt, setColorOpt] = useState<string>('');
  const [sizeOpt, setSizeOpt] = useState<string>('');
  const [count, setCount] = useState<number>(0);
  const [imageActive, setImage] = useState<StaticImageData>(images[0].image);
  const [loading, setLoading] = useListState<string>();

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    Get(`product/${slug}`, {})
    .then((res: any) => {
        setMainData(res.data);
        setLoading.filter((e) => e != 'getdata');
    })
    .catch((err) => {
        console.log(err);
        setLoading.filter((e) => e != 'getdata');
    });
  }

  if (!mainData) return (
    <></>
  );

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 text-dark min-h-screen pt-20 mx-auto gap-8 px-3 md:px-4 sm:px-8 lg:px-0 max-w-5xl mb-4'>
      <div className='grid grid-cols-2 gap-2 md:grid-cols-4 auto-rows-min'>
      <div className='col-span-2 md:col-span-4'>
        <Image
          src={imageActive}
          alt='merch'
          className='w-full h-72 object-cover rounded-md'
        />
      </div>
      {images.map((item) => (
        <div
          key={item.id}
          className='flex items-center justify-center'
        >
          <Image
            src={item.image}
            alt='merch'
            className={`w-full h-20 object-cover rounded-md cursor-pointer ${
              item.image === imageActive
                ? 'border-2 border-primary-dark'
                : 'border-2 border-primary-light-200'
            }`}
            onClick={() => setImage(item.image)}
          />
        </div>
        ))}
      </div>
      <div className='flex flex-col gap-2 divide-y divide-primary-light-200'>
        <h3 className='text-lg md:text-xl'>{mainData.product_name}</h3>
        <div className='flex gap-2 items-center !border-y-0'>
          <p className='text-grey text-xs md:text-sm'>Terjual 30+</p>
          <p>&bull;</p>
          <p className='text-xs md:text-sm'>
            <FontAwesomeIcon icon={faStar} className='text-warning-400' />
            <span className='ml-1'>4.8</span>
          </p>
        </div>
        <div className='!border-t-0'>
          <h3 className='text-xl'><NumberFormatter value={parseInt(mainData.price)} /></h3>
          {/* <p className='text-grey text-xs line-through'>Rp1.650.000</p> */}
        </div>
        <div className='flex flex-row justify-between items-center pt-3 pb-2'>
          <CreatorTitle image={Foto} creator={mainData.created_by} location='Jakarta' />
          {/* <Button color='secondary' label='Lihat Toko' /> */}
        </div>
        <div className='pt-3 pb-1'>
          <p className='font-semibold'>
            Pilih Warna: <span className='text-grey font-normal'>{colorOpt}</span>
          </p>
          <div className='flex flex-wrap gap-2 my-2'>
            {colors.map((item) => (
              <div
                className={`flex items-center justify-center border text-sm ${
                  item.color === colorOpt
                    ? 'border-primary-dark text-primary-dark'
                    : 'border-primary-light-200 text-grey'
                } px-3 py-1 rounded-md cursor-pointer`}
                onClick={() => setColorOpt(item.color)}
                key={item.id}
              >
                {item.color}
              </div>
            ))}
          </div>
        </div>
        <div className='py-3'>
          <p>
            Deskripsi Produk <br />
            <br />
            About product:
            <br />
            Material Bahan :
            <br />✅ 100% Katun kualitas terbaik {`(Combed 24s)`}
            <br />
            ✅ Lembut dan halus
            <br />
            ✅ Tidak menerawang
            <br />
            ✅ Tidak panas
            <br />
            ✅ Menyerap keringat
            <br />
            *Produk MNST ini menggunakan size chart Oversize
            <br />
            {`Size chart Asia (before wash)`}
            <br />
            {`* M( Lebar 55 x Tinggi 71 ) cm`}
            <br />
            {`* L( Lebar 57 x Tinggi 73 ) cm`}
            <br />
            {`* XL( Lebar 60 x Tinggi 75 ) cm`}
            <br />
            - tolerance 1 cm
            <br />- all kind of cotton will shrink after wash, its normal Pesanan anda akan langsung
            kami proses di hari yg sama sebelum jam 17.00 senin-sabtu Pesanan di hari sabtu dan
            minggu diatas jam 17.00 akan diproses senin. Wajib menyertakan video unboxing untuk
            claim tukar atau return Jika terjadi barang rusak atau reject saat pengiriman. Kesalahan
            pembelian dalam memilih ukuran tidak bisa di tukar. Pastikan ukuran yg anda pilih benar.
            Dengan membaca size chart dengan teliti.
          </p>
        </div>
      </div>
      <div className='border border-primary-light-200 rounded-lg p-3 h-fit flex flex-col gap-2 shadow-sm'>
        <h5 className='text-lg md:text-xl'>Jumlah</h5>
        <div className='flex flex-col md:flex-row items-center gap-4'>
          <div className='flex items-center'>
            <div className='border border-primary-light-200 rounded-md py-2 px-5 flex gap-4'>
              <button
                onClick={() => setCount(count - 1)}
                disabled={count === 0}
                className='w-5 h-5 rounded-full disabled:border-grey disabled:text-grey border-primary-dark border-2 text-primary-dark flex items-center justify-center'
              >
                <FontAwesomeIcon icon={faMinus} size='xs' />
              </button>
              <p>{count}</p>
              <button
                onClick={() => setCount(count + 1)}
                className='w-5 h-5 rounded-full border-primary-dark border-2 text-primary-dark flex items-center justify-center'
              >
                <FontAwesomeIcon icon={faPlus} size='xs' />
              </button>
            </div>
          </div>
          <p>
            Stok <span className='font-semibold'>123</span>
          </p>
        </div>
        <div className='flex justify-end'>
          <p className='text-grey line-through'>Rp1.650.000</p>
        </div>
        <div className='flex items-center justify-between'>
          <p className='text-grey'>Subtotal</p>
          <h5 className='font-semibold'>Rp1.250.000</h5>
        </div>
        <Button
          label='Keranjang'
          startIcon={faCirclePlus}
          color='primary'
          fullWidth
          className='py-3 my-1'
        />
        <Button label='Beli Sekarang' color='secondary' fullWidth className='py-3' />
      </div>
  </div>
  
  );
};

export default MerchandiseDetail;
