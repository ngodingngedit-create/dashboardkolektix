import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowRight } from '@fortawesome/free-solid-svg-icons';
import JobsCard from '@/components/Card/JobsCard';
import styles from '../index.module.css';
import { VacancyProps } from '@/utils/globalInterface';

interface JobsListProps {
  data: VacancyProps[];
  loading: boolean;
}

const JobsList = ({ data, loading }: JobsListProps) => {
  return (
    <div className='my-2 md:mx-auto md:max-w-7xl md:px-12'>
      <div className='flex justify-between items-center text-dark mb-4 px-6 md:px-3'>
        <h3 className={styles.heading}>Lowongan</h3>
        <Link href='/lowongan' className='text-primary-base flex gap-2 items-center'>
          Lihat Semua
          <FontAwesomeIcon icon={faCircleArrowRight} />
        </Link>
      </div>

      <div
        className={`${styles.eventContainer} min-h-80 gap-4 items-center w-full pb-3 px-0 md:ml-0`}
      >
        {/* {data.map((el) => (
          <div className={styles.eventCard} key={el.id}>
            <JobsCard
              name={el.name}
              slug={el.slug}
              event={el.has_event.name}
              startDate={el.start_date}
              endDate={el.end_date}
              salary={el.salary}
              status={el.status}
              creator={el.has_creator?.name}
              location={el.location}
            />
          </div>
        ))} */}
        {/* <div className={styles.eventCard}>
          <JobsCard />
        </div>
        <div className={styles.eventCard}>
          <JobsCard />
        </div>
        <div className={styles.eventCard}>
          <JobsCard />
        </div> */}
      </div>
    </div>
  );
};

export default JobsList;
