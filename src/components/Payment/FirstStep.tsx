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

import { useEffect, useState, useMemo } from "react";
import { Modal } from "@mantine/core";
import useWindowSize from "@/utils/useWindowSize";
import { EventProps, TicketProps } from "@/utils/globalInterface";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Field, Label, Input } from "@headlessui/react";
import { faChevronUp, faTicket } from "@fortawesome/free-solid-svg-icons";
import InputField from "../Input";
import { formatDate } from "@/utils/useFormattedDate";
import { Switch } from "@nextui-org/react";
import useLoggedUser from "@/utils/useLoggedUser";
import React from "react";
import { Button, Card, Flex, Group, NumberFormatter, Stack, Text, TextInput, Badge, Divider } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react/dist/iconify.js";
import fetch from "@/utils/fetch";
import { useListState } from "@mantine/hooks";
import moment from "moment";
import { notifications } from "@mantine/notifications";
import InputSelect from "../Input/Select";

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
  data?: TicketProps[];
}

interface ErrorForm {
  nik: boolean;
  nama: boolean;
  email: boolean;
  countryCode: boolean;
  phone: boolean;
  nikLength?: boolean;
  phoneFormat?: boolean;
  phoneLength?: boolean;
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
  gender?: string; // Changed from is_gender
  birthdate?: string;
  kelas?: string; // Changed from is_kelas
  assistant?: string; // Changed from is_assistant
  is_insurance?: number;
  // Merchandise fields
  merch_size?: string;
  merch_product_name?: string;
  merch_product_id?: number;
  merch_image_url?: string;
  merch_price?: number;
  merch_variant_id?: number;
  merch_variant_name?: string;
  event_merch_id?: number;
}

interface EventMerchandise {
  id: number;
  event_id: number;
  event_ticket_id: number;
  product_id: number;
  title: string;
  price: number;
  stock_qty: number;
  max_per_ticket: number;
  is_required: number;
  is_active: number;
  product: {
    id: number;
    product_name: string;
    slug: string;
    average_star: string;
    total_review: number;
    total_sold: number;
    product_image?: {
      id: number;
      product_id: number;
      image: string;
      image_url: string;
    }[];
  };
  varians: {
    id: number;
    product_id: number;
    varian_name: string;
    sku: string;
    price: string;
    stock_qty: number;
  }[];
}

interface EventDetailWithMerch extends EventProps {
  has_merches?: EventMerchandise[];
}

interface StepPaymentProps {
  detail: EventDetailWithMerch;
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

type Detail = { ppn?: any; ppn_type?: any; [k: string]: any };

const normalizeDetail = (detail: Detail) => {
  const normalized: Detail = { ...detail };

  const rawType = detail?.ppn_type;
  if (rawType === null || rawType === undefined || rawType === "" || rawType === "null") {
    normalized.ppn_type = "percentage";
  } else {
    normalized.ppn_type = String(rawType);
  }

  const rawPpn = detail?.ppn;
  if (rawPpn === null || rawPpn === undefined || rawPpn === "" || rawPpn === "null") {
    normalized.ppn = 0;
  } else {
    const n = Number(rawPpn);
    normalized.ppn = Number.isNaN(n) ? 0 : n;
  }

  const rawAdminFee = detail?.admin_fee;
  if (rawAdminFee === null || rawAdminFee === undefined || rawAdminFee === "" || rawAdminFee === "null") {
    normalized.admin_fee = 7000;
  } else {
    const af = Number(rawAdminFee);
    normalized.admin_fee = Number.isNaN(af) ? 7000 : af;
  }

  return normalized;
};

const validateNIK = (nik: string): { isValid: boolean; errorMessage?: string } => {
  const cleanedNIK = nik.replace(/\D/g, "");

  if (cleanedNIK.length < 16) {
    return {
      isValid: false,
      errorMessage: "NIK harus 16 digit",
    };
  }

  if (cleanedNIK.length > 16) {
    return {
      isValid: false,
      errorMessage: "Maksimal NIK adalah 16 digit",
    };
  }

  return { isValid: true };
};

const validatePhoneNumber = (phone: string): { isValid: boolean; errorMessage?: string } => {
  const cleanedPhone = phone.replace(/\D/g, "");

  if (cleanedPhone.startsWith("62")) {
    return {
      isValid: false,
      errorMessage: "Nomor telepon tidak boleh dimulai dengan 62",
    };
  }

  if (cleanedPhone.startsWith("0")) {
    return {
      isValid: false,
      errorMessage: "Nomor telepon tidak boleh dimulai dengan 0",
    };
  }

  if (cleanedPhone.length > 13) {
    return {
      isValid: false,
      errorMessage: "Maksimal 13 digit",
    };
  }

  if (cleanedPhone.length < 9) {
    return {
      isValid: false,
      errorMessage: "Nomor telepon terlalu pendek (minimal 9 digit)",
    };
  }

  if (!/^\d+$/.test(cleanedPhone)) {
    return {
      isValid: false,
      errorMessage: "Format nomor telepon tidak valid",
    };
  }

  return { isValid: true };
};

const FirstStep = ({ onSubmitVoucher, onCancelVoucher, detail, haveVoucher, ticket, totalCount, onSubmit, form, setForm, error, totalSubtotalPrice, setFormValid }: StepPaymentProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useListState<string>([]);
  const [voucherFields, setVoucherFields] = useState([""]);
  const [vouchers, setVouchers] = useState<{ name: string; amount: number }[]>([]);
  const { width } = useWindowSize();
  const userData = useLoggedUser();
  const [collapse, setCollapse] = useState<boolean[]>(form.map((_, index) => index === 0));
  const [displayValues, setDisplayValues] = useState<{ [key: number]: string }>({});
  const [fieldErrors, setFieldErrors] = useState<{
    [key: number]: {
      nik?: string;
      phone?: string;
      email?: string;
      [key: string]: string | undefined;
    };
  }>({});

  const [insuranceChecked, setInsuranceChecked] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);

  // State untuk merchandise
  const [merchProducts, setMerchProducts] = useState<any[]>([]);
  const [selectedMerchImages, setSelectedMerchImages] = useState<{ [key: number]: string }>({});
  const [loadingMerch, setLoadingMerch] = useState<boolean>(false);
  const [selectedProductForPreview, setSelectedProductForPreview] = useState<any>(null);
  const [selectedProductImage, setSelectedProductImage] = useState<string>("");
  const [productPreviewModalOpen, setProductPreviewModalOpen] = useState(false);

  const hasInsuranceData = detail?.has_insurances && detail.has_insurances.length > 0;
  const firstInsurance = hasInsuranceData ? detail.has_insurances?.[0] : null;
  const insuranceInfo = {
    title: firstInsurance?.title ?? "Tidak ada asuransi",
    description: firstInsurance?.description ?? "Tidak ada Deskripsi",
    provider: firstInsurance?.insurance?.name ?? "",
    address: firstInsurance?.insurance?.address ?? "",
    hasInsurance: hasInsuranceData,
  };

  // Fungsi untuk mendapatkan informasi tiket untuk pemilik tiket tertentu
  const getTicketInfoForOwner = (index: number) => {
    if (index === 0) return { isBundlingMerch: false, ticketName: "", seatNumber: "", ticketPrice: 0, eventTicketId: 0 };

    let currentIndex = 0;
    for (const ticketItem of ticket) {
      const seatNumbers = Array.isArray(ticketItem.seat_number)
        ? ticketItem.seat_number
        : typeof ticketItem.seat_number === "string" && ticketItem.seat_number.trim() !== ""
          ? JSON.parse(ticketItem.seat_number)
          : Array.from({ length: ticketItem.qty_ticket }, (_, i) => undefined);

      for (let i = 0; i < seatNumbers.length; i++) {
        if (currentIndex === index - 1) {
          const ticketDetail = detail.has_event_ticket?.find((t) => t.id === ticketItem.event_ticket_id);
          const isBundlingMerch = ticketDetail ? ticketDetail.is_bundling_merch === 1 : false;

          return {
            isBundlingMerch,
            ticketName: ticketItem.name,
            seatNumber: seatNumbers[i] || undefined,
            ticketPrice: ticketItem.price,
            eventTicketId: ticketItem.event_ticket_id,
          };
        }
        currentIndex++;
      }
    }
    return { isBundlingMerch: false, ticketName: "", seatNumber: "", ticketPrice: 0, eventTicketId: 0 };
  };

  // Fungsi untuk membuka modal preview produk
  const openProductImageModal = (product: any) => {
    if (product) {
      setSelectedProductForPreview(product);
      if (product.product_image && product.product_image.length > 0 && product.product_image[0]?.image_url) {
        setSelectedProductImage(product.product_image[0].image_url);
      } else {
        setSelectedProductImage("");
      }
      setProductPreviewModalOpen(true);
    }
  };

  const closeProductImageModal = () => {
    setSelectedProductForPreview(null);
    setSelectedProductImage("");
    setProductPreviewModalOpen(false);
  };

  // Fungsi untuk mengambil produk merchandise dari event
  const fetchMerchProductsFromEvent = () => {
    try {
      setLoadingMerch(true);

      if (detail?.has_merches && Array.isArray(detail.has_merches)) {
        const filteredMerches = detail.has_merches.filter((merch: EventMerchandise) => merch.is_active === 1 && merch.stock_qty > 0);

        const convertedProducts: any[] = filteredMerches.map((merch: EventMerchandise) => ({
          id: merch.product_id,
          product_name: merch.product.product_name,
          price: merch.price.toString(),
          qty: merch.stock_qty,
          product_status_id: 2,
          product_image: merch.product.product_image || [],
          slug: merch.product.slug,
          average_star: merch.product.average_star,
          total_review: merch.product.total_review,
          total_sold: merch.product.total_sold,
          event_merch_data: {
            event_merch_id: merch.id,
            title: merch.title,
            max_per_ticket: merch.max_per_ticket,
            is_required: merch.is_required,
            varians: merch.varians,
          },
        }));

        setMerchProducts(convertedProducts);

        const initialImages: { [key: number]: string } = {};
        convertedProducts.forEach((product: any) => {
          if (product.product_image && product.product_image.length > 0 && product.product_image[0]?.image_url) {
            initialImages[product.id] = product.product_image[0].image_url;
          }
        });
        setSelectedMerchImages(initialImages);
      } else {
        setMerchProducts([]);
      }
    } catch (error: any) {
      console.error("Error processing merch products from event:", error);
      notifications.show({
        color: "red",
        position: "top-right",
        message: "Gagal memuat data merchandise",
      });
      setMerchProducts([]);
    } finally {
      setLoadingMerch(false);
    }
  };

  // Fungsi untuk mendapatkan variant merchandise berdasarkan productId
  const getMerchVariants = (productId: number) => {
    const product = merchProducts.find((p) => p.id === productId);
    if (!product || !product.event_merch_data?.varians) return [];

    return product.event_merch_data.varians;
  };

  useEffect(() => {
    if (detail?.insurance_required === 1) {
      setInsuranceChecked(true);
    } else {
      setInsuranceChecked(false);
    }
  }, [detail?.insurance_required]);

  // Cek apakah ada tiket yang memiliki bundling merchandise
  useEffect(() => {
    const hasBundlingMerchTickets = ticket.some((ticketItem) => {
      const ticketDetail = detail.has_event_ticket?.find((t) => t.id === ticketItem.event_ticket_id);
      return ticketDetail?.is_bundling_merch === 1;
    });

    if (hasBundlingMerchTickets) {
      fetchMerchProductsFromEvent();
    }
  }, [detail?.has_event_ticket, ticket]);

  const calculateInsuranceTotal = () => {
    if (!insuranceChecked || !detail?.insurance_amount || displayTotalCount === 0) return 0;
    return detail.insurance_amount * displayTotalCount;
  };

  const computeTax = (detail: any, subtotalAfterVoucher: number) => {
    const d = normalizeDetail(detail);

    const ppnType = d.ppn_type;
    const ppnValue = Number(d.ppn);

    if (ppnType === "percentage") {
      const tax = Math.round(subtotalAfterVoucher * (ppnValue / 100));
      return { tax, label: `${ppnValue}%`, ppnType };
    } else if (ppnType === "nominal") {
      const tax = Math.round(ppnValue);
      return { tax, label: "", ppnType };
    }

    return { tax: 0, label: "0", ppnType };
  };

  useEffect(() => {
    if (userData) {
      userData.name && handleInput(0, "full_name", userData.name);
      userData.email && handleInput(0, "email", userData.email);
    }
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

  const toggleCollapse = (index: number) => {
    setCollapse((prev) => {
      let newCollapse = [...prev];
      newCollapse[index] = !newCollapse[index];
      return newCollapse;
    });
  };

  const handleInput = (index: number, field: keyof Form, value: string) => {
    let newForm = [...form];

    if (field === "no_telp") {
      const displayVal = value.replaceAll(/\D/g, "");
      setDisplayValues((prev) => ({ ...prev, [index]: displayVal }));

      const phoneForBackend = "62" + displayVal;
      newForm[index] = { ...newForm[index], [field]: phoneForBackend };

      if (detail.is_phone_number == 1) {
        const validation = validatePhoneNumber(displayVal);

        if (!validation.isValid) {
          setFieldErrors((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              phone: validation.errorMessage,
            },
          }));
        } else {
          setFieldErrors((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              phone: undefined,
            },
          }));
        }
      }
    } else if (field === "nik") {
      const numericValue = value.replace(/\D/g, "").slice(0, 16);
      newForm[index] = { ...newForm[index], [field]: numericValue };

      if (detail.is_noidentity == 1) {
        const validation = validateNIK(numericValue);

        if (!validation.isValid) {
          setFieldErrors((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              nik: validation.errorMessage,
            },
          }));
        } else {
          setFieldErrors((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              nik: undefined,
            },
          }));
        }
      }
    } else if (field === "merch_product_name") {
      const selectedProduct = merchProducts.find((product) => product.product_name === value);
      if (selectedProduct) {
        newForm[index] = {
          ...newForm[index],
          [field]: value,
          merch_product_id: selectedProduct.id,
          event_merch_id: selectedProduct.event_merch_data.event_merch_id,
          merch_price: parseFloat(selectedProduct.price) || 0,
          merch_variant_id: undefined,
          merch_variant_name: "",
        };
      }
    } else if (field === "email") {
      newForm[index] = { ...newForm[index], [field]: value };

      if (detail.is_email == 1 && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setFieldErrors((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              email: "Format email tidak valid",
            },
          }));
        } else {
          setFieldErrors((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              email: undefined,
            },
          }));
        }
      }
    } else {
      newForm[index] = { ...newForm[index], [field]: value };
    }

    setForm(newForm);
    const isFormValid = newForm.every(formValidation);
    setFormValid(isFormValid);
  };

  const copyOrderer = (targetIndex: number) => {
    if (form.length > 0 && targetIndex > 0 && targetIndex < form.length) {
      let newForm = [...form];
      newForm[targetIndex] = { ...newForm[0], is_pemesan: 0 };
      setForm(newForm);

      if (displayValues[0]) {
        setDisplayValues((prev) => ({
          ...prev,
          [targetIndex]: displayValues[0],
        }));
      }

      setFieldErrors((prev) => ({
        ...prev,
        [targetIndex]: {},
      }));

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
        gender: "",
        birthdate: "",
        kelas: "",
        assistant: "",
        merch_size: "",
        merch_product_name: "",
        merch_product_id: undefined,
        event_merch_id: undefined,
        merch_image_url: "",
        merch_price: 0,
        merch_variant_id: undefined,
        merch_variant_name: "",
      };
      setForm(newForm);

      setDisplayValues((prev) => ({
        ...prev,
        [targetIndex]: "",
      }));

      setFieldErrors((prev) => ({
        ...prev,
        [targetIndex]: {},
      }));

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
        const isMinTransactionValid = displayTotalSubtotalPrice >= voucher.min_transaction;

        let discount = 0;

        if (voucher.is_multiply) {
          discount = voucher.type == "persentase" ? ((displayTotalSubtotalPrice * voucher.discount) / 100) * displayTotalCount : voucher.discount * displayTotalCount;
        } else {
          discount = voucher.type == "persentase" ? (displayTotalSubtotalPrice * voucher.discount) / 100 : voucher.discount;
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

  const getBundlingInfo = (event_ticket_id: number) => {
    if (!detail.has_event_ticket) return { isBundling: false, bundlingQty: 0 };

    const ticket = detail.has_event_ticket.find((t) => t.id === event_ticket_id);
    return {
      isBundling: ticket ? ticket.is_bundling === 1 : false,
      bundlingQty: ticket ? ticket.bundling_qty : 0,
    };
  };

  const displayTotalCount = useMemo(() => {
    if (!ticket || ticket.length === 0) return 0;

    let count = 0;

    ticket.forEach((item) => {
      const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);

      if (isBundling && bundlingQty >= 2 && bundlingQty <= 99) {
        const packageCount = Math.floor(item.qty_ticket / bundlingQty);
        count += packageCount;
      } else {
        count += item.qty_ticket;
      }
    });

    return count;
  }, [ticket]);

  const displayTotalSubtotalPrice = useMemo(() => {
    if (!ticket || ticket.length === 0) return 0;

    let total = 0;

    ticket.forEach((item) => {
      const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);

      if (isBundling && bundlingQty >= 2 && bundlingQty <= 99) {
        const packageCount = Math.floor(item.qty_ticket / bundlingQty);
        total += item.price * packageCount;
      } else {
        total += item.price * item.qty_ticket;
      }
    });

    return total;
  }, [ticket]);

  const totalTicketFee = useMemo(() => {
    if (!ticket || ticket.length === 0) return 0;

    let totalFee = 0;

    ticket.forEach((item) => {
      const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);
      const fee = item.ticket_fee || 0;

      if (isBundling && bundlingQty >= 2 && bundlingQty <= 99) {
        const packageCount = Math.floor(item.qty_ticket / bundlingQty);
        totalFee += fee * packageCount;
      } else {
        totalFee += fee * item.qty_ticket;
      }
    });

    return totalFee;
  }, [ticket]);

  const adminFee = totalTicketFee;

  const calculateGrandTotal = () => {
    const subtotalTiket = displayTotalSubtotalPrice;
    const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
    const subtotalAfterVoucher = Math.max(subtotalTiket - totalVoucher, 0);
    const insuranceTotal = calculateInsuranceTotal();
    const { tax } = computeTax(detail, subtotalAfterVoucher);

    return subtotalAfterVoucher + adminFee + tax + insuranceTotal;
  };

  const eventHasInsurance = detail?.is_insurance === 1;
  const insuranceRequired = detail?.insurance_required === 1;

  useEffect(() => {
    if (insuranceRequired) {
      setInsuranceChecked(true);
    }
  }, [insuranceRequired]);

  return (
    width &&
    (width < 768 ? (
      // MOBILE LAYOUT
      <div className="bg-primary-light pt-2 sm:pt-3 px-1.5 sm:px-2" style={{ paddingBottom: 160 }}>
        <div className="border-b p-1.5 sm:p-2 border-primary-light flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <div className="px-1 sm:px-1.5 py-0.5 sm:py-1 border rounded-md border-primary-light shrink-0">
            {detail && detail.image_url && <Image src={detail?.image_url} width={1000} height={1000} alt="banner" className="w-6 sm:w-8 h-6 sm:h-8 object-cover rounded-sm" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold truncate">{detail?.name}</p>
            <p className="text-xs text-grey">
              {displayTotalCount} {ticket.some((item) => getBundlingInfo(item.event_ticket_id).isBundling) ? "Paket" : "Tiket"}
            </p>
          </div>
        </div>

        {/* Voucher Section */}
        <Card withBorder radius={8} p="xs" className="mb-2 sm:mb-3">
          <Stack gap="xs">
            <Flex gap={4} align="center">
              <Icon icon="mdi:voucher-outline" className={`text-primary-base text-xs sm:text-sm`} />
              <Text fw={600} size="xs">
                Voucher
              </Text>
            </Flex>

            {voucherFields.map((field, index) => (
              <Group key={index} gap={4}>
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
            <Button variant="outline" size="xs" onClick={handleAddVoucherField} className="mt-0.5 sm:mt-1 text-xs">
              + Tambah
            </Button>
          </Stack>
        </Card>

        {/* Order Summary */}
        <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm mb-2 sm:mb-3">
          <div className="border-b border-b-primary-light-200 p-1.5 sm:p-2">
            <p className="font-semibold text-xs sm:text-sm">Ringkasan</p>
          </div>

          {ticket.map((item: FormTicket) => {
            const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);

            let displayQty = item.qty_ticket;
            let packageCount = 1;

            if (isBundling && bundlingQty >= 2 && bundlingQty <= 99) {
              packageCount = Math.floor(item.qty_ticket / bundlingQty);
              displayQty = packageCount;
            }

            const bundlingInfo = isBundling && bundlingQty >= 2 && bundlingQty <= 99 ? ` (paket ${bundlingQty} orang)` : "";
            const displaySubtotal = isBundling && bundlingQty >= 2 && bundlingQty <= 99 ? item.price * packageCount : item.price * item.qty_ticket;

            return (
              <div className="border-b p-3 border-primary-light-200 flex gap-3" key={item.event_ticket_id}>
                <div className="px-3 flex items-center border rounded-md border-primary-light">
                  <FontAwesomeIcon icon={faTicket} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm mb-1 font-semibold">
                    {item.name}
                    {bundlingInfo}
                  </p>
                  <p className="text-xs text-grey">
                    {displayQty} {displayQty === 1 ? "Paket" : "Paket"} x {item.price} = Rp {displaySubtotal.toLocaleString("id-ID")}
                    {isBundling && bundlingQty >= 2 && bundlingQty <= 99 && <span className="text-[10px] text-gray-500 block">({item.qty_ticket} tiket fisik)</span>}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Order Summary Details */}
          <div className="py-2 sm:py-3 px-2 sm:px-4 flex justify-between items-center text-xs border-t border-primary-light-200">
            <p>
              {`Jumlah (${displayTotalCount} ${
                ticket.some((item) => {
                  const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);
                  return isBundling && bundlingQty >= 2 && bundlingQty <= 99;
                })
                  ? "Paket"
                  : "Tiket"
              })`}
            </p>
            <p className="font-semibold">{displayTotalSubtotalPrice > 0 ? <NumberFormatter value={displayTotalSubtotalPrice} /> : <Text>Free</Text>}</p>
          </div>

          {vouchers.length > 0 && (
            <div className="py-2 sm:py-3 px-2 sm:px-4 flex justify-between items-center text-xs sm:text-sm">
              <p>Total Voucher</p>
              <p className="font-semibold">
                -<NumberFormatter value={vouchers.reduce((sum, voucher) => sum + (voucher.amount || 0), 0)} />
              </p>
            </div>
          )}

          {(() => {
            const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
            const subtotalAfterVoucher = Math.max(displayTotalSubtotalPrice - totalVoucher, 0);
            return (
              <div className="py-2 sm:py-3 px-2 sm:px-4 flex justify-between items-center text-xs sm:text-sm">
                <p>Subtotal</p>
                <p className="font-semibold">
                  <NumberFormatter value={subtotalAfterVoucher} />
                </p>
              </div>
            );
          })()}

          {/* Insurance Section */}
          {detail?.is_insurance === 1 && (
            <>
              <div className="border-b p-3 border-primary-light-200 flex gap-3 items-center justify-between" key="asuransi">
                <div className="flex items-center gap-3">
                  <div className="px-3 flex items-center border rounded-md border-primary-light">
                    <Icon icon="mdi:shield-check" className="text-primary" />
                  </div>
                  <div>
                    <button onClick={() => setInsuranceModalOpen(true)} className="text-sm mb-1 font-semibold hover:text-primary transition-colors text-left">
                      Pakai Asuransi
                    </button>
                    <p className="text-xs text-grey">
                      Rp {detail?.insurance_amount?.toLocaleString("id-ID") || "0"} per tiket
                      {insuranceChecked && <span className="block text-xs text-blue-600">+Rp {calculateInsuranceTotal().toLocaleString("id-ID")}</span>}
                    </p>
                  </div>
                </div>

                {detail?.insurance_required === 0 ? (
                  <input type="checkbox" className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2" checked={insuranceChecked} onChange={(e) => setInsuranceChecked(e.target.checked)} />
                ) : (
                  <div className="text-xs text-primary font-semibold">Wajib</div>
                )}
              </div>

              <Modal opened={insuranceModalOpen} onClose={() => setInsuranceModalOpen(false)} title="Ketentuan Asuransi" size="lg" centered>
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                  <div className="w-full sm:w-1/4 flex flex-col items-center justify-center">
                    <div className="bg-blue-50 p-4 rounded-full mb-3">
                      <Icon icon="mdi:shield-check" className="text-blue-600 text-4xl" />
                    </div>
                    <p className="text-sm font-semibold text-center">Proteksi Tiket Anda</p>
                  </div>

                  <div className="w-full sm:w-3/4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">{insuranceInfo.title}</h4>
                        <p className="text-xs text-gray-600">{insuranceInfo.description}</p>
                      </div>

                      <div className="pt-2">
                        <p className="text-xs text-gray-500">
                          Biaya asuransi: <span className="font-semibold">Rp {detail?.insurance_amount?.toLocaleString("id-ID") || "2.000"} per tiket</span>
                        </p>
                        {detail?.insurance_required === 1 && <p className="text-xs text-red-500 mt-1">*Asuransi wajib untuk event ini</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex justify-end">
                  <Button onClick={() => setInsuranceModalOpen(false)} size="xs">
                    Mengerti
                  </Button>
                </div>
              </Modal>
            </>
          )}

          {/* Tax */}
          {detail?.ppn !== undefined &&
            (() => {
              const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
              const subtotalAfterVoucher = Math.max(displayTotalSubtotalPrice - totalVoucher, 0);
              const { tax, label, ppnType } = computeTax(detail, subtotalAfterVoucher);

              if (tax > 0) {
                return (
                  <div className="py-3 px-4 flex justify-between items-center">
                    <p>{ppnType === "nominal" ? `Tax ${label}` : `Tax (${label})`}</p>
                    <p className="font-semibold">
                      <NumberFormatter value={tax} />
                    </p>
                  </div>
                );
              }
              return null;
            })()}

          {/* Admin Fee */}
          {adminFee > 0 && (
            <div className="py-3 px-4 flex justify-between items-center">
              <p>Biaya Admin</p>
              <p className="font-semibold">
                <NumberFormatter value={adminFee} />
              </p>
            </div>
          )}

          {/* Grand Total */}
          <div className="py-2 sm:py-3 px-2 sm:px-4 flex justify-between items-center text-xs sm:text-sm border-t border-primary-light-200">
            <p>Total Pembayaran</p>
            <p className="font-semibold">
              {(() => {
                const grandTotal = calculateGrandTotal();
                return grandTotal > 0 ? <NumberFormatter value={grandTotal} /> : <Text>Free</Text>;
              })()}
            </p>
          </div>
        </div>

        {/* Form Section */}
        {form.map((item, index) => {
          const ticketInfo = getTicketInfoForOwner(index);
          const selectedProduct = item.merch_product_id ? merchProducts.find((p) => p.id === item.merch_product_id) : null;
          const availableVariants = selectedProduct ? getMerchVariants(item.merch_product_id!) : [];

          return (
            <div className="bg-white mt-1 sm:mt-1.5" key={index}>
              <div className="border-b py-1.5 sm:py-2 px-1.5 sm:px-3 border-primary-light flex items-start justify-between cursor-pointer gap-1 sm:gap-2" onClick={() => toggleCollapse(index)}>
                {index > 0 && <FontAwesomeIcon icon={faTicket} className="text-primary shrink-0 mt-0.5 sm:mt-1 text-xs sm:text-sm" />}
                <Stack gap={0} className={`flex-grow min-w-0`}>
                  <p className="font-semibold text-xs sm:text-sm leading-tight">{index > 0 ? `${index}. Pemilik Tiket ${ticketInfo.ticketName} ${ticketInfo.seatNumber ? `(Seat ${ticketInfo.seatNumber})` : ""}` : "Data Pemesan"}</p>
                  {index > 0 && ticketInfo.seatNumber && <p className="text-xs text-grey leading-tight">Seat {ticketInfo.seatNumber}</p>}
                  {index > 0 && <p className="text-xs text-grey leading-tight">1 Tiket x {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(ticketInfo.ticketPrice ?? 0)}</p>}
                </Stack>
                <button className="text-grey shrink-0 mt-0.5 sm:mt-1">
                  <FontAwesomeIcon icon={faChevronUp} className={`${collapse[index] ? "rotate-0" : "rotate-180"} transition-transform text-xs sm:text-sm`} />
                </button>
              </div>

              {index > 0 && (
                <div className="flex items-center justify-end gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-grey flex-wrap sm:flex-nowrap">
                  <p className="text-xs text-end">Gunakan Data Pemesan</p>
                  <Switch size="sm" onChange={(e: any) => (e.target.checked ? copyOrderer(index) : clearForm(index))} />
                </div>
              )}

              <div className={`border-b p-2 sm:p-3 border-primary-light ${collapse[index] ? "max-h-[26rem]" : "max-h-0"} transition-max-height delay-100 duration-150 ease-in-out`}>
                <div className={`${collapse[index] ? "opacity-100" : "opacity-0"} transition-transform-opacity duration-300 delay-300 ease-in-out`}>
                  <div className={`${collapse[index] ? "visible delay-300 duration-300" : "invisible"} transition-transform space-y-1.5 sm:space-y-2`}>
                    {detail.is_noidentity && (
                      <Field className="mb-1.5 sm:mb-2">
                        <div>
                          <InputSelect
                            label="Identitas"
                            required
                            onChange={(e) => handleInput(index, "identity_type_id", e.target.value)}
                            options={[
                              { key: "1", label: "KTP" },
                              { key: "2", label: "SIM" },
                              { key: "3", label: "Kartu Pelajar" },
                              { key: "4", label: "Passport" },
                              { key: "5", label: "KTM" },
                            ]}
                          />
                        </div>
                        <Label className="text-xs sm:text-sm font-base text-grey">Nomor Induk KTP</Label>
                        <Input
                          type="text"
                          className={`${
                            fieldErrors[index]?.nik ? "border-danger" : "border-primary-light"
                          } [&::-webkit-inner-spin-button]:appearance-none mt-0.5 sm:mt-1 block w-full rounded-lg border bg-white/5 py-1 px-2 text-xs sm:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200`}
                          placeholder="3277*************"
                          value={item.nik}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/\D/g, "").slice(0, 16);
                            handleInput(index, "nik", numericValue);
                          }}
                          maxLength={16}
                        />
                        {fieldErrors[index]?.nik && <p className="text-[8px] sm:text-[9px] mt-0.5 text-danger">{fieldErrors[index]?.nik}</p>}
                      </Field>
                    )}

                    {detail.is_name && (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Nama Lengkap</Label>
                        <Input
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                          placeholder="Nama Lengkap"
                          value={item.full_name}
                          onChange={(e) => handleInput(index, "full_name", e.target.value)}
                        />
                      </Field>
                    )}

                    {detail.is_assistant == 1 && (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Assistant</Label>
                        <Input
                          type="text"
                          value={item.assistant || ""}
                          onChange={(e) => handleInput(index, "assistant", e.target.value)}
                          placeholder="Nama Assistant"
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                        />
                      </Field>
                    )}

                    {detail.is_gender == 1 && (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Jenis Kelamin</Label>
                        <select
                          value={item.gender || ""}
                          onChange={(e) => handleInput(index, "gender", e.target.value)}
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm text-dark"
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="Pria">Pria</option>
                          <option value="Wanita">Wanita</option>
                          <option value="Tidak Memberitahu">Tidak Memberitahu</option>
                        </select>
                      </Field>
                    )}

                    {detail.is_birthdate == 1 && (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Tanggal Lahir</Label>
                        <Input
                          type="date"
                          value={item.birthdate || ""}
                          onChange={(e) => handleInput(index, "birthdate", e.target.value)}
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm text-dark"
                        />
                      </Field>
                    )}

                    {detail.is_kelas == 1 && (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Kelas</Label>
                        <Input
                          type="text"
                          value={item.kelas || ""}
                          onChange={(e) => handleInput(index, "kelas", e.target.value)}
                          placeholder="Masukan kelas (angka)"
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm text-dark"
                        />
                      </Field>
                    )}

                    {detail.is_profession == 1 && (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Profesi / Pekerjaan</Label>
                        <Input
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                          placeholder="Profesi atau pekerjaan"
                          value={item.is_profession}
                          onChange={(e) => handleInput(index, "is_profession", e.target.value)}
                        />
                      </Field>
                    )}

                    {detail.is_company == 1 && (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Perusahaan / Organisasi</Label>
                        <Input
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                          placeholder="Perusahaan atau organisasi"
                          value={item.is_company}
                          onChange={(e) => handleInput(index, "is_company", e.target.value)}
                        />
                      </Field>
                    )}

                    {detail.is_email == 1 && (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Email</Label>
                        <Input
                          type="email"
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                          placeholder="Contoh: example@example.com"
                          value={item.email}
                          onChange={(e) => handleInput(index, "email", e.target.value)}
                        />
                        {fieldErrors[index]?.email && <p className="text-[8px] sm:text-[9px] mt-0.5 text-danger">{fieldErrors[index]?.email}</p>}
                      </Field>
                    )}

                    {detail.is_phone_number == 1 && (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">No Telepon</Label>
                        <div className="flex gap-1 sm:gap-2 items-center">
                          <form className="max-w-sm block mt-0.5 sm:mt-1">
                            <select
                              id="countries"
                              className="bg-gray-50 border border-primary-light text-dark text-xs sm:text-sm rounded-lg focus:ring-primary-base focus:border-primary-light block w-full py-1 sm:py-1.5 px-1.5 sm:px-2"
                              value={item.countryCode}
                              onChange={(e) => handleInput(index, "countryCode", e.target.value)}
                            >
                              <option value="+62">+62</option>
                            </select>
                          </form>
                          <Input
                            className={`${
                              fieldErrors[index]?.phone ? "border-danger" : "border-primary-light"
                            } mt-0.5 sm:mt-1 w-4/5 block rounded-lg border bg-white/5 py-1 sm:py-1.5 px-1.5 sm:px-2 text-xs sm:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200`}
                            placeholder="Contoh: 81234567890"
                            value={displayValues[index] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numericValue = value.replace(/\D/g, "");
                              handleInput(index, "no_telp", numericValue);
                            }}
                            type="tel"
                            maxLength={13}
                          />
                        </div>
                        {fieldErrors[index]?.phone && <p className="text-[8px] sm:text-[9px] mt-0.5 text-danger">{fieldErrors[index]?.phone}</p>}
                      </Field>
                    )}

                    {/* Merchandise Bundling Section */}
                    {index > 0 && ticketInfo.isBundlingMerch && (
                      <div className="border-t pt-3 mt-3">
                        <p className="font-semibold text-sm mb-2">Bundling Merchandise</p>

                        <div className="space-y-2">
                          {merchProducts.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Field className="mb-2 flex-1">
                                <Label className="text-xs font-base text-grey">Nama Produk</Label>
                                <div className="flex gap-2 items-center">
                                  <select
                                    className="mt-1 flex-1 rounded-lg border border-primary-light-200 bg-white/5 py-1 px-2 text-xs text-dark focus:outline-none"
                                    value={item.merch_product_name || ""}
                                    onChange={(e) => handleInput(index, "merch_product_name", e.target.value)}
                                  >
                                    <option value="">Pilih Produk</option>
                                    {merchProducts.map((product) => (
                                      <option key={product.id} value={product.product_name}>
                                        {product.product_name}
                                      </option>
                                    ))}
                                  </select>

                                  {item.merch_product_name && selectedProduct && (
                                    <div
                                      className="w-8 h-8 mt-1 rounded overflow-hidden border border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                                      onClick={() => openProductImageModal(selectedProduct)}
                                      title="Klik untuk preview"
                                    >
                                      {selectedProduct.product_image && selectedProduct.product_image.length > 0 && selectedProduct.product_image[0]?.image_url ? (
                                        <Image src={selectedProduct.product_image[0].image_url} alt={selectedProduct.product_name} width={32} height={32} className="w-full h-full object-cover" />
                                      ) : (
                                        <Icon icon="mdi:tshirt-crew" className="text-gray-400 text-xs" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </Field>
                            </div>
                          )}

                          {item.merch_product_name && availableVariants.length > 0 && (
                            <Field className="mb-2">
                              <Label className="text-xs font-base text-grey">Variant</Label>
                              <select
                                className="mt-1 block w-full rounded-lg border border-primary-light-200 bg-white/5 py-1 px-2 text-xs text-dark focus:outline-none"
                                value={item.merch_variant_id?.toString() || ""}
                                onChange={(e) => {
                                  const variantId = parseInt(e.target.value);
                                  const selectedVariant = availableVariants.find((v: any) => v.id === variantId);
                                  if (selectedVariant) {
                                    const newForm = [...form];
                                    newForm[index] = {
                                      ...newForm[index],
                                      merch_variant_id: variantId,
                                      merch_variant_name: selectedVariant.varian_name,
                                      merch_price: parseFloat(selectedVariant.price) || parseFloat(selectedProduct?.price || "0"),
                                    };
                                    setForm(newForm);
                                  }
                                }}
                              >
                                <option value="">Pilih Variant</option>
                                {availableVariants.map((variant: any) => (
                                  <option key={variant.id} value={variant.id}>
                                    {variant.varian_name}
                                  </option>
                                ))}
                              </select>
                            </Field>
                          )}

                          {item.merch_product_name && selectedProduct && (
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                              <div className="flex-1 min-w-0">
                                <div className="space-y-0.5">
                                  <p className="font-medium text-[10px] truncate">{item.merch_product_name}</p>
                                  {item.merch_price && item.merch_price > 0 && (
                                    <p className="text-[9px] text-grey">
                                      Harga: <span className="font-semibold">Rp {item.merch_price.toLocaleString("id-ID")}</span>
                                    </p>
                                  )}
                                  {item.merch_variant_name && (
                                    <p className="text-[9px] text-grey truncate">
                                      Variant: <span className="font-medium">{item.merch_variant_name}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Product Preview Modal */}
        <Modal
          opened={productPreviewModalOpen}
          onClose={closeProductImageModal}
          size="lg"
          centered
          title={
            <div className="flex items-center gap-2">
              <Icon icon="mdi:image-search" className="text-primary" />
              <span>Detail Produk</span>
            </div>
          }
          padding="lg"
        >
          {selectedProductForPreview && (
            <div className="space-y-6">
              <div className="relative">
                {selectedProductImage && selectedProductImage !== "" ? (
                  <div className="w-full h-64 md:h-80 overflow-hidden rounded-lg bg-gray-100">
                    <Image src={selectedProductImage} alt={selectedProductForPreview.product_name} width={800} height={600} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-full h-64 md:h-80 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                    <Icon icon="mdi:tshirt-crew" className="text-gray-400 text-8xl mb-4" />
                    <p className="text-gray-500">Tidak ada gambar tersedia</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedProductForPreview.product_name}</h3>
                  <div className="flex items-center gap-4 mb-3">
                    <Badge color="blue" variant="light" size="lg">
                      Bundling
                    </Badge>
                    {selectedProductForPreview.average_star && (
                      <div className="flex items-center gap-1">
                        <Icon icon="mdi:star" className="text-yellow-500" />
                        <span className="text-sm font-medium">{selectedProductForPreview.average_star}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Divider />

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Harga</h4>
                  {selectedProductForPreview.event_merch_data?.varians?.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900 line-through">Rp {parseFloat(selectedProductForPreview.price).toLocaleString("id-ID")}</span>
                        <span className="text-sm text-gray-500">(Harga akan menyesuaikan variant)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">Rp {parseFloat(selectedProductForPreview.price).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>

                {selectedProductForPreview.event_merch_data?.varians?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Variant Tersedia</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProductForPreview.event_merch_data.varians.map((variant: any) => (
                        <div key={variant.id} className={`border rounded-lg p-3 ${variant.stock_qty > 0 ? "border-gray-200" : "border-red-200 bg-red-50"}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{variant.varian_name}</p>
                              <p className="text-sm font-bold text-primary mt-1 line-through">Rp {parseFloat(variant.price).toLocaleString("id-ID")}</p>
                            </div>
                            {variant.stock_qty > 0 ? (
                              <Badge color="green" variant="light" size="sm">
                                Stok: {variant.stock_qty}
                              </Badge>
                            ) : (
                              <Badge color="red" variant="light" size="sm">
                                Habis
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <Icon icon="mdi:sale" className="text-2xl text-green-500 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">Terjual</p>
                    <p className="text-sm font-bold">{selectedProductForPreview.total_sold || 0}</p>
                  </div>
                  <div className="text-center">
                    <Icon icon="mdi:star-circle" className="text-2xl text-yellow-500 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">Rating</p>
                    <p className="text-sm font-bold">{selectedProductForPreview.average_star || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <Button fullWidth onClick={closeProductImageModal} variant="light" color="gray">
              Tutup Preview
            </Button>
          </div>
        </Modal>

        <div className="h-40 md:hidden" />
      </div>
    ) : (
      // DESKTOP LAYOUT
      <div className="bg-primary-light min-h-screen pb-28">
        <div className="max-w-5xl mx-auto grid grid-cols-5 mt-8 gap-x-7 pt-20">
          <h2 className="col-span-5 mb-4">Personal Informasi</h2>
          <div className="col-span-3 flex flex-col gap-3">
            {form.map((item, index) => {
              const ticketInfo = getTicketInfoForOwner(index);
              const selectedProduct = item.merch_product_id ? merchProducts.find((p) => p.id === item.merch_product_id) : null;
              const availableVariants = selectedProduct ? getMerchVariants(item.merch_product_id!) : [];

              return (
                <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm" key={index}>
                  <div className="border-b border-b-primary-light-200 px-5 py-3 flex items-center justify-between cursor-pointer" onClick={() => toggleCollapse(index)}>
                    {index > 0 && <FontAwesomeIcon icon={faTicket} className="text-primary shrink-0 mr-[10px]" />}
                    <Stack gap={0} className={`flex-grow`}>
                      <p className="font-semibold">{index > 0 ? `${index}. Pemilik Tiket ${ticketInfo.ticketName} ${ticketInfo.seatNumber ? `(Seat ${ticketInfo.seatNumber})` : ""}` : "Data Pemesan"}</p>
                      {index > 0 && <p className="text-xs text-grey">1 Tiket x {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(ticketInfo.ticketPrice ?? 0)}</p>}
                    </Stack>
                    <button className="text-grey">
                      <FontAwesomeIcon icon={faChevronUp} className={`${collapse[index] ? "rotate-0" : "rotate-180"} transition-transform`} />
                    </button>
                  </div>

                  {index > 0 && (
                    <div className="flex items-center justify-end gap-[8px] px-4 py-2 rounded-lg text-grey">
                      <p className="text-xs md:text-sm text-end">Gunakan Data Pemesan</p>
                      <Switch size="sm" onChange={(e: any) => (e.target.checked ? copyOrderer(index) : clearForm(index))} />
                    </div>
                  )}

                  <div className={`px-5 pt-3 pb-5 ${collapse[index] ? "" : "max-h-0"} transition-max-height delay-100 duration-150 ease-in-out`}>
                    <div className={`${collapse[index] ? "opacity-100" : "opacity-0"} transition-transform-opacity duration-300 delay-300 ease-in-out`}>
                      <div className={`${collapse[index] ? "visible" : "invisible"} flex flex-col gap-3`}>
                        {detail.is_noidentity == 1 && (
                          <div className="grid grid-cols-4 gap-3">
                            <div>
                              <InputSelect
                                label="Identitas"
                                required
                                onChange={(e) => handleInput(index, "identity_type_id", e.target.value)}
                                options={[
                                  { key: "1", label: "KTP" },
                                  { key: "2", label: "SIM" },
                                  { key: "3", label: "Kartu Pelajar" },
                                  { key: "4", label: "Passport" },
                                  { key: "5", label: "KTM" },
                                ]}
                              />
                            </div>
                            <div className="col-span-3">
                              <div className="relative">
                                <InputField
                                  fullWidth
                                  type="number"
                                  label="Nomor Identitas"
                                  placeholder="Contoh: 3277************"
                                  value={item.nik}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
                                    handleInput(index, "nik", value);
                                  }}
                                />
                                {fieldErrors[index]?.nik && <p className="text-[10px] mt-1 text-danger">{fieldErrors[index]?.nik}</p>}
                              </div>
                            </div>
                          </div>
                        )}

                        {detail.is_name == 1 && <InputField fullWidth type="text" label="Nama Lengkap" placeholder="Nama Lengkap" value={item.full_name} onChange={(e) => handleInput(index, "full_name", e.target.value)} />}

                        {detail.is_assistant == 1 && (
                          <Field className="mb-2">
                            <Label className="text-sm font-base text-grey">Assistant</Label>
                            <Input
                              type="text"
                              value={item.assistant || ""}
                              onChange={(e) => handleInput(index, "assistant", e.target.value)}
                              placeholder="Nama Assistant"
                              className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                            />
                          </Field>
                        )}

                        {detail.is_gender == 1 && (
                          <Field className="mb-2">
                            <Label className="text-sm font-base text-grey">Jenis Kelamin</Label>
                            <select value={item.gender || ""} onChange={(e) => handleInput(index, "gender", e.target.value)} className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark">
                              <option value="">Pilih Jenis Kelamin</option>
                              <option value="Pria">Pria</option>
                              <option value="Wanita">Wanita</option>
                              <option value="Tidak Memberitahu">Tidak Memberitahu</option>
                            </select>
                          </Field>
                        )}

                        {detail.is_birthdate == 1 && (
                          <Field className="mb-2">
                            <Label className="text-sm font-base text-grey">Tanggal Lahir</Label>
                            <Input
                              type="date"
                              value={item.birthdate || ""}
                              onChange={(e) => handleInput(index, "birthdate", e.target.value)}
                              className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark"
                            />
                          </Field>
                        )}

                        {detail.is_kelas == 1 && (
                          <Field className="mb-2">
                            <Label className="text-sm font-base text-grey">Kelas</Label>
                            <Input
                              type="text"
                              value={item.kelas || ""}
                              onChange={(e) => handleInput(index, "kelas", e.target.value)}
                              placeholder="Masukan kelas (angka)"
                              className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark"
                            />
                          </Field>
                        )}

                        {detail.is_profession == 1 && <InputField fullWidth type="text" label="Profesi" placeholder="Profesi" value={item.is_profession} onChange={(e) => handleInput(index, "is_profession", e.target.value)} />}
                        {detail.is_company == 1 && <InputField fullWidth type="text" label="Perusahaan" placeholder="Perusahaan" value={item.is_company} onChange={(e) => handleInput(index, "is_company", e.target.value)} />}

                        {detail.is_email == 1 && <InputField fullWidth type="text" label="Email" placeholder="Contoh: example@example.com" value={item.email} onChange={(e) => handleInput(index, "email", e.target.value)} />}

                        {detail.is_phone_number == 1 && (
                          <Field className="mb-1.5 sm:mb-2">
                            <Label className="text-xs sm:text-sm font-base text-grey">No Telepon</Label>
                            <div className="flex gap-1 sm:gap-2 items-center">
                              <form className="max-w-sm block mt-0.5 sm:mt-1">
                                <select
                                  id="countries"
                                  className="bg-gray-50 border border-primary-light text-dark text-xs sm:text-sm rounded-lg focus:ring-primary-base focus:border-primary-light block w-full py-1 sm:py-1.5 px-1.5 sm:px-2"
                                  value={item.countryCode}
                                  onChange={(e) => handleInput(index, "countryCode", e.target.value)}
                                >
                                  <option value="+62">+62</option>
                                </select>
                              </form>
                              <Input
                                className={`${
                                  fieldErrors[index]?.phone ? "border-danger" : "border-primary-light"
                                } mt-0.5 sm:mt-1 w-4/5 block rounded-lg border bg-white/5 py-1 sm:py-1.5 px-1.5 sm:px-2 text-xs sm:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200`}
                                placeholder="Contoh: 81234567890"
                                value={displayValues[index] || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const numericValue = value.replace(/\D/g, "");
                                  handleInput(index, "no_telp", numericValue);
                                }}
                                type="tel"
                                maxLength={13}
                              />
                            </div>
                            {fieldErrors[index]?.phone && <p className="text-[8px] sm:text-[9px] mt-0.5 text-danger">{fieldErrors[index]?.phone}</p>}
                          </Field>
                        )}

                        {/* Merchandise Bundling Section for Desktop */}
                        {index > 0 && ticketInfo.isBundlingMerch && (
                          <div className="border-t pt-3 mt-3">
                            <p className="font-semibold text-sm mb-2">Bundling Merchandise</p>

                            <div className="space-y-2">
                              {merchProducts.length > 0 && (
                                <div className="flex items-start gap-3">
                                  <Field className="mb-2 flex-1">
                                    <Label className="text-sm font-base text-grey">Nama Produk</Label>
                                    <div className="flex gap-2 items-center">
                                      <select
                                        className="mt-1 flex-1 rounded-lg border border-primary-light-200 bg-white/5 py-1.5 px-3 text-sm text-dark focus:outline-none"
                                        value={item.merch_product_name || ""}
                                        onChange={(e) => handleInput(index, "merch_product_name", e.target.value)}
                                      >
                                        <option value="">Pilih Produk</option>
                                        {merchProducts.map((product) => (
                                          <option key={product.id} value={product.product_name}>
                                            {product.product_name}
                                          </option>
                                        ))}
                                      </select>

                                      {item.merch_product_name && selectedProduct && (
                                        <div
                                          className="w-10 h-10 mt-1 rounded overflow-hidden border border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                                          onClick={() => openProductImageModal(selectedProduct)}
                                          title="Klik untuk preview"
                                        >
                                          {selectedProduct.product_image && selectedProduct.product_image.length > 0 && selectedProduct.product_image[0]?.image_url ? (
                                            <Image src={selectedProduct.product_image[0].image_url} alt={selectedProduct.product_name} width={40} height={40} className="w-full h-full object-cover" />
                                          ) : (
                                            <Icon icon="mdi:tshirt-crew" className="text-gray-400 text-sm" />
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </Field>
                                </div>
                              )}

                              {item.merch_product_name && availableVariants.length > 0 && (
                                <Field className="mb-2">
                                  <Label className="text-sm font-base text-grey">Variant</Label>
                                  <select
                                    className="mt-1 block w-full rounded-lg border border-primary-light-200 bg-white/5 py-1.5 px-3 text-sm text-dark focus:outline-none"
                                    value={item.merch_variant_id?.toString() || ""}
                                    onChange={(e) => {
                                      const variantId = parseInt(e.target.value);
                                      const selectedVariant = availableVariants.find((v: any) => v.id === variantId);
                                      if (selectedVariant) {
                                        const newForm = [...form];
                                        newForm[index] = {
                                          ...newForm[index],
                                          merch_variant_id: variantId,
                                          merch_variant_name: selectedVariant.varian_name,
                                          merch_price: parseFloat(selectedVariant.price) || parseFloat(selectedProduct?.price || "0"),
                                        };
                                        setForm(newForm);
                                      }
                                    }}
                                  >
                                    <option value="">Pilih Variant</option>
                                    {availableVariants.map((variant: any) => (
                                      <option key={variant.id} value={variant.id}>
                                        {variant.varian_name} - Rp {parseFloat(variant.price).toLocaleString("id-ID")}
                                      </option>
                                    ))}
                                  </select>
                                </Field>
                              )}

                              {item.merch_product_name && selectedProduct && (
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                  <div className="flex-1 min-w-0">
                                    <div className="space-y-1">
                                      <p className="font-medium text-xs">{item.merch_product_name}</p>
                                      {item.merch_price && item.merch_price > 0 && (
                                        <p className="text-xs text-grey">
                                          Harga: <span className="font-semibold">Rp {item.merch_price.toLocaleString("id-ID")}</span>
                                        </p>
                                      )}
                                      {item.merch_variant_name && (
                                        <p className="text-xs text-grey truncate">
                                          Variant: <span className="font-medium">{item.merch_variant_name}</span>
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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

              {ticket.map((item: FormTicket) => {
                const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);

                let displayQty = item.qty_ticket;
                let packageCount = 1;

                if (isBundling && bundlingQty >= 2 && bundlingQty <= 99) {
                  packageCount = Math.floor(item.qty_ticket / bundlingQty);
                  displayQty = packageCount;
                }

                const bundlingInfo = isBundling && bundlingQty >= 2 && bundlingQty <= 99 ? ` (paket ${bundlingQty} orang)` : "";
                const displaySubtotal = isBundling && bundlingQty >= 2 && bundlingQty <= 99 ? item.price * packageCount : item.price * item.qty_ticket;

                return (
                  <div className="border-b p-3 border-primary-light-200 flex gap-3" key={item.event_ticket_id}>
                    <div className="px-3 flex items-center border rounded-md border-primary-light">
                      <FontAwesomeIcon icon={faTicket} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm mb-1 font-semibold">
                        {item.name}
                        {bundlingInfo}
                      </p>
                      <p className="text-xs text-grey">
                        {displayQty} {displayQty === 1 ? "Paket" : "Paket"} x {item.price} = Rp {displaySubtotal.toLocaleString("id-ID")}
                        {isBundling && bundlingQty >= 2 && bundlingQty <= 99 && <span className="text-[10px] text-gray-500 block">({item.qty_ticket} tiket fisik)</span>}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="py-3 px-4 flex justify-between items-center">
                <p>
                  {`Jumlah (${displayTotalCount} ${
                    ticket.some((item) => {
                      const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);
                      return isBundling && bundlingQty >= 2 && bundlingQty <= 99;
                    })
                      ? "Paket"
                      : "Tiket"
                  })`}
                </p>
                <p className="font-semibold">{displayTotalSubtotalPrice > 0 ? <NumberFormatter value={displayTotalSubtotalPrice} /> : <Text>Free</Text>}</p>
              </div>

              {vouchers.length > 0 && (
                <div className="py-3 px-4 flex justify-between items-center">
                  <p>Voucher</p>
                  <p className="font-semibold">
                    -<NumberFormatter value={vouchers.reduce((sum, voucher) => sum + (voucher.amount || 0), 0)} />
                  </p>
                </div>
              )}

              {(() => {
                const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
                const subtotalAfterVoucher = Math.max(displayTotalSubtotalPrice - totalVoucher, 0);
                return (
                  <div className="py-3 px-4 flex justify-between items-center">
                    <p>Subtotal</p>
                    <p className="font-semibold">
                      <NumberFormatter value={subtotalAfterVoucher} />
                    </p>
                  </div>
                );
              })()}

              {detail?.is_insurance === 1 && (
                <>
                  <div className="border-b p-3 border-primary-light-200 flex gap-3 items-center justify-between" key="asuransi">
                    <div className="flex items-center gap-3">
                      <div className="px-3 flex items-center border rounded-md border-primary-light">
                        <Icon icon="mdi:shield-check" className="text-primary" />
                      </div>
                      <div>
                        <button onClick={() => setInsuranceModalOpen(true)} className="text-sm mb-1 font-semibold hover:text-primary transition-colors text-left">
                          Pakai Asuransi
                        </button>
                        <p className="text-xs text-grey">
                          Rp {detail?.insurance_amount?.toLocaleString("id-ID") || "0"} per tiket
                          {insuranceChecked && <span className="block text-xs text-blue-600">+Rp {calculateInsuranceTotal().toLocaleString("id-ID")}</span>}
                        </p>
                      </div>
                    </div>

                    {detail?.insurance_required === 0 ? (
                      <input type="checkbox" className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2" checked={insuranceChecked} onChange={(e) => setInsuranceChecked(e.target.checked)} />
                    ) : (
                      <div className="text-xs text-primary font-semibold">Wajib</div>
                    )}
                  </div>

                  <Modal opened={insuranceModalOpen} onClose={() => setInsuranceModalOpen(false)} title="Ketentuan Asuransi" size="lg" centered>
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      <div className="w-full sm:w-1/4 flex flex-col items-center justify-center">
                        <div className="bg-blue-50 p-4 rounded-full mb-3">
                          <Icon icon="mdi:shield-check" className="text-blue-600 text-4xl" />
                        </div>
                        <p className="text-sm font-semibold text-center">Proteksi Tiket Anda</p>
                      </div>

                      <div className="w-full sm:w-3/4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{insuranceInfo.title}</h4>
                            <p className="text-xs text-gray-600">{insuranceInfo.description}</p>
                          </div>

                          <div className="pt-2">
                            <p className="text-xs text-gray-500">
                              Biaya asuransi: <span className="font-semibold">Rp {detail?.insurance_amount?.toLocaleString("id-ID") || "2.000"} per tiket</span>
                            </p>
                            {detail?.insurance_required === 1 && <p className="text-xs text-red-500 mt-1">*Asuransi wajib untuk event ini</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t flex justify-end">
                      <Button onClick={() => setInsuranceModalOpen(false)} size="xs">
                        Mengerti
                      </Button>
                    </div>
                  </Modal>
                </>
              )}

              {detail?.ppn !== undefined &&
                (() => {
                  const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
                  const subtotalAfterVoucher = Math.max(displayTotalSubtotalPrice - totalVoucher, 0);
                  const { tax, label, ppnType } = computeTax(detail, subtotalAfterVoucher);

                  if (tax > 0) {
                    return (
                      <div className="py-3 px-4 flex justify-between items-center">
                        <p>{ppnType === "nominal" ? `Tax ${label}` : `Tax (${label})`}</p>
                        <p className="font-semibold">
                          <NumberFormatter value={tax} />
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}

              {adminFee > 0 && (
                <div className="py-3 px-4 flex justify-between items-center">
                  <p>Biaya Admin</p>
                  <p className="font-semibold">
                    <NumberFormatter value={adminFee} />
                  </p>
                </div>
              )}

              <div className="py-3 px-4 flex justify-between items-center">
                <p>Total Pembayaran</p>
                <p className="font-semibold">
                  {(() => {
                    const grandTotal = calculateGrandTotal();
                    return grandTotal > 0 ? <NumberFormatter value={grandTotal} /> : <Text>Free</Text>;
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Preview Modal for Desktop */}
        <Modal
          opened={productPreviewModalOpen}
          onClose={closeProductImageModal}
          size="lg"
          centered
          title={
            <div className="flex items-center gap-2">
              <Icon icon="mdi:image-search" className="text-primary" />
              <span>Detail Produk</span>
            </div>
          }
          padding="lg"
        >
          {selectedProductForPreview && (
            <div className="space-y-6">
              <div className="relative">
                {selectedProductImage && selectedProductImage !== "" ? (
                  <div className="w-full h-64 md:h-80 overflow-hidden rounded-lg bg-gray-100">
                    <Image src={selectedProductImage} alt={selectedProductForPreview.product_name} width={800} height={600} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-full h-64 md:h-80 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                    <Icon icon="mdi:tshirt-crew" className="text-gray-400 text-8xl mb-4" />
                    <p className="text-gray-500">Tidak ada gambar tersedia</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedProductForPreview.product_name}</h3>
                  <div className="flex items-center gap-4 mb-3">
                    <Badge color="blue" variant="light" size="lg">
                      Bundling
                    </Badge>
                    {selectedProductForPreview.average_star && (
                      <div className="flex items-center gap-1">
                        <Icon icon="mdi:star" className="text-yellow-500" />
                        <span className="text-sm font-medium">{selectedProductForPreview.average_star}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Divider />

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Harga</h4>
                  {selectedProductForPreview.event_merch_data?.varians?.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900 line-through">Rp {parseFloat(selectedProductForPreview.price).toLocaleString("id-ID")}</span>
                        <span className="text-sm text-gray-500">(Harga akan menyesuaikan variant)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">Rp {parseFloat(selectedProductForPreview.price).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>

                {selectedProductForPreview.event_merch_data?.varians?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Variant Tersedia</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProductForPreview.event_merch_data.varians.map((variant: any) => (
                        <div key={variant.id} className={`border rounded-lg p-3 ${variant.stock_qty > 0 ? "border-gray-200" : "border-red-200 bg-red-50"}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{variant.varian_name}</p>
                              <p className="text-sm font-bold text-primary mt-1 line-through">Rp {parseFloat(variant.price).toLocaleString("id-ID")}</p>
                            </div>
                            {variant.stock_qty > 0 ? (
                              <Badge color="green" variant="light" size="sm">
                                Stok: {variant.stock_qty}
                              </Badge>
                            ) : (
                              <Badge color="red" variant="light" size="sm">
                                Habis
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <Icon icon="mdi:sale" className="text-2xl text-green-500 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">Terjual</p>
                    <p className="text-sm font-bold">{selectedProductForPreview.total_sold || 0}</p>
                  </div>
                  <div className="text-center">
                    <Icon icon="mdi:star-circle" className="text-2xl text-yellow-500 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">Rating</p>
                    <p className="text-sm font-bold">{selectedProductForPreview.average_star || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <Button fullWidth onClick={closeProductImageModal} variant="light" color="gray">
              Tutup Preview
            </Button>
          </div>
        </Modal>
      </div>
    ))
  );
};

export default FirstStep;
