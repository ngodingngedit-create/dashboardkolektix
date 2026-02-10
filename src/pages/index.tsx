// import HeroSection from "@/components/HeroSection";
// import EventList from "@/components/Home/EventList";
// import CategoryBlock from "@/components/Home/CategoryBlock";
// import { useEffect, useState } from "react";
// import { Get } from "@/utils/REST";
// import { EventProps, SliderProps, VacancyProps } from "@/utils/globalInterface";
// import Cookies from "js-cookie";
// import { useRouter } from "next/router";
// import PromoBlock from "@/components/Home/PromoBlock";
// import JobsList from "@/components/Home/JobsList";
// import TalentList from "@/components/Home/TalentList";
// import MerchandiseList from "@/components/Home/MerchandiseList";
// import ChatBox from "@/components/chat";
// import useWindowSize from "@/utils/useWindowSize";

// export default function Home() {
//   const [loading, setLoading] = useState<boolean>(false);
//   const [data, setData] = useState<EventProps[]>([]);
//   const [vacancy, setVacancy] = useState<VacancyProps[]>([]);
//   const [sliderData, setSliderData] = useState<SliderProps[]>([]);
//   const [activeRequests, setActiveRequests] = useState<number>(0);
//   const [upcoming, setUpcoming] = useState<EventProps[]>([]);

//   const handleRequestStart = () => {
//     setActiveRequests((prev) => prev + 1);
//     setLoading(true);
//   };

//   const handleRequestEnd = () => {
//     setActiveRequests((prev) => {
//       const newCount = prev - 1;
//       if (newCount === 0) {
//         setLoading(false);
//       }
//       return newCount;
//     });
//   };
//   const getData = () => {
//     handleRequestStart();
//     Get("event", {})
//       .then((res: any) => {
//         setData(
//           res.data.sort((b: any, a: any) => {
//             return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
//           })
//         );
//         handleRequestEnd();
//       })
//       .catch((err) => {
//         console.log(err);
//         handleRequestEnd();
//       });
//   };

//   const getVacancy = () => {
//     handleRequestStart();
//     Get("vacancy", {})
//       .then((res: any) => {
//         setVacancy(res.data);
//         handleRequestEnd();
//       })
//       .catch((err) => {
//         handleRequestEnd();
//       });
//   };

//   const getSliderData = () => {
//     handleRequestStart();
//     Get("slider", {})
//       .then((res: any) => {
//         setSliderData(res.data);
//         handleRequestEnd();
//       })
//       .catch((err) => {
//         handleRequestEnd();
//       });
//   };

//   const getUpcomingData = () => {
//     handleRequestStart();
//     Get("event-up-coming", {})
//       .then((res: any) => {
//         setUpcoming(res.data);
//         handleRequestEnd();
//       })
//       .catch((err) => {
//         handleRequestEnd();
//       });
//   };

//   useEffect(() => {
//     Cookies.remove("ticketCount", { path: "/" });
//     Cookies.remove("selected", { path: "/" });
//     getData();
//     getUpcomingData();
//     getVacancy();
//     getSliderData();
//   }, []);

//   useEffect(() => {
//     console.log(activeRequests, "request");
//     console.log(loading, "loading");
//   }, [loading]);
//   return (
//     <main className="bg-white min-h-screen">
//       <HeroSection data={upcoming} loading={loading} slider={sliderData} />
//       {/* <EventList data={data} loading={loading} /> */}
//       <CategoryBlock />
//       <EventList data={data} loading={loading} />
//       <PromoBlock />
//       <ChatBox />
//       {/* <JobsList data={vacancy} loading={loading} /> */}
//       {/* <TalentList /> */}
//       <MerchandiseList data={data} />
//     </main>
//   );
// }

// import HeroSection from "@/components/HeroSection";
// import EventList from "@/components/Home/EventList";
// import CategoryBlock from "@/components/Home/CategoryBlock";
// import { useEffect, useState } from "react";
// import { Get } from "@/utils/REST";
// import { EventProps, SliderProps, VacancyProps } from "@/utils/globalInterface";
// import { MerchListResponse } from "@/pages/dashboard/merch/type";
// import Cookies from "js-cookie";
// import { useRouter } from "next/router";
// import PromoBlock from "@/components/Home/PromoBlock";
// import JobsList from "@/components/Home/JobsList";
// import TalentList from "@/components/Home/TalentList";
// import MerchandiseList from "@/components/Home/MerchandiseList";
// import ChatBox from "@/components/chat";
// import useWindowSize from "@/utils/useWindowSize";

// export default function Home() {
//   const [loading, setLoading] = useState<boolean>(false);
//   const [data, setData] = useState<EventProps[]>([]);
//   const [vacancy, setVacancy] = useState<VacancyProps[]>([]);
//   const [sliderData, setSliderData] = useState<SliderProps[]>([]);
//   const [activeRequests, setActiveRequests] = useState<number>(0);
//   const [upcoming, setUpcoming] = useState<EventProps[]>([]);
//   const [merchandiseData, setMerchandiseData] = useState<MerchListResponse[]>([]);
//   const [merchandiseLoading, setMerchandiseLoading] = useState<boolean>(false);

//   const handleRequestStart = () => {
//     setActiveRequests((prev) => prev + 1);
//     setLoading(true);
//   };

//   const handleRequestEnd = () => {
//     setActiveRequests((prev) => {
//       const newCount = prev - 1;
//       if (newCount === 0) {
//         setLoading(false);
//       }
//       return newCount;
//     });
//   };

//   const getData = () => {
//     handleRequestStart();
//     Get("event", {})
//       .then((res: any) => {
//         setData(
//           res.data.sort((b: any, a: any) => {
//             return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
//           })
//         );
//         handleRequestEnd();
//       })
//       .catch((err) => {
//         console.log(err);
//         handleRequestEnd();
//       });
//   };

//   const getVacancy = () => {
//     handleRequestStart();
//     Get("vacancy", {})
//       .then((res: any) => {
//         setVacancy(res.data);
//         handleRequestEnd();
//       })
//       .catch((err) => {
//         handleRequestEnd();
//       });
//   };

//   const getSliderData = () => {
//     handleRequestStart();
//     Get("slider", {})
//       .then((res: any) => {
//         setSliderData(res.data);
//         handleRequestEnd();
//       })
//       .catch((err) => {
//         handleRequestEnd();
//       });
//   };

//   const getUpcomingData = () => {
//     handleRequestStart();
//     Get("event-up-coming", {})
//       .then((res: any) => {
//         setUpcoming(res.data);
//         handleRequestEnd();
//       })
//       .catch((err) => {
//         handleRequestEnd();
//       });
//   };

//   const getMerchandiseData = () => {
//     setMerchandiseLoading(true);
//     Get("product", {})
//       .then((res: any) => {
//         // Filter hanya merchandise dengan status 2 (aktif/published)
//         const filteredMerch = (res.data as MerchListResponse[]).filter((item) => item.product_status_id === 2);
//         setMerchandiseData(filteredMerch);
//         setMerchandiseLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching merchandise:", err);
//         setMerchandiseLoading(false);
//       });
//   };

//   useEffect(() => {
//     Cookies.remove("ticketCount", { path: "/" });
//     Cookies.remove("selected", { path: "/" });
//     getData();
//     getUpcomingData();
//     getVacancy();
//     getSliderData();
//     getMerchandiseData();
//   }, []);

//   useEffect(() => {
//     console.log(activeRequests, "request");
//     console.log(loading, "loading");
//   }, [loading]);

//   return (
//     <main className="bg-white min-h-screen">
//       <HeroSection data={upcoming} loading={loading} slider={sliderData} />
//       <CategoryBlock />
//       <EventList data={data} loading={loading} />

//       {/* <JobsList data={vacancy} loading={loading} />
//       <TalentList /> */}
//       <MerchandiseList data={merchandiseData} loading={merchandiseLoading} />
//       <PromoBlock />
//       <ChatBox />
//     </main>
//   );
// }

// import HeroSection from "@/components/HeroSection";
// import EventList from "@/components/Home/EventList";
// import CategoryBlock from "@/components/Home/CategoryBlock";
// import { useEffect, useState } from "react";
// import { Get } from "@/utils/REST";
// import { EventProps, SliderProps, VacancyProps } from "@/utils/globalInterface";
// import { MerchListResponse, MerchPromoResponse } from "@/pages/dashboard/merch/type";
// import Cookies from "js-cookie";
// import PromoBlock from "@/components/Home/PromoBlock";
// import MerchandiseList from "@/components/Home/MerchandiseList";
// import ChatBox from "@/components/chat";
// import PromoMerchandiseList from "@/components/Home/MerchandiseList/index";
// import JobsList from "@/components/Home/JobsList";
// import TalentList from "@/components/Home/TalentList";

// export default function Home() {
//   const [loading, setLoading] = useState<boolean>(false);
//   const [data, setData] = useState<EventProps[]>([]);
//   const [vacancy, setVacancy] = useState<VacancyProps[]>([]);
//   const [sliderData, setSliderData] = useState<SliderProps[]>([]);
//   const [activeRequests, setActiveRequests] = useState<number>(0);
//   const [upcoming, setUpcoming] = useState<EventProps[]>([]);
//   const [merchandiseData, setMerchandiseData] = useState<MerchListResponse[]>([]);
//   const [merchandiseLoading, setMerchandiseLoading] = useState<boolean>(false);
//   const [promoData, setPromoData] = useState<MerchPromoResponse | null>(null);
//   const [promoLoading, setPromoLoading] = useState<boolean>(false);

//   const handleRequestStart = () => {
//     setActiveRequests((prev) => prev + 1);
//     setLoading(true);
//   };

//   const handleRequestEnd = () => {
//     setActiveRequests((prev) => {
//       const newCount = prev - 1;
//       if (newCount === 0) {
//         setLoading(false);
//       }
//       return newCount;
//     });
//   };

//   const getData = () => {
//     handleRequestStart();
//     Get("event", {})
//       .then((res: any) => {
//         setData(
//           res.data.sort((b: any, a: any) => {
//             return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
//           })
//         );
//         handleRequestEnd();
//       })
//       .catch((err) => {
//         console.log(err);
//         handleRequestEnd();
//       });
//   };

//   const getVacancy = () => {
//     handleRequestStart();
//     Get("vacancy", {})
//       .then((res: any) => {
//         setVacancy(res.data);
//         handleRequestEnd();
//       })
//       .catch((err) => {
//         handleRequestEnd();
//       });
//   };

//   const getSliderData = () => {
//     handleRequestStart();
//     Get("slider", {})
//       .then((res: any) => {
//         setSliderData(res.data);
//         handleRequestEnd();
//       })
//       .catch((err) => {
//         handleRequestEnd();
//       });
//   };

//   // Di file Home (index.tsx)
//   const getUpcomingData = () => {
//     handleRequestStart();
//     Get("event-up-coming", {
//       // Tambahkan parameter untuk mendapatkan semua upcoming
//       params: { all: true }, // atau sesuai dengan API Anda
//     })
//       .then((res: any) => {
//         setUpcoming(res.data);
//         handleRequestEnd();
//       })
//       .catch((err) => {
//         handleRequestEnd();
//       });
//   };

//   const getMerchandiseData = () => {
//     setMerchandiseLoading(true);
//     setPromoLoading(true);
//     Get("promotions/showby/1", {})
//       .then((res: any) => {
//         if (res.data) {
//           // Simpan data promo lengkap
//           setPromoData(res.data);

//           // Handle products (bisa array atau object)
//           let products: any[] = [];

//           if (res.data.products) {
//             if (Array.isArray(res.data.products)) {
//               products = res.data.products;
//             } else {
//               // Jika products adalah object single product, ubah ke array
//               products = [res.data.products];
//             }
//           }

//           // Filter hanya merchandise dengan status 2 (aktif/published) untuk merchandiseData
//           const filteredMerch = products.filter((item: any) => item.product_status_id === 2);
//           setMerchandiseData(filteredMerch);
//         } else {
//           setMerchandiseData([]);
//         }
//         setMerchandiseLoading(false);
//         setPromoLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching merchandise:", err);
//         setMerchandiseLoading(false);
//         setPromoLoading(false);
//       });
//   };

//   useEffect(() => {
//     Cookies.remove("ticketCount", { path: "/" });
//     Cookies.remove("selected", { path: "/" });
//     getData();
//     getUpcomingData();
//     getVacancy();
//     getSliderData();
//     getMerchandiseData();
//   }, []);

//   return (
//     <main className="bg-white min-h-screen">
//       <HeroSection data={upcoming} loading={loading} slider={sliderData} />
//       <CategoryBlock />
//       <EventList data={data} loading={loading} />
//       {/* <JobsList data={vacancy} loading={loading} />
//       <TalentList /> */}

//       {/* Promo Merchandise Section - hanya muncul jika promoData ada */}
//       <PromoMerchandiseList data={promoData} loading={promoLoading} />

//       <PromoBlock />
//       <ChatBox />
//     </main>
//   );
// }

import HeroSection from "@/components/HeroSection";
import EventList from "@/components/Home/EventList";
import CategoryBlock from "@/components/Home/CategoryBlock";
import { useEffect, useState } from "react";
import { Get } from "@/utils/REST";
import { EventProps, SliderProps, VacancyProps } from "@/utils/globalInterface";
import { MerchListResponse, MerchPromoResponse } from "@/pages/dashboard/merch/type";
import Cookies from "js-cookie";
import PromoBlock from "@/components/Home/PromoBlock";
import ChatBox from "@/components/chat";
import PromoMerchandiseList from "@/components/Home/MerchandiseList/index";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<EventProps[]>([]);
  const [vacancy, setVacancy] = useState<VacancyProps[]>([]);
  const [sliderData, setSliderData] = useState<SliderProps[]>([]);
  const [activeRequests, setActiveRequests] = useState<number>(0);
  const [upcoming, setUpcoming] = useState<EventProps[]>([]);
  const [merchandiseData, setMerchandiseData] = useState<MerchListResponse[]>([]);
  const [merchandiseLoading, setMerchandiseLoading] = useState<boolean>(false);
  const [promoData, setPromoData] = useState<MerchPromoResponse | null>(null);
  const [promoLoading, setPromoLoading] = useState<boolean>(false);

  const handleRequestStart = () => {
    setActiveRequests((prev) => prev + 1);
    setLoading(true);
  };

  const handleRequestEnd = () => {
    setActiveRequests((prev) => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setLoading(false);
      }
      return newCount;
    });
  };

  const getData = () => {
    handleRequestStart();
    Get("event", {})
      .then((res: any) => {
        setData(
          res.data.sort((b: any, a: any) => {
            return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
          })
        );
        handleRequestEnd();
      })
      .catch((err) => {
        console.log(err);
        handleRequestEnd();
      });
  };

  const getVacancy = () => {
    handleRequestStart();
    Get("vacancy", {})
      .then((res: any) => {
        setVacancy(res.data);
        handleRequestEnd();
      })
      .catch((err) => {
        handleRequestEnd();
      });
  };

  const getSliderData = () => {
    handleRequestStart();
    Get("slider", {})
      .then((res: any) => {
        setSliderData(res.data);
        handleRequestEnd();
      })
      .catch((err) => {
        handleRequestEnd();
      });
  };

  const getUpcomingData = () => {
    handleRequestStart();
    Get("event-up-coming", {
      params: { all: true },
    })
      .then((res: any) => {
        setUpcoming(res.data);
        handleRequestEnd();
      })
      .catch((err) => {
        handleRequestEnd();
      });
  };

  const getMerchandiseData = () => {
    setMerchandiseLoading(true);
    setPromoLoading(true);

    Get("promotions/showby/1", {})
      .then((res: any) => {
        if (res.data) {
          // Simpan data promo lengkap
          setPromoData(res.data);

          // Handle products (bisa array atau object)
          let products: any[] = [];

          if (res.data.products) {
            if (Array.isArray(res.data.products)) {
              products = res.data.products;
            } else {
              // Jika products adalah object single product, ubah ke array
              products = [res.data.products];
            }
          }

          // Filter hanya merchandise dengan status 2 (aktif/published) untuk merchandiseData
          const filteredMerch = products.filter((item: any) => item.product_status_id === 2);
          setMerchandiseData(filteredMerch);
        } else {
          setMerchandiseData([]);
        }
        setMerchandiseLoading(false);
        setPromoLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching merchandise:", err);
        // Tetap set state kosong jika error
        setMerchandiseData([]);
        setPromoData(null);
        setMerchandiseLoading(false);
        setPromoLoading(false);
      });
  };

  useEffect(() => {
    Cookies.remove("ticketCount", { path: "/" });
    Cookies.remove("selected", { path: "/" });

    // Panggil API yang TIDAK membutuhkan auth
    getData();
    getUpcomingData();
    getSliderData();

    // Cek token sebelum panggil API yang butuh auth
    const token = Cookies.get("token");

    if (token) {
      // Hanya panggil jika ada token
      getVacancy();
    } else {
      // Set default state untuk data yang butuh auth
      console.log("User not authenticated, skipping vacancy API");
      setVacancy([]);
    }

    // Panggil merchandise data tanpa validasi token
    getMerchandiseData();
  }, []);

  return (
    <main className="bg-white min-h-screen">
      <HeroSection data={upcoming} loading={loading} slider={sliderData} />
      <CategoryBlock />
      <EventList data={data} loading={loading} />

      {/* Promo Merchandise Section - hanya muncul jika promoData ada */}
      <PromoMerchandiseList data={promoData} loading={promoLoading} />

      <PromoBlock />
      {/* <ChatBox /> */}
    </main>
  );
}