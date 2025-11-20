// import { use, useEffect, useState } from "react";
// import useWindowSize from "@/utils/useWindowSize";
// import { EventProps } from "@/utils/globalInterface";
// import Image from "next/image";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { Field, Label, Input } from "@headlessui/react";
// import { faChevronCircleDown, faChevronCircleUp, faChevronDown, faChevronUp, faTicket } from "@fortawesome/free-solid-svg-icons";
// import InputField from "../Input";
// import { formatDate } from "@/utils/useFormattedDate";
// import { Switch } from "@nextui-org/react";
// import useLoggedUser from "@/utils/useLoggedUser";
// import Countdown, { CountdownRendererFn } from "react-countdown";
// import React from "react";
// import { Button, Card, Flex, Group, NumberFormatter, Stack, Text, TextInput } from "@mantine/core";
// import { useTranslation } from "react-i18next";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import fetch from "@/utils/fetch";
// import { useListState } from "@mantine/hooks";
// import moment from "moment";
// import { notifications } from "@mantine/notifications";

// interface FormTicket {
//   event_id: number;
//   event_ticket_id: number;
//   name: string;
//   price: number;
//   subtotal_price: number;
//   qty_ticket: number;
//   payment_status: string;
//   seat_number?: string[];
//   ticket_fee?: number;
// }

// interface ErrorForm {
//   nik: boolean;
//   nama: boolean;
//   email: boolean;
//   countryCode: boolean;
//   phone: boolean;
// }

// interface Form {
//   nik: string;
//   full_name: string;
//   email: string;
//   countryCode: string;
//   no_telp: string;
//   is_pemesan: number;
//   is_profession: string;
//   is_company: string;
//   identity_type_id: number;
//   event_ticket_id: number;
//   seat_number?: string;
//   // NEW FIELDS
//   // We keep them as strings in the form UI (value "1","2","3" for gender),
//   // birthdate as YYYY-MM-DD string, kelas as text — convert to integer if backend needs.
//   is_gender?: string;
//   birthdate?: string;
//   is_kelas?: string;
// }

// interface StepPaymentProps {
//   detail: EventProps;
//   ticket: FormTicket[];
//   totalCount: number;
//   onSubmit: () => void;
//   form: Form[];
//   setForm: (form: any) => void;
//   error: ErrorForm;
//   totalSubtotalPrice: number;
//   setFormValid: (valid: boolean) => void;
//   haveVoucher?: any;
//   onSubmitVoucher?: (data: { id: number; name: string; amount: number; is_multiply: boolean; type: "persentase" | "nominal" }) => void;
//   onCancelVoucher?: (index: number) => void;
// }

// const FirstStep = ({ onSubmitVoucher, onCancelVoucher, detail, haveVoucher, ticket, totalCount, onSubmit, form, setForm, error, totalSubtotalPrice, setFormValid }: StepPaymentProps) => {
//   const { t } = useTranslation();
//   const [loading, setLoading] = useListState<string>([]);
//   const [voucherFields, setVoucherFields] = useState([""]);
//   const totalTicketFee = ticket.reduce((sum, item) => sum + (item.ticket_fee || 0) * item.qty_ticket, 0);
//   const [vouchers, setVouchers] = useState<{ name: string; amount: number }[]>([]);
//   const { width } = useWindowSize();
//   const userData = useLoggedUser();
//   const [collapse, setCollapse] = useState<boolean[]>(form.map((_, index) => index === 0));

//   //console.log('vouchers first step', vouchers);

//   const formValidation = (data: Form) => {
//     return (
//       (detail.is_noidentity == 1 ? Boolean(data.nik) : true) &&
//       (detail.is_name == 1 ? Boolean(data.full_name) : true) &&
//       (detail.is_email == 1 ? Boolean(data.email) : true) &&
//       (detail.is_email == 1 ? data.email.includes("@") && data.email.includes(".") : true) &&
//       (detail.is_phone_number == 1 ? Boolean(data.no_telp) : true)
//     );
//   };

//   const handleInput = (index: number, field: keyof Form, value: string) => {
//     let newForm = [...form];
//     if (field == "no_telp") {
//       var phone = value.replaceAll(/\D/g, "");
//       phone = phone.replace(/^(?!0|6)(\d+)/, "628$1");
//       phone = phone.replace(/^0/, "62");
//       newForm[index] = { ...newForm[index], [field]: phone };
//     } else {
//       newForm[index] = { ...newForm[index], [field]: value };
//     }
//     setForm(newForm);

//     const isFormValid = newForm.every(formValidation);

//     setFormValid(isFormValid);
//   };

//   const toggleCollapse = (index: number) => {
//     setCollapse((prev) => {
//       let newCollapse = [...prev];
//       newCollapse[index] = !newCollapse[index];
//       return newCollapse;
//     });
//   };

//   const copyOrderer = (targetIndex: number) => {
//     if (form.length > 0 && targetIndex > 0 && targetIndex < form.length) {
//       let newForm = [...form];
//       newForm[targetIndex] = { ...newForm[0], is_pemesan: 0 };
//       setForm(newForm);
//       const isFormValid = newForm.every(formValidation);

//       setFormValid(isFormValid);
//     }
//   };

//   const clearForm = (targetIndex: number) => {
//     if (form.length > 0 && targetIndex >= 0 && targetIndex < form.length) {
//       let newForm = [...form];
//       newForm[targetIndex] = {
//         nik: "",
//         full_name: "",
//         email: "",
//         countryCode: "",
//         no_telp: "",
//         is_pemesan: 0,
//         is_profession: "",
//         is_company: "",
//         identity_type_id: 1,
//         event_ticket_id: 1,
//         // reset new fields too
//         is_gender: "",
//         birthdate: "",
//         is_kelas: "",
//       };
//       setForm(newForm);
//       const isFormValid = newForm.every(formValidation);

//       setFormValid(isFormValid);
//     }
//   };

//   const renderer: CountdownRendererFn = ({ minutes, seconds, completed }) => {
//     if (completed) {
//       return <p>Time Out</p>;
//     } else {
//       return (
//         <p className="font-semibold">
//           {String(minutes).padStart(2, "0")} : {String(seconds).padStart(2, "0")}
//         </p>
//       );
//     }
//   };

//   useEffect(() => {
//     if (userData) {
//       userData.name && handleInput(0, "full_name", userData.name);
//       userData.email && handleInput(0, "email", userData.email);
//     }
//   }, [userData]);

//   const handleGetVoucher = async (index: number) => {
//     //console.log('handleGetVoucher');
//     if (!voucherFields[index]) return;

//     const isDuplicate = vouchers.some((v) => v.name === voucherFields[index]);
//     if (isDuplicate) {
//       notifications.show({
//         message: "Voucher sudah digunakan.",
//         color: "red",
//       });
//       return;
//     }

//     await fetch<
//       {
//         event_id: number;
//         date: string;
//         code: string;
//       },
//       {
//         voucher: {
//           discount: number;
//           type: "persentase" | "nominal";
//           date_start: string;
//           date_end: string;
//           max_use: number;
//           min_transaction: number;
//           stock: number;
//           status: 1 | 0;
//         };
//       }
//     >({
//       url: "vouchers/validate",
//       method: "POST",
//       data: {
//         event_id: detail.id,
//         date: moment(new Date()).format("YYYY-MM-DD"),
//         code: voucherFields[index],
//       },
//       before: () => setLoading.append(`getvoucher-${index}`),
//       success: (data) => {
//         const voucher = data?.voucher ?? data?.data?.voucher;
//         //console.log('voucher wk', voucher.is_multiply);
//         if (!voucher) return;
//         const isDateValid = moment(voucher.date_start).isBefore(new Date()) && moment(voucher.date_end).isAfter(new Date());
//         const isStockValid = voucher.stock > 0;
//         const isStatusValid = voucher.status == 1;
//         const isMinTransactionValid = totalSubtotalPrice >= voucher.min_transaction;

//         let discount = 0;

//         if (voucher.is_multiply) {
//           discount = voucher.type == "persentase" ? ((totalSubtotalPrice * voucher.discount) / 100) * totalCount : voucher.discount * totalCount;
//         } else {
//           discount = voucher.type == "persentase" ? (totalSubtotalPrice * voucher.discount) / 100 : voucher.discount;
//         }

//         if (isDateValid && isStockValid && isStatusValid && isMinTransactionValid) {
//           if (onSubmitVoucher) {
//             onSubmitVoucher({
//               id: voucher.id,
//               name: voucherFields[index],
//               amount: discount,
//               is_multiply: voucher.is_multiply,
//               type: voucher.type,
//             });
//           }

//           const newVouchers = [...vouchers];
//           newVouchers[index] = { name: voucherFields[index], amount: discount };
//           setVouchers(newVouchers);
//         } else {
//           notifications.show({
//             message: "Voucher Tidak Ditemukan",
//             color: "red",
//           });
//           const newVoucherFields = [...voucherFields];
//           newVoucherFields[index] = "";
//           setVoucherFields(newVoucherFields);
//         }
//       },
//       complete: () => setLoading.filter((e) => e !== `getvoucher-${index}`),
//       error: () => {
//         notifications.show({
//           message: "Voucher Tidak Ditemukan",
//           color: "red",
//         });
//         const newVoucherFields = [...voucherFields];
//         newVoucherFields[index] = "";
//         setVoucherFields(newVoucherFields);
//       },
//     });
//   };

//   useEffect(() => {
//     if (Array.isArray(haveVoucher) && haveVoucher.length > 0) {
//       setVoucherFields(haveVoucher.map((voucher: { name: string }) => voucher.name || ""));
//       setVouchers((prev) => {
//         const newVouchers = [...prev];
//         haveVoucher.forEach((voucher: { name: string; amount: number }) => {
//           if (!newVouchers.some((v) => v.name === voucher.name)) {
//             newVouchers.push(voucher);
//           }
//         });
//         return newVouchers;
//       });
//     } else {
//       setVoucherFields([""]);
//     }
//   }, [haveVoucher]);

//   const handleAddVoucherField = () => {
//     if (voucherFields.length < (detail.max_use_voucher ?? 0)) {
//       setVoucherFields([...voucherFields, ""]);
//     } else {
//       notifications.show({
//         message: "Maksimal voucher sudah digunakan",
//         color: "red",
//       });
//     }
//   };

//   const handleCancelVoucher = (index: number) => {
//     onCancelVoucher && onCancelVoucher(index);
//     const newVoucherFields = [...voucherFields];
//     const newVouchers = [...vouchers];
//     newVoucherFields[index] = "";
//     newVouchers.splice(index, 1);
//     setVoucherFields(newVoucherFields);
//     setVouchers(newVouchers.filter(Boolean));
//   };

//   return (
//     width &&
//     (width < 768 ? (
//       <div className="bg-primary-light px-4 sm:px-8 md:px-12 lg:px-0" style={{ minHeight: "unset", paddingBottom: 0 }}>
//         <div className="border-b p-3 border-primary-light flex items-center gap-3">
//           <div className="px-2 py-1 border rounded-md border-primary-light">{detail && detail.image_url && <Image src={detail?.image_url} width={1000} height={1000} alt="banner" className="w-10 h-10 object-cover rounded-md" />}</div>
//           <div>
//             <p className="text-sm mb-1">{detail?.name}</p>
//             <p className="text-xs text-grey">{totalCount} Tiket</p>
//           </div>
//         </div>

//         <Card withBorder radius={10} p={20}>
//           <Stack gap={20}>
//             <Flex gap={10} align="center">
//               <Icon icon="mdi:voucher-outline" className={`text-primary-base text-[20px]`} />
//               <Text fw={600}>Voucher</Text>
//             </Flex>

//             {voucherFields.map((field, index) => (
//               <Group key={index}>
//                 <TextInput
//                   w="100%"
//                   value={vouchers[index]?.name || field}
//                   onChange={(e) => {
//                     const newVoucherFields = [...voucherFields];
//                     newVoucherFields[index] = e.currentTarget.value;
//                     setVoucherFields(newVoucherFields);
//                   }}
//                   placeholder={`Masukan Kode Voucher ${index + 1}`}
//                 />
//                 <Button loading={loading.includes(`getvoucher-${index}`)} disabled={field.length < 3} size="xs" onClick={() => handleGetVoucher(index)} className={`shrink-0`}>
//                   Submit
//                 </Button>
//                 {vouchers[index] && (
//                   <>
//                     <Button variant="outline" size="xs" color="red" onClick={() => handleCancelVoucher(index)} className="shrink-0">
//                       Cancel
//                     </Button>
//                     <Icon icon="uiw:circle-check" className="text-green-500 text-[20px] shrink-0" />
//                   </>
//                 )}
//               </Group>
//             ))}
//             <Button variant="outline" size="xs" onClick={handleAddVoucherField} className="mt-2">
//               + Tambah Voucher
//             </Button>
//           </Stack>
//         </Card>

//         <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm">
//           <div className="border-b border-b-primary-light-200 p-3">
//             <p className="font-semibold">Ringkasan Pesanan</p>
//           </div>

//           {ticket.map((item: FormTicket) => (
//             <div className="border-b p-3 border-primary-light-200 flex gap-3" key={item.event_ticket_id}>
//               <div className="px-3 flex items-center border rounded-md border-primary-light">
//                 <FontAwesomeIcon icon={faTicket} className="text-primary" />
//               </div>
//               <div>
//                 <p className="text-sm mb-1 font-semibold">{item.name}</p>
//                 <p className=" text-grey text-xs">
//                   {item.qty_ticket} Tiket x {item.price}
//                 </p>
//               </div>
//             </div>
//           ))}

//           <div className="py-3 px-4 flex justify-between items-center">
//             <p>{`Jumlah (${totalCount} Tiket)`}</p>
//             <p className="font-semibold">{totalSubtotalPrice > 0 ? <NumberFormatter value={totalSubtotalPrice} /> : <Text>Free</Text>}</p>
//           </div>

//           <div className="py-3 px-4 flex justify-between items-center">
//             <p>Biaya Admin </p>
//             <p className="font-semibold">{totalTicketFee > 0 ? <NumberFormatter value={totalTicketFee} /> : <Text>Free</Text>}</p>
//           </div>

//           {(() => {
//             const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
//             const subtotalAfterVoucher = Math.max(totalSubtotalPrice - totalVoucher, 0);
//             return (
//               <div className="py-3 px-4 flex justify-between items-center">
//                 <p>Subtotal</p>
//                 <p className="font-semibold">
//                   <NumberFormatter value={subtotalAfterVoucher} />
//                 </p>
//               </div>
//             );
//           })()}

//           {detail.ppn
//             ? (() => {
//                 const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
//                 const subtotalAfterVoucher = Math.max(totalSubtotalPrice - totalVoucher, 0);
//                 const taxBase = subtotalAfterVoucher + totalTicketFee;
//                 const tax = Math.round(taxBase * (detail.ppn / 100));
//                 return (
//                   <div className="py-3 px-4 flex justify-between items-center">
//                     <p>Tax ({detail.ppn}%)</p>
//                     <p className="font-semibold">{detail.ppn > 0 ? <NumberFormatter value={tax} /> : <Text>Free</Text>}</p>
//                   </div>
//                 );
//               })()
//             : null}

//           {vouchers.length > 0 && (
//             <div className="py-3 px-4 flex justify-between items-center">
//               <p>Total Voucher</p>
//               <p className="font-semibold">
//                 -<NumberFormatter value={vouchers.reduce((sum, voucher) => sum + (voucher.amount || 0), 0)} />
//               </p>
//             </div>
//           )}

//           <div className="py-3 px-4 flex justify-between items-center">
//             <p>Total Pembayaran</p>
//             <p className="font-semibold">
//               {(() => {
//                 const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
//                 const subtotalAfterVoucher = Math.max(totalSubtotalPrice - totalVoucher, 0);
//                 const tax = detail.ppn ? Math.round((subtotalAfterVoucher + totalTicketFee) * (detail.ppn / 100)) : 0;
//                 const grandTotal = subtotalAfterVoucher + totalTicketFee + tax;
//                 return grandTotal > 0 ? <NumberFormatter value={grandTotal} /> : <Text>Free</Text>;
//               })()}
//             </p>
//           </div>
//         </div>

//         {form.map((item, index) => {
//           let ticketForOwner = null;
//           let currentIndex = 0;

//           for (const ticketItem of ticket) {
//             for (let i = 0; i < (ticketItem?.seat_number?.length ?? ticketItem.qty_ticket); i++) {
//               if (currentIndex === index - 1) {
//                 ticketForOwner = {
//                   ...ticketItem,
//                   seat_number: ticketItem?.seat_number ? ticketItem?.seat_number[i] : undefined,
//                 } as FormTicket;
//                 break;
//               }
//               currentIndex++;
//             }
//             if (ticketForOwner) break;
//           }

//           if (!ticketForOwner?.seat_number && !!item.seat_number) {
//             handleInput(index, "seat_number", item.seat_number ?? "");
//           }

//           return (
//             <div className="bg-white mt-4 last:mb-16" key={index}>
//               <div className="border-b py-3 px-5 border-primary-light flex items-center justify-between cursor-pointer" onClick={() => toggleCollapse(index)}>
//                 {index > 0 && <FontAwesomeIcon icon={faTicket} className="text-primary shrink-0 mr-[10px]" />}
//                 <Stack gap={0} className={`flex-grow`}>
//                   <p className="font-semibold">{index > 0 ? `${index}. ${t("ticketOwner")} ${ticketForOwner?.name} ${ticketForOwner?.seat_number ? `(Seat ${ticketForOwner?.seat_number})` : ""}` : t("registrantData")}</p>
//                   {index > 0 && (
//                     <p className="text-xs text-grey">
//                       1 Tiket x{" "}
//                       {new Intl.NumberFormat("id-ID", {
//                         style: "currency",
//                         currency: "IDR",
//                       }).format(ticketForOwner?.price ?? 0)}
//                     </p>
//                   )}
//                 </Stack>
//                 <button className="text-grey">
//                   <FontAwesomeIcon icon={faChevronUp} className={`${collapse[index] ? "rotate-0" : "rotate-180"} transition-transform`} />
//                 </button>
//               </div>

//               {index > 0 && (
//                 <div className="flex items-center justify-end gap-[8px] px-4 py-2 rounded-lg text-grey">
//                   <p className="text-xs md:text-sm text-end">{t("useRegistrantData")}</p>
//                   <Switch size="sm" onChange={(e: any) => (e.target.checked ? copyOrderer(index) : clearForm(index))} />
//                 </div>
//               )}

//               <div className={`border-b p-3 border-primary-light ${collapse[index] ? "max-h-[50rem]" : "max-h-0"} transition-max-height delay-100 duration-150 ease-in-out`}>
//                 <div className={`${collapse[index] ? "opacity-100" : "opacity-0"} transition-transform-opacity duration-300 delay-300 ease-in-out`}>
//                   <div className={`${collapse[index] ? "visible delay-300 duration-300" : "invisible"} transition-transform `}>
//                     {detail.is_noidentity ? (
//                       <Field className="mb-2">
//                         <Label className="text-sm font-base text-grey">Nomor Induk KTP</Label>
//                         <Input
//                           type="text"
//                           className={`${
//                             error.nik ? "border-danger" : "border-primary-light"
//                           } [&::-webkit-inner-spin-button]:appearance-none mt-2 block w-full rounded-lg border t bg-white/5 py-1.5 px-3 text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200`}
//                           placeholder="1234 567 890"
//                           value={item.nik}
//                           onChange={(e) => {
//                             const numericValue = e.target.value.replace(/\D/g, "").slice(0, 17);
//                             handleInput(index, "nik", numericValue);
//                           }}
//                           maxLength={17}
//                         />
//                         {error.nik && item.nik.length < 16 && <p className="text-[10px] mt-1 text-danger">Minimal NIK adalah 16 Digit</p>}
//                         {error.nik && item.nik.length > 17 && <p className="text-[10px] mt-1 text-danger">Maksimal NIK adalah 17 Digit</p>}
//                       </Field>
//                     ) : null}

//                     {detail.is_name ? (
//                       <Field className="mb-2">
//                         <Label className="text-sm font-base text-grey">Nama Lengkap</Label>
//                         <Input
//                           className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
//                           placeholder="Nama Lengkap"
//                           value={item.full_name}
//                           onChange={(e) => handleInput(index, "full_name", e.target.value)}
//                         />
//                       </Field>
//                     ) : null}

//                     {detail.is_gender ? (
//                       <Field className="mb-2">
//                         <Label className="text-sm font-base text-grey">Jenis Kelamin</Label>
//                         <select value={item.is_gender || ""} onChange={(e) => handleInput(index, "is_gender", e.target.value)} className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark">
//                           <option value="">Pilih Jenis Kelamin</option>
//                           <option value="1">Pria</option>
//                           <option value="2">Wanita</option>
//                           <option value="3">Tidak Memberitahu</option>
//                         </select>
//                       </Field>
//                     ) : null}

//                     {detail.is_birthdate ? (
//                       <Field className="mb-2">
//                         <Label className="text-sm font-base text-grey">Tanggal Lahir</Label>
//                         <Input
//                           type="date"
//                           value={item.birthdate || ""}
//                           onChange={(e) => handleInput(index, "birthdate", e.target.value)}
//                           className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark"
//                         />
//                       </Field>
//                     ) : null}

//                     {detail.is_kelas ? (
//                       <Field className="mb-2">
//                         <Label className="text-sm font-base text-grey">Kelas</Label>
//                         <Input
//                           type="text"
//                           value={item.is_kelas || ""}
//                           onChange={(e) => handleInput(index, "is_kelas", e.target.value)}
//                           placeholder="Masukan kelas (angka)"
//                           className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark"
//                         />
//                       </Field>
//                     ) : null}

//                     {detail.is_profession ? (
//                       <Field className="mb-2">
//                         <Label className="text-sm font-base text-grey">Profesi / Pekerjaan</Label>
//                         <Input
//                           className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
//                           placeholder="Profesi atau pekerjaan"
//                           value={item.is_profession}
//                           onChange={(e) => handleInput(index, "is_profession", e.target.value)}
//                         />
//                       </Field>
//                     ) : null}

//                     {detail.is_company ? (
//                       <Field className="mb-2">
//                         <Label className="text-sm font-base text-grey">Perusahaan / Organisasi</Label>
//                         <Input
//                           className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
//                           placeholder="Perusahaan atau organisasi"
//                           value={item.is_company}
//                           onChange={(e) => handleInput(index, "is_company", e.target.value)}
//                         />
//                       </Field>
//                     ) : null}

//                     {detail.is_email ? (
//                       <Field className="mb-2">
//                         <Label className="text-sm font-base text-grey">Email</Label>
//                         <Input
//                           type="email"
//                           className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
//                           placeholder="Contoh: example@example.com"
//                           value={item.email}
//                           onChange={(e) => handleInput(index, "email", e.target.value)}
//                         />
//                       </Field>
//                     ) : null}

//                     {detail.is_phone_number ? (
//                       <Field className="mb-2">
//                         <Label className="text-sm font-base text-grey">No Telepon</Label>
//                         <div className="flex gap-2 items-center">
//                           <form className="max-w-sm block mt-2">
//                             <select
//                               id="countries"
//                               className="bg-gray-50 border border-primary-light text-dark text-sm rounded-lg focus:ring-primary-base focus:border-primary-light block w-full py-1.5"
//                               defaultValue="+62"
//                               value={item.countryCode}
//                               onChange={(e) => handleInput(index, "countryCode", e.target.value)}
//                             >
//                               <option value="+62">+62</option>
//                               <option value="+1">+1</option>
//                               <option value="+2">+2</option>
//                               <option value="+3">+3</option>
//                               <option value="+4">+4</option>
//                             </select>
//                           </form>
//                           <Input
//                             className="mt-2 w-4/5 block rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
//                             placeholder="Contoh: 81233334444"
//                             value={item.no_telp}
//                             onChange={(e) => handleInput(index, "no_telp", e.target.value)}
//                           />
//                         </div>
//                       </Field>
//                     ) : null}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     ) : (
//       <div className="bg-primary-light" style={{ minHeight: "unset", paddingBottom: 0 }}>
//         <div className="max-w-5xl mx-auto grid grid-cols-5 mt-8 gap-x-7 pt-20">
//           <h2 className="col-span-5 mb-4">Personal Informasi </h2>

//           <div className="col-span-3 flex flex-col gap-3">
//             {form.map((item, index) => {
//               let ticketForOwner = null;
//               let currentIndex = 0;

//               for (const ticketItem of ticket) {
//                 for (let i = 0; i < (ticketItem?.seat_number?.length ?? ticketItem.qty_ticket); i++) {
//                   if (currentIndex === index - 1) {
//                     ticketForOwner = {
//                       ...ticketItem,
//                       seat_number: ticketItem?.seat_number ? ticketItem?.seat_number[i] : undefined,
//                     } as FormTicket;
//                     break;
//                   }
//                   currentIndex++;
//                 }
//                 if (ticketForOwner) break;
//               }

//               if (!ticketForOwner?.seat_number && !!item.seat_number) {
//                 handleInput(index, "seat_number", item.seat_number ?? "");
//               }

//               return (
//                 <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm" key={index}>
//                   <div className="border-b border-b-primary-light-200 cursor-pointer px-5 py-3 flex items-center justify-between" onClick={() => toggleCollapse(index)}>
//                     {index > 0 && <FontAwesomeIcon icon={faTicket} className="text-primary shrink-0 mr-[10px]" />}
//                     <Stack gap={0} className={`flex-grow`}>
//                       <p className="font-semibold">{index > 0 ? `${index}. ${t("ticketOwner")} ${ticketForOwner?.name} ${ticketForOwner?.seat_number ? `(Seat ${ticketForOwner?.seat_number})` : ""}` : t("registrantData")}</p>
//                       {index > 0 && <p className="text-xs text-grey">1 Tiket x {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(ticketForOwner?.price ?? 0)}</p>}
//                     </Stack>
//                     <button className="text-grey">
//                       <FontAwesomeIcon icon={faChevronUp} className={`${collapse[index] ? "rotate-0" : "rotate-180"} transition-transform`} />
//                     </button>
//                   </div>

//                   {index > 0 && (
//                     <div className="flex items-center justify-end gap-[8px] px-4 py-2 rounded-lg text-grey">
//                       <p className="text-xs md:text-sm text-end">{t("useRegistrantData")}</p>
//                       <Switch size="sm" onChange={(e: any) => (e.target.checked ? copyOrderer(index) : clearForm(index))} />
//                     </div>
//                   )}

//                   <div className={`px-5 pt-3 pb-5 ${collapse[index] ? "" : "max-h-0"} transition-max-height delay-100 duration-150 ease-in-out`}>
//                     <div className={`${collapse[index] ? "opacity-100" : "opacity-0"} transition-transform-opacity duration-300 delay-300 ease-in-out`}>
//                       <div className={`${collapse[index] ? "visible" : "invisible"} flex flex-col gap-3`}>
//                         {detail.is_noidentity ? (
//                           <>
//                             <InputField fullWidth type="number" label={t("ktpNumber")} placeholder={`${t("example")}: 123456789012345`} value={item.nik} onChange={(e) => handleInput(index, "nik", e.target.value)} />
//                             {error.nik && <p className="text-[10px] mt-1 text-danger">Minimal NIK adalah 16 Digit</p>}
//                           </>
//                         ) : null}

//                         {detail.is_name ? <InputField fullWidth type="text" label={t("fullName")} placeholder={t("fullName")} value={item.full_name} onChange={(e) => handleInput(index, "full_name", e.target.value)} /> : null}

//                         {detail.is_gender ? (
//                           <Field className="mb-2">
//                             <Label className="text-sm font-base text-grey">Jenis Kelamin</Label>
//                             <select
//                               value={item.is_gender || ""}
//                               onChange={(e) => handleInput(index, "is_gender", e.target.value)}
//                               className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark"
//                             >
//                               <option value="">Pilih Jenis Kelamin</option>
//                               <option value="1">Pria</option>
//                               <option value="2">Wanita</option>
//                               <option value="3">Tidak Memberitahu</option>
//                             </select>
//                           </Field>
//                         ) : null}

//                         {detail.is_birthdate ? (
//                           <Field className="mb-2">
//                             <Label className="text-sm font-base text-grey">Tanggal Lahir</Label>
//                             <Input
//                               type="date"
//                               value={item.birthdate || ""}
//                               onChange={(e) => handleInput(index, "birthdate", e.target.value)}
//                               className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark"
//                             />
//                           </Field>
//                         ) : null}

//                         {detail.is_kelas ? (
//                           <Field className="mb-2">
//                             <Label className="text-sm font-base text-grey">Kelas</Label>
//                             <Input
//                               type="text"
//                               value={item.is_kelas || ""}
//                               onChange={(e) => handleInput(index, "is_kelas", e.target.value)}
//                               placeholder="Masukan kelas (angka)"
//                               className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark"
//                             />
//                           </Field>
//                         ) : null}

//                         {detail.is_profession ? (
//                           <InputField fullWidth type="text" label={t("profession")} placeholder={t("profession")} value={item.is_profession} onChange={(e) => handleInput(index, "is_profession", e.target.value)} />
//                         ) : null}
//                         {detail.is_company ? <InputField fullWidth type="text" label={t("company")} placeholder={t("company")} value={item.is_company} onChange={(e) => handleInput(index, "is_company", e.target.value)} /> : null}
//                         {detail.is_email ? <InputField fullWidth type="text" label="Email" placeholder={`${t("example")}: example@example.com`} value={item.email} onChange={(e) => handleInput(index, "email", e.target.value)} /> : null}
//                         {detail.is_phone_number ? (
//                           <InputField fullWidth type="number" label={t("phoneNumber")} placeholder={`${t("example")}: 81233334444`} onChange={(e) => handleInput(index, "no_telp", e.target.value)} value={item.no_telp} />
//                         ) : null}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           <div className="col-span-2 flex flex-col gap-3">
//             <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm">
//               <div className="flex items-center gap-3 p-3">
//                 {detail && detail.image_url && <Image src={detail?.image_url} width={1000} height={1000} alt="banner" className="w-10 h-10 object-cover rounded-md" />}
//                 <div>
//                   <p className="text-sm mb-1">{detail?.name}</p>
//                   <p className="text-xs text-grey">{formatDate(detail.start_date) == formatDate(detail.end_date) ? formatDate(detail.start_date) : `${formatDate(detail.start_date)} - ${formatDate(detail.end_date)}`}</p>
//                 </div>
//               </div>
//             </div>

//             <Card withBorder radius={10} p={20}>
//               <Stack gap={20}>
//                 <Flex gap={10} align="center">
//                   <Icon icon="mdi:voucher-outline" className={`text-primary-base text-[20px]`} />
//                   <Text fw={600}>Voucher</Text>
//                 </Flex>

//                 {voucherFields.map((field, index) => (
//                   <Group key={index}>
//                     <TextInput
//                       w="100%"
//                       value={vouchers[index]?.name || field}
//                       onChange={(e) => {
//                         const newVoucherFields = [...voucherFields];
//                         newVoucherFields[index] = e.currentTarget.value;
//                         setVoucherFields(newVoucherFields);
//                       }}
//                       placeholder={`Masukan Kode Voucher ${index + 1}`}
//                     />
//                     <Button loading={loading.includes(`getvoucher-${index}`)} disabled={field.length < 3} size="xs" onClick={() => handleGetVoucher(index)} className={`shrink-0`}>
//                       Submit
//                     </Button>
//                     {vouchers[index] && (
//                       <>
//                         <Button variant="outline" size="xs" color="red" onClick={() => handleCancelVoucher(index)} className="shrink-0">
//                           Cancel
//                         </Button>
//                         <Icon icon="uiw:circle-check" className="text-green-500 text-[20px] shrink-0" />
//                       </>
//                     )}
//                   </Group>
//                 ))}
//                 <Button variant="outline" size="xs" onClick={handleAddVoucherField} className="mt-2">
//                   + Tambah Voucher
//                 </Button>
//               </Stack>
//             </Card>

//             <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm">
//               <div className="border-b border-b-primary-light-200 p-3">
//                 <p className="font-semibold">{t("orderSummary")}</p>
//               </div>

//               {ticket.map((item: FormTicket) => (
//                 <div className="border-b p-3 border-primary-light-200 flex gap-3" key={item.event_ticket_id}>
//                   <div className="px-3 flex items-center border rounded-md border-primary-light">
//                     <FontAwesomeIcon icon={faTicket} className="text-primary" />
//                   </div>
//                   <div>
//                     <p className="text-sm mb-1 font-semibold">{item.name}</p>
//                     <p className="text-xs text-grey">
//                       {item.qty_ticket} Tiket x {item.price}
//                     </p>
//                   </div>
//                 </div>
//               ))}

//               <div className="py-3 px-4 flex justify-between items-center">
//                 <p>{`${t("jumlah")} (${totalCount} ${t("ticket")})`}</p>
//                 <p className="font-semibold">{totalSubtotalPrice > 0 ? <NumberFormatter value={totalSubtotalPrice} /> : <Text>Free</Text>}</p>
//               </div>

//               <div className="py-3 px-4 flex justify-between items-center">
//                 <p>{t("adminFee")} dekstop</p>
//                 <p className="font-semibold">{totalTicketFee > 0 ? <NumberFormatter value={totalTicketFee} /> : <Text>Free</Text>}</p>
//               </div>

//               {vouchers.length > 0 && (
//                 <div className="py-3 px-4 flex justify-between items-center">
//                   <p>Voucher</p>
//                   <p className="font-semibold">
//                     -<NumberFormatter value={vouchers.reduce((sum, voucher) => sum + (voucher.amount || 0), 0)} />
//                   </p>
//                 </div>
//               )}

//               {detail.ppn
//                 ? (() => {
//                     const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
//                     const subtotalAfterVoucher = Math.max(totalSubtotalPrice - totalVoucher, 0);
//                     const tax = detail.ppn ? Math.round((subtotalAfterVoucher + totalTicketFee) * (detail.ppn / 100)) : 0;
//                     return (
//                       <div className="py-3 px-4 flex justify-between items-center">
//                         <p>Tax ({detail.ppn}%)</p>
//                         <p className="font-semibold">{detail.ppn > 0 ? <NumberFormatter value={tax} /> : <Text>Free</Text>}</p>
//                       </div>
//                     );
//                   })()
//                 : null}

//               <div className="py-3 px-4 flex justify-between items-center">
//                 <p>{t("totalPayment")}</p>
//                 <p className="font-semibold">
//                   {(() => {
//                     const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
//                     const subtotalAfterVoucher = Math.max(totalSubtotalPrice - totalVoucher, 0);
//                     const tax = detail.ppn ? Math.round((subtotalAfterVoucher + totalTicketFee) * (detail.ppn / 100)) : 0;
//                     const grandTotal = subtotalAfterVoucher + totalTicketFee + tax;
//                     return grandTotal > 0 ? <NumberFormatter value={grandTotal} /> : <Text>Free</Text>;
//                   })()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     ))
//   );
// };

// export default FirstStep;

"use client";

import { useEffect, useState } from "react";
import useWindowSize from "@/utils/useWindowSize";
import { EventProps } from "@/utils/globalInterface";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Field, Label, Input } from "@headlessui/react";
import { faChevronUp, faTicket } from "@fortawesome/free-solid-svg-icons";
import InputField from "../Input";
import { formatDate } from "@/utils/useFormattedDate";
import { Switch } from "@nextui-org/react";
import useLoggedUser from "@/utils/useLoggedUser";
import React from "react";
import { Button, Card, Flex, Group, NumberFormatter, Stack, Text, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react/dist/iconify.js";
import fetch from "@/utils/fetch";
import { useListState } from "@mantine/hooks";
import moment from "moment";
import { notifications } from "@mantine/notifications";

interface FormTicket {
  event_id: number;
  event_ticket_id: number;
  name: string;
  price: number;
  subtotal_price: number;
  qty_ticket: number;
  payment_status: string;
  seat_number?: string[] | string;
  ticket_fee?: number;
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
  is_profession: string;
  is_company: string;
  identity_type_id: number;
  event_ticket_id: number;
  seat_number?: string;
  // NEW
  is_gender?: string;
  birthdate?: string;
  is_kelas?: string;
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
  haveVoucher?: any;
  onSubmitVoucher?: (data: { id: number; name: string; amount: number; is_multiply: boolean; type: "persentase" | "nominal" }) => void;
  onCancelVoucher?: (index: number) => void;
}

const FirstStep = ({ onSubmitVoucher, onCancelVoucher, detail, haveVoucher, ticket, totalCount, onSubmit, form, setForm, error, totalSubtotalPrice, setFormValid }: StepPaymentProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useListState<string>([]);
  const [voucherFields, setVoucherFields] = useState([""]);
  const totalTicketFee = ticket.reduce((sum, item) => sum + (item.ticket_fee || 0) * item.qty_ticket, 0);
  const [vouchers, setVouchers] = useState<{ name: string; amount: number }[]>([]);
  const { width } = useWindowSize();
  const userData = useLoggedUser();
  const [collapse, setCollapse] = useState<boolean[]>(form.map((_, index) => index === 0));

  useEffect(() => {
    if (userData) {
      userData.name && handleInput(0, "full_name", userData.name);
      userData.email && handleInput(0, "email", userData.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const formValidation = (data: Form) => {
    return (
      (detail.is_noidentity == 1 ? Boolean(data.nik) : true) &&
      (detail.is_name == 1 ? Boolean(data.full_name) : true) &&
      (detail.is_email == 1 ? Boolean(data.email) : true) &&
      (detail.is_email == 1 ? data.email.includes("@") && data.email.includes(".") : true) &&
      (detail.is_phone_number == 1 ? Boolean(data.no_telp) : true)
    );
  };

  const handleInput = (index: number, field: keyof Form, value: string) => {
    let newForm = [...form];
    if (field == "no_telp") {
      var phone = value.replaceAll(/\D/g, "");
      phone = phone.replace(/^(?!0|6)(\d+)/, "628$1");
      phone = phone.replace(/^0/, "62");
      newForm[index] = { ...newForm[index], [field]: phone };
    } else {
      newForm[index] = { ...newForm[index], [field]: value };
    }
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
      newForm[targetIndex] = { ...newForm[0], is_pemesan: 0 };
      setForm(newForm);
      const isFormValid = newForm.every(formValidation);
      setFormValid(isFormValid);
    }
  };

  const clearForm = (targetIndex: number) => {
    if (form.length > 0 && targetIndex >= 0 && targetIndex < form.length) {
      let newForm = [...form];
      newForm[targetIndex] = {
        nik: "",
        full_name: "",
        email: "",
        countryCode: "",
        no_telp: "",
        is_pemesan: 0,
        is_profession: "",
        is_company: "",
        identity_type_id: 1,
        event_ticket_id: 1,
        is_gender: "",
        birthdate: "",
        is_kelas: "",
      };
      setForm(newForm);
      const isFormValid = newForm.every(formValidation);
      setFormValid(isFormValid);
    }
  };

  const handleGetVoucher = async (index: number) => {
    if (!voucherFields[index]) return;

    const isDuplicate = vouchers.some((v) => v.name === voucherFields[index]);
    if (isDuplicate) {
      notifications.show({
        message: "Voucher sudah digunakan.",
        color: "red",
      });
      return;
    }

    await fetch<
      {
        event_id: number;
        date: string;
        code: string;
      },
      {
        voucher: {
          discount: number;
          type: "persentase" | "nominal";
          date_start: string;
          date_end: string;
          max_use: number;
          min_transaction: number;
          stock: number;
          status: 1 | 0;
          is_multiply?: boolean;
          id?: number;
        };
      }
    >({
      url: "vouchers/validate",
      method: "POST",
      data: {
        event_id: detail.id,
        date: moment(new Date()).format("YYYY-MM-DD"),
        code: voucherFields[index],
      },
      before: () => setLoading.append(`getvoucher-${index}`),
      success: (data) => {
        const voucher = data?.voucher ?? data?.data?.voucher;
        if (!voucher) return;
        const isDateValid = moment(voucher.date_start).isBefore(new Date()) && moment(voucher.date_end).isAfter(new Date());
        const isStockValid = voucher.stock > 0;
        const isStatusValid = voucher.status == 1;
        const isMinTransactionValid = totalSubtotalPrice >= voucher.min_transaction;

        let discount = 0;

        if (voucher.is_multiply) {
          discount = voucher.type == "persentase" ? ((totalSubtotalPrice * voucher.discount) / 100) * totalCount : voucher.discount * totalCount;
        } else {
          discount = voucher.type == "persentase" ? (totalSubtotalPrice * voucher.discount) / 100 : voucher.discount;
        }

        if (isDateValid && isStockValid && isStatusValid && isMinTransactionValid) {
          if (onSubmitVoucher) {
            onSubmitVoucher({
              id: voucher.id,
              name: voucherFields[index],
              amount: discount,
              is_multiply: !!voucher.is_multiply,
              type: voucher.type,
            });
          }

          const newVouchers = [...vouchers];
          newVouchers[index] = { name: voucherFields[index], amount: discount };
          setVouchers(newVouchers);
        } else {
          notifications.show({
            message: "Voucher Tidak Ditemukan",
            color: "red",
          });
          const newVoucherFields = [...voucherFields];
          newVoucherFields[index] = "";
          setVoucherFields(newVoucherFields);
        }
      },
      complete: () => setLoading.filter((e) => e !== `getvoucher-${index}`),
      error: () => {
        notifications.show({
          message: "Voucher Tidak Ditemukan",
          color: "red",
        });
        const newVoucherFields = [...voucherFields];
        newVoucherFields[index] = "";
        setVoucherFields(newVoucherFields);
      },
    });
  };

  useEffect(() => {
    if (Array.isArray(haveVoucher) && haveVoucher.length > 0) {
      setVoucherFields(haveVoucher.map((voucher: { name: string }) => voucher.name || ""));
      setVouchers((prev) => {
        const newVouchers = [...prev];
        haveVoucher.forEach((voucher: { name: string; amount: number }) => {
          if (!newVouchers.some((v) => v.name === voucher.name)) {
            newVouchers.push(voucher);
          }
        });
        return newVouchers;
      });
    } else {
      setVoucherFields([""]);
    }
  }, [haveVoucher]);

  const handleAddVoucherField = () => {
    if (voucherFields.length < (detail.max_use_voucher ?? 0)) {
      setVoucherFields([...voucherFields, ""]);
    } else {
      notifications.show({
        message: "Maksimal voucher sudah digunakan",
        color: "red",
      });
    }
  };

  const handleCancelVoucher = (index: number) => {
    onCancelVoucher && onCancelVoucher(index);
    const newVoucherFields = [...voucherFields];
    const newVouchers = [...vouchers];
    newVoucherFields[index] = "";
    newVouchers.splice(index, 1);
    setVoucherFields(newVoucherFields);
    setVouchers(newVouchers.filter(Boolean));
  };

  // --- Return layout (mobile / desktop) aligned with FirstStepUnlogged design ---
  return (
    width &&
    (width < 768 ? (
      // MOBILE layout (match Unlogged)
      <div className="bg-primary-light pt-3 pb-4 px-2">
        <div className="border-b p-2 border-primary-light flex items-center gap-2 mb-2">
          <div className="px-1.5 py-1 border rounded-md border-primary-light shrink-0">
            {detail && detail.image_url && <Image src={detail?.image_url} width={1000} height={1000} alt="banner" className="w-8 h-8 object-cover rounded-sm" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">{detail?.name}</p>
            <p className="text-xs text-grey">{totalCount} Tiket</p>
          </div>
        </div>

        <Card withBorder radius={8} p="sm" className="mb-2">
          <Stack gap="xs">
            <Flex gap={6} align="center">
              <Icon icon="mdi:voucher-outline" className={`text-primary-base text-sm`} />
              <Text fw={600} size="xs">
                Voucher
              </Text>
            </Flex>

            {voucherFields.map((field, index) => (
              <Group key={index} gap="xs">
                <TextInput
                  w="100%"
                  value={vouchers[index]?.name || field}
                  onChange={(e) => {
                    const newVoucherFields = [...voucherFields];
                    newVoucherFields[index] = e.currentTarget.value;
                    setVoucherFields(newVoucherFields);
                  }}
                  placeholder={`Voucher ${index + 1}`}
                  size="xs"
                />
                <Button loading={loading.includes(`getvoucher-${index}`)} disabled={field.length < 3} size="xs" onClick={() => handleGetVoucher(index)} className={`shrink-0`}>
                  OK
                </Button>
                {vouchers[index] && (
                  <>
                    <Button variant="outline" size="xs" color="red" onClick={() => handleCancelVoucher(index)} className="shrink-0">
                      X
                    </Button>
                    <Icon icon="uiw:circle-check" className="text-green-500 text-xs shrink-0" />
                  </>
                )}
              </Group>
            ))}
            <Button variant="outline" size="xs" onClick={handleAddVoucherField} className="mt-1 text-xs">
              + Tambah
            </Button>
          </Stack>
        </Card>

        <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm mb-2">
          <div className="border-b border-b-primary-light-200 p-2">
            <p className="font-semibold text-xs">Ringkasan</p>
          </div>

          {ticket.map((item: FormTicket) => (
            <div className="border-b p-2 border-primary-light-200 flex gap-2" key={item.event_ticket_id}>
              <div className="px-2 flex items-center border rounded-md border-primary-light shrink-0">
                <FontAwesomeIcon icon={faTicket} className="text-primary text-xs" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{item.name}</p>
                <p className="text-grey text-xs">
                  {item.qty_ticket}x Rp{item.price}
                </p>
              </div>
            </div>
          ))}

          <div className="py-3 px-4 flex justify-between items-center text-xs border-t border-primary-light-200">
            <p>Jumlah</p>
            <p className="font-semibold">{totalSubtotalPrice > 0 ? <NumberFormatter value={totalSubtotalPrice} /> : "Gratis"}</p>
          </div>

          {vouchers.length > 0 && (
            <div className="py-3 px-4 flex justify-between items-center">
              <p>Total Voucher</p>
              <p className="font-semibold">
                -
                <NumberFormatter value={vouchers.reduce((sum, voucher) => sum + (voucher.amount || 0), 0)} />
              </p>
            </div>
          )}

          {(() => {
            const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
            const subtotalAfterVoucher = Math.max(totalSubtotalPrice - totalVoucher, 0);
            return (
              <div className="py-3 px-4 flex justify-between items-center">
                <p>Subtotal</p>
                <p className="font-semibold">
                  <NumberFormatter value={subtotalAfterVoucher} />
                </p>
              </div>
            );
          })()}

          {detail.ppn
            ? (() => {
                const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
                const subtotalAfterVoucher = Math.max(totalSubtotalPrice - totalVoucher, 0);
                const taxBase = subtotalAfterVoucher + totalTicketFee;
                const tax = Math.round(taxBase * (detail.ppn / 100));
                return (
                  <div className="py-3 px-4 flex justify-between items-center">
                    <p>Tax ({detail.ppn}%)</p>
                    <p className="font-semibold">{detail.ppn > 0 ? <NumberFormatter value={tax} /> : <Text>Free</Text>}</p>
                  </div>
                );
              })()
            : null}

          <div className="py-3 px-4 flex justify-between items-center text-xs">
            <p>Admin</p>
            <p className="font-semibold">{totalTicketFee > 0 ? <NumberFormatter value={totalTicketFee} /> : "Gratis"}</p>
          </div>

          <div className="py-3 px-4 flex justify-between items-center">
            <p>Total Pembayaran</p>
            <p className="font-semibold">
              {(() => {
                const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
                const subtotalAfterVoucher = Math.max(totalSubtotalPrice - totalVoucher, 0);
                const tax = detail.ppn ? Math.round((subtotalAfterVoucher + totalTicketFee) * (detail.ppn / 100)) : 0;
                const grandTotal = subtotalAfterVoucher + totalTicketFee + tax;
                return grandTotal > 0 ? <NumberFormatter value={grandTotal} /> : <Text>Free</Text>;
              })()}
            </p>
          </div>
        </div>

        {form.map((item, index) => {
          let ticketForOwner = null;
          let currentIndex = 0;

          for (const ticketItem of ticket) {
            for (let i = 0; i < (Array.isArray(ticketItem?.seat_number) ? ticketItem?.seat_number.length : ticketItem?.seat_number ? JSON.parse(String(ticketItem.seat_number)).length : ticketItem.qty_ticket); i++) {
              if (currentIndex === index - 1) {
                ticketForOwner = {
                  ...ticketItem,
                  seat_number: Array.isArray(ticketItem?.seat_number) ? ticketItem?.seat_number[i] : ticketItem?.seat_number ? JSON.parse(String(ticketItem.seat_number))[i] : undefined,
                } as FormTicket;
                break;
              }
              currentIndex++;
            }
            if (ticketForOwner) break;
          }

          if (!ticketForOwner?.seat_number && !!item.seat_number) {
            handleInput(index, "seat_number", item.seat_number ?? "");
          }

          return (
            <div className="bg-white mt-1" key={index}>
              <div className="border-b py-2 md:py-3 px-2 md:px-5 border-primary-light flex items-start justify-between cursor-pointer gap-2 md:gap-3" onClick={() => toggleCollapse(index)}>
                {index > 0 && <FontAwesomeIcon icon={faTicket} className="text-primary shrink-0 mt-1 text-xs md:text-base" />}
                <Stack gap={0} className={`flex-grow min-w-0`}>
                  <p className="font-semibold text-xs md:text-sm leading-tight">{index > 0 ? `${index}. ${t("ticketOwner")} ${ticketForOwner?.name}` : t("registrantData")}</p>
                  {index > 0 && ticketForOwner?.seat_number && <p className="text-xs text-grey leading-tight">Seat {ticketForOwner?.seat_number}</p>}
                  {index > 0 && <p className="text-xs text-grey leading-tight">1 Tiket x {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(ticketForOwner?.price ?? 0)}</p>}
                </Stack>
                <button className="text-grey shrink-0 mt-1">
                  <FontAwesomeIcon icon={faChevronUp} className={`${collapse[index] ? "rotate-0" : "rotate-180"} transition-transform text-xs md:text-base`} />
                </button>
              </div>

              {index > 0 && (
                <div className="flex items-center justify-end gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-lg text-grey flex-wrap md:flex-nowrap">
                  <p className="text-xs md:text-sm text-end">{t("useRegistrantData")}</p>
                  <Switch size="sm" onChange={(e: any) => (e.target.checked ? copyOrderer(index) : clearForm(index))} />
                </div>
              )}

              <div className={`border-b p-3 border-primary-light ${collapse[index] ? "max-h-[26rem]" : "max-h-0"} transition-max-height delay-100 duration-150 ease-in-out`}>
                <div className={`${collapse[index] ? "opacity-100" : "opacity-0"} transition-transform-opacity duration-300 delay-300 ease-in-out`}>
                  <div className={`${collapse[index] ? "visible delay-300 duration-300" : "invisible"} transition-transform `}>
                    {detail.is_noidentity ? (
                      <Field className="mb-2">
                        <Label className="text-xs md:text-sm font-base text-grey">Nomor Induk KTP</Label>
                        <Input
                          type="text"
                          className={`${
                            error.nik ? "border-danger" : "border-primary-light"
                          } [&::-webkit-inner-spin-button]:appearance-none mt-1 block w-full rounded-lg border t bg-white/5 py-1 px-2 text-xs md:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200`}
                          placeholder="1234 567 890"
                          value={item.nik}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/\D/g, "").slice(0, 17);
                            handleInput(index, "nik", numericValue);
                          }}
                          maxLength={17}
                        />
                        {error.nik && item.nik.length < 16 && <p className="text-[9px] md:text-[10px] mt-0.5 text-danger">Minimal NIK adalah 16 Digit</p>}
                        {error.nik && item.nik.length > 17 && <p className="text-[9px] md:text-[10px] mt-0.5 text-danger">Maksimal NIK adalah 17 Digit</p>}
                      </Field>
                    ) : null}

                    {detail.is_name ? (
                      <Field className="mb-2">
                        <Label className="text-xs md:text-sm font-base text-grey">Nama Lengkap</Label>
                        <Input
                          className="mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs md:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                          placeholder="Nama Lengkap"
                          value={item.full_name}
                          onChange={(e) => handleInput(index, "full_name", e.target.value)}
                        />
                      </Field>
                    ) : null}

                    {detail.is_gender ? (
                      <Field className="mb-2">
                        <Label className="text-xs md:text-sm font-base text-grey">Jenis Kelamin</Label>
                        <select
                          value={item.is_gender || ""}
                          onChange={(e) => handleInput(index, "is_gender", e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs md:text-sm text-dark"
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="1">Pria</option>
                          <option value="2">Wanita</option>
                          <option value="3">Tidak Memberitahu</option>
                        </select>
                      </Field>
                    ) : null}

                    {detail.is_birthdate ? (
                      <Field className="mb-2">
                        <Label className="text-xs md:text-sm font-base text-grey">Tanggal Lahir</Label>
                        <Input
                          type="date"
                          value={item.birthdate || ""}
                          onChange={(e) => handleInput(index, "birthdate", e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs md:text-sm text-dark"
                        />
                      </Field>
                    ) : null}

                    {detail.is_kelas ? (
                      <Field className="mb-2">
                        <Label className="text-xs md:text-sm font-base text-grey">Kelas</Label>
                        <Input
                          type="text"
                          value={item.is_kelas || ""}
                          onChange={(e) => handleInput(index, "is_kelas", e.target.value)}
                          placeholder="Masukan kelas (angka)"
                          className="mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs md:text-sm text-dark"
                        />
                      </Field>
                    ) : null}

                    {detail.is_profession ? (
                      <Field className="mb-2">
                        <Label className="text-xs md:text-sm font-base text-grey">Profesi / Pekerjaan</Label>
                        <Input
                          className="mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs md:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                          placeholder="Profesi atau pekerjaan"
                          value={item.is_profession}
                          onChange={(e) => handleInput(index, "is_profession", e.target.value)}
                        />
                      </Field>
                    ) : null}

                    {detail.is_company ? (
                      <Field className="mb-2">
                        <Label className="text-xs md:text-sm font-base text-grey">Perusahaan / Organisasi</Label>
                        <Input
                          className="mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs md:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                          placeholder="Perusahaan atau organisasi"
                          value={item.is_company}
                          onChange={(e) => handleInput(index, "is_company", e.target.value)}
                        />
                      </Field>
                    ) : null}

                    {detail.is_email ? (
                      <Field className="mb-2">
                        <Label className="text-xs md:text-sm font-base text-grey">Email</Label>
                        <Input
                          type="email"
                          className="mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs md:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                          placeholder="Contoh: example@example.com"
                          value={item.email}
                          onChange={(e) => handleInput(index, "email", e.target.value)}
                        />
                      </Field>
                    ) : null}

                    {detail.is_phone_number ? (
                      <Field className="mb-2">
                        <Label className="text-xs md:text-sm font-base text-grey">No Telepon</Label>
                        <div className="flex gap-1 md:gap-2 items-center">
                          <form className="max-w-sm block mt-1">
                            <select
                              id="countries"
                              className="bg-gray-50 border border-primary-light text-dark text-xs md:text-sm rounded-lg focus:ring-primary-base focus:border-primary-light block w-full py-1 md:py-1.5 px-2 md:px-3"
                              defaultValue="+62"
                              value={item.countryCode}
                              onChange={(e) => handleInput(index, "countryCode", e.target.value)}
                            >
                              <option value="+62">+62</option>
                              <option value="+1">+1</option>
                              <option value="+2">+2</option>
                              <option value="+3">+3</option>
                              <option value="+4">+4</option>
                            </select>
                          </form>
                          <Input
                            className="mt-1 w-4/5 block rounded-lg border border-primary-light bg-white/5 py-1 md:py-1.5 px-2 md:px-3 text-xs md:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                            placeholder="Contoh: 81233334444"
                            value={item.no_telp}
                            onChange={(e) => handleInput(index, "no_telp", e.target.value)}
                          />
                        </div>
                      </Field>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      // DESKTOP layout (match Unlogged)
      <div className="bg-primary-light min-h-screen pb-28">
        <div className="max-w-5xl mx-auto grid grid-cols-5 mt-8 gap-x-7 pt-20 ">
          <h2 className="col-span-5 mb-4">Personal Informasi</h2>
          <div className="col-span-3 flex flex-col gap-3">
            {form.map((item, index) => {
              let ticketForOwner = null;
              let currentIndex = 0;

              for (const ticketItem of ticket) {
                for (let i = 0; i < (Array.isArray(ticketItem?.seat_number) ? ticketItem?.seat_number.length : ticketItem?.seat_number ? JSON.parse(String(ticketItem.seat_number)).length : ticketItem.qty_ticket); i++) {
                  if (currentIndex === index - 1) {
                    ticketForOwner = {
                      ...ticketItem,
                      seat_number: Array.isArray(ticketItem?.seat_number) ? ticketItem?.seat_number[i] : ticketItem?.seat_number ? JSON.parse(String(ticketItem.seat_number))[i] : undefined,
                    } as FormTicket;
                    break;
                  }
                  currentIndex++;
                }
                if (ticketForOwner) break;
              }

              if (!ticketForOwner?.seat_number && !!item.seat_number) {
                handleInput(index, "seat_number", item.seat_number ?? "");
              }

              return (
                <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm" key={index}>
                  <div className="border-b border-b-primary-light-200 px-5 py-3 flex items-center justify-between cursor-pointer" onClick={() => toggleCollapse(index)}>
                    {index > 0 && <FontAwesomeIcon icon={faTicket} className="text-primary shrink-0 mr-[10px]" />}
                    <Stack gap={0} className={`flex-grow`}>
                      <p className="font-semibold">{index > 0 ? `${index}. ${t("ticketOwner")} ${ticketForOwner?.name} ${ticketForOwner?.seat_number ? `(Seat ${ticketForOwner?.seat_number})` : ""}` : t("registrantData")}</p>
                      {index > 0 && <p className="text-xs text-grey">1 Tiket x {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(ticketForOwner?.price ?? 0)}</p>}
                    </Stack>
                    <button className="text-grey">
                      <FontAwesomeIcon icon={faChevronUp} className={`${collapse[index] ? "rotate-0" : "rotate-180"} transition-transform`} />
                    </button>
                  </div>

                  {index > 0 && (
                    <div className="flex items-center justify-end gap-[8px] px-4 py-2 rounded-lg text-grey">
                      <p className="text-xs md:text-sm text-end">{t("useRegistrantData")}</p>
                      <Switch size="sm" onChange={(e: any) => (e.target.checked ? copyOrderer(index) : clearForm(index))} />
                    </div>
                  )}

                  <div className={`px-5 pt-3 pb-5 ${collapse[index] ? "" : "max-h-0"} transition-max-height delay-100 duration-150 ease-in-out`}>
                    <div className={`${collapse[index] ? "opacity-100" : "opacity-0"} transition-transform-opacity duration-300 delay-300 ease-in-out`}>
                      <div className={`${collapse[index] ? "visible" : "invisible"} flex flex-col gap-3`}>
                        {detail.is_noidentity ? (
                          <div className="grid grid-cols-4 gap-3">
                            <div>{/* identity selector removed in original first step; keep placeholder if needed */}</div>
                            <div className="col-span-3">
                              <InputField fullWidth type="number" label={t("ktpNumber")} placeholder={`${t("example")}: 123456789012345`} value={item.nik} onChange={(e) => handleInput(index, "nik", e.target.value)} />
                              {error.nik && <p className="text-[10px] mt-1 text-danger">Minimal NIK adalah 16 Digit</p>}
                            </div>
                          </div>
                        ) : null}

                        {detail.is_name ? <InputField fullWidth type="text" label={t("fullName")} placeholder={t("fullName")} value={item.full_name} onChange={(e) => handleInput(index, "full_name", e.target.value)} /> : null}

                        {detail.is_gender ? (
                          <Field className="mb-2">
                            <Label className="text-sm font-base text-grey">Jenis Kelamin</Label>
                            <select
                              value={item.is_gender || ""}
                              onChange={(e) => handleInput(index, "is_gender", e.target.value)}
                              className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark"
                            >
                              <option value="">Pilih Jenis Kelamin</option>
                              <option value="1">Pria</option>
                              <option value="2">Wanita</option>
                              <option value="3">Tidak Memberitahu</option>
                            </select>
                          </Field>
                        ) : null}

                        {detail.is_birthdate ? (
                          <Field className="mb-2">
                            <Label className="text-sm font-base text-grey">Tanggal Lahir</Label>
                            <Input
                              type="date"
                              value={item.birthdate || ""}
                              onChange={(e) => handleInput(index, "birthdate", e.target.value)}
                              className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark"
                            />
                          </Field>
                        ) : null}

                        {detail.is_kelas ? (
                          <Field className="mb-2">
                            <Label className="text-sm font-base text-grey">Kelas</Label>
                            <Input
                              type="text"
                              value={item.is_kelas || ""}
                              onChange={(e) => handleInput(index, "is_kelas", e.target.value)}
                              placeholder="Masukan kelas (angka)"
                              className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark"
                            />
                          </Field>
                        ) : null}

                        {detail.is_profession ? (
                          <InputField fullWidth type="text" label={t("profession")} placeholder={t("profession")} value={item.is_profession} onChange={(e) => handleInput(index, "is_profession", e.target.value)} />
                        ) : null}
                        {detail.is_company ? <InputField fullWidth type="text" label={t("company")} placeholder={t("company")} value={item.is_company} onChange={(e) => handleInput(index, "is_company", e.target.value)} /> : null}
                        {detail.is_email ? <InputField fullWidth type="text" label="Email" placeholder={`${t("example")}: example@example.com`} value={item.email} onChange={(e) => handleInput(index, "email", e.target.value)} /> : null}
                        {detail.is_phone_number ? (
                          <InputField fullWidth type="number" label={t("phoneNumber")} placeholder={`${t("example")}: 81233334444`} onChange={(e) => handleInput(index, "no_telp", e.target.value)} value={item.no_telp} />
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
              <div className="flex items-center gap-3 p-3">
                {detail && detail.image_url && <Image src={detail?.image_url} width={1000} height={1000} alt="banner" className="w-10 h-10 object-cover rounded-md" />}
                <div>
                  <p className="text-sm mb-1">{detail?.name}</p>
                  <p className="text-xs text-grey">{formatDate(detail.start_date) == formatDate(detail.end_date) ? formatDate(detail.start_date) : `${formatDate(detail.start_date)} - ${formatDate(detail.end_date)}`}</p>
                </div>
              </div>
            </div>

            <Card withBorder radius={10} p={20}>
              <Stack gap={20}>
                <Flex gap={10} align="center">
                  <Icon icon="mdi:voucher-outline" className={`text-primary-base text-[20px]`} />
                  <Text fw={600}>Voucher</Text>
                </Flex>

                {voucherFields.map((field, index) => (
                  <Group key={index}>
                    <TextInput
                      w="100%"
                      value={vouchers[index]?.name || field}
                      onChange={(e) => {
                        const newVoucherFields = [...voucherFields];
                        newVoucherFields[index] = e.currentTarget.value;
                        setVoucherFields(newVoucherFields);
                      }}
                      placeholder={`Masukan Kode Voucher ${index + 1}`}
                    />
                    <Button loading={loading.includes(`getvoucher-${index}`)} disabled={field.length < 3} size="xs" onClick={() => handleGetVoucher(index)} className={`shrink-0`}>
                      Submit
                    </Button>
                    {vouchers[index] && (
                      <>
                        <Button variant="outline" size="xs" color="red" onClick={() => handleCancelVoucher(index)} className="shrink-0">
                          Cancel
                        </Button>
                        <Icon icon="uiw:circle-check" className="text-green-500 text-[20px] shrink-0" />
                      </>
                    )}
                  </Group>
                ))}
                <Button variant="outline" size="xs" onClick={handleAddVoucherField} className="mt-2">
                  + Tambah Voucher
                </Button>
              </Stack>
            </Card>

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
                <p>{`${t("jumlah")} (${totalCount} ${t("ticket")})`}</p>
                <p className="font-semibold">{totalSubtotalPrice > 0 ? <NumberFormatter value={totalSubtotalPrice} /> : <Text>Free</Text>}</p>
              </div>

              <div className="py-3 px-4 flex justify-between items-center">
                <p>{t("adminFee")} dekstop</p>
                <p className="font-semibold">{totalTicketFee > 0 ? <NumberFormatter value={totalTicketFee} /> : <Text>Free</Text>}</p>
              </div>

              {vouchers.length > 0 && (
                <div className="py-3 px-4 flex justify-between items-center">
                  <p>Voucher</p>
                  <p className="font-semibold">
                    -<NumberFormatter value={vouchers.reduce((sum, voucher) => sum + (voucher.amount || 0), 0)} />
                  </p>
                </div>
              )}

              {detail.ppn
                ? (() => {
                    const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
                    const subtotalAfterVoucher = Math.max(totalSubtotalPrice - totalVoucher, 0);
                    const tax = detail.ppn ? Math.round((subtotalAfterVoucher + totalTicketFee) * (detail.ppn / 100)) : 0;
                    return (
                      <div className="py-3 px-4 flex justify-between items-center">
                        <p>Tax ({detail.ppn}%)</p>
                        <p className="font-semibold">{detail.ppn > 0 ? <NumberFormatter value={tax} /> : <Text>Free</Text>}</p>
                      </div>
                    );
                  })()
                : null}

              <div className="py-3 px-4 flex justify-between items-center">
                <p>{t("totalPayment")}</p>
                <p className="font-semibold">
                  {(() => {
                    const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
                    const subtotalAfterVoucher = Math.max(totalSubtotalPrice - totalVoucher, 0);
                    const tax = detail.ppn ? Math.round((subtotalAfterVoucher + totalTicketFee) * (detail.ppn / 100)) : 0;
                    const grandTotal = subtotalAfterVoucher + totalTicketFee + tax;
                    return grandTotal > 0 ? <NumberFormatter value={grandTotal} /> : <Text>Free</Text>;
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))
  );
};

export default FirstStep;
