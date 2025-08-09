import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

import studentImg from "../assets/Student.jpg"; 
import tutorImg from "../assets/Teacher1.jpg";      

function RoleCard({ title, subtitle, selected, onClick, type, imgSrc }) {
  return (
    <button
      type="button"
      className={`rolecard ${selected ? "rolecard--selected" : ""}`}
      onClick={onClick}
      aria-pressed={!!selected}
      aria-label={`Select ${type}`}
    >
      <div className="rolecard__avatar">
        <img src={imgSrc} alt={`${title} avatar`} />
      </div>
      <div className="rolecard__text">
        <div className="rolecard__title">{title}</div>
        <div className="rolecard__subtitle">{subtitle}</div>
      </div>
      {selected && <span className="rolecard__check" aria-hidden="true">✓</span>}
    </button>
  );
}

export default function Landing() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (role) => {
    setSelected(role);
    if (role === "student") navigate("/student/login");
    if (role === "tutor") navigate("/tutor/login");
  };

  return (
    <main className="landingV2">
      <div className="landingV2__wrap">
        <h1 className="landingV2__title"><span className="black-text">Welcome to</span> TeachConnect</h1>

        <p className="landingV2__subtitle">Sign In to Continue</p>

        <div className="landingV2__cards">
          <RoleCard
            type="student or guardian"
            title="Guardian or Student"
            subtitle="Select, if you're looking for a tutor"
            selected={selected === "student"}
            onClick={() => handleSelect("student")}
            imgSrc={studentImg}
          />
          <RoleCard
            type="tutor"
            title="Tutor"
            subtitle="Select, if you're looking for tuition job"
            selected={selected === "tutor"}
            onClick={() => handleSelect("tutor")}
            imgSrc={tutorImg}
          />
        </div>
      </div>
    </main>
  );
}
