const DescriptionBlock = ({ data }: { data?: string }) => {
  return (
    <div>
      <div className='text-sm py-3 px-4 md:px-0 md:py-12 md:w-2/3 mb-60 lg:mb-0 md:mb-0'>
        <p className='mb-5 font-semibold'>Deskripsi Tentang event</p>
        {data ? (
          <div dangerouslySetInnerHTML={{ __html: data }}></div>
        ) : (
          <>
            <p>
              Amis Males Tour adalah sebuah rangkaian promosi dari album pertama Amis yang diberi
              nama Filosofi Males. Tour ini akan dilaksanakan di 33 Kota. Amis ingin menyampaikan
              sebuah pesan bahwa semua kesuksesan berawal dari kemalasan. Orang malas adalah
              orang-orang yang menemukan jalan pintas.
            </p>
            <br />
            <p>
              Sesuai dengan single dalam albumnya “Darurat Judi”, Tour ini juga merupakan sebuah
              jalan pintas untuk memberantas kebiasaan bermain Judi Online. Ia melihat yang
              berkewajiban masih berada di tahap malas, namun belum menemukan jalan pintas.
            </p>
          </>
        )}
        <br />
      </div>
    </div>
  );
};

export default DescriptionBlock;
