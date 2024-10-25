import { useState } from 'react';
import Head from 'next/head';

const PrivacyPolicyPage: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setActiveItem(activeItem === id ? null : id);
  };

  return (
    <>
      <Head>
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>Terms and Conditions</title>
      </Head>
      <div className='flex mt-14'>
        <aside
          className='w-1/4 bg-blue-600 text-white min-h-screen p-4'
          style={{ backgroundColor: '#02255a' }}
        >
          <h2 className='text-2xl font-semibold mb-4'>Kebijakan Privasi</h2>
          {[
            {
              id: 'introduction',
              title: 'Introduksi',
              links: [{ href: '#introduction', text: 'Defenisi' }],
            },
            {
              id: 'data-collection',
              title: 'Pengumpulan Data',
              links: [{ href: '#data-collection', text: 'Pengumpulan Informasi' }],
            },
            {
              id: 'data-usage',
              title: 'Penggunaan Data',
              links: [{ href: '#data-usage', text: 'Pengungkapan Data Pribadi' }],
            },
            {
              id: 'data-sharing',
              title: 'Penyimpanan Data',
              links: [{ href: '#data-sharing', text: 'Proses Penyimpanan Data' }],
            },
            {
              id: 'user-rights',
              title: 'Pengakuan & Persetujuan',
              links: [{ href: '#user-rights', text: 'Pengakuan & Persetujuan' }],
            },
            {
              id: 'policy-changes',
              title: 'Platform Pihak Ketiga',
              links: [{ href: '#policy-changes', text: 'Pihak Ketiga' }],
            },
            {
              id: 'contact-us',
              title: 'Hubungi Kami',
              links: [{ href: '#contact-us', text: 'Cara Menghubungi Kami' }],
            },
          ].map((item) => (
            <div key={item.id} className='accordion-item mb-4'>
              <button
                className={`w-full text-left ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => toggleAccordion(item.id)}
              >
                {item.title}
              </button>
              <div
                className={`accordion-content pl-4 ${activeItem === item.id ? 'block' : 'hidden'}`}
              >
                {item.links.map((link) => (
                  <a key={link.href} href={link.href} className='block py-1'>
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </aside>
        <main className='w-3/4 p-6 text-dark'>
          <section id='introduction' className='mb-6'>
            <h2 className='text-2xl font-semibold mb-4'>Defenisi</h2>
            <p>
              {`Kebijakan Privasi berikut ini menjelaskan bagaimana Kami, (PT. KOLEKTIX MAJU BERSAMA,
              afiliasi-afiliasi Kami, dan pihak yang berkerja sama dengan Kami secara khusus untuk
              menyediakan layanan, produk dan/atau jasa kepada Anda, untuk selanjutnya disebut
              "Kami") mengumpulkan, menyimpan, menggunakan, mengolah, menguasai, mentransfer,
              mengungkapkan dan melindungi Informasi Pribadi Anda.`}
            </p>
            <p>
              {`Kebijakan Privasi ini berlaku bagi setiap pelanggan dan/atau pengguna (“Pelanggan”)
              dan penyedia tiket sebagai pemilik tiket dan/atau yang menyediakan tiket (“Penyedia
              Tiket”) pada situs kolektix(https://www.kolektix.com) ("Platform"), kecuali diatur
              pada kebijakan privasi yang terpisah.`}
            </p>
            <p>
              Mohon baca Kebijakan Privasi ini dengan seksama untuk memastikan bahwa Anda memahami
              bagaimana proses pengumpulan, penggunaan, dan pengolahan data Kami.
            </p>
          </section>
          <section id='data-collection' className='mb-6'>
            <h2 className='text-2xl font-semibold mb-4'>Pengumpulan Data</h2>
            <p>
              {` Kami mengumpulkan informasi yang mengidentifikasikan atau dapat digunakan untuk
              mengidentifikasi, menghubungi, atau menemukan orang atau perangkat yang terkait dengan
              informasi tersebut ("Informasi Pribadi"). Kami dapat mengumpulkan informasi dalam
              berbagai macam bentuk dan tujuan, termasuk tujuan yang diizinkan berdasarkan peraturan
              perundang-undangan yang berlaku.`}
            </p>
            <ul className='list-disc list-inside ml-4'>
              <li>Pengumpulan Informasi Pribadi Pelanggan</li>
              <li>Pengumpulan Informasi Pribadi Penyedia Tiket</li>
              <li>Informasi yang Kami Kumpulkan Secara Langsung</li>
              <li>Informasi yang Dikumpulkan Setiap Kali Anda Menggunakan Platform</li>
              <li>Penggunaan Cookies</li>
              <li>Informasi Lokasi</li>
              <li>Informasi dari Pihak Ketiga</li>
              <li>Informasi Tentang Pihak Ketiga yang Anda Berikan</li>
            </ul>
          </section>
          <section id='data-usage' className='mb-6'>
            <h2 className='text-2xl font-semibold mb-4'>Penggunaan Data</h2>
            <p>
              Anda setuju untuk memberikan Informasi Pribadi kepada Kami, dan Kami dapat menggunakan
              informasi tersebut untuk tujuan berikut, serta tujuan lain yang diizinkan oleh
              peraturan perundang-undangan yang berlaku:
            </p>
            <ul className='list-disc list-inside ml-4'>
              <li>Identifikasi dan pendaftaran sebagai Pengguna serta administrasi akun.</li>
              <li>
                Verifikasi informasi, termasuk proses Mengenal Pelanggan (Know Your Customer).
              </li>
              <li>Fasilitasi penggunaan layanan, produk, dan akses ke Platform.</li>
              <li>Pengolahan pesanan dan pembayaran melalui Platform.</li>
              <li>Penyampaian informasi pengiriman produk dan dukungan konsumen.</li>
              <li>Verifikasi dan transaksi keuangan.</li>
              <li>Pemberitahuan pembaruan pada Platform atau layanan.</li>
              <li>Penelitian tentang demografi dan perilaku Pengguna.</li>
              <li>Pemeliharaan dan pengembangan Platform.</li>
              <li>Penyediaan komunikasi pemasaran dan materi promosi.</li>
              <li>Pengolahan pertanyaan dan saran Pengguna.</li>
            </ul>
          </section>
          <section id='data-sharing' className='mb-6'>
            <h2 className='text-2xl font-semibold mb-4'>
              TEMPAT KAMI MENYIMPAN INFORMASI PRIBADI ANDA
            </h2>
            <p className='mb-4'>
              Informasi Pribadi dari Anda yang Kami kumpulkan dapat disimpan, ditransfer, atau
              diolah oleh Penyedia Tiket pihak ketiga. Kami akan menggunakan semua upaya yang wajar
              untuk memastikan bahwa semua Penyedia Tiket pihak ketiga tersebut memberikan tingkat
              perlindungan yang sebanding dengan komitmen Kami berdasarkan Kebijakan Privasi ini.
            </p>
            <p>
              Informasi Pribadi Anda juga dapat disimpan atau diproses di luar negara Anda oleh
              pihak yang bekerja untuk Kami di negara lain, atau oleh Penyedia Tiket pihak ketiga,
              vendor, pemasok, mitra, kontraktor, atau afiliasi Kami. Dalam hal tersebut, Kami akan
              memastikan bahwa Informasi Pribadi tersebut tetap menjadi subjek dari tingkat
              perlindungan yang sebanding dengan apa yang disyaratkan dalam hukum negara Anda (dan,
              dalam hal apapun, sejalan dengan komitmen Kami dalam Kebijakan Privasi ini).
            </p>
          </section>
          <section id='user-rights' className='mb-6'>
            <h2 className='text-2xl font-semibold mb-4'>PENGAKUAN DAN PERSETUJUAN</h2>
            <p className='mb-4'>
              Dengan menyetujui Kebijakan Privasi, Anda mengakui bahwa Anda telah membaca dan
              memahami Kebijakan Privasi ini dan menyetujui segala ketentuannya. Secara khusus, Anda
              setuju dan memberikan persetujuan kepada Kami untuk mengumpulkan, menggunakan,
              membagikan, mengungkapkan, menyimpan, mentransfer, dan/atau mengolah Informasi Pribadi
              Anda sesuai dengan Kebijakan Privasi ini.
            </p>
            <p className='mb-4'>
              Dalam keadaan di mana Anda memberikan kepada Kami Informasi Pribadi yang berkaitan
              dengan individu lain (seperti Informasi Pribadi yang berkaitan dengan pasangan Anda,
              anggota keluarga, teman, atau pihak lain), Anda menyatakan dan menjamin bahwa Anda
              telah memperoleh persetujuan dari individu tersebut untuk, dan dengan ini menyetujui
              atas nama individu tersebut untuk, pengumpulan, penggunaan, pengungkapan dan
              pengolahan Informasi Pribadi mereka oleh Kami.
            </p>
            <p className='mb-4'>
              {` Anda dapat menarik persetujuan Anda untuk setiap atau segala pengumpulan, penggunaan
              atau pengungkapan Informasi Pribadi Anda kapan saja dengan memberikan kepada Kami
              pemberitahuan yang wajar secara tertulis menggunakan rincian kontak yang disebutkan di
              bawah ini. Anda juga dapat menarik persetujuan pengiriman komunikasi dan informasi
              tertentu dari Kami melalui fasilitas "opt-out" atau pilihan "berhenti berlangganan"
              yang tersedia dalam pesan Kami kepada Anda. Tergantung pada keadaan dan sifat
              persetujuan yang Anda tarik, Anda harus memahami dan mengakui bahwa setelah penarikan
              persetujuan tersebut, Anda mungkin tidak lagi dapat menggunakan Platform atau layanan.
              Penarikan persetujuan Anda dapat mengakibatkan penghentian Akun Anda atau hubungan
              kontraktual Anda dengan Kami, dengan semua hak dan kewajiban yang muncul sepenuhnya
              harus dipenuhi. Setelah menerima pemberitahuan untuk menarik persetujuan untuk
              pengumpulan, penggunaan atau pengungkapan Informasi Pribadi Anda, Kami akan
              menginformasikan Anda tentang konsekuensi yang mungkin terjadi dari penarikan tersebut
              sehingga Anda dapat memutuskan apakah Anda tetap ingin menarik persetujuan.`}
            </p>
          </section>
          <section id='policy-changes' className='mb-6'>
            <h2 className='text-2xl font-semibold mb-4'>PLATFORM PIHAK KETIGA</h2>
            <p className='mb-4'>
              Platform, situs web, dan Materi Pemasaran dapat berisi tautan ke situs web yang
              dioperasikan oleh pihak ketiga. Kami tidak mengendalikan atau menerima
              pertanggungjawaban atau tanggung jawab untuk situs web ini dan untuk pengumpulan,
              penggunaan, pemeliharaan, berbagi, atau pengungkapan data dan informasi oleh pihak
              ketiga tersebut. Silakan baca syarat dan ketentuan dan kebijakan privasi dari situs
              web pihak ketiga tersebut untuk mengetahui bagaimana mereka mengumpulkan dan
              menggunakan Informasi Pribadi Anda.
            </p>
            <p>
              Iklan yang terdapat pada Platform dan Materi Pemasaran Kami berfungsi sebagai tautan
              ke situs web pengiklan dan dengan demikian segala informasi yang mereka kumpulkan
              berdasarkan klik Anda pada tautan itu akan dikumpulkan dan digunakan oleh pengiklan
              yang relevan sesuai dengan kebijakan privasi pengiklan tersebut.
            </p>
          </section>
          <section id='contact-us' className='mb-6'>
            <h2 className='text-2xl font-semibold mb-4'>CARA UNTUK MENGHUBUNGI KAMI</h2>
            <p className='mb-4'>
              Jika Anda ingin menarik persetujuan Anda dalam penggunaan informasi pribadi, meminta
              akses dan / atau koreksi dari Informasi Pribadi Anda, memiliki pertanyaan, komentar
              atau masalah, atau memerlukan bantuan mengenai hal-hal teknis, jangan ragu untuk
              hubungi Kami di:
            </p>
            <p className='mb-4'>
              <strong>PT Kolektix Maju Bersama</strong>
            </p>
            <p className='mb-4'>
              Alamat: Pasar Kita Pintu barat 2 Blok K17/18 Pamulang Barat, Kec. pamulang, kota
              tanggerang selatan banten 15417
            </p>
            <p className='mb-4'>
              Email ke{' '}
              <a href='mailto:teman@kolektix.com' className='text-blue-500 hover:underline'>
                teman@kolektix.com
              </a>{' '}
              atau hubungi{' '}
              <a href='tel:+628119990445' className='text-blue-500 hover:underline'>
                +62 811 9990 445
              </a>
              .
            </p>
          </section>
        </main>
      </div>
      <style jsx>{`
        .accordion-content {
          display: none;
        }
        .accordion-item {
          position: relative;
          padding-left: 20px; /* Adjust to your liking */
        }
        .accordion-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px; /* Adjust thickness */
          background-color: #eb671e; /* Adjust color */
        }
        .active::before {
          background-color: yellow; /* Change to the desired active color */
        }
        .active {
          font-weight: bold; /* Optional: makes the text bold */
          border-radius: 6px;
          background-color: rgba(
            255,
            255,
            255,
            0.2
          ); /* Optional: background color for active item */
        }
      `}</style>
    </>
  );
};

export default PrivacyPolicyPage;
