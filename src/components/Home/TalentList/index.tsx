import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
import styles from "../index.module.css";
import TalentCard from "@/components/Card/TalentCard";

const TalentList = () => {
  return (
    <div className="my-12 md:mx-auto md:max-w-7xl md:px-10">
      <div className="flex justify-between items-center text-dark mb-4 px-6">
        <h3 className={styles.heading}>Cari Talent</h3>
        <Link href="/talent" className="text-primary-base flex gap-2 items-center">
          Lihat Semua
          <FontAwesomeIcon icon={faCircleArrowRight} />
        </Link>
      </div>

      <div className={`${styles.eventContainer2} min-h-80 gap-4 items-center w-full pb-3 px-0 md:px-3 md:ml-0`}>
        {/* <div className={styles.eventCard}>
          <TalentCard />
        </div>
        <div className={styles.eventCard}>
          <TalentCard />
        </div>
        <div className={styles.eventCard}>
          <TalentCard />
        </div>
        <div className={styles.eventCard}>
          <TalentCard />
        </div> */}
      </div>
    </div>
  );
};

export default TalentList;
