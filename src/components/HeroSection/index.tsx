import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import useWindowSize from '@/utils/useWindowSize';
import Image from 'next/image';
import Upcoming from '@/components/Home/Upcoming';
import { Get } from '@/utils/REST';
import { EventProps, SliderProps } from '@/utils/globalInterface';

interface HeroProps {
  data: EventProps[];
  slider: SliderProps[];
  loading: boolean;
}

const HeroSection = ({ data, slider, loading }: HeroProps) => {
  const [onLoad, setOnLoad] = useState(false);
  const [sliderData, setSliderData] = useState<SliderProps[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOnLoad(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getData = () => {
    setLoading(true);
    Get('slider', {})
      .then((res: any) => {
        const allData = res.data;
        setSliderData(allData);
        setLoading(false);
      })
      .catch((err) => {
        console.log('Error fetching data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const { width } = useWindowSize();
  const settings = {
    className: 'center',
    pauseOnHover: true,
    centerMode: true,
    centerPadding: '100px',
    slidesToShow: 3,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 1000,
    // infinite: false,
  };

  const settingsMobile = {
    className: 'center',
    pauseOnHover: true,
    centerMode: true,
    centerPadding: '100px',
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 1000,
    infinite: false,
  };

  if (!onLoad) {
    return (
      <div className='bg-hero'>
        <div className='flex items-center justify-center pt-28 pb-10'>
          <div className='animate-pulse h-[180px] md:h-[220px] w-[100%] md:w-[70%] bg-light-grey rounded-xl'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-hero'>
      {width && width > 768 ? (
        <div className='pt-20 ' id='hero'>
          <Slider {...settings}>
            {sliderData.map((el) => (
              <div key={el.id} className='mx-40'>
                <Image 
                  src={el.image_url} 
                  alt={el.name} 
                  className='drop-shadow-xl rounded-xl -translate-x-[20px]'
                  width={700}
                  height={500} 
                />
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        <div className='pt-20' id='slidermob'>
          <Slider {...settingsMobile}>
            {sliderData.map((el) => (
              <div key={el.id} className='mx-auto'>
                <Image 
                  src={el.image_url} 
                  alt={el.name} 
                  className='drop-shadow-xl rounded-md object-cover' 
                  width={500}
                  height={500}
                />
              </div>
            ))}
          </Slider>
        </div>
      )}
      {data.length > 0 && <Upcoming className='mt-3' data={data} loading={loading} />}
    </div>
  );
};

export default HeroSection;
