"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Foto from "../../assets/images/amis-banner.png";
import Button from "@/components/Button";
import Image from "next/image";
import Images from "@/components/Images";
import ModalTransaction from "@/components/ModalTransaction";
import Cookies from "js-cookie";
import { Spinner } from "@nextui-org/react";
import { TransactionProps } from "@/utils/globalInterface";
// import ThirdStep from "@/components/Payment/ThirdStep";
import { Get } from "@/utils/REST";
import Countdown, { CountdownRendererFn } from "react-countdown";
import useWindowSize from "@/utils/useWindowSize";
import { totalmem } from "os";

const Payment = () => {
  const router = useRouter();
  useEffect(() => {
    const userData = Cookies.get("token");
    userData === undefined && router.push("/auth");
  }, []);
  const { id } = router.query;
  const [step, setStep] = useState<number>(0);
  const [transactionData, setTransactionData] = useState<TransactionProps>();
  const [showModalTransaction, setShowModalTransaction] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const isBrowser = () => typeof window !== "undefined";
  function padToTwoDigits(num: number) {
    return num.toString().padStart(2, "0");
  }
  const now = new Date();
  const targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const dayName = days[targetDate.getDay()];
  const day = padToTwoDigits(targetDate.getDate());
  const month = months[targetDate.getMonth()];
  const year = targetDate.getFullYear();
  const hours = padToTwoDigits(targetDate.getHours());
  const minutes = padToTwoDigits(targetDate.getMinutes());
  const { width } = useWindowSize();

  const formattedDate = `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}`;

  // Hitung grandtotal dengan bundling logic (untuk Step 2)
  const calculateGrandtotalWithBundling = (transaction: TransactionProps) => {
    if (!transaction?.tickets) return transaction?.grandtotal || 0;

    // Hitung base amount dengan bundling logic
    const baseAmount = transaction.tickets.reduce((total, item) => {
      const isBundling = item.has_event_ticket?.is_bundling === 1;
      const bundlingQty = item.has_event_ticket?.bundling_qty || 0;

      if (isBundling && bundlingQty >= 2 && bundlingQty <= 4) {
        const packageCount = Math.floor(item.qty_ticket / bundlingQty);
        return total + (packageCount > 0 ? item.price * packageCount : item.price * item.qty_ticket);
      }
      return total + item.price * item.qty_ticket;
    }, 0);

    // Hitung voucher discount (jika ada di transaction data)
    const voucherDiscount = 0; // Tidak ada data voucher di Step 2

    const subtotal = Math.max(baseAmount - voucherDiscount, 0);
    const ppnValue = Number(transaction.has_event.ppn);
    const taxAmount = subtotal > 0 ? subtotal * (ppnValue / 100) : 0;

    // Hitung ticket fee
    const totalTicketFee = transaction.tickets.reduce((sum, ticket) => {
      const fee = ticket.has_event_ticket?.ticket_fee ?? 0;
      return sum + fee * ticket.qty_ticket;
    }, 0);

    return subtotal + totalTicketFee + taxAmount;
  };

  const frontendGrandtotal = transactionData ? calculateGrandtotalWithBundling(transactionData) : 0;

  const renderer: CountdownRendererFn = ({ hours, minutes, seconds }) => {
    return (
      <div className="flex flex-col items-center justify-center  font-semibold">
        <h3 className="text-[15px] my-5">Waktu untuk Pembayaran Tersisa</h3>
        <div className="bg-primary-light border-2 border-primary-light-200 text-[40px] px-6 py-2 rounded-xl">
          <div className="flex">
            <div className="pr-4">
              {String(hours).padStart(2, "0")}
              <p className="text-sm font-medium text-center text-grey">Jam</p>
            </div>
            <div className="border-2 border-x-primary-light-200 border-y-primary-light px-4">
              {String(minutes).padStart(2, "0")}
              <p className="text-sm font-medium text-center text-grey">Menit</p>
            </div>
            <div className="pl-4">
              {String(seconds).padStart(2, "0")}
              <p className="text-sm font-medium text-center text-grey">Detik</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-center font-light my-5 px-4">
          Batas pembayaran sampai dengan <span className="font-semibold">{formattedDate}</span> Harap selesaikan pembayaran sebelum waktu tersebut untuk menghindari pembatalan otomatis.
        </p>
      </div>
    );
  };

  const getPayment = () => {
    setLoading(true);
    Get(`transaction/${id}`, {})
      .then((res: any) => {
        setTransactionData(res.data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
  };

  function scrollToTop() {
    if (!isBrowser()) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (id) {
      getPayment();
    }
  }, [id]);

  // useEffect(() => {
  //   if (transactionData) {
  //     if (typeof transactionData.payment_method === 'object') {
  //       getPaymentMethodById(transactionData.payment_method.id);
  //     }
  //   }
  // }, [transactionData]);

  return (
    <>
      {width && transactionData && step === 0 && width > 768 && (
        <div className="w-full fixed flex justify-end gap-3 bottom-0 bg-white border-t-2 border-t-primary-light-200 z-50 p-5">
          <Button
            color="primary"
            label="Bayar Sekarang"
            disabled={loading}
            onClick={
              transactionData.payment_method.id === 3
                ? () => {
                    setLoading(true);
                    router.push(transactionData.xendit_url);
                  }
                : () => {
                    setStep(2);
                    scrollToTop();
                  }
            }
          />
        </div>
      )}
      {!loading ? (
        transactionData ? (
          <div className="text-dark">
            {/* {step === 0 && <ThirdStep scrollToTop={scrollToTop} setLoading={setLoading} setStep={setStep} transactionData={transactionData} loading={loading}/>} */}
            {step === 2 && (
              <div className="bg-primary-light text-dark">
                <Image src={Foto} alt="Banner" className="w-full" />

                <div className="bg-white">
                  <div className="border-b-2 p-3 border-primary-light">
                    <Countdown date={targetDate} intervalDelay={0} precision={3} renderer={renderer} autoStart={true} />
                  </div>
                  <div className="border-b-2 p-3 border-primary-light flex gap-3"></div>
                </div>

                <div className="bg-white mt-1">
                  <div className="border-b-2 p-3 border-primary-light flex gap-3">
                    <div className="flex items-center gap-3">
                      <p className=" font-semibold">{transactionData.payment_method.payment_name}</p>
                      <Images type="logo" path={transactionData.payment_method.logo} alt={transactionData.payment_method.payment_name} className="w-8 h-8 object-contain" />
                    </div>
                  </div>
                  <div className="bg-white mt-1">
                    <div className="border-b-2 p-3 border-primary-light flex flex-col gap-2">
                      <div>
                        <p className="text-xs text-grey mb-1">Kode Invoice</p>
                        <p className="text-sm mb-1">{transactionData.invoice_no}</p>
                      </div>
                      <div>
                        <p className="text-xs text-grey mb-1">No. Rekening</p>
                        <p className="text-sm mb-1">{transactionData.payment_method.account_no}</p>
                        <p className="text-xs mb-1">Atas Nama {transactionData.payment_method.account_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-grey mb-1">Total Pembayaran</p>
                        <p className="text-sm mb-1">{`Rp${transactionData.grandtotal.toLocaleString("id-ID")}`}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white mt-1">
                  <div className="border-b-2 p-3 border-primary-light flex flex-col gap-2">
                    <div className="flex justify-between">
                      <p className="text-xs text-grey mb-1">Regular Ticket {`x(${transactionData.total_qty})`}</p>
                      <p className="text-xs mb-1">Rp{transactionData.total_price.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-grey mb-1">Pajak</p>
                      <p className="text-xs mb-1">
                        Rp
                        {transactionData.ppn ? transactionData.ppn.toLocaleString("id-ID") : 0}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-grey mb-1">Biaya Admin</p>
                      <p className="text-xs mb-1">
                        Rp
                        {transactionData.admin_fee ? transactionData.admin_fee.toLocaleString("id-ID") : 0}
                      </p>
                    </div>
                    <div className="border-t-2 border-primary-light">
                      <div className="flex items-center justify-between font-semibold">
                        <p>Total Pembayaran</p>
                        <p>{`Rp${transactionData.grandtotal.toLocaleString("id-ID")}`}</p>
                      </div>
                      <button className="w-full bg-primary-dark text-white py-2 rounded-lg my-3" onClick={() => setShowModalTransaction(!showModalTransaction)}>
                        {loading ? <Spinner color="default" size="sm" /> : "Upload Bukti Pembayaran"}
                      </button>
                      <ModalTransaction id={transactionData.id} invoice={transactionData.invoice_no} isOpen={showModalTransaction} setIsOpen={setShowModalTransaction} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          id && <div className="min-h-screen flex justify-center items-center text-dark">Data pembayaran tidak ditemukan</div>
        )
      ) : (
        <div className="min-h-screen flex justify-center items-center">
          <Spinner color="primary" size="lg" />
        </div>
      )}
    </>
  );
};

export default Payment;
