import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Welcome to Tuition Matching Platform</h1>
      <p>Select your role to continue:</p>
      <div style={{ marginTop: "20px" }}>
        <Link to="/student/register">
          <button style={{ marginRight: "10px" }}>Student / Guardian</button>
        </Link>
        <Link to="/tutor/register">
          <button>Tutor</button>
        </Link>
      </div>
    </div>
  );
}
