import React from "react";
import "./Spinner.css"; // keep CSS in a separate file

const Spinner: React.FC = () => {
  return (
    <div className="spinner">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default Spinner;
