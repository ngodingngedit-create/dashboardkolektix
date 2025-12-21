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
import { Button, Card, Flex, Group, NumberFormatter, Stack, Text, TextInput } from "@mantine/core";
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
  // is_bundling?: number;
  // bundling_qty?: number;
}

interface ErrorForm {
  nik: boolean;
  nama: boolean;
  email: boolean;
  countryCode: boolean;
  phone: boolean;
  // tambahan
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
  // NEW
  is_gender?: string;
  birthdate?: string;
  is_kelas?: string;
  is_assistant?: string;
  is_insurance?: number;
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

type Detail = { ppn?: any; ppn_type?: any; [k: string]: any };

const normalizeDetail = (detail: Detail) => {
  const normalized: Detail = { ...detail };

  // normalisasi ppn_type: treat null/undefined/""/"null" -> "percentage"
  const rawType = detail?.ppn_type;
  if (rawType === null || rawType === undefined || rawType === "" || rawType === "null") {
    normalized.ppn_type = "percentage";
  } else {
    normalized.ppn_type = String(rawType);
  }

  // normalisasi ppn:
  // - if null/undefined/""/"null" -> default 10
  // - if numeric string -> Number(parsed)
  // - if 0 -> keep 0
  const rawPpn = detail?.ppn;
  if (rawPpn === null || rawPpn === undefined || rawPpn === "" || rawPpn === "null") {
    normalized.ppn = 0;
  } else {
    const n = Number(rawPpn);
    normalized.ppn = Number.isNaN(n) ? 0 : n;
  }

  const rawAdminFee = detail?.admin_fee;
  if (rawAdminFee === null || rawAdminFee === undefined || rawAdminFee === "" || rawAdminFee === "null") {
    normalized.admin_fee = 7000; // default admin fee PER TICKET
  } else {
    const af = Number(rawAdminFee);
    normalized.admin_fee = Number.isNaN(af) ? 7000 : af;
  }

  return normalized;
};

// Fungsi validasi KTP
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

// Fungsi validasi nomor telepon
const validatePhoneNumber = (phone: string): { isValid: boolean; errorMessage?: string } => {
  // Hapus semua karakter non-digit
  const cleanedPhone = phone.replace(/\D/g, "");

  // Validasi: tidak boleh dimulai dengan 62 atau 0
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

  // Validasi panjang maksimal 11 digit (tidak termasuk kode negara)
  if (cleanedPhone.length > 11) {
    return {
      isValid: false,
      errorMessage: "Maksimal 11 digit (tidak termasuk kode negara)",
    };
  }

  // Validasi panjang minimal (biasanya 9-11 digit untuk Indonesia)
  if (cleanedPhone.length < 9) {
    return {
      isValid: false,
      errorMessage: "Nomor telepon terlalu pendek",
    };
  }

  // Validasi format nomor (harus angka semua)
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
  // const totalTicketFee = ticket.reduce((sum, item) => sum + (item.ticket_fee || 0) * item.qty_ticket, 0);
  const [vouchers, setVouchers] = useState<{ name: string; amount: number }[]>([]);
  const { width } = useWindowSize();
  const userData = useLoggedUser();
  const [collapse, setCollapse] = useState<boolean[]>(form.map((_, index) => index === 0));
  const [displayValues, setDisplayValues] = useState<{ [key: number]: string }>({});
  const [fieldErrors, setFieldErrors] = useState<{
    [key: number]: {
      nik?: string;
      phone?: string;
    };
  }>({});

  const [insuranceChecked, setInsuranceChecked] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  // Cek apakah ada data insurance
  const hasInsuranceData = detail?.has_insurances && detail.has_insurances.length > 0;

  // Ambil insurance pertama jika ada
  const firstInsurance = hasInsuranceData ? detail.has_insurances?.[0] : null;

  // Data insurance dengan fallback
  const insuranceInfo = {
    title: firstInsurance?.title ?? "Tidak ada asuransi",
    description: firstInsurance?.description ?? "Tidak ada Deskripsi",
    provider: firstInsurance?.insurance?.name ?? "",
    address: firstInsurance?.insurance?.address ?? "",
    hasInsurance: hasInsuranceData,
  };

  useEffect(() => {
    if (detail?.insurance_required === 1) {
      setInsuranceChecked(true); // Wajib = auto checked
    } else {
      setInsuranceChecked(false); // Opsional = unchecked
    }
  }, [detail?.insurance_required]);

  const calculateInsuranceTotal = () => {
    if (!insuranceChecked || !detail?.insurance_amount || totalCount === 0) return 0;

    // insurance_amount biasanya per tiket
    return detail.insurance_amount * totalCount;
  };

  const calculateGrandTotal = () => {
    const subtotalTiket = displayTotalSubtotalPrice;
    const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
    const subtotalAfterVoucher = Math.max(subtotalTiket - totalVoucher, 0);
    const insuranceTotal = calculateInsuranceTotal();
    const tax = detail?.ppn ? Math.round(subtotalAfterVoucher * (detail.ppn / 100)) : 0;

    return subtotalAfterVoucher + adminFee + tax + insuranceTotal;
  };

  // const adminFee = totalTicketFee;

  const firstTicket = detail.has_event_ticket && detail.has_event_ticket[0];
  const isBundlingGlobal = firstTicket ? firstTicket.is_bundling === 1 : false;
  const bundlingQtyGlobal = firstTicket ? firstTicket.bundling_qty : 0;

  console.log("Bundling data from detail:", {
    hasFirstTicket: !!firstTicket,
    isBundlingGlobal,
    bundlingQtyGlobal,
    firstTicket,
  });

  // const computeTax = (detail: any, subtotalAfterVoucher: number) => {
  //   // const ppnType = detail?.ppn_type || "percentage";
  //   // const raw = detail?.ppn != null ? Number(detail?.ppn) || 10 : 10; //perubahan default ppn 10%

  //   const ppnType = detail?.ppn_type ?? "percentage";
  //   const raw = detail?.ppn ?? 10; // default 10%

  //   if (ppnType === "percentage") {
  //     const taxBase = subtotalAfterVoucher;
  //     const tax = Math.round(taxBase * (raw / 100));
  //     return { tax, label: `${raw}%` };
  //   }

  //   if (ppnType === "nominal") {
  //     const tax = Math.round(raw);
  //     return { tax, label: `Rp ${tax.toLocaleString("id-ID")}` };
  //   }

  //   return { tax: 0, label: "Free" };
  // };

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

  // const handleInput = (index: number, field: keyof Form, value: string) => {
  //   let newForm = [...form];
  //   if (field == "no_telp") {
  //     var phone = value.replaceAll(/\D/g, "");
  //     phone = phone.replace(/^(?!0|6)(\d+)/, "628$1");
  //     phone = phone.replace(/^0/, "62");
  //     newForm[index] = { ...newForm[index], [field]: phone };
  //   } else {
  //     newForm[index] = { ...newForm[index], [field]: value };
  //   }
  //   setForm(newForm);
  //   const isFormValid = newForm.every(formValidation);
  //   setFormValid(isFormValid);
  // };

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
      // Update display value (hanya angka)
      const displayVal = value.replaceAll(/\D/g, "");
      setDisplayValues((prev) => ({ ...prev, [index]: displayVal }));

      // Format untuk backend
      let phone = value.replaceAll(/\D/g, "");
      phone = phone.replace(/^(?!0|6)(\d+)/, "62$1");
      phone = phone.replace(/^0/, "62");

      newForm[index] = { ...newForm[index], [field]: phone };

      // Validasi real-time untuk nomor telepon
      if (detail.is_phone_number == 1) {
        const validation = validatePhoneNumber(phone);
        setFieldErrors((prev) => ({
          ...prev,
          [index]: {
            ...prev[index],
            phone: validation.isValid ? undefined : validation.errorMessage,
          },
        }));
      }
    } else if (field === "nik") {
      // Hanya menerima angka dan batasi panjang
      const numericValue = value.replace(/\D/g, "").slice(0, 16);
      newForm[index] = { ...newForm[index], [field]: numericValue };

      // Validasi real-time untuk NIK
      if (detail.is_noidentity == 1) {
        const validation = validateNIK(numericValue);
        setFieldErrors((prev) => ({
          ...prev,
          [index]: {
            ...prev[index],
            nik: validation.isValid ? undefined : validation.errorMessage,
          },
        }));
      }
    } else {
      newForm[index] = { ...newForm[index], [field]: value };
    }

    setForm(newForm);
    const isFormValid = newForm.every(formValidation);
    setFormValid(isFormValid);
  };

  // const handleInput = (index: number, field: keyof Form, value: string) => {
  //   let newForm = [...form];

  //   if (field === "no_telp") {
  //     // Update display value
  //     const displayVal = value.replaceAll(/\D/g, "");
  //     setDisplayValues((prev) => ({ ...prev, [index]: displayVal }));

  //     // Format untuk backend (SAMA PERSIS dengan kode lama)
  //     let phone = value.replaceAll(/\D/g, "");
  //     phone = phone.replace(/^(?!0|6)(\d+)/, "62$1");
  //     phone = phone.replace(/^0/, "62");

  //     newForm[index] = { ...newForm[index], [field]: phone };
  //   } else {
  //     newForm[index] = { ...newForm[index], [field]: value };
  //   }

  //   setForm(newForm);
  //   const isFormValid = newForm.every(formValidation);
  //   setFormValid(isFormValid);
  // };

  const copyOrderer = (targetIndex: number) => {
    if (form.length > 0 && targetIndex > 0 && targetIndex < form.length) {
      let newForm = [...form];
      newForm[targetIndex] = { ...newForm[0], is_pemesan: 0 };
      setForm(newForm);

      // COPY JUGA displayValues untuk no_telp
      if (displayValues[0]) {
        setDisplayValues((prev) => ({
          ...prev,
          [targetIndex]: displayValues[0],
        }));
      }

      // Reset error untuk form yang dicopy
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
        is_gender: "",
        birthdate: "",
        is_kelas: "",
        is_assistant: "",
      };
      setForm(newForm);

      // RESET displayValues
      setDisplayValues((prev) => ({
        ...prev,
        [targetIndex]: "",
      }));

      // Reset error
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

  const allBundlingInfo = detail.has_event_ticket
    ? detail.has_event_ticket.map((ticket) => ({
        id: ticket.id,
        isBundling: ticket.is_bundling === 1,
        bundlingQty: ticket.bundling_qty,
      }))
    : [];

  // Fungsi untuk mendapatkan bundling info berdasarkan event_ticket_id
  // Atau jika mau cari berdasarkan ID nanti:
  const getBundlingInfo = (event_ticket_id: number) => {
    if (!detail.has_event_ticket) return { isBundling: false, bundlingQty: 0 };

    const ticket = detail.has_event_ticket.find((t) => t.id === event_ticket_id);
    return {
      isBundling: ticket ? ticket.is_bundling === 1 : false,
      bundlingQty: ticket ? ticket.bundling_qty : 0,
    };
  };

  console.log("is_bundling", allBundlingInfo);

  const displayTotalCount = useMemo(() => {
    if (!ticket || ticket.length === 0) return 0;

    let count = 0;

    ticket.forEach((item) => {
      const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);

      if (isBundling && bundlingQty >= 2 && bundlingQty <= 99) {
        // 💡 HITUNG JUMLAH PAKET: qty_ticket (fisik) / bundling_qty
        // Contoh: bundling_qty = 2, qty_ticket = 4 → 4/2 = 2 paket
        // Contoh: bundling_qty = 2, qty_ticket = 2 → 2/2 = 1 paket
        // Contoh: bundling_qty = 3, qty_ticket = 6 → 6/3 = 2 paket

        const packageCount = Math.floor(item.qty_ticket / bundlingQty);
        count += packageCount;

        console.log(`Bundling ${item.name}:`, {
          physicalTickets: item.qty_ticket,
          bundlingQty,
          packageCount,
          addedToCount: packageCount,
        });
      } else {
        // Non-bundling: jumlah tiket fisik
        count += item.qty_ticket;
      }
    });

    return count;
  }, [ticket, allBundlingInfo]);
  // Lalu gunakan displayTotalCount di semua tempat

  const displayTotalSubtotalPrice = useMemo(() => {
    if (!ticket || ticket.length === 0) return 0;

    let total = 0;

    ticket.forEach((item) => {
      const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);

      if (isBundling && bundlingQty >= 2 && bundlingQty <= 99) {
        // 💡 Harga per paket × jumlah paket
        const packageCount = Math.floor(item.qty_ticket / bundlingQty);
        total += item.price * packageCount;

        console.log(`Bundling ${item.name} price:`, {
          pricePerPackage: item.price,
          packageCount,
          subtotal: item.price * packageCount,
        });
      } else {
        // Non-bundling: harga normal
        total += item.price * item.qty_ticket;
      }
    });

    return total;
  }, [ticket, allBundlingInfo]);

  const totalTicketFee = useMemo(() => {
    if (!ticket || ticket.length === 0) return 0;

    let totalFee = 0;

    ticket.forEach((item) => {
      const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);
      const fee = item.ticket_fee || 0;

      if (isBundling && bundlingQty >= 2 && bundlingQty <= 99) {
        // 💡 Admin fee per paket × jumlah paket
        const packageCount = Math.floor(item.qty_ticket / bundlingQty);
        totalFee += fee * packageCount;

        console.log(`Bundling ${item.name} admin fee:`, {
          feePerPackage: fee,
          packageCount,
          subtotalFee: fee * packageCount,
          qty_ticket: item.qty_ticket,
          bundlingQty,
        });
      } else {
        // Non-bundling: admin fee normal (per tiket)
        totalFee += fee * item.qty_ticket;
      }
    });

    return totalFee;
  }, [ticket, allBundlingInfo]);

  const adminFee = totalTicketFee; // atau langsung pakai totalTicketFee

  // --- Return layout (mobile / desktop) aligned with FirstStepUnlogged design ---
  return (
    width &&
    (width < 768 ? (
      // MOBILE layout (responsive)
      // IMPORTANT: adjusted padding-bottom and spacer so content won't be hidden by fixed bottom bar
      <div className="bg-primary-light pt-2 sm:pt-3 px-1.5 sm:px-2" style={{ paddingBottom: 160 /* explicit large bottom padding for mobile */ }}>
        <div className="border-b p-1.5 sm:p-2 border-primary-light flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <div className="px-1 sm:px-1.5 py-0.5 sm:py-1 border rounded-md border-primary-light shrink-0">
            {detail && detail.image_url && <Image src={detail?.image_url} width={1000} height={1000} alt="banner" className="w-6 sm:w-8 h-6 sm:h-8 object-cover rounded-sm" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold truncate">{detail?.name}</p>
            <p className="text-xs text-grey">{totalCount} Tiket</p>
          </div>
        </div>
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
        <div className="border border-primary-light-200 rounded-lg bg-white shadow-sm mb-2 sm:mb-3">
          <div className="border-b border-b-primary-light-200 p-1.5 sm:p-2">
            <p className="font-semibold text-xs sm:text-sm">Ringkasan</p>
          </div>

          {ticket.map((item: FormTicket) => {
            const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);

            // Tentukan display quantity (jumlah paket)
            let displayQty = item.qty_ticket;
            let packageCount = 1;

            if (isBundling && bundlingQty >= 2 && bundlingQty <= 99) {
              packageCount = Math.floor(item.qty_ticket / bundlingQty);
              displayQty = packageCount; // Tampilkan jumlah paket
            }

            const bundlingInfo = isBundling && bundlingQty >= 2 && bundlingQty <= 99 ? ` (paket ${bundlingQty} orang)` : "";

            // Display subtotal
            const displaySubtotal =
              isBundling && bundlingQty >= 2 && bundlingQty <= 99
                ? item.price * packageCount // Harga per paket × jumlah paket
                : item.price * item.qty_ticket;

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

          <div className="py-2 sm:py-3 px-2 sm:px-4 flex justify-between items-center text-xs border-t border-primary-light-200">
            <p>
              {`Jumlah (${displayTotalCount} ${
                // 💡 KONDISI: Cek apakah ADA ticket yang bundling
                ticket.some((item) => {
                  const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);
                  return isBundling && bundlingQty >= 2 && bundlingQty <= 99;
                })
                  ? "Paket" // Jika ADA bundling → "Paket"
                  : "Tiket" // Jika TIDAK ADA bundling → "Tiket"
              })`}
            </p>
            <p className="font-semibold">{displayTotalSubtotalPrice > 0 ? <NumberFormatter value={displayTotalSubtotalPrice} /> : <Text>Free</Text>}</p>
          </div>

          {vouchers.length > 0 && (
            <div className="py-2 sm:py-3 px-2 sm:px-4 flex justify-between items-center text-xs sm:text-sm">
              <p>Total Voucher</p>
              <p className="font-semibold">
                -
                <NumberFormatter value={vouchers.reduce((sum, voucher) => sum + (voucher.amount || 0), 0)} />
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
                    {/* Ambil harga dari insurance_amount */}
                    {/* <p className="text-xs text-grey">Rp {detail?.insurance_amount?.toLocaleString("id-ID") || "Kosong"}</p> */}
                    <p className="text-xs text-grey">
                      Rp {detail?.insurance_amount?.toLocaleString("id-ID") || "0"} per tiket
                      {insuranceChecked && <span className="block text-xs text-blue-600">+Rp {calculateInsuranceTotal().toLocaleString("id-ID")}</span>}
                    </p>
                  </div>
                </div>

                {/* Tampilkan checkbox hanya jika insurance_require = 0 */}
                {detail?.insurance_required === 0 ? (
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                    onChange={(e) => {
                      setInsuranceChecked(e.target.checked);
                      console.log("Asuransi checked:", e.target.checked, "Total asuransi:", calculateInsuranceTotal());
                    }}
                  />
                ) : (
                  // Jika insurance_require = 1, checkbox hidden dan asuransi wajib
                  <div className="text-xs text-primary font-semibold">Wajib</div>
                )}
              </div>

              {/* Modal Asuransi */}
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
                        {/* Tampilkan status wajib/opsional */}
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

          {detail?.ppn !== undefined
            ? (() => {
                const subtotalTiket = totalSubtotalPrice;
                const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
                const subtotalAfterVoucher = Math.max(subtotalTiket - totalVoucher, 0);

                // gunakan helper untuk menghitung tax & label (percentage / nominal)
                const { tax, label, ppnType } = computeTax(detail, subtotalAfterVoucher);

                if (tax <= 0) return null;

                return (
                  <div className="py-3 px-4 flex justify-between items-center">
                    <p>{ppnType === "nominal" ? `Tax ${label}` : `Tax (${label})`}</p>
                    <p className="font-semibold">
                      <NumberFormatter value={tax} />
                    </p>
                  </div>
                );
              })()
            : null}

          {adminFee > 0 && (
            <div className="py-3 px-4 flex justify-between items-center">
              <p>{t("adminFee")}</p>
              <p className="font-semibold">
                <NumberFormatter value={adminFee} />
              </p>
            </div>
          )}

          <div className="py-2 sm:py-3 px-2 sm:px-4 flex justify-between items-center text-xs sm:text-sm border-t border-primary-light-200">
            <p>{t("totalPayment")}</p>
            {/* <p className="font-semibold">
              {(() => {
                const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
                const subtotalAfterVoucher = Math.max(displayTotalSubtotalPrice - totalVoucher, 0);
                const tax = detail.ppn ? Math.round(subtotalAfterVoucher * (detail.ppn / 100)) : 0;
                const grandtotal = subtotalAfterVoucher + totalTicketFee + tax;
                return grandtotal > 0 ? <NumberFormatter value={grandtotal} /> : <Text>Free</Text>;
              })()}
            </p> */}
            <p className="font-semibold">
              {(() => {
                const grandTotal = calculateGrandTotal();
                return grandTotal > 0 ? <NumberFormatter value={grandTotal} /> : <Text>Free</Text>;
              })()}
            </p>
          </div>
        </div>
        {/* {form.map((item, index) => {
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
          } */}
        {form.map((item, index) => {
          let ticketForOwner: FormTicket | null = null;
          let currentIndex = 0;

          // Cari tiket yang sesuai dengan form[index]
          // form[0] = pemesan → skip
          // form[1] = tiket pertama, form[2] = tiket kedua, dst.
          if (index === 0) {
            // pemesan tidak punya tiket sendiri
          } else {
            for (const ticketItem of ticket) {
              const seats = Array.isArray(ticketItem.seat_number)
                ? ticketItem.seat_number
                : typeof ticketItem.seat_number === "string" && ticketItem.seat_number.trim() !== ""
                ? JSON.parse(ticketItem.seat_number)
                : Array.from({ length: ticketItem.qty_ticket }, (_, i) => undefined);

              for (let i = 0; i < seats.length; i++) {
                if (currentIndex === index - 1) {
                  // index - 1 karena form[0] = pemesan
                  ticketForOwner = {
                    ...ticketItem,
                    seat_number: seats[i] || undefined,
                  };

                  // INI YANG PALING PENTING: simpan seat_number ke form!
                  if (seats[i] && item.seat_number !== seats[i]) {
                    handleInput(index, "seat_number", seats[i] as string);
                  }
                  break;
                }
                currentIndex++;
              }
              if (ticketForOwner) break;
            }
          }

          if (!ticketForOwner?.seat_number && !!item.seat_number) {
            handleInput(index, "seat_number", item.seat_number ?? "");
          }

          return (
            <div className="bg-white mt-1 sm:mt-1.5" key={index}>
              <div className="border-b py-1.5 sm:py-2 px-1.5 sm:px-3 border-primary-light flex items-start justify-between cursor-pointer gap-1 sm:gap-2" onClick={() => toggleCollapse(index)}>
                {index > 0 && <FontAwesomeIcon icon={faTicket} className="text-primary shrink-0 mt-0.5 sm:mt-1 text-xs sm:text-sm" />}
                <Stack gap={0} className={`flex-grow min-w-0`}>
                  <p className="font-semibold text-xs sm:text-sm leading-tight">{index > 0 ? `${index}. ${t("ticketOwner")} ${ticketForOwner?.name}` : t("registrantData")}</p>
                  {index > 0 && ticketForOwner?.seat_number && <p className="text-xs text-grey leading-tight">Seat {ticketForOwner?.seat_number}</p>}
                  {index > 0 && <p className="text-xs text-grey leading-tight">1 Tiket x {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(ticketForOwner?.price ?? 0)}</p>}
                </Stack>
                <button className="text-grey shrink-0 mt-0.5 sm:mt-1">
                  <FontAwesomeIcon icon={faChevronUp} className={`${collapse[index] ? "rotate-0" : "rotate-180"} transition-transform text-xs sm:text-sm`} />
                </button>
              </div>

              {index > 0 && (
                <div className="flex items-center justify-end gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-grey flex-wrap sm:flex-nowrap">
                  <p className="text-xs text-end">{t("useRegistrantData")}</p>
                  <Switch size="sm" onChange={(e: any) => (e.target.checked ? copyOrderer(index) : clearForm(index))} />
                </div>
              )}

              <div className={`border-b p-2 sm:p-3 border-primary-light ${collapse[index] ? "max-h-[26rem]" : "max-h-0"} transition-max-height delay-100 duration-150 ease-in-out`}>
                <div className={`${collapse[index] ? "opacity-100" : "opacity-0"} transition-transform-opacity duration-300 delay-300 ease-in-out`}>
                  <div className={`${collapse[index] ? "visible delay-300 duration-300" : "invisible"} transition-transform space-y-1.5 sm:space-y-2`}>
                    {detail.is_noidentity ? (
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
                            const numericValue = e.target.value.replace(/\D/g, "").slice(0, 16); // Ganti 17 jadi 16
                            handleInput(index, "nik", numericValue);
                          }}
                          maxLength={16} // Ganti 17 jadi 16
                        />
                        {/* TAMPILKAN ERROR DARI VALIDASI BARU */}
                        {fieldErrors[index]?.nik && <p className="text-[8px] sm:text-[9px] mt-0.5 text-danger">{fieldErrors[index]?.nik}</p>}
                        {/* ATAU ERROR LAMA JIKA MASIH ADA */}
                        {error.nik && item.nik.length < 16 && !fieldErrors[index]?.nik && <p className="text-[8px] sm:text-[9px] mt-0.5 text-danger">Minimal NIK adalah 16 Digit</p>}
                      </Field>
                    ) : null}

                    {detail.is_name ? (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Nama Lengkap</Label>
                        <Input
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                          placeholder="Nama Lengkap"
                          value={item.full_name}
                          onChange={(e) => handleInput(index, "full_name", e.target.value)}
                        />
                      </Field>
                    ) : null}

                    {/* ADDED assistant input - same design as other inputs */}
                    {detail.is_assistant ? (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Assistant</Label>
                        <Input
                          type="text"
                          value={item.is_assistant || ""}
                          onChange={(e) => handleInput(index, "is_assistant", e.target.value)}
                          placeholder="Nama Assistant"
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                        />
                      </Field>
                    ) : null}

                    {detail.is_kelas ? (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Kelas</Label>
                        <Input
                          type="text"
                          value={item.is_kelas || ""}
                          onChange={(e) => handleInput(index, "is_kelas", e.target.value)}
                          placeholder="Masukan kelas (angka)"
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm text-dark"
                        />
                      </Field>
                    ) : null}

                    {detail.is_gender ? (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Jenis Kelamin</Label>
                        <select
                          value={item.is_gender || ""}
                          onChange={(e) => handleInput(index, "is_gender", e.target.value)}
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm text-dark"
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="1">Pria</option>
                          <option value="2">Wanita</option>
                          <option value="3">Tidak Memberitahu</option>
                        </select>
                      </Field>
                    ) : null}

                    {detail.is_birthdate ? (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Tanggal Lahir</Label>
                        <Input
                          type="date"
                          value={item.birthdate || ""}
                          onChange={(e) => handleInput(index, "birthdate", e.target.value)}
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm text-dark"
                        />
                      </Field>
                    ) : null}

                    {detail.is_profession ? (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Profesi / Pekerjaan</Label>
                        <Input
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                          placeholder="Profesi atau pekerjaan"
                          value={item.is_profession}
                          onChange={(e) => handleInput(index, "is_profession", e.target.value)}
                        />
                      </Field>
                    ) : null}

                    {detail.is_company ? (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Perusahaan / Organisasi</Label>
                        <Input
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                          placeholder="Perusahaan atau organisasi"
                          value={item.is_company}
                          onChange={(e) => handleInput(index, "is_company", e.target.value)}
                        />
                      </Field>
                    ) : null}

                    {detail.is_email ? (
                      <Field className="mb-1.5 sm:mb-2">
                        <Label className="text-xs sm:text-sm font-base text-grey">Email</Label>
                        <Input
                          type="email"
                          className="mt-0.5 sm:mt-1 block w-full rounded-lg border border-primary-light bg-white/5 py-1 px-2 text-xs sm:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                          placeholder="Contoh: example@example.com"
                          value={item.email}
                          onChange={(e) => handleInput(index, "email", e.target.value)}
                        />
                      </Field>
                    ) : null}

                    {/* {detail.is_phone_number == 1 && <InputField fullWidth type="number" label="No Telepon" placeholder="Contoh: 81233334444" onChange={(e) => handleInput(index, "no_telp", e.target.value)} value={item.no_telp} />} */}
                    {detail.is_phone_number ? (
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

                              // BLOKIR JIKA INPUT DIMULAI DENGAN 62 ATAU 0
                              if (numericValue.startsWith("62") || numericValue.startsWith("0")) {
                                // Tampilkan error
                                setFieldErrors((prev) => ({
                                  ...prev,
                                  [index]: {
                                    ...prev[index],
                                    phone: "Nomor tidak boleh dimulai dengan 62 atau 0",
                                  },
                                }));
                                // Jangan update nilai
                                return;
                              }

                              // BLOKIR JIKA LEBIH DARI 11 DIGIT
                              if (numericValue.length > 11) {
                                setFieldErrors((prev) => ({
                                  ...prev,
                                  [index]: {
                                    ...prev[index],
                                    phone: "Maksimal 11 digit",
                                  },
                                }));
                                // Potong jadi 11 digit
                                const trimmedValue = numericValue.slice(0, 11);
                                handleInput(index, "no_telp", trimmedValue);
                                return;
                              }

                              // Jika valid, reset error
                              setFieldErrors((prev) => ({
                                ...prev,
                                [index]: {
                                  ...prev[index],
                                  phone: undefined,
                                },
                              }));

                              handleInput(index, "no_telp", numericValue);
                            }}
                            type="tel"
                          />
                        </div>
                        {/* Tambahkan pesan error validasi */}
                        {fieldErrors[index]?.phone && <p className="text-[8px] sm:text-[9px] mt-0.5 text-danger">{fieldErrors[index]?.phone}</p>}
                      </Field>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {/* BIG spacer supaya konten mobile tidak tertutup fixed bottom bar.
            Kalau fixed footer tingginya berbeda, ubah nilai height di bawah. */}
        <div className="h-40 md:hidden" />
      </div>
    ) : (
      // DESKTOP layout (tidak diubah)
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
                        {/* {detail.is_noidentity ? (
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
                              <InputField fullWidth type="number" label="Nomor Identitas" placeholder={`${t("example")}: 123456789012345`} value={item.nik} onChange={(e) => handleInput(index, "nik", e.target.value)} />
                              {error.nik && <p className="text-[10px] mt-1 text-danger">Minimal NIK adalah 16 Digit</p>}
                            </div>
                          </div>
                        ) : null} */}

                        {detail.is_noidentity ? (
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
                                  placeholder={`${t("example")}: 3277************`}
                                  value={item.nik}
                                  onChange={(e) => {
                                    // Hanya ambil 16 digit pertama
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
                                    handleInput(index, "nik", value);
                                  }}
                                />
                                {/* ERROR DARI VALIDASI BARU */}
                                {fieldErrors[index]?.nik && <p className="text-[10px] mt-1 text-danger">{fieldErrors[index]?.nik}</p>}
                                {/* ERROR LAMA */}
                                {error.nik && item.nik.length < 16 && !fieldErrors[index]?.nik && <p className="text-[10px] mt-1 text-danger">Minimal NIK adalah 16 Digit</p>}
                              </div>
                            </div>
                          </div>
                        ) : null}
                        {detail.is_name ? <InputField fullWidth type="text" label={t("fullName")} placeholder={t("fullName")} value={item.full_name} onChange={(e) => handleInput(index, "full_name", e.target.value)} /> : null}

                        {/* Assistant for desktop */}
                        {detail.is_assistant ? (
                          <Field className="mb-2">
                            <Label className="text-sm font-base text-grey">Assistant</Label>
                            <Input
                              type="text"
                              value={item.is_assistant || ""}
                              onChange={(e) => handleInput(index, "is_assistant", e.target.value)}
                              placeholder="Nama Assistant"
                              className="mt-2 block w-full rounded-lg border border-primary-light bg-white/5 py-1.5 px-3 text-sm text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                            />
                          </Field>
                        ) : null}

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
                        {/* {detail.is_phone_number ? (
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
                                className="mt-0.5 sm:mt-1 w-4/5 block rounded-lg border border-primary-light bg-white/5 py-1 sm:py-1.5 px-1.5 sm:px-2 text-xs sm:text-sm/6 text-dark focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-primary-200"
                                placeholder="Contoh: 81234567890"
                                value={displayValues[index] || ""} // Tampilkan tanpa 628
                                onChange={(e) => handleInput(index, "no_telp", e.target.value)}
                                type="tel"
                              />
                            </div>
                          </Field>
                        ) : null} */}
                        {detail.is_phone_number ? (
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

                                  // BLOKIR JIKA INPUT DIMULAI DENGAN 62 ATAU 0
                                  if (numericValue.startsWith("62") || numericValue.startsWith("0")) {
                                    // Tampilkan error
                                    setFieldErrors((prev) => ({
                                      ...prev,
                                      [index]: {
                                        ...prev[index],
                                        phone: "Nomor tidak boleh dimulai dengan 62 atau 0",
                                      },
                                    }));
                                    // Jangan update nilai
                                    return;
                                  }

                                  // BLOKIR JIKA LEBIH DARI 11 DIGIT
                                  if (numericValue.length > 11) {
                                    setFieldErrors((prev) => ({
                                      ...prev,
                                      [index]: {
                                        ...prev[index],
                                        phone: "Maksimal 11 digit",
                                      },
                                    }));
                                    // Potong jadi 11 digit
                                    const trimmedValue = numericValue.slice(0, 11);
                                    handleInput(index, "no_telp", trimmedValue);
                                    return;
                                  }

                                  // Jika valid, reset error
                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    [index]: {
                                      ...prev[index],
                                      phone: undefined,
                                    },
                                  }));

                                  handleInput(index, "no_telp", numericValue);
                                }}
                                type="tel"
                              />
                            </div>
                            {/* Tambahkan pesan error validasi */}
                            {fieldErrors[index]?.phone && <p className="text-[8px] sm:text-[9px] mt-0.5 text-danger">{fieldErrors[index]?.phone}</p>}
                          </Field>
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

              {ticket.map((item: FormTicket) => {
                const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);

                // Tentukan display quantity (jumlah paket)
                let displayQty = item.qty_ticket;
                let packageCount = 1;

                if (isBundling && bundlingQty >= 2 && bundlingQty <= 99) {
                  packageCount = Math.floor(item.qty_ticket / bundlingQty);
                  displayQty = packageCount; // Tampilkan jumlah paket
                }

                const bundlingInfo = isBundling && bundlingQty >= 2 && bundlingQty <= 99 ? ` (paket ${bundlingQty} orang)` : "";

                // Display subtotal
                const displaySubtotal =
                  isBundling && bundlingQty >= 2 && bundlingQty <= 99
                    ? item.price * packageCount // Harga per paket × jumlah paket
                    : item.price * item.qty_ticket;

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
                    // 💡 KONDISI: Cek apakah ADA ticket yang bundling
                    ticket.some((item) => {
                      const { isBundling, bundlingQty } = getBundlingInfo(item.event_ticket_id);
                      return isBundling && bundlingQty >= 2 && bundlingQty <= 99;
                    })
                      ? "Paket" // Jika ADA bundling → "Paket"
                      : "Tiket" // Jika TIDAK ADA bundling → "Tiket"
                  })`}
                </p>
                <p className="font-semibold">{displayTotalSubtotalPrice > 0 ? <NumberFormatter value={displayTotalSubtotalPrice} /> : <Text>Free</Text>}</p>
              </div>
              {/* <div className="py-3 px-4 flex justify-between items-center">
                <p>{`${t("jumlah")} (${totalCount} ${t("ticket")})`}</p>
                <p className="font-semibold">{totalSubtotalPrice > 0 ? <NumberFormatter value={totalSubtotalPrice} /> : <Text>Free</Text>}</p>
              </div> */}

              {vouchers.length > 0 && (
                <div className="py-3 px-4 flex justify-between items-center">
                  <p>Voucher</p>
                  <p className="font-semibold">
                    -<NumberFormatter value={vouchers.reduce((sum, voucher) => sum + (voucher.amount || 0), 0)} />
                  </p>
                </div>
              )}

              {(() => {
                const subtotalTiket = displayTotalSubtotalPrice;
                const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
                const subtotalAfterVoucher = Math.max(subtotalTiket - totalVoucher, 0);

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
                        {/* Ambil harga dari insurance_amount */}
                        {/* <p className="text-xs text-grey">Rp {detail?.insurance_amount?.toLocaleString("id-ID") || "Kosong"}</p> */}
                        <p className="text-xs text-grey">
                          Rp {detail?.insurance_amount?.toLocaleString("id-ID") || "0"} per tiket
                          {insuranceChecked && <span className="block text-xs text-blue-600">+Rp {calculateInsuranceTotal().toLocaleString("id-ID")}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Tampilkan checkbox hanya jika insurance_require = 0 */}
                    {detail?.insurance_required === 0 ? (
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                        onChange={(e) => {
                          setInsuranceChecked(e.target.checked);
                          console.log("Asuransi checked:", e.target.checked, "Total asuransi:", calculateInsuranceTotal());
                        }}
                      />
                    ) : (
                      // Jika insurance_require = 1, checkbox hidden dan asuransi wajib
                      <div className="text-xs text-primary font-semibold">Wajib</div>
                    )}
                  </div>

                  {/* Modal Asuransi */}
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
                            {/* Tampilkan status wajib/opsional */}
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

              {/* TAX */}
              {detail?.ppn !== undefined
                ? (() => {
                    const subtotalTiket = totalSubtotalPrice;
                    const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
                    const subtotalAfterVoucher = Math.max(subtotalTiket - totalVoucher, 0);

                    // gunakan helper untuk menghitung tax & label (percentage / nominal)
                    const { tax, label, ppnType } = computeTax(detail, subtotalAfterVoucher);

                    if (tax <= 0) return null;

                    return (
                      <div className="py-3 px-4 flex justify-between items-center">
                        <p>{ppnType === "nominal" ? `Tax ${label}` : `Tax (${label})`}</p>
                        <p className="font-semibold">
                          <NumberFormatter value={tax} />
                        </p>
                      </div>
                    );
                  })()
                : null}

              {adminFee > 0 && (
                <div className="py-3 px-4 flex justify-between items-center">
                  <p>{t("adminFee")}</p>
                  <p className="font-semibold">
                    <NumberFormatter value={adminFee} />
                  </p>
                </div>
              )}

              <div className="py-3 px-4 flex justify-between items-center">
                <p>{t("totalPayment")}</p>
                {/* <p className="font-semibold">
                  {(() => {
                    const totalVoucher = vouchers.reduce((sum, v) => sum + (v?.amount || 0), 0);
                    const subtotalAfterVoucher = Math.max(displayTotalSubtotalPrice - totalVoucher, 0);
                    const tax = detail.ppn ? Math.round(subtotalAfterVoucher * (detail.ppn / 100)) : 0;
                    const grandtotal = subtotalAfterVoucher + totalTicketFee + tax;
                    return grandtotal > 0 ? <NumberFormatter value={grandtotal} /> : <Text>Free</Text>;
                  })()}
                </p> */}
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
      </div>
    ))
  );
};

export default FirstStep;
