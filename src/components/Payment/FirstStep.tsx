import { useEffect, useState } from 'react';
import useWindowSize from '@/utils/useWindowSize';
import { EventProps } from '@/utils/globalInterface';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Field, Label, Input } from '@headlessui/react';
import { faChevronCircleDown, faChevronCircleUp, faChevronDown, faChevronUp, faTicket } from '@fortawesome/free-solid-svg-icons';
import InputField from '../Input';
import { formatDate } from '@/utils/useFormattedDate';
import { Switch } from '@nextui-org/react';
import useLoggedUser from '@/utils/useLoggedUser';
import Countdown, { CountdownRendererFn } from 'react-countdown';
import React from 'react';
import { Stack } from '@mantine/core';

interface FormTicket {
    event_id: number;
    event_ticket_id: number;
    name: string;
    price: number;
    subtotal_price: number;
    qty_ticket: number;
    payment_status: string;
}

interface ErrorForm {
    nik: boolean;
    nama: boolean;
    email: boolean;
    countryCode: boolean;
    phone: boolean;
}

interface Form {
    nik: string;
    full_name: string;
    email: string;
    countryCode: string;
    no_telp: string;
    is_pemesan: number;
    identity_type_id: number;
    event_ticket_id: number;
}

interface StepPaymentProps {
    detail: EventProps;
    ticket: FormTicket[];
    totalCount: number;
    onSubmit: () => void;
    form: Form[];
    setForm: (form: any) => void;
    error: ErrorForm;
    totalSubtotalPrice: number;
    setFormValid: (valid: boolean) => void;
}

const FirstStep = ({ detail, ticket, totalCount, onSubmit, form, setForm, error, totalSubtotalPrice, setFormValid }: StepPaymentProps) => {
    const { width } = useWindowSize();
    const userData = useLoggedUser();
    const [collapse, setCollapse] = useState<boolean[]>(form.map((_, index) => index === 0));

    const formValidation = (data: Form) => {
        return (detail.is_noidentity == 1 ? Boolean(data.nik) : true) &&
        (detail.is_name == 1 ? Boolean(data.full_name) : true) &&
        (detail.is_email == 1 ? Boolean(data.email) : true) &&
        (detail.is_phone_number == 1 ? Boolean(data.no_telp) : true);
    };

    const handleInput = (index: number, field: keyof Form, value: string) => {
        let newForm = [...form];
        newForm[index] = { ...newForm[index], [field]: value };
        setForm(newForm);

        const isFormValid = newForm.every(formValidation);

        setFormValid(isFormValid);
    };

    const toggleCollapse = (index: number) => {
        setCollapse((prev) => {
            let newCollapse = [...prev];
            newCollapse[index] = !newCollapse[index];
            return newCollapse;
        });
    };

    const copyOrderer = (targetIndex: number) => {
        if (form.length > 0 && targetIndex > 0 && targetIndex < form.length) {
            let newForm = [...form];
            newForm[targetIndex] = { ...newForm[0] };
            setForm(newForm);
            const isFormValid = newForm.every(formValidation);

            setFormValid(isFormValid);
        }
    };

    const clearForm = (targetIndex: number) => {
        if (form.length > 0 && targetIndex >= 0 && targetIndex < form.length) {
            let newForm = [...form];
            newForm[targetIndex] = {
                nik: '',
                full_name: '',
                email: '',
                countryCode: '',
                no_telp: '',
                is_pemesan: 0,
                identity_type_id: 1,
                event_ticket_id: 1
            };
            setForm(newForm);
            const isFormValid = newForm.every(formValidation);

            setFormValid(isFormValid);
        }
    };

    const renderer: CountdownRendererFn = ({ minutes, seconds, completed }) => {
        if (completed) {
            return <p>Time Out</p>;
        } else {
            return (
                <p className="font-semibold">
                    {String(minutes).padStart(2, '0')} : {String(seconds).padStart(2, '0')}
                </p>
            );
        }
    };

    useEffect(() => {
        if (userData) {
            userData.name && handleInput(0, 'full_name', userData.name);
            userData.email && handleInput(0, 'email', userData.email);
        }
    }, [userData]);

    return (
        width &&
        (width < 768 ? (
            <div className="bg-primary-light px-4 sm:px-8 md:px-12 lg:px-0 mb-72">
                <div className="border-b p-3 border-primary-light flex items-center gap-3">
                    <div className="px-2 py-1 border rounded-md border-primary-light">{detail && detail.image_url && <Image src={detail?.image_url} width={1000} height={1000} alt="banner" className="w-10 h-10 object-cover rounded-md" />}</div>
                    <div>
                        <p className="text-sm mb-1">{detail?.name}</p>
                        <p className="text-xs text-grey">{totalCount} Tiket</p>
                    </div>
                </div>
                <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm">
                    <div className="border-b border-b-primary-light-200 p-3">
                        <p className="font-semibold">Ringkasan Pesanan</p>
                    </div>
                    {ticket.map((item: FormTicket) => (
                        <div className="border-b p-3 border-primary-light-200 flex gap-3" key={item.event_ticket_id}>
                            <div className="px-3 flex items-center border rounded-md border-primary-light">
                                <FontAwesomeIcon icon={faTicket} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-sm mb-1 font-semibold">{item.name}</p>
                                <p className=" text-grey text-xs">
                                    {item.qty_ticket} Tiket x {item.price}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div className="py-3 px-4 flex justify-between items-center">
                        <p>{`Jumlah (${totalCount} Tiket)`}</p>
                        <p className="font-semibold">Rp{totalSubtotalPrice.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="py-3 px-4 flex justify-between items-center">
                        <p>Biaya Admin</p>
                        <p className="font-semibold">Rp{(detail.admin_fee ?? 0).toLocaleString('id-ID')}</p>
                    </div>
                    {detail.ppn ? (
                        <div className="py-3 px-4 flex justify-between items-center">
                            <p>Tax</p>
                            <p className="font-semibold">Rp{detail.ppn.toLocaleString('id-ID')}</p>
                        </div>
                    ) : null}
                    <div className="py-3 px-4 flex justify-between items-center">
                        <p>Total Pembayaran</p>
                        <p className="font-semibold">Rp{(totalSubtotalPrice + (detail.admin_fee + (detail.ppn || 0))).toLocaleString('id-ID')}</p>
                    </div>
                </div>
                {form.map((item, index) => {
                    let ticketForOwner = null;
                    let currentIndex = 0;

                    // Loop untuk mencari tiket yang sesuai dengan index pemilik tiket
                    for (const ticketItem of ticket) {
                        for (let i = 0; i < ticketItem.qty_ticket; i++) {
                            if (currentIndex === index - 1) {
                                // Pemilik ditemukan, simpan tiket untuk pemilik ini
                                ticketForOwner = ticketItem;
                                break;
                            }
                            currentIndex++;
                        }
                        if (ticketForOwner) break;
                    }

                    return (
                        <div className="bg-white mt-4 last:mb-16" key={index}>
                            <div className="border-b py-3 px-5 border-primary-light flex items-center justify-between cursor-pointer" onClick={() => toggleCollapse(index)}>
                                {index > 0 && <FontAwesomeIcon icon={faTicket} className='text-primary shrink-0 mr-[10px]' />}
                                <Stack gap={0} className={`flex-grow`}>
                                  <p className="font-semibold">{index > 0 ? `${index}. Pemilik Tiket ${ticketForOwner?.name}` : 'Data Pemesan'}</p>
                                  {index > 0 && <p className="text-xs text-grey">1 Tiket x {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(ticketForOwner?.price ?? 0)}</p>}
                                </Stack>
                                <button className="text-grey">
                                    <FontAwesomeIcon icon={faChevronUp} className={`${collapse[index] ? 'rotate-0' : 'rotate-180'} transition-transform`} />
                                </button>
                            </div>
                            {index > 0 && (
                                <div className="flex items-center justify-end gap-[8px] px-4 py-2 rounded-lg text-grey">
                                    <p className="text-xs md:text-sm text-end">Gunakan Data Pemesan</p>
                                    <Switch size="sm" onChange={(e: any) => (e.target.checked ? copyOrderer(index) : clearForm(index))} />
                                </div>
                            )}
                            <div className={`border-b p-3 border-primary-light ${collapse[index] ? 'max-h-[50rem]' : 'max-h-0'} transition-max-height delay-100 duration-150 ease-in-out`}>
                                <div className={`${collapse[index] ? 'opacity-100' : 'opacity-0'} transition-transform-opacity duration-300 delay-300 ease-in-out`}>
                                    <div className={`${collapse[index] ? 'visible delay-300 duration-300' : 'invisible'} transition-transform `}>
                                        {detail.is_noidentity ? (
                                            <Field className="mb-2">
                                                <Label className="text-sm font-base text-grey">Nomor Induk KTP</Label>
                                                <Input
                                                    type="text"
                                                    className={`${error.nik ? 'border-danger' : 'border-primary-light'} [&::-webkit-inner-spin-button]:appearance-none mt-2 block w-full rounded-lg border t bg-white/5 py-1.5 px-3 text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200`}
                                                    placeholder="1234 567 890"
                                                    value={item.nik}
                                                    onChange={(e) => {
                                                        const numericValue = e.target.value.replace(/\D/g, '').slice(0, 17);
                                                        handleInput(index, 'nik', numericValue);
                                                    }}
                                                    maxLength={17}
                                                />
                                                {error.nik && item.nik.length < 16 && <p className="text-[10px] mt-1 text-danger">Minimal NIK adalah 16 Digit</p>}
                                                {error.nik && item.nik.length > 17 && <p className="text-[10px] mt-1 text-danger">Maksimal NIK adalah 17 Digit</p>}
                                            </Field>
                                        ) : null}
                                        {detail.is_name ? (
                                            <Field className="mb-2">
                                                <Label className="text-sm font-base text-grey">Nama Lengkap</Label>
                                                <Input className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200" placeholder="Nama Lengkap" value={item.full_name} onChange={(e) => handleInput(index, 'full_name', e.target.value)} />
                                            </Field>
                                        ) : null}
                                        {detail.is_email ? (
                                            <Field className="mb-2">
                                                <Label className="text-sm font-base text-grey">Email</Label>
                                                <Input
                                                    type="email"
                                                    className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                                                    placeholder="Contoh: example@example.com"
                                                    value={item.email}
                                                    onChange={(e) => handleInput(index, 'email', e.target.value)}
                                                />
                                            </Field>
                                        ) : null}
                                        {detail.is_phone_number ? (
                                            <Field className="mb-2">
                                                <Label className="text-sm font-base text-grey">No Telepon</Label>
                                                <div className="flex gap-2 items-center">
                                                    <form className="max-w-sm block mt-2">
                                                        <select id="countries" className="bg-gray-50 border border-primary-light text-dark text-sm rounded-lg focus:ring-primary-base focus:border-primary-light block w-full py-1.5" defaultValue="+62" value={item.countryCode} onChange={(e) => handleInput(index, 'countryCode', e.target.value)}>
                                                            <option value="+62">+62</option>
                                                            <option value="+1">+1</option>
                                                            <option value="+2">+2</option>
                                                            <option value="+3">+3</option>
                                                            <option value="+4">+4</option>
                                                        </select>
                                                    </form>
                                                    <Input className="mt-2 w-4/5 block rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200" placeholder="Contoh: 81233334444" value={item.no_telp} onChange={(e) => handleInput(index, 'no_telp', e.target.value)} />
                                                </div>
                                            </Field>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* <div className='flex justify-center'>
          <button
            className='w-[95%] bg-primary-dark text-white py-2 rounded-lg my-3 disabled:bg-primary-light-200 disabled:text-grey disabled:cursor-not-allowed'
            onClick={onSubmit}
            // disabled={!isFormValid}
          >
            Lanjut
          </button>
        </div> */}
            </div>
        ) : (
            <div className="bg-primary-light min-h-screen pb-28">
                <div className="max-w-5xl mx-auto grid grid-cols-5 mt-8 gap-x-7 pt-20 ">
                    <h2 className="col-span-5 mb-4">Personal Informasi</h2>
                    <div className="col-span-3 flex flex-col gap-3">
                        {form.map((item, index) => {
                            // Tentukan tiket untuk pemilik berdasarkan index
                            let ticketForOwner = null;
                            let currentIndex = 0;

                            // Loop untuk mencari tiket yang sesuai dengan index pemilik tiket
                            for (const ticketItem of ticket) {
                                for (let i = 0; i < ticketItem.qty_ticket; i++) {
                                    if (currentIndex === index - 1) {
                                        // Pemilik ditemukan, simpan tiket untuk pemilik ini
                                        ticketForOwner = ticketItem;
                                        break;
                                    }
                                    currentIndex++;
                                }
                                if (ticketForOwner) break;
                            }

                            return (
                                <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm" key={index}>
                                    <div className="border-b border-b-primary-light-200 cursor-pointer px-5 py-3 flex items-center justify-between" onClick={() => toggleCollapse(index)}>
                                      {index > 0 && <FontAwesomeIcon icon={faTicket} className='text-primary shrink-0 mr-[10px]' />}
                                      <Stack gap={0} className={`flex-grow`}>
                                        <p className="font-semibold">{index > 0 ? `${index}. Pemilik Tiket ${ticketForOwner?.name}` : 'Data Pemesan'}</p>
                                        {index > 0 && <p className="text-xs text-grey">1 Tiket x {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(ticketForOwner?.price ?? 0)}</p>}
                                      </Stack>
                                      <button className="text-grey">
                                          <FontAwesomeIcon icon={faChevronUp} className={`${collapse[index] ? 'rotate-0' : 'rotate-180'} transition-transform`} />
                                      </button>
                                    </div>
                                    {index > 0 && (
                                        <div className="flex items-center justify-end gap-[8px] px-4 py-2 rounded-lg text-grey">
                                            <p className="text-xs md:text-sm text-end">Gunakan Data Pemesan</p>
                                            <Switch size="sm" onChange={(e: any) => (e.target.checked ? copyOrderer(index) : clearForm(index))} />
                                        </div>
                                    )}
                                    <div className={`px-5 pt-3 pb-5 ${collapse[index] ? '' : 'max-h-0'} transition-max-height delay-100 duration-150 ease-in-out`}>
                                        <div className={`${collapse[index] ? 'opacity-100' : 'opacity-0'} transition-transform-opacity duration-300 delay-300 ease-in-out`}>
                                            <div className={`${collapse[index] ? 'visible' : 'invisible'} flex flex-col gap-3`}>
                                                {detail.is_noidentity ? (
                                                    <>
                                                        <InputField fullWidth type="number" label="No Induk KTP" placeholder="Contoh: 123456789012345" value={item.nik} onChange={(e) => handleInput(index, 'nik', e.target.value)} />
                                                        {error.nik && <p className="text-[10px] mt-1 text-danger">Minimal NIK adalah 16 Digit</p>}
                                                    </>
                                                ) : null}
                                                {detail.is_name ? (
                                                    <>
                                                        <InputField fullWidth type="text" label="Nama Lengkap" placeholder="Nama Lengkap" value={item.full_name} onChange={(e) => handleInput(index, 'full_name', e.target.value)} />
                                                    </>
                                                ) : null}
                                                {detail.is_email ? (
                                                    <>
                                                        <InputField fullWidth type="text" label="Email" placeholder="Contoh: example@example.com" value={item.email} onChange={(e) => handleInput(index, 'email', e.target.value)} />
                                                    </>
                                                ) : null}
                                                {detail.is_phone_number ? (
                                                    <>
                                                        <InputField fullWidth type="number" label="No Telepon" placeholder="Contoh: 81233334444" onChange={(e) => handleInput(index, 'no_telp', e.target.value)} value={item.no_telp} />
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="col-span-2 flex flex-col gap-3">
                        <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm">
                            {/* <div className='border-b border-b-primary-light-200 p-3'>
                <p className='font-semibold'>Event</p>
              </div> */}
                            <div className="flex items-center gap-3 p-3">
                                {detail && detail.image_url && <Image src={detail?.image_url} width={1000} height={1000} alt="banner" className="w-10 h-10 object-cover rounded-md" />}
                                <div>
                                    <p className="text-sm mb-1">{detail?.name}</p>
                                    <p className="text-xs text-grey">
                                        {formatDate(detail.start_date) == formatDate(detail.end_date) ? formatDate(detail.start_date) : `${formatDate(detail.start_date)} - ${formatDate(detail.end_date)}`}
                                        {/* &bull;{' '}
                    {`${detail.start_time} - ${detail.end_time}`} */}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm">
                            <div className="border-b border-b-primary-light-200 p-3">
                                <p className="font-semibold">Ringkasan Pesanan</p>
                            </div>
                            {ticket.map((item: FormTicket) => (
                                <div className="border-b p-3 border-primary-light-200 flex gap-3" key={item.event_ticket_id}>
                                    <div className="px-3 flex items-center border rounded-md border-primary-light">
                                        <FontAwesomeIcon icon={faTicket} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm mb-1 font-semibold">{item.name}</p>
                                        <p className="text-xs text-grey">
                                            {item.qty_ticket} Tiket x {item.price}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div className="py-3 px-4 flex justify-between items-center">
                                <p>{`Jumlah (${totalCount} Tiket)`}</p>
                                <p className="font-semibold">Rp{totalSubtotalPrice.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="py-3 px-4 flex justify-between items-center">
                                <p>Biaya Admin</p>
                                <p className="font-semibold">Rp{(detail.admin_fee * totalCount).toLocaleString('id-ID')}</p>
                            </div>
                            {detail.ppn ? (
                                <div className="py-3 px-4 flex justify-between items-center">
                                    <p>Tax</p>
                                    <p className="font-semibold">Rp{detail.ppn.toLocaleString('id-ID')}</p>
                                </div>
                            ) : null}
                            <div className="py-3 px-4 flex justify-between items-center">
                                <p>Total Pembayaran</p>
                                <p className="font-semibold">Rp{(totalSubtotalPrice + detail.admin_fee * totalCount + (detail.ppn || 0)).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))
    );
};

export default FirstStep;
