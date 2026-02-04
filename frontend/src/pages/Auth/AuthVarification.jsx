import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

export default function AuthVerification() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("❌ Invalid verification link.");
      return;
    }

    axios
      .get(`http://localhost:5000/api/users/verify-email?token=${token}&email=${email}`)
      .then(() => setStatus("✅ Email verified successfully!"))
      .catch(() => setStatus("❌ Verification failed or token expired."));
  }, [searchParams]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>{status}</h2>
      <p>
        {status.startsWith("✅") && (
          <>
            You can now{" "}
            <Link to="/login" style={{ color: "blue", textDecoration: "underline" }}>
              log in here
            </Link>.
          </>
        )}
      </p>
    </div>
  );
}