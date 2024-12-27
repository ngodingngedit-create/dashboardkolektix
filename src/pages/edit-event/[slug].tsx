import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import useLoggedUser from '@/utils/useLoggedUser';
import { UserProps } from '@/utils/globalInterface';
import imagePlus from '../../assets/icon/image-plus.png';
import { faCalendar, faClock } from '@fortawesome/free-regular-svg-icons';
import { Tabs, Tab, Checkbox, Switch, Select, SelectItem, Spinner } from '@nextui-org/react';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InputField from '@/components/Input';
import InputEditor from '@/components/Input/InputEditor';
import TicketContainer from '@/components/TicketContainer';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import ModalDate from '@/components/EventCreator/Modal/ModalDate';
import ModalTime from '@/components/EventCreator/Modal/ModalTime';
import ModalTicket from '@/components/EventCreator/Modal/ModalTicket';
import { FormEvent, EventTicket } from '@/utils/formInterface';
import ModalLocation from '@/components/EventCreator/Modal/ModalLocation';
import ModalCreateTicket from '@/components/EventCreator/Modal/ModalCreateTicket';
import { Put, Get } from '@/utils/REST';
import { toast } from 'react-toastify';
import Images from '@/components/Images';
import Button from '@/components/Button';
import React from 'react';

const option = [
  { key: 'true', label: 'Tidak Terbatas' },
  { key: 'false', label: '1 Tiket' },
];

const CreateEvent = () => {
  const router = useRouter();
  const [ticket, setTicket] = useState<EventTicket[]>([]);
  const [form, setForm] = useState<FormEvent>({
    creator_id: 0,
    name: '',
    image: '',
    event_format_id: 0,
    event_topic_id: 0,
    tag: '',
    event_type_id: 0,
    start_date: null,
    end_date: null,
    start_time: '',
    end_time: '',
    zone_time: '',
    organization_method: '',
    location_name: '',
    location_city: '',
    location_address: '',
    location_map: '',
    longitude: '',
    latitude: '',
    is_name: false,
    is_phone_number: false,
    is_birthdate: false,
    is_email: false,
    is_noidentity: false,
    is_gender: false,
    max_buy_ticket: 1,
    one_email_ticket: false,
    one_id_one_ticket: false,
    description: '',
    term_condition: '',
    save_as_draft: false,
    tickets: ticket,
  });
  const defaultForm: EventTicket = {
    ticket_type: '',
    ticket_category_id: 1,
    ticket_category: 'Festival',
    name: '',
    ticket_date: null,
    ticket_end: null,
    qty: 0,
    price: 0,
    description: '',
  };
  const [image, setImage] = useState<string | null>(null);
  const [editTicket, setEditTicket] = useState<EventTicket>(defaultForm);
  const [eventId, setEventId] = useState<number | null>(null);
  const [idxTicket, setIdxTicket] = useState<number>();
  const [showDate, setShowDate] = useState<boolean>(false);
  const [showTime, setShowTime] = useState<boolean>(false);
  const [showTicket, setShowTicket] = useState<boolean>(false);
  const [showLocation, setShowLocation] = useState<boolean>(false);
  const [addTicket, showAddTicket] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const loggedUser = useLoggedUser();
  const { slug } = router.query;

  const getData = () => {
    setIsLoading(true);
    Get(`event/${slug}`, {})
      .then((res: any) => {
        const { image_thumbnail, image, ...rest } = res.data;
        setForm({ ...rest });
        setTicket(res.data.has_event_ticket);
        setEventId(res.data.id);
        setImage(res.data.image_base64 as string);
        setIsLoading(false);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (slug) {
      getData();
    }
    //eslint-disable-next-line
  }, [slug]);

  useEffect(() => {
    if (loggedUser) {
      setForm({ ...form, creator_id: loggedUser.has_creator?.id ?? 0 });
      console.log(form);
      console.log(loggedUser);
    }
    //eslint-disable-next-line
  }, [loggedUser]);

  useEffect(() => {
    setForm({ ...form, tickets: ticket });
    //eslint-disable-next-line
  }, [ticket]);

  const findCheapestPrice = (tickets: EventTicket[]) => {
    if (tickets.length === 0) return null;

    let cheapestPrice = tickets[0].price;

    for (const ticket of tickets) {
      if (ticket.price < cheapestPrice) {
        cheapestPrice = ticket.price;
      }
    }

    return cheapestPrice;
  };

  const submitEvent = () => {
    setIsLoading(true);
    if (eventId) {
      Put(`event/${eventId}`, { ...form, starting_price: findCheapestPrice(form.tickets) })
        .then((res: any) => {
          console.log(res);
          router.push('/dashboard/my-event').then(() => {
            setIsLoading(false);
          });
          toast.success('Event Berhasil Diupdate');
        })
        .catch((err: any) => {
          console.log(err);
          toast.error(err.response.data.message);
          setIsLoading(false);
        });
    } else {
      toast.error('Event Tidak Ditemukan');
      setIsLoading(false);
    }
  };

  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setForm({ ...form, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const onEditTicket = (data: EventTicket, idx: number) => {
    setIdxTicket(idx);
    setEditTicket(data);
    // console.log(data);
    showAddTicket(true);
  };

  const onAddTicket = () => {
    setEditTicket({
      ...defaultForm,
    });
    // console.log(editTicket);
    setIdxTicket(undefined);
    showAddTicket(true);
  };

  const deleteTicket = (idx: number) => {
    let arr = [...ticket];
    arr.splice(idx, 1);
    setTicket(arr);
  };
  useEffect(() => {
    console.log(form);
  }, [form]);
  return !isLoading ? (
    <>
      <div className='text-dark min-h-screen max-w-7xl mx-auto py-20 md:px-10 border-primary-light-200'>
        <div className='grid grid-cols-1 md:grid-cols-2'>
          <div className='md:col-span-2 self-center mb-8 text-center md:text-start'>
            <h1 className=''>Edit Event</h1>
            <p className='text-grey'>Lengkapi form dibawah ini untuk mengupdate event</p>
          </div>
          <div className='md:pr-10'>
            <label className='w-full border-2 border-primary-light-200 rounded-lg border-dashed bg-primary-light flex flex-col items-center justify-center h-72 gap-4 cursor-pointer'>
              <input type='file' className='hidden' onChange={handleFile} />
              {image ? (
                <Image
                  src={image}
                  alt='image'
                  className='object-cover w-full h-full'
                  width={0}
                  height={0}
                />
              ) : (
                <>
                  <Image src={imagePlus} alt='image-plus' />
                  <h3 className='font-semibold text-medium text-center'>
                    Unggah gambar/poster/banner
                  </h3>
                  <p className='text-grey text-center text-sm px-8'>
                    Direkomendasikan ukuran 724 x 340px dan tidak lebih dari 2mb
                  </p>
                </>
              )}
            </label>
            <div className='mt-8 text-sm'>
              <InputField
                type='text'
                placeholder='Nama Event'
                value={form.name}
                fullWidth
                onChange={(e: any) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className='mb-8 mt-2 text-sm'>
              <InputField
                type='text'
                placeholder='Tag; Contoh: hiburan, musik, budaya, kuliner, pendidikan'
                value={form.tag}
                fullWidth
                onChange={(e: any) => setForm({ ...form, tag: e.target.value })}
              />
            </div>
            <div className='w-full border-2 border-primary-light-200 rounded-lg'>
              <div
                className='w-full border-primary-light-200 text-grey text-sm py-2 px-2 flex items-center cursor-pointer'
                onClick={() => setShowDate(!showDate)}
              >
                <FontAwesomeIcon icon={faCalendar} size='lg' className='w-5 mr-2' />
                {form.start_date && form.end_date ? (
                  <p className='text-dark'>
                    {form.start_date} - {form.end_date}
                  </p>
                ) : (
                  <p>Atur Tanggal Event</p>
                )}
              </div>
              <div
                className='w-full border-y-2 border-primary-light-200 text-grey text-sm py-2 px-2 flex items-center cursor-pointer'
                onClick={() => setShowTime(!showTime)}
              >
                <FontAwesomeIcon icon={faClock} size='lg' className='w-5 mr-2' />
                {form.start_time && form.end_time ? (
                  <p className='text-dark'>
                    {form.start_time} - {form.end_time} {form.zone_time}
                  </p>
                ) : (
                  <p>Atur Waktu Event</p>
                )}
              </div>
              <div
                className='w-full border-primary-light-200 text-grey text-sm py-2 px-2 flex items-center cursor-pointer'
                onClick={() => setShowLocation(!showLocation)}
              >
                <FontAwesomeIcon icon={faLocationDot} size='lg' className='w-5 mr-2' />
                {form.organization_method !== '' ? (
                  form.organization_method === 'Offline' ? (
                    <p className='text-dark'>{`${form.location_name}, ${form.location_address}, ${form.location_city}`}</p>
                  ) : (
                    <p className='text-dark'>{form.location_map}</p>
                  )
                ) : (
                  <p>Atur Alamat Event</p>
                )}
              </div>
            </div>
          </div>
          <div className='md:px-10'>
            <Tabs
              variant='solid'
              aria-label='Tabs variants'
              className='border border-b-2 border-primary-light-200 border-x-0 border-t-0'
              fullWidth
              classNames={{
                tabList: 'pb-0 self-center font-semibold rounded-b-none bg-white',
                tab: 'p-5',
                cursor: 'rounded-b-none border-b-2 border-b-primary-base bg-grey-200',
              }}
            >
              <Tab key='active' title='Info Tiket'>
                <div className='border-2 border-primary-light-200 rounded-2xl my-5 mx-auto'>
                  <div className='border-b-2 border-primary-light-200 px-4 py-3 flex justify-between items-center'>
                    <h3 className='text-medium font-semibold'>Tiket</h3>
                    <div
                      className='flex items-center gap-2 text-sm text-primary-dark cursor-pointer'
                      onClick={onAddTicket}
                    >
                      <button className='border-1.5 border-primary-dark rounded-full p-0.5 flex items-center justify-center'>
                        <FontAwesomeIcon icon={faPlus} className='' size='sm' />
                      </button>
                      <p>Tambah Tiket</p>
                    </div>
                  </div>
                  <div className='p-5'>
                    {ticket.length > 0 &&
                      ticket.map((el, index) => (
                        <div key={index}>
                          <TicketContainer
                            type={el.ticket_type}
                            category={el.ticket_category}
                            price={el.price}
                            description={el.description}
                            name={el.name}
                            onEdit={() => onEditTicket(el, index)}
                            onDelete={() => deleteTicket(index)}
                            ticketDate={el.ticket_date}
                            ticketEnd={el.ticket_end}
                          />
                        </div>
                      ))}
                  </div>
                </div>
                <div className='border-2 border-primary-light-200 rounded-2xl my-5 mx-auto'>
                  <div className='border-b-2 border-primary-light-200 px-4 py-3 flex justify-between items-center'>
                    <h3 className='text-medium font-semibold'>Formulir Data Pemesan</h3>
                  </div>
                  <div className='p-5'>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                      <Checkbox
                        color='default'
                        isSelected={form.is_name}
                        classNames={{ label: 'text-sm' }}
                        onChange={(e: any) => setForm({ ...form, is_name: e.target.checked })}
                      >
                        Nama Lengkap
                      </Checkbox>
                      <Checkbox
                        classNames={{ label: 'text-sm' }}
                        color='default'
                        isSelected={form.is_email}
                        onChange={(e: any) => setForm({ ...form, is_email: e.target.checked })}
                      >
                        Email
                      </Checkbox>
                      <Checkbox
                        classNames={{ label: 'text-sm' }}
                        color='default'
                        isSelected={form.is_phone_number}
                        onChange={(e: any) =>
                          setForm({ ...form, is_phone_number: e.target.checked })
                        }
                      >
                        No. Handphone
                      </Checkbox>
                      <Checkbox
                        classNames={{ label: 'text-sm' }}
                        color='default'
                        isSelected={form.is_noidentity}
                        onChange={(e: any) => setForm({ ...form, is_noidentity: e.target.checked })}
                      >
                        No. KTP
                      </Checkbox>
                      <Checkbox
                        classNames={{ label: 'text-sm' }}
                        color='default'
                        isSelected={form.is_birthdate}
                        onChange={(e: any) => setForm({ ...form, is_birthdate: e.target.checked })}
                      >
                        Tanggal Lahir
                      </Checkbox>
                      <Checkbox
                        classNames={{ label: 'text-sm' }}
                        color='default'
                        isSelected={form.is_gender}
                        onChange={(e: any) => setForm({ ...form, is_gender: e.target.checked })}
                      >
                        Jenis Kelamin
                      </Checkbox>
                    </div>
                  </div>
                </div>
                <div className='border-2 border-primary-light-200 rounded-2xl my-5 mx-auto'>
                  <div className='border-b-2 border-primary-light-200 px-4 py-3 flex justify-between items-center'>
                    <h3 className='text-medium font-semibold'>Pengaturan Tiket</h3>
                  </div>
                  <div className='p-5'>
                    <div className='flex flex-col gap-2'>
                      <div className='flex justify-between'>
                        <div>
                          <p>Jumlah maks. tiket dalam 1 transaksi</p>
                          <p className='text-grey text-xs'>
                            Jumlah maksimal tiket yang dapat dibeli dalam 1 transaksi
                          </p>
                        </div>
                        <Select
                          variant='underlined'
                          className='w-24'
                          aria-label='Options'
                          size='sm'
                          defaultSelectedKeys={[form.max_buy_ticket.toString()]}
                          onChange={(e: any) =>
                            setForm({ ...form, max_buy_ticket: e.target.value })
                          }
                          selectedKeys={form.max_buy_ticket ? [form.max_buy_ticket.toString()] : []}
                          classNames={{ listbox: 'text-dark', popoverContent: 'w-40' }}
                        >
                          {option.map((item) => (
                            <SelectItem key={item.key}>{item.label}</SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div className='flex justify-between'>
                        <div>
                          <p>1 akun email untuk 1 kali transaksi</p>
                          <p className='text-grey text-xs'>
                            1 akun email hanya dapat melakukan 1 kali transaksi pembelian tiket
                          </p>
                        </div>
                        <div>
                          <Switch
                            size='sm'
                            isSelected={form.one_email_ticket}
                            onChange={(e: any) =>
                              setForm({ ...form, one_email_ticket: e.target.checked })
                            }
                          />
                        </div>
                      </div>
                      <div className='flex justify-between'>
                        <div>
                          <p>1 tiket untuk 1 data pemesan</p>
                          <p className='text-grey text-xs'>Data setiap tiket tidak boleh sama</p>
                        </div>
                        <div>
                          <Switch
                            size='sm'
                            isSelected={form.one_id_one_ticket}
                            onChange={(e: any) =>
                              setForm({ ...form, one_id_one_ticket: e.target.checked })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab>
              <Tab key='history' title='Detail Event'>
                <div className='border-2 border-primary-light-200 rounded-2xl my-5'>
                  <div className='border-b-2 border-primary-light-200 px-4 py-3 '>
                    <h3 className='text-medium font-semibold'>Deskripsi</h3>
                  </div>
                  <div className='p-5'>
                    <InputEditor
                      theme='snow'
                      onChange={(value: any) => setForm({ ...form, description: value })}
                      value={form?.description}
                      placeholder='Ketik Deskripsi'
                      modules={{
                        toolbar: [
                          [{ header: '1' }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ list: 'bullet' }],
                        ],
                        clipboard: {
                          // toggle to add extra line breaks when pasting HTML:
                          matchVisual: false,
                        },
                      }}
                      className='editor'
                    />
                  </div>
                </div>

                <div className='border-2 border-primary-light-200 rounded-2xl my-5'>
                  <div className='border-b-2 border-primary-light-200 px-4 py-3 '>
                    <h3 className='text-medium font-semibold'>Syarat & Ketentuan</h3>
                  </div>
                  <div className='p-5'>
                    <InputEditor
                      theme='snow'
                      onChange={(value: any) => setForm({ ...form, term_condition: value })}
                      value={form?.term_condition}
                      placeholder='Ketik Syarat & Ketentuan'
                      modules={{
                        toolbar: [
                          [{ header: '1' }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ list: 'bullet' }],
                        ],
                        clipboard: {
                          // toggle to add extra line breaks when pasting HTML:
                          matchVisual: false,
                        },
                      }}
                      className='editor'
                    />
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
      <div className='border border-t-primary-light-200'>
        <div className='flex justify-between max-w-7xl px-8 py-2'>
          <div></div>
          <div className='flex'>
            <Button
              color='primary'
              label='Update Event'
              onClick={submitEvent}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      <ModalDate isOpen={showDate} setIsOpen={setShowDate} form={form} setForm={setForm} />
      <ModalTime isOpen={showTime} setIsOpen={setShowTime} form={form} setForm={setForm} />
      <ModalTicket isOpen={showTicket} setIsOpen={setShowTicket} form={form} setForm={setForm} />
      <ModalLocation
        isOpen={showLocation}
        setIsOpen={setShowLocation}
        form={form}
        setForm={setForm}
      />
      <ModalCreateTicket
        isOpen={addTicket}
        setIsOpen={showAddTicket}
        ticket={ticket}
        setTicket={setTicket}
        data={editTicket}
        setIdx={setIdxTicket}
        idx={idxTicket}
        endDate={form.end_date}
      />
    </>
  ) : (
    <Spinner color='primary' size='lg' className='min-h-screen flex items-center justify-center' />
  );
};

export default CreateEvent;
