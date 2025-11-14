import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        localStorage.setItem("access_token", session.access_token);
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    };

    handleSession();
  }, []);

  return <p>Logging you in...</p>;
}
