// import {
//   Modal,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   RadioGroup,
//   Radio,
// } from '@nextui-org/react';
// import { FormEvent } from '@/utils/formInterface';
// import { useState } from 'react';
// import React from 'react';

// interface ModalProps {
//   isOpen: boolean;
//   setIsOpen(isOpen: boolean): void;
//   form: FormEvent;
//   setForm(form: FormEvent): void;
// }

// export default function ModalTime({ isOpen, setIsOpen, form, setForm }: ModalProps) {
//   const [startTime, setStartTime] = useState<string>(form.start_time);
//   const [endTime, setEndTime] = useState<string>(form.end_time);
//   const [zoneTime, setZoneTime] = useState<string>(form.zone_time || 'WIB'); // Default to WIB if no zone_time

//   const onSubmit = () => {
//     setForm({ ...form, start_time: startTime, end_time: endTime, zone_time: zoneTime });
//     setIsOpen(false);
//   };

//   return (
//     <div className='flex flex-col gap-2'>
//       <Modal isOpen={isOpen} placement='auto' onOpenChange={setIsOpen} className='text-dark'>
//         <ModalContent>
//           {(onClose) => (
//             <>
//               <ModalHeader className='flex flex-col gap-1'>Tanggal</ModalHeader>
//               <ModalBody>
//                 <div className='grid grid-cols-2 w-full gap-3'>
//                   <div>
//                     <label className='block mb-1 text-sm'>Jam Mulai</label>
//                     <input
//                       type='time'
//                       value={form.start_time}
//                       onChange={(e) => setStartTime(e.target.value)}
//                       className='w-full p-2 border border-primary-light-200 rounded-md'
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className='block mb-1 text-sm'>Jam Berakhir</label>
//                     <input
//                       type='time'
//                       value={form.end_time}
//                       onChange={(e) => setEndTime(e.target.value)}
//                       className='w-full p-2 border border-primary-light-200 rounded-md'
//                       required
//                     />
//                   </div>
//                 </div>
//                 <RadioGroup
//                   label={
//                     <p className='text-sm'>
//                       Zona Waktu <span className='text-danger'>*</span>
//                     </p>
//                   }
//                   defaultValue={form.zone_time} // Ensure WIB is selected by default
//                   size='md'
//                   onChange={(e) => setZoneTime(e.target.value)}
//                 >
//                   <Radio value='WIB'>Waktu Indonesia Barat</Radio>
//                   <Radio value='WITA'>Waktu Indonesia Tengah</Radio>
//                   <Radio value='WIT'>Waktu Indonesia Timur</Radio>
//                 </RadioGroup>
//               </ModalBody>
//               <ModalFooter>
//                 <button
//                   className='w-full text-white bg-primary-dark rounded-md py-2 disabled:bg-primary-disabled disabled:text-white disabled:cursor-not-allowed'
//                   disabled={startTime === '' || endTime === '' || zoneTime === ''}
//                   onClick={() => {
//                     onSubmit();
//                   }}
//                 >
//                   Simpan
//                 </button>
//               </ModalFooter>
//             </>
//           )}
//         </ModalContent>
//       </Modal>
//     </div>
//   );
// }

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, RadioGroup, Radio } from "@nextui-org/react";
import { FormEvent } from "@/utils/formInterface";
import { useState, useEffect } from "react";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
  form: FormEvent;
  setForm(form: FormEvent): void;
}

export default function ModalTime({ isOpen, setIsOpen, form, setForm }: ModalProps) {
  // local controlled state for smooth typing
  const [startTime, setStartTime] = useState<string>(form.start_time ?? "");
  const [endTime, setEndTime] = useState<string>(form.end_time ?? "");
  const [zoneTime, setZoneTime] = useState<string>(form.zone_time ?? "WIB"); // default WIB

  // sync when modal opens or form changes (so editing existing event reflects current values)
  useEffect(() => {
    if (isOpen) {
      setStartTime(form.start_time ?? "");
      setEndTime(form.end_time ?? "");
      setZoneTime(form.zone_time ?? "WIB");
    }
  }, [isOpen, form.start_time, form.end_time, form.zone_time]);

  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

  const validTimes = () => {
    if (!startTime || !endTime) return false;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) return false;
    // chronological check (same-day enforcement)
    const today = new Date().toISOString().slice(0, 10);
    const s = new Date(`${today}T${startTime}:00`);
    const e = new Date(`${today}T${endTime}:00`);
    if (s.getTime() >= e.getTime()) return false;
    return true;
  };

  const onSubmit = () => {
    if (!timeRegex.test(startTime)) {
      alert("Format waktu mulai tidak valid. Gunakan format HH:MM (24 jam).");
      return;
    }
    if (!timeRegex.test(endTime)) {
      alert("Format waktu selesai tidak valid. Gunakan format HH:MM (24 jam).");
      return;
    }

    // chronological check
    const today = new Date().toISOString().slice(0, 10);
    const s = new Date(`${today}T${startTime}:00`);
    const e = new Date(`${today}T${endTime}:00`);
    if (s.getTime() >= e.getTime()) {
      alert("Waktu mulai harus sebelum waktu selesai.");
      return;
    }

    setForm({ ...form, start_time: startTime, end_time: endTime, zone_time: zoneTime });
    setIsOpen(false);
  };

  // NOTE:
  // Some NextUI RadioGroup implementations expose `onValueChange` (preferred) instead of `onChange`.
  // Using `value` + `onValueChange` gives a reliable controlled RadioGroup behavior.
  // We also keep onClick on each Radio as an extra fallback to ensure the circle toggles visually.

  return (
    <div className="flex flex-col gap-2">
      <Modal isOpen={isOpen} placement="auto" onOpenChange={setIsOpen} className="text-dark">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Atur Waktu</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 w-full gap-3">
                  <div>
                    <label className="block mb-1 text-sm">Jam Mulai</label>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-2 border border-primary-light-200 rounded-md" aria-label="Jam Mulai" />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm">Jam Berakhir</label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-2 border border-primary-light-200 rounded-md" aria-label="Jam Berakhir" />
                  </div>
                </div>

                <div className="mt-4">
                  <RadioGroup
                    label={
                      <p className="text-sm">
                        Zona Waktu <span className="text-danger">*</span>
                      </p>
                    }
                    value={zoneTime}
                    size="md"
                    // prefer onValueChange for NextUI; handler ensures we accept string or event-like values
                    onValueChange={(val: any) => {
                      const v = typeof val === "string" ? val : val?.value ?? val;
                      setZoneTime(v);
                    }}
                    className="mt-2"
                  >
                    <Radio
                      value="WIB"
                      onClick={() => {
                        // fallback: ensure visual toggle even if RadioGroup has issues in some NextUI versions
                        setZoneTime("WIB");
                      }}
                    >
                      WIB (Waktu Indonesia Barat)
                    </Radio>
                    <Radio
                      value="WITA"
                      onClick={() => {
                        setZoneTime("WITA");
                      }}
                    >
                      WITA (Waktu Indonesia Tengah)
                    </Radio>
                    <Radio
                      value="WIT"
                      onClick={() => {
                        setZoneTime("WIT");
                      }}
                    >
                      WIT (Waktu Indonesia Timur)
                    </Radio>
                  </RadioGroup>
                </div>
              </ModalBody>

              <ModalFooter>
                <div className="flex gap-2 w-full justify-end">
                  <button
                    className="px-4 py-2 rounded-md border"
                    onClick={() => {
                      // reset to initial form values when cancel
                      setStartTime(form.start_time ?? "");
                      setEndTime(form.end_time ?? "");
                      setZoneTime(form.zone_time ?? "WIB");
                      setIsOpen(false);
                    }}
                  >
                    Batal
                  </button>

                  <button className="w-full text-white bg-primary-dark rounded-md py-2 disabled:bg-primary-disabled disabled:text-white disabled:cursor-not-allowed" disabled={!validTimes()} onClick={() => onSubmit()}>
                    Simpan
                  </button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
