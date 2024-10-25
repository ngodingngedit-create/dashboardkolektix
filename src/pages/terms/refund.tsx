import React from 'react';

const ReturnPolicy = () => {
  return (
    <div className='pt-20 text-dark'>
      <div className='max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6'>
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
            creator. Ketentuan yang berlaku pada proses tersebut adalah ketentuan yang ada pada
            pihak event creator, dan diluar dari tanggung jawab kami.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ReturnPolicy;
