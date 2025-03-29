import React from "react";
import "./GoogleSignInButton.css";

const GoogleSignInButton = () => {
  return (
    <a href="http://localhost:5000/api/auth/google">
      <button className="google-signin-btn">Sign in with Google</button>
    </a>
  );
};

export default GoogleSignInButton;
