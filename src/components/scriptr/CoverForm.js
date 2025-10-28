import React from 'react';
import styles from '@/styles/scriptr.module.css';

export default function CoverForm({ formData = {}, setFormData, printMode }) {
  // Add a local handleChange function for controlled inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className={`${styles['a4-box']} ${printMode ? "print-a4" : ""}`} style={{ position: 'relative', zIndex: 10 }}>
      <div id="first-page" className={styles.formContainer1}>
        <form id="screenplayForm">
          <div style={{ height: '10cm' }}></div>

          <center>PROJECT</center>
          <input
            type="text"
            name="movie_name"
            placeholder="Movie Name"
            value={formData?.movie_name || ""}
            onChange={handleChange}
            className={`${styles.textInput} w-full text-center border-b-2 border-black py-2 focus:outline-none`}
            disabled={printMode}
            readOnly={printMode}
          />
          
          <center>WRITTEN BY</center>
          <input
            type="text"
            name="writer"
            placeholder="Writer"
            value={formData?.writer || ""}
            onChange={handleChange}
            className={`${styles.textInput} w-full text-center border-b-2 border-black py-2 focus:outline-none`}
            disabled={printMode}
            readOnly={printMode}
          />
          <center>DIRECTED BY</center>
          <input
            type="text"
            name="director"
            placeholder="Director"
            value={formData?.director || ""}
            onChange={handleChange}
            className={`${styles.textInput} w-full text-center border-b-2 border-black py-2 focus:outline-none`}
            disabled={printMode}
            readOnly={printMode}
          />
          <center>PRODUCED BY</center>
          <input
            type="text"
            name="producer"
            placeholder="Producer"
            value={formData?.producer || ""}
            onChange={handleChange}
            className={`${styles.textInput} w-full text-center border-b-2 border-black py-2 focus:outline-none`}
            disabled={printMode}
            readOnly={printMode}
          />
        </form>
      </div>
    </div>
  );
}
