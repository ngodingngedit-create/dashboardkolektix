import React from 'react';
import styles from './styles.module.css'; // Assuming you have a CSS file for styling

const Burgers = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const toggleBurger = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button onClick={toggleBurger} className={styles.button}>
        <span className={`${styles.burger6} ${isOpen && styles.isClosed}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    </div>
  );
};

export default Burgers;
