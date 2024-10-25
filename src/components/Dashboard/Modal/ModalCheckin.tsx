import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tab,
  Tabs,
  TabItemProps,
} from '@nextui-org/react';
import QrScanner from '@/components/QrScanner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { Key, useState } from 'react';
import InputField from '@/components/Input';
import { faCross, faXmark } from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/Button';
import { Post } from '@/utils/REST';
import React from 'react';

interface TransactionProofProps {
  transaction_id: number;
  bank_id: number;
  bank_name: string;
  bank_account: string;
  bank_account_name: string;
  file_transfer: string;
}

interface ModalProps {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
}

interface SuccessCheckinData {
  invoice_no: string;
  total_qty: string;
  event_name: string;
  name: string | null;
  category_ticket: string;
}

export default function ModalCheckin({ isOpen, setIsOpen }: ModalProps) {
  const [selected, setSelected] = useState<any>('qr');
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SuccessCheckinData | null>(null);
  const [invoiceNo, setInvoiceNo] = useState<string>('');


  const handleManualSubmit = () => {
    Post('transaction-scan-ticket', { invoice_no: invoiceNo })
      .then((res: any) => {
        console.log(res);
        setStep(1);
        setData(res.data);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      })
      .catch((err: any) => {
        console.log(err);
        setStep(2);
      });
  };
  return (
    <div className='flex flex-col gap-2'>
      <Modal
        isOpen={isOpen}
        placement='auto'
        onOpenChange={setIsOpen}
        className='text-dark'
        classNames={{ body: 'px-0' }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1 border-b border-b-primary-light-200'>
                Check In Event
              </ModalHeader>
              <ModalBody>
                {step === 0 && (
                  <Tabs
                    variant='underlined'
                    aria-label='Options'
                    selectedKey={selected}
                    onSelectionChange={setSelected}
                  >
                    <Tab key='qr' title='Scan Barcode'>
                      <QrScanner
                        isOpen={isOpen && selected === 'qr' && step === 0}
                        step={step}
                        setStep={setStep}
                        setData={setData}
                      />
                    </Tab>
                    <Tab key="manual" title="Input Manual">
                      <div className="px-5">
                        <input
                          type="text"
                          className="border-3 border-primary-light-200 rounded-full w-full py-2 px-4 text-sm"
                          placeholder="Input kode tiket"
                          value={invoiceNo}
                          onChange={(e) => setInvoiceNo(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end px-5 mt-4">
                        <Button
                          label="Submit"
                          onClick={() => handleManualSubmit()}
                          color="primary"
                        />
                      </div>
                    </Tab>
                  </Tabs>
                )}
                {step === 1 && data && (
                  <div className='flex flex-col gap-3 py-4 px-6'>
                    <div>
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        size='3x'
                        className='text-[#06c258] mb-3'
                      />
                      <h6 className=''>Check In Berhasil</h6>
                      <p className='text-grey'>Tiket berhasil divalidasi</p>
                    </div>
                    <div className='flex flex-col gap-1'>
                      <p className='text-grey text-xs'>Nama Pembeli</p>
                      <p>{data.name}</p>
                    </div>
                    <div className='flex flex-col gap-1'>
                      <p className='text-grey text-xs'>Kode Tiket</p>
                      <p>{data.invoice_no}</p>
                    </div>
                    <div className='flex flex-col gap-1'>
                      <p className='text-grey text-xs'>Jenis Tiket</p>
                      <p>{data.category_ticket}</p>
                    </div>
                    <div className='flex flex-col gap-1'>
                      <p className='text-grey text-xs'>Total Tiket</p>
                      <p>{data.total_qty} Tiket</p>
                    </div>
                    {/* <div className='flex flex-col gap-1'>
                      <p className='text-grey text-xs'>Waktu Check In</p>
                      <p>02/03/2020</p>
                    </div> */}
                  </div>
                )}
                {step === 2 && (
                  <div className='flex flex-col gap-3 py-4 px-6'>
                    <div className='flex flex-col rounded-full border-3 border-danger w-10 h-10 items-center justify-center'>
                      <FontAwesomeIcon icon={faXmark} size='xl' className='text-danger' />
                    </div>
                    <h6>Check In Gagal</h6>
                    <p className='text-grey'>Tiket gagal divalidasi silahkan coba kembali</p>
                  </div>
                )}
              </ModalBody>
              {step > 0 && (
                <ModalFooter className='border-t border-t-primary-light-200'>
                  <div className='flex items-center w-full gap-2'>
                    <Button
                      color='primary'
                      label='Check In Lainnya'
                      fullWidth
                      onClick={() => setStep(0)}
                    />
                    <Button
                      color='secondary'
                      label='Kembali'
                      fullWidth
                      onClick={() => setIsOpen(false)}
                    />
                  </div>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
