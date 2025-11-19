// import { useState, useEffect } from "react";
// import styles from "../index.module.css";
// import { Get } from "@/utils/REST";
// import { CategoryProps } from "@/utils/globalInterface";
// import Images from "@/components/Images";

// const CategoryBlock = () => {
//   const [data, setData] = useState<CategoryProps[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);

//   const getData = () => {
//     setLoading(true);
//     Get("category", {})
//       .then((res: any) => {
//         setData(res.data);
//         console.log(res.data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.log(err);
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   return (
//     <div className="">
//       <div className="text-dark bg-primary-dark mt-12 mb-32 block md:flex justify-center items-center h-16">
//         <div className="w-full md:w-1/4 md:px-24 px-2 py-2">
//           <h3 className="text-white">Kategori Rekomendasi</h3>
//         </div>
//         <div className="w-full flex gap-5 mt-0 md:mt-20 pr-3 overflow-x-scroll">
//           {data.map((item: CategoryProps) => (
//             <div className={`text-center ${styles.categoryCard}`} key={item.id}>
//               <Images path={item.image} type="category" alt="foto" className="md:min-w-20 md:min-h-20 min-w-16 min-h-16 rounded-md object-cover" />
//               <p className="text-sm font-semibold my-2">{item.name}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CategoryBlock;

import { useState, useEffect } from "react";
import styles from "../index.module.css";
import { Get } from "@/utils/REST";
import { CategoryProps } from "@/utils/globalInterface";
import Images from "@/components/Images";
import Link from "next/link"; // <-- added

const CategoryBlock = () => {
  const [data, setData] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getData = () => {
    setLoading(true);
    Get("category", {})
      .then((res: any) => {
        setData(res.data);
        console.log(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="">
      <div className="text-dark bg-primary-dark mt-12 mb-32 block md:flex justify-center items-center h-16">
        <div className="w-full md:w-1/4 md:px-24 px-2 py-2">
          <h3 className="text-white">Kategori Rekomendasi</h3>
        </div>
        <div className="w-full flex gap-5 mt-0 md:mt-20 pr-3 overflow-x-scroll">
          {data.map((item: CategoryProps) => {
            // create a safe slug / query value (optionally lowercase)
            const q = encodeURIComponent(item.name);

            return (
              <Link
                key={item.id}
                href={`/event?category=${q}`}
                className={`text-center ${styles.categoryCard}`}
                // accessible: make the whole card focusable
                tabIndex={0}
                aria-label={`Lihat event kategori ${item.name}`}
              >
                <div>
                  <Images path={item.image} type="category" alt={item.name} className="md:min-w-20 md:min-h-20 min-w-16 min-h-16 rounded-md object-cover" />
                </div>
                <p className="text-sm font-semibold my-2">{item.name}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBlock;
