import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsConditionBlock = ({ data }: { data?: string }) => {
  const { t } = useTranslation();
  return (
    <div className='text-sm px-8 py-3 md:py-10'>
      <p className='mb-5 font-semibold'>{t('termAndCondition')}</p>
      {data ? (
        <div dangerouslySetInnerHTML={{ __html: data }}></div>
      ) : (
        <>
          <ul className='list-decimal text-xs'>
            <li className='mb-3'>Entry Pass yang valid adalah yang dibeli melalui kolektix.com</li>
            <li className='mb-3'>Satu Entry Pass berlaku untuk satu orang dan satu FDC</li>
            <li className='mb-3'>
              Panitia dan Promotor tidak bertanggung jawab/ tidak ada penggantian kerugian atas
              pembelian tiket acara melalui calo/tempat/kanal/platform/yang bukan mitra resmi
              penjualan tiket &quot;AMIS MALES TOUR&quot;
            </li>
            <li className='mb-3'>
              Tiket yang hilang/dicuri tidak akan diganti atau diterbitkan ulang. Meskipun anda
              memiliki bukti pembelian. Tiket kalian merupakan tanggung jawab kalian.
            </li>
            <li className='mb-3'>
              Panitia acara, Promotor, dan Pengisi Acara tidak bertanggung jawab atas biaya
              transportasi atau akomodasi yang telah dikeluarkan penonton untuk mengunjungi acara
              jika seandainya acara harus dibatalkan atau dipindahkan ke hari dan/atau waktu lain.
            </li>
            <li className='mb-3'>
              Dalam keadaan-keadaan kahar seperti bencana alam, kerusuhan, perang, wabah, dan semua
              keadaan darurat yang diumumkan secara resmi oleh Pemerintah.
              Panitia/penyelenggara/promotor berhak untuk membatalkan dan/atau merubah waktu acara
              dan tata letak tempat tanpa pemberitahuan sebelumnya.
            </li>
            <li className='mb-3'>
              Panitia/Penyelenggara/Promotor berhak untuk, merevisi waktu acara, tata letak tempat
              dan kapasitas penonton tanpa pemberitahuan sebelumnya.
            </li>
            <li className='mb-3'>
              Jika acara dibatalkan, Promotor harus mengembalikan uang pembelian tiket yang sudah
              dibeli dengan jangka waktu yang akan diinfokan lebih lanjut oleh Promotor, tetapi akan
              dipotong biaya bank, biaya lain-lain dan pembayaran lain yang mungkin dikenakan untuk
              mentransfer uang kembali ke pelanggan.
            </li>
            <li className='mb-3'>
              Panitia acara/penanggung jawab tempat acara, promotor, dan pengisi acara tidak
              bertanggung jawab atas hilangnya barang-barang pribadi para penonton atau
              kejadian-kejadian yang mengakibatkan cedera di semua area acara selama acara
              berlangsung, apapun alasannya.
            </li>
            <li className='mb-3'>
              Harap membawa kartu ID asli dan e-Ticket dari Kolektix.com saat melakukan penukaran
              tiket.
            </li>
            <li className='mb-3'>
              Kami menyarankan agar para penonton menggunakan transportasi online saat datang ke
              venue AMIS MALES TOUR.
            </li>
            <li className='mb-3'>
              Promotor berhak untuk:
              <ul className='list-disc'>
                <li className='mb-3'>
                  Melarang penonton masuk jika Entry Pass telah digunakan oleh orang lain.
                </li>
                <li className='mb-3'>
                  Melarang penonton masuk ke area venue AMIS MALES TOUR jika Entry Pass yang
                  digunakan tidak valid.
                </li>
                <li className='mb-3'>
                  Memproses atau mengajukan hukuman, baik perdata maupun pidana, terhadap pengunjung
                  yang mendapatkan Entry Pass secara tidak sah, termasuk ditemukannya memalsukan dan
                  menggandakan Entry Pass yang sah atau memperoleh Entry Pass dengan cara yang tidak
                  sesuai dengan prosedur.
                </li>
              </ul>
            </li>
            <li className='mb-3'>
              Penyelenggara mengambil tindakan tegas, dan berhak mengeluarkan pengunjung dari venue
              AMIS MALES TOUR jika tidak mematuhi protokol kesehatan yang telah diterapkan.
            </li>
            <li className='mb-3'>
              Barang yang boleh dibawa kedalam venue AMIS MALES TOUR:
              <ul className='list-disc'>
                <li className='mb-3'>Membawa kartu identitas dan uang pribadi</li>
                <li className='mb-3'>Membawa bukti tiket/tanda masuk</li>
                <li className='mb-3'>Membawa masker dan hand sanitizer</li>
                <li className='mb-3'>Membawa obat-obatan pribadi</li>
                <li className='mb-3'>Membawa jas hujan</li>
                <li className='mb-3'>Membawa handphone / perangkat lainnya</li>
              </ul>
            </li>
            <li className='mb-3'>
              Barang yang tidak diperbolehkan dibawa kedalam venue AMIS MALES TOUR:
              <ul className='list-disc'>
                <li className='mb-3'>
                  Makanan dan minuman dari luar ke dalam venue AMIS MALES TOUR
                </li>
                <li className='mb-3'>Kamera profesional seperti Drone, SLR, DSLR.</li>
                <li className='mb-3'>Tongsis atau Selfie Stick.</li>
                <li className='mb-3'>
                  Minuman beralkohol, obat-obatan terlarang, psikotropika, atau barang yang
                  mengandung zat berbahaya lainnya.
                </li>
                <li className='mb-3'>
                  Senjata tajam/api, bahan peledak, dan benda-benda yang dilarang menurut ketentuan
                  peraturan perundang-undangan yang berlaku ke dalam venue AMIS MALES TOUR.
                </li>
                <li className='mb-3'>Cairan dan benda yang mudah terbakar.</li>
                <li className='mb-3'>Laser dan pointer.</li>
                <li className='mb-3'>Dipersilahkan membawa rokok atau rokok elektrik.</li>
                <li className='mb-3'>
                  Barang yang berbahaya untuk orang lain maupun diri sendiri walaupun tidak
                  disebutkan pada peraturan diatas.
                </li>
              </ul>
            </li>
            <li className='mb-3'>
              Pihak promotor/ penyelenggara acara berhak mengambil, menyita dan tidak mengembalikan
              kepada penonton jika ditemukannya barang terlarang saat pengecekan barang.
            </li>
            <li className='mb-3'>
              Dilarang membuat kerusuhan dalam situasi apapun di dalam area venue AMIS MALES TOUR.
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default TermsConditionBlock;
