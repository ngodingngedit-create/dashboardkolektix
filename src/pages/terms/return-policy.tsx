import React from 'react';

const RefundPolicy = () => {
  return (
    <div className='max-w-3xl mx-auto bg-white shadow-md text-dark rounded-lg p-6 pt-24 my-3'>
      <h1 className='text-2xl md:text-4xl font-bold mb-4'>
        Prosedur Pembatalan dan Refund Event di KOLEKTIX
      </h1>
      <p className='text-gray-600 mb-6'>
        <strong>21 Jul 2023 - Winda Paramita</strong>
      </p>
      <p className='mb-4'>
        Event kamu batal diadakan? Gak perlu bingung, cek prosedur pembatalan dan refund event kamu
        di KOLEKTIX.
      </p>

      <p className='mb-4'>
        Hi, Event Creator! Buat event memang gak semudah itu, ada banyak faktor tak terduga yang
        bisa mempengaruhi keberlangsungan event kamu hingga pembatalan dan penundaan event yang gak
        bisa dihindari.
      </p>

      <p className='mb-4'>
        Bagi kamu yang harus membatalkan/menunda event di KOLEKTIX, ada beberapa prosedur yang wajib
        diikuti. Baca selengkapnya di bawah ini, ya.
      </p>

      <h2 className='text-xl md:text-2xl font-semibold mb-2'>
        Prosedur Pembatalan/Penundaan Event
      </h2>
      <p className='mb-4'>
        Jika event kamu batal atau ditunda, ada beberapa langkah yang harus kamu lakukan. Berikut
        prosedur pembatalan atau penundaan event:
      </p>

      <ul className='list-disc pl-5 space-y-2 mb-4'>
        <li>
          Pihak Event Creator perlu mengirimkan pernyataan tertulis yang bertanda tangankan dari
          Event Creator. Pernyataan ini berupa file dalam format PDF yang ditujukan ke KOLEKTIX.com
          dan berisi:
          <ul className='list-disc pl-5 space-y-1'>
            <li>Nama event</li>
            <li>Link event</li>
            <li>Tanggal event</li>
            <li>Alasan pembatalan/penundaan event</li>
            <li>Tanda tangan Event Creator</li>
          </ul>
        </li>
        <li>
          Pihak Event Creator perlu mengirimkan pernyataan tertulis dalam format file WORD yang
          berisi:
          <ul className='list-disc pl-5 space-y-1'>
            <li>Nama event</li>
            <li>Tanggal event</li>
            <li>Alasan pembatalan/penundaan event</li>
            <li>Periode pengajuan refund</li>
            <li>Subject email untuk pengumuman pembatalan/penundaan event</li>
            <li>Banner event (ukuran file maksimal sebesar 1 MB).</li>
          </ul>
        </li>
        <li>
          Bagi Event Creator yang melakukan refund atas batalnya event, KOLEKTIX memiliki kebijakan
          untuk tetap mengenakan service fee sebesar 3,5% atas transaksi yang telah dilakukan.
          Pengembalian hanya termasuk harga tiket tanpa biaya convenience fee yang ditanggung
          customer atau pembeli tiket.
        </li>
        <li>
          Prosedur refund kepada customer akan mengikuti prosedur dari KOLEKTIX yang akan
          diinformasikan melalui email kepada customer.
        </li>
        <li>
          Email blast akan dikirimkan oleh pihak KOLEKTIX sesuai dengan jadwal yang telah
          ditentukan.
        </li>
      </ul>

      <h3 className='text-lg md:text-xl font-semibold mb-2'>Perlu diingat:</h3>
      <ul className='list-disc pl-5 space-y-2 mb-6'>
        <li>Event Creator harus menentukan periode pengajuan refund dengan jelas.</li>
        <li>
          Apabila hingga periode pengajuan refund ditutup masih terdapat dana yang cukup, maka biaya
          pembatalan akan dikurangi dari dana tersebut dan Event Creator dapat melakukan penarikan
          atau withdrawal.
        </li>
        <li>
          Apabila hingga periode pengajuan refund ditutup dana tidak mencukupi, maka biaya
          pembatalan akan ditagihkan kepada Event Creator. Sisa dana yang ada masih dapat ditarik
          oleh Event Creator.
        </li>
      </ul>

      <p className='mb-4'>
        Itu dia prosedur pembatalan event di KOLEKTIX. Masih ada yang ingin ditanyakan? Kamu bisa
        mengirimkan email ke{' '}
        <a href='mailto:teman@kolektix.com' className='text-blue-500 underline'>
          teman@kolektix.com
        </a>{' '}
        atau hubungi{' '}
        <a href='tel:+628119990445' className='text-blue-500 underline'>
          +62 811 9990 445
        </a>
        .
      </p>

      <h1 className='text-2xl md:text-4xl font-bold mb-4'>Kebijakan Pengembalian Uang</h1>
      <p className='mb-4'>
        Berikut adalah kebijakan pengembalian dana kami, setiap pembelian atau transaksi akan
        mencapai persyaratan yang berbeda. Silahkan baca dengan cermat ketentuan dibawah ini:
      </p>

      <ul className='list-disc pl-5 space-y-2 mb-4'>
        <li>Seluruh tiket pembeli yang telah dibeli tidak bisa diuangkan kembali.</li>
        <li>
          Pengembalian dana hanya untuk pembeli yang memiliki kendala dalam proses pembayaran,
          contoh seperti sistem bank dalam proses perbaikan atau error.
        </li>
        <li>
          Kami menghimbau kamu untuk tidak menjual tiketmu ke orang lain. Setiap kendala atau
          masalah yang disebabkan dari aktivitas tersebut bukan tanggung jawab kami.
        </li>
        <li>
          Jika kamu ingin menjual tiketmu, kamu sebaiknya mengkonfirmasikan terlebih dahulu kepada
          event creator atau kami.
        </li>
        <li>
          Kami dapat mengembalikan danamu jika ada bukti transaksi. Jika tidak, tidak kami layani.
        </li>
        <li>Bukti transaksi dapat berupa struk transfer atau mutasi rekening.</li>
        <li>
          Setiap pengembalian dana yang disebabkan oleh Force Majeure akan diatur oleh event
          creator. Ketentuan yang berlaku pada proses tersebut adalah ketentuan yang ada pada pihak
          event creator, dan diluar dari tanggung jawab kami.
        </li>
      </ul>
    </div>
  );
};

export default RefundPolicy;
