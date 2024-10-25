import React from 'react';
import Button from '@/components/Button';
import InputEditor from '@/components/Input/InputEditor';
import InputField from '@/components/Input';
import { RadioGroup, Radio } from '@nextui-org/react';

const CreateVacancy = () => {
  return (
    <>
      <div className='max-w-3xl mx-auto pt-5 text-dark min-h-screen pb-20'>
        <div className='flex flex-col gap-4 px-4 sm:px-8 md:px-12 lg:px-0'>
          <h2>Buat Lowongan</h2>
          <p className='text-grey'>Lengkapi form dibawah ini untuk membuat Lowongan</p>
          <div>
            <div className='max-w-3xl mx-auto pt-10 text-dark'>
              <div className='border-2 border-primary-light-200 rounded-xl flex flex-col gap-3'>
                <div className='flex items-center gap-3 border-b-2 border-b-primary-light-200 p-4'>
                  <div className='flex flex-col gap-3'>
                    <p className='font-semibold'>Informasi Lowongan</p>
                  </div>
                </div>
                <div className='px-4 pb-5 flex flex-col gap-3'>
                  <div className='grid grid-cols-4 items-center gap-y-4 gap-x-3'>
                    <p>
                      Nama Profesi/Posisi <span className='text-danger'>*</span>
                    </p>
                    <div className='col-span-3'>
                      <InputField type='text' placeholder='Nama Profesi' required fullWidth />
                    </div>
                    <p>
                      Rentang Gaji <span className='text-danger'>*</span>
                    </p>

                    <RadioGroup
                      className='col-span-3'
                      size='md'
                      color='primary'
                      // value={form.ticket_type}
                      // onChange={(e: any) => setForm({ ...form, ticket_type: e.target.value })}
                    >
                      <div className='grid grid-cols-2 gap-x-3'>
                        <Radio
                          classNames={{
                            base: 'data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-3xl px-4 gap-2 border shadow-sm border-primary-light-200 max-w-full rounded-3xl ml-0.5 mr-3 my-1',
                          }}
                          value='Berbayar'
                          size='sm'
                        >
                          Full Time
                        </Radio>
                        <Radio
                          classNames={{
                            base: 'data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-3xl px-4 gap-2 border shadow-sm border-primary-light-200 max-w-full rounded-3xl ml-0.5 mr-3 my-1',
                          }}
                          value='Gratis'
                          size='sm'
                        >
                          Kontrak
                        </Radio>
                      </div>
                    </RadioGroup>
                    <p>
                      Rentang Gaji <span className='text-danger'>*</span>
                    </p>
                    <div className='col-span-3 grid grid-cols-2 gap-x-3'>
                      <InputField type='text' placeholder='Nama Profesi' required fullWidth />
                      <InputField type='text' placeholder='Nama Profesi' required fullWidth />
                    </div>
                    <p>
                      Pembayaran <span className='text-danger'>*</span>
                    </p>
                    <RadioGroup
                      className='col-span-3'
                      size='md'
                      color='primary'
                      // value={form.ticket_type}
                      // onChange={(e: any) => setForm({ ...form, ticket_type: e.target.value })}
                    >
                      <div className='grid grid-cols-3 gap-x-3'>
                        <Radio
                          classNames={{
                            base: 'data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-3xl px-4 gap-2 border shadow-sm border-primary-light-200 max-w-full rounded-3xl ml-0.5 mr-3 my-1',
                          }}
                          value='Berbayar'
                          size='sm'
                        >
                          Bulanan
                        </Radio>
                        <Radio
                          classNames={{
                            base: 'data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-3xl px-4 gap-2 border shadow-sm border-primary-light-200 max-w-full rounded-3xl ml-0.5 mr-3 my-1',
                          }}
                          value='Gratis'
                          size='sm'
                        >
                          Mingguan
                        </Radio>
                        <Radio
                          classNames={{
                            base: 'data-[selected=true]:bg-primary-light-200 data-[selected=true]:border data-[selected=true]:border-primary-dark data-[selected=true]:shadow-md data-[selected=true]:rounded-3xl px-4 gap-2 border shadow-sm border-primary-light-200 max-w-full rounded-3xl ml-0.5 mr-3 my-1',
                          }}
                          value='Gratis'
                          size='sm'
                        >
                          Harian
                        </Radio>
                      </div>
                    </RadioGroup>

                    <p>
                      Tanggal Mulai <span className='text-danger'>*</span>
                    </p>
                    <div className='col-span-3'>
                      <InputField type='date' required fullWidth />
                    </div>
                    <p>
                      Tanggal Berakhir <span className='text-danger'>*</span>
                    </p>
                    <div className='col-span-3'>
                      <InputField type='date' required fullWidth />
                    </div>
                    <p>
                      Lokasi <span className='text-danger'>*</span>
                    </p>
                    <div className='col-span-3'>
                      <InputField type='text' placeholder='Nama Profesi' required fullWidth />
                    </div>
                    <p>
                      Skill <span className='text-danger'>*</span>
                    </p>
                    <div className='col-span-3'>
                      <InputField type='text' placeholder='Nama Profesi' required fullWidth />
                    </div>
                  </div>
                </div>
              </div>
              <div className='border-2 border-primary-light-200 rounded-2xl my-5'>
                <div className='border-b-2 border-primary-light-200 px-4 py-3 '>
                  <h3 className='text-medium font-semibold'>Deskripsi</h3>
                </div>
                <div className='p-5 '>
                  <InputEditor
                    theme='snow'
                    // onChange={(value: any) => setForm({ ...form, description: value })}
                    // value={form?.description}
                    placeholder='Ketik Deskripsi'
                    modules={{
                      toolbar: [
                        [{ header: '1' }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'bullet' }],
                      ],
                      clipboard: {
                        matchVisual: false,
                      },
                    }}
                    className='editor'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='border-t-2 w-full border-t-primary-light-200 fixed bottom-0 flex justify-end gap-3 p-5 bg-white'>
        <Button label='Simpan Draf' color='secondary' />
        <Button label='Simpan Perubahan' color='primary' />
      </div>
    </>
  );
};

export default CreateVacancy;
