import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import useLoggedUser from '@/utils/useLoggedUser';
import { UserProps } from '@/utils/globalInterface';
import imagePlus from '../../assets/icon/image-plus.png';
import { faCalendar, faClock } from '@fortawesome/free-regular-svg-icons';
import { TagsInput } from '@mantine/core';
import { Tabs, Tab, Checkbox, Switch, Select, SelectItem, Spinner } from '@nextui-org/react';
import {
  faLocationDot,
  faExclamation,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
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
import { Get, Post } from '@/utils/REST';
import { formatDate, formatYear } from '@/utils/useFormattedDate';
import { toast } from 'react-toastify';
import Button from '@/components/Button';
import React from 'react';

const option = [
  { key: 1, label: '1 Tiket' },
  { key: 2, label: '2 Tiket' },
  { key: 3, label: '3 Tiket' },
  { key: 4, label: '4 Tiket' },
  { key: 5, label: '5 Tiket' },
  { key: 6, label: '6 Tiket' },
  { key: 7, label: '7 Tiket' },
  { key: 8, label: '8 Tiket' },
  { key: 9, label: '9 Tiket' },
  { key: 10, label: '10 Tiket' },
];

interface ErrorResponse {
  name?: string[];
  tag?: string[];
  start_date?: string[];
  end_date?: string[];
  start_time?: string[];
  end_time?: string[];
  zone_time?: string[];
  organization_method?: string[];
  location_name?: string[];
  location_city?: string[];
  location_address?: string[];
  location_map?: string[];
  description?: string[];
  term_condition?: string[];
}

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
    is_name: true,
    is_phone_number: true,
    is_birthdate: false,
    is_email: true,
    is_noidentity: true,
    is_gender: false,
    max_buy_ticket: 1,
    one_email_ticket: false,
    one_id_one_ticket: false,
    description: '',
    term_condition: '',
    save_as_draft: false,
    tickets: ticket,
  });
  const defaultForm = {
    ticket_type: '',
    ticket_category_id: 1,
    ticket_category: '',
    name: '',
    ticket_date: null,
    ticket_end: null,
    qty: 0,
    price: 0,
    description: '',
  };
  const [error, setError] = useState<ErrorResponse>({});
  const [image, setImage] = useState<string | null>(null);
  const [editTicket, setEditTicket] = useState<EventTicket>(defaultForm);
  const [idxTicket, setIdxTicket] = useState<number | null>(null);
  const [showDate, setShowDate] = useState<boolean>(false);
  const [showTime, setShowTime] = useState<boolean>(false);
  const [showTicket, setShowTicket] = useState<boolean>(false);
  const [showLocation, setShowLocation] = useState<boolean>(false);
  const [addTicket, showAddTicket] = useState<boolean>(false);
  const [tagSuggestion, setTagSuggestion] = useState<string[]>();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<string>('info');
  // const [userData, setUserData] = useState<UserProps | null>(null);
  const loggedUser = useLoggedUser();

  useEffect(() => {
    getTagSuggestion();
  }, []);

  useEffect(() => {
    if (loggedUser) {
      setForm({ ...form, creator_id: loggedUser.has_creator.id });
    }
    //eslint-disable-next-line
  }, [loggedUser]);

  useEffect(() => {
    setForm({ ...form, tickets: ticket });
    //eslint-disable-next-line
  }, [ticket]);

  const getTagSuggestion = async () => {
    if (!tagSuggestion) {
      try {
        Get('event-topic', {})
        .then((res: any) => {
          setTagSuggestion(res.map((e: any) => e.name));
        })
        .catch((err) => {
          toast.error('FAILED GET TAG SUGGESTION');
        })
      } catch (error) {
        console.log('FAILED GET TAG SUGGESTION');
      }
    }
  };

  const submitEvent = () => {
    setLoading(true); // Set loading ke true
    Post('event', form)
      .then((res) => {
        console.log(res);4
        toast.success('Event Berhasil Dibuat');
        router.push('/create-event/success');
      })
      .catch((err) => {
        const error = err.response.data.errors
        toast.error(err.response.data.message);
        setError(error);

        const keys = Object.keys(error);
        const hasDescription = keys.includes('description');
        const hasTermCondition = keys.includes('term_condition');

        if ((hasDescription || hasTermCondition) && keys.length <= 2) {
            setTab('detail');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const saveDraft = () => {
    Post('event', { ...form, save_as_draft: true })
      .then((res: any) => {
        console.log(res);
        toast.success('Event disimpan sebagai draft');
        router.push('/dashboard/my-event');
      })
      .catch((err: any) => {
        console.log(err);
        toast.error(err.response.data.message);
      });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validasi tipe file
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Silakan unggah file gambar dengan format JPG, PNG, atau GIF.');
        return;
      }
  
      // Validasi ukuran file
      // const maxSizeInMB = 2;
      // if (file.size / 1024 / 1024 > maxSizeInMB) {
      //   alert('Ukuran file harus lebih kecil dari 2MB.');
      //   return;
      // }
  
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
    setIdxTicket(null);
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
  return (
    <>
      <div className='text-dark min-h-screen max-w-7xl mx-auto py-20 border-primary-light-200 px-4 sm:px-8 md:px-12 lg:px-[20px]'>
        <div className='grid grid-cols-1 md:grid-cols-2'>
          <div className='md:col-span-2 self-center mb-8 text-center md:text-start'>
            <h1 className=''>Buat Event</h1>
            <p className='text-grey'>Lengkapi form dibawah ini untuk membuat event</p>
          </div>
          <div className='md:pr-10'>
            <label className='w-full border-2 border-primary-light-200 rounded-lg border-dashed bg-chat flex flex-col items-center justify-center h-72 gap-4 cursor-pointer'>
            <input type='file' className='hidden' onChange={handleFile}  accept='image/jpeg, image/png, image/gif' />
{image ? (
  <Image
    src={image}
    alt='image'
    className='object-cover'
    width={0}
    height={0}
    style={{ width: '100%', height: '100%' }}
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
                fullWidth
                onChange={(e: any) => setForm({ ...form, name: e.target.value })}
              />
              {error && error?.name && (
                <p className='text-danger text-xs mt-1'>{error && error?.name[0]}</p>
              )}
            </div>
            <div className='mb-8 mt-2 text-sm'>
              <TagsInput
                multiple
                className={`[&_*]:!border-[#E2EDFF]`}
                radius={8}
                placeholder='Tag; Contoh: hiburan, musik, budaya, kuliner, pendidikan'
                data={tagSuggestion}
                value={!form.tag ? [] : form.tag.split('||')}
                onChange={(e) => setForm({ ...form, tag: e.join('||') })}
                error={(error && error?.tag) && error?.tag[0]}
              />
            </div>
            <div className='w-full rounded-lg'>
              <div
                className='w-full border-primary-light-200 text-grey text-sm py-2 px-2 flex items-center cursor-pointer'
                onClick={() => setShowDate(!showDate)}
              >
                <FontAwesomeIcon icon={faCalendar} size='lg' className='w-5 mr-2' />
                {form.start_date && form.end_date ? (
                  <p className='text-dark'>
                    {formatDate(form.start_date)} - {formatDate(form.end_date)}
                  </p>
                ) : (
                  <p>Atur Tanggal Event</p>
                )}
                <div>
                  {error && error?.start_date && !form.start_date && (
                    <p className='text-danger text-xs ml-2'>*{error && error?.start_date[0]}</p>
                  )}
                  {error && error?.end_date && !form.end_date && (
                    <p className='text-danger text-xs ml-2'>*{error && error?.end_date[0]}</p>
                  )}
                </div>
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
                <div>
                  {error && error?.start_time && !form.start_time && (
                    <p className='text-danger text-xs ml-2'>*{error && error?.start_time[0]}</p>
                  )}
                  {error && error?.end_time && !form.end_time && (
                    <p className='text-danger text-xs ml-2'>*{error && error?.end_time[0]}</p>
                  )}
                  {error && error?.zone_time && !form.zone_time && (
                    <p className='text-danger text-xs ml-2'>*{error && error?.zone_time[0]}</p>
                  )}
                </div>
              </div>
              <div
                className='w-full border-primary-light-200 text-grey text-sm py-2 px-2 mb-3 flex items-center cursor-pointer'
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
                <div>
                  {error && error?.location_address && !form.location_address && (
                    <p className='text-danger text-xs ml-2'>
                      *{error && error?.location_address[0]}
                    </p>
                  )}
                  {error && error?.location_city && !form.location_city && (
                    <p className='text-danger text-xs ml-2'>*{error && error?.location_city[0]}</p>
                  )}
                  {error && error?.location_map && !form.location_map && (
                    <p className='text-danger text-xs ml-2'>*{error && error?.location_map[0]}</p>
                  )}
                  {error && error?.location_name && !form.location_name && (
                    <p className='text-danger text-xs ml-2'>*{error && error?.location_name[0]}</p>
                  )}
                  {error && error?.organization_method && !form.organization_method && (
                    <p className='text-danger text-xs ml-2'>
                      *Metode penyelenggaraan event harus diisi
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='md:px-10'>
            <Tabs
              selectedKey={tab}
              onSelectionChange={e => setTab(e as string)}
              variant='solid'
              aria-label='Tabs variants'
              className='border border-b-2 border-primary-light-200 border-x-0 border-t-0'
              fullWidth
              classNames={{
                tabList: 'pb-0 self-center font-semibold rounded-b-none bg-white',
                tab: 'p-5',
                cursor: 'rounded-b-none border-b-2 border-b-primary-base',
              }}
            >
              <Tab key='info' title='Info Tiket'>
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
                            ticketDate={el.ticket_date}
                            ticketEnd={el.ticket_end}
                            description={el.description}
                            name={el.name}
                            onEdit={() => onEditTicket(el, index)}
                            onDelete={() => deleteTicket(index)}
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
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
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
                          className='w-32 md:w-40 lg:w-24' // Responsive width for the select input
                          aria-label='Options'
                          size='sm'
                          defaultSelectedKeys={
                            form.max_buy_ticket ? [form.max_buy_ticket.toString()] : []
                          }
                          onChange={(e: any) =>
                            setForm({ ...form, max_buy_ticket: e.target.value })
                          }
                          selectedKeys={form.max_buy_ticket ? [form.max_buy_ticket.toString()] : []}
                          classNames={{
                            listbox: 'text-dark max-h-40 overflow-auto', // Restricts height and adds scroll for long lists
                            popoverContent: 'w-full sm:w-48 md:w-56 lg:w-64', // Responsive width for the dropdown
                          }}
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
              <Tab
                 key='detail'
                 title={
                   error && (error?.description || error?.term_condition) ? (
                     <div className='flex items-center space-x-2'>
                       <FontAwesomeIcon icon={faExclamationCircle} className='text-danger' />
                       <span>Detail Event</span>
                     </div>
                   ) : (
                     'Detail Event'
                   )
                 }
              >
                <div className='border-2 border-primary-light-200 rounded-2xl my-5'>
                  <div className='border-b-2 border-primary-light-200 px-4 py-3 flex justify-between items-center'>
                    <h3 className='text-medium font-semibold'>Deskripsi</h3>
                    {error?.description && <p className='text-danger mt-1'>{error?.description}</p>}
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
                  <div className='border-b-2 border-primary-light-200 px-4 py-3 flex items-center justify-between'>
                    <h3 className='text-medium font-semibold'>Syarat & Ketentuan</h3>
                    {error?.term_condition && (
                      <p className='text-danger mt-1'>{error?.term_condition}</p>
                    )}
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
      <div className='border border-t-primary-light-200 fixed bottom-0 w-full bg-white shadow-md'>
        <div className='flex justify-between max-w-6xl px-8 py-4 text-dark items-center z-50'>
          <p>Hai Creator! Selangkah lagi event kamu berhasil dibuat.</p>
          <div className='flex gap-2'>
            <Button onClick={saveDraft} color='secondary' label='Draf' />
            <Button 
              className={`whitespace-nowrap`}
              onClick={submitEvent} 
              color='primary' 
              disabled={loading} // Nonaktifkan tombol saat loading
              label={loading ? 'Loading...' : 'Simpan'} // Ubah label berdasarkan status loading
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
        endDate={form.end_date}
        setIsOpen={showAddTicket}
        ticket={ticket}
        setTicket={setTicket}
        data={editTicket}
        setIdx={setIdxTicket}
        idx={idxTicket}
      />
    </>
  );
};

export default CreateEvent;
