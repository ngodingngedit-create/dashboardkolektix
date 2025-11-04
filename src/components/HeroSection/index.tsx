import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useWindowSize from "@/utils/useWindowSize";
import Image from "next/image";
import Upcoming from "@/components/Home/Upcoming";
import { Get } from "@/utils/REST";
import { EventProps, SliderProps } from "@/utils/globalInterface";
import { useRouter } from "next/router";
import { AspectRatio, Box, Image as ImageM } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useInterval } from "@mantine/hooks";

declare global {
  interface Window {
    intervalSet?: boolean;
  }
}

interface HeroProps {
  data: EventProps[];
  slider: SliderProps[];
  loading: boolean;
}

const HeroSection = ({ data, slider, loading }: HeroProps) => {
  const [onLoad, setOnLoad] = useState(false);
  const [sliderData, setSliderData] = useState<SliderProps[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setOnLoad(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getData = () => {
    setLoading(true);
    Get("slider", {})
      .then((res: any) => {
        const allData = res.data;
        setSliderData(allData);
        setLoading(false);

        if (window && !window.intervalSet) {
          if (!document.querySelector("#HeroSectionNextBtn")) return;
          window.intervalSet = true;
          let userClicked = false;

          const interval = setInterval(() => {
            if (!userClicked) {
              (document.querySelector("#HeroSectionNextBtn") as HTMLButtonElement)?.click();
            }
          }, 5000);

          document.querySelector("#HeroSectionNextBtn")?.addEventListener("click", () => {
            userClicked = true;
            clearInterval(interval);
            setTimeout(() => {
              userClicked = false;
              window.intervalSet = false;
              getData();
            }, 5000);
          });
        }
      })
      .catch((err) => {
        console.log("Error fetching data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const { width } = useWindowSize();
  const [slide, setSlide] = useState(0);

  if (!onLoad) {
    return (
      <div className="bg-hero">
        <div className="flex items-center justify-center pt-28 pb-10">
          <div className="animate-pulse h-[180px] md:h-[220px] w-[100%] md:w-[70%] bg-light-grey rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-hero">
      <div className="py-20 max-w-screen-xl mx-auto" id="hero">
        <Carousel
          controlsOffset={width && width > 768 ? "17vw" : "40px"}
          maw={1280}
          mx="auto"
          slideSize={width && width > 768 ? "70%" : "calc(100% - 40px)"}
          slideGap={20}
          loop
          slidesToScroll={1}
          nextControlProps={{
            id: "HeroSectionNextBtn",
          }}
          onSlideChange={(e) => setSlide(e)}
        >
          {sliderData.map((e, i) => (
            <Carousel.Slide key={i} className={`${slide == i ? "z-20" : ""}`}>
              <AspectRatio
                onClick={() => (e.link ? window.open(e.link, "_blank") : {})}
                ratio={750 / 246}
                className={`
                    ${e.link ? "cursor-pointer" : ""}
                    ${slide != i ? "scale-80" : ""}
                    ${(slide < i && i != sliderData.length - 1) || slide == i - 1 || (slide == sliderData.length - 1 && i == 0) ? "!-translate-x-1/4" : ""}
                    ${slide > i || (i == sliderData.length - 1 && i != slide) ? "translate-x-1/4" : ""}
                    transition-transform duration-500 ease-in-out`}
              >
                <ImageM src={e.image_url} className={`!rounded-xl !drop-shadow-xls`} />
              </AspectRatio>
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
      {data.length > 0 && <Upcoming className="mt-3" data={data} loading={loading} />}
    </div>
  );
};

export default HeroSection;
