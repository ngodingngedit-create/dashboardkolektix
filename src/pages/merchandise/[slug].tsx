import { useContext, useEffect, useMemo, useState } from 'react';
import Foto from '../../assets/images/amis-banner.png';
import CreatorTitle from '@/components/Creator/CreatorTitle';
import Image, { StaticImageData } from 'next/image';
import { faCirclePlus, faMinus, faPlus, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { MerchListResponse } from '../dashboard/merch/type';
import { Get, Post } from '@/utils/REST';
import { useListState } from '@mantine/hooks';
import { NumberFormatter, Button } from '@mantine/core';
import { Icon } from '@iconify/react/dist/iconify.js';
import _ from 'lodash';
import useLoggedUser from '@/utils/useLoggedUser';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { AppMainContext } from '../_app';

export type CartStorage = {
    variant_id: number,
    product_id: number,
    qty: number,
    price: number,
}

const MerchandiseDetail = () => {
    const [isr, setIsr] = useState(false);
    const [mainData, setMainData] = useState<MerchListResponse>();
    const [colorOpt, setColorOpt] = useState<string>('');
    const [count, setCount] = useState<number>(0);
    const [imageActive, setImage] = useState<number>(0);
    const [loading, setLoading] = useListState<string>();
    const [selectedVariant, setSelectedVariant] = useState<number>();
    const user = useLoggedUser();
    const router = useRouter();
    const { slug } = router.query;

    const { cartCount, setCartCount } = useContext(AppMainContext);

    useEffect(() => {
        setIsr(true);
    }, []);

    useEffect(() => {
        getData();
    }, [isr]);

    useEffect(() => {
        const stock = _.find(mainData?.product_varian, ['id', selectedVariant])?.stock_qty;
        setCount((stock ?? 0) > 1 ? 1 : 0);
    }, [selectedVariant]);

    const getData = () => {
        Get(`product/${slug}`, {})
            .then((res: any) => {
                setMainData(res.data);
                if ((res.data?.product_varian?.length) ?? 0 > 0) {
                    setSelectedVariant(res.data?.product_varian[0].id);
                    setCount(res.data?.product_varian[0].stock_qty > 1 ? 1 : 0);
                } else {
                    setCount(res.data?.qty > 1 ? 1 : 0);
                }
                if (res.data)
                setLoading.filter((e) => e != 'getdata');
            })
            .catch((err) => {
                console.log(err);
                setLoading.filter((e) => e != 'getdata');
            });
    };

    const handleAddCart = () => {
        setLoading.append('addcart');
        // if (user?.id) {
        //     Post('cart', {
        //         user_id: user?.id,
        //         variant_id: selectedVariant,
        //         product_id: mainData?.id,
        //         qty: count,
        //         price: parseInt(selectedVariant ? _.find((mainData?.product_varian ?? []), ['id', selectedVariant])?.price ?? '0' : (mainData?.price ?? '0')),
        //         description: ''
        //     })
        //     .then((res: any) => {
        //         if (res.id) {
        //             toast.success('Berhasil menambah produk ke keranjang');
        //             setTimeout(() => {
        //                 router.push('/merch-cart');
        //             }, 2000)
        //         }
        //         setLoading.filter(e => e != 'addcart');
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //         setLoading.filter(e => e != 'addcart');
        //     });
        // } else {
            const cartData = JSON.parse(Cookies.get('_cart') ?? '[]') as CartStorage[];
            const has = cartData.find(e => e.product_id == mainData?.id && (e.variant_id ? e.variant_id == selectedVariant : true));
            const selectedQty = (mainData?.product_varian.length ?? 0) > 0 
                ? mainData?.product_varian.find(e => e.id == selectedVariant)?.stock_qty 
                : mainData?.qty;

            const added = has ? _.min([has?.qty + count, selectedQty]) ?? 0 : 0;

            // Update the cartData and set the appropriate quantities
            if (has) {
                cartData.forEach((e, index) => {
                    if (e.product_id == mainData?.id && (e.variant_id ? e.variant_id == selectedVariant : true)) {
                        cartData[index] = { ...e, qty: added };
                    }
                });
            } else {
                cartData.push({
                    variant_id: selectedVariant ?? 0,
                    product_id: mainData?.id ?? 0,
                    qty: added,
                    price: parseInt(selectedVariant ? _.find((mainData?.product_varian ?? []), ['id', selectedVariant])?.price ?? '0' : (mainData?.price ?? '0')),
                });
            }

            // Calculate the new cart count
            const newCartCount = cartData.reduce((total, item) => total + item.qty, 0);

            // Update state and cookies
            setCartCount && setCartCount(newCartCount);
            Cookies.set('_cart', JSON.stringify(cartData));

            toast.success('Berhasil menambah produk ke keranjang');
            setLoading.filter(e => e != 'addcart');

        // }
    };

    const handleDirectOrder = () => {
        Cookies.set('order_data', JSON.stringify([
            {
                product_id: mainData?.id,
                variant_id: selectedVariant,
                qty: count
            }
        ]))
        router.push('/merch-order');
    };

    if (!mainData) return <></>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 text-dark min-h-screen pt-20 mx-auto gap-8 px-3 md:px-4 sm:px-8 lg:px-0 max-w-5xl mb-4 mt-4">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 auto-rows-min">
                <div className="col-span-2 md:col-span-4">
                    {mainData.product_image[imageActive] && (
                        <Image src={mainData.product_image[imageActive].image_url ?? ''} width={500} height={500} alt="merch" className="w-full h-72 object-cover rounded-md" />
                    )}
                </div>
                {mainData.product_image.map((e, i) => (
                    <div key={i} className="flex items-center justify-center">
                        <Image src={e.image_url} width={500} height={500} alt="merch" className={`w-full h-20 object-cover rounded-md cursor-pointer ${i === imageActive ? 'border-2 border-primary-dark' : 'border-2 border-primary-light-200'}`} onClick={() => setImage(i)} />
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-2 divide-y divide-primary-light-200">
                <h3 className="text-lg md:text-xl">{mainData.product_name}</h3>
                <div className="flex gap-2 items-center !border-y-0">
                    <p className="text-grey text-xs md:text-sm">Terjual 30+</p>
                    <p>&bull;</p>
                    <p className="text-xs md:text-sm">
                        <FontAwesomeIcon icon={faStar} className="text-warning-400" />
                        <span className="ml-1">4.8</span>
                    </p>
                </div>
                <div className="!border-t-0">
                    <h3 className="text-xl">
                        <NumberFormatter value={parseInt(selectedVariant ? _.find(mainData.product_varian, ['id', selectedVariant])?.price ?? '0' : mainData.price)} />
                    </h3>
                    {/* <p className='text-grey text-xs line-through'>Rp1.650.000</p> */}
                </div>
                <div className="flex flex-row justify-between items-center pt-3 pb-2">
                    <CreatorTitle image={Foto} creator={mainData.created_by} location="Jakarta" />
                    {/* <Button color='secondary' label='Lihat Toko' /> */}
                </div>

                {mainData?.product_varian?.length > 0 && (
                  <div className="pt-3 pb-1">
                      <p className="font-semibold">
                          Pilih {mainData.product_varian.map(e => e?.product_varian_category?.varian_name)[0]}: <span className="text-grey font-normal">{_.find(mainData.product_varian, ['id', selectedVariant])?.varian_name}</span>
                      </p>
                      <div className="flex flex-wrap gap-2 my-2">
                          {mainData.product_varian.map((e, i) => (
                              <div className={`flex items-center justify-center border text-sm ${e.id == selectedVariant ? 'border-primary-dark text-primary-dark' : 'border-primary-light-200 text-grey'} px-3 py-1 rounded-md cursor-pointer`} onClick={() => setSelectedVariant(e.id)} key={i}>
                                  {e.varian_name}
                              </div>
                          ))}
                      </div>
                  </div>
                )}


                <div className="py-3">
                    <p className={`mb-[5px]`}>
                        Deskripsi Produk <br />
                    </p>
                    <div dangerouslySetInnerHTML={{ __html: mainData.description }} />
                </div>
            </div>
            <div className="border border-primary-light-200 rounded-lg p-3 h-fit flex flex-col gap-2 shadow-sm">
                <h5 className="text-lg md:text-xl">Jumlah</h5>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center">
                        <div className="border border-primary-light-200 rounded-md py-2 px-5 flex gap-4">
                            <button onClick={() => setCount(count - 1)} disabled={count === 0} className="w-5 h-5 rounded-full disabled:border-grey disabled:text-grey border-primary-dark border-2 text-primary-dark flex items-center justify-center">
                                <FontAwesomeIcon icon={faMinus} size="xs" />
                            </button>
                            <p>{count}</p>
                            <button onClick={() => (count < ((selectedVariant ? _.find(mainData.product_varian, ['id', selectedVariant])?.stock_qty : mainData.qty) ?? 0)) && setCount(count + 1)} disabled={count == mainData.qty} className="w-5 h-5 rounded-full border-primary-dark border-2 text-primary-dark flex items-center justify-center">
                                <FontAwesomeIcon icon={faPlus} size="xs" />
                            </button>
                        </div>
                    </div>
                    <p>
                        Stok <span className="font-semibold">{selectedVariant ? _.find(mainData.product_varian, ['id', selectedVariant])?.stock_qty : mainData.qty}</span>
                    </p>
                </div>
                {/* <div className="flex justify-end">
                    <p className="text-grey line-through">Rp1.650.000</p>
                </div> */}
                <div className="flex items-center justify-between">
                    <p className="text-grey">Subtotal</p>
                    <h5 className="font-semibold"><NumberFormatter value={parseInt(selectedVariant ? _.find(mainData.product_varian, ['id', selectedVariant])?.price ?? '0' : mainData.price) * count} /></h5>
                </div>
                    <Button
                        onClick={handleAddCart}
                        disabled={count <= 0}
                        loading={loading.includes('addcart')}
                        mt={5}
                        size="md"
                        radius="xl"
                        color="#0B387C"
                        leftSection={<Icon icon="uiw:plus" />}
                    >
                        Tambah Keranjang
                    </Button>
                    <Button
                        onClick={handleDirectOrder}
                        disabled={count <= 0}
                        mt={5}
                        size="md"
                        radius="xl"
                        color="#0B387C"
                        variant="outline"
                    >
                        Beli Sekarang
                    </Button>
            </div>
        </div>
    );
};

export default MerchandiseDetail;
