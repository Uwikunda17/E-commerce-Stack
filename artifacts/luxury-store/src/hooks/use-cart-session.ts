import { useState, useEffect } from "react";

const SESSION_KEY = "luxury_store_session_id";

export function useCartSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let currentSession = localStorage.getItem(SESSION_KEY);
    if (!currentSession) {
      currentSession = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      localStorage.setItem(SESSION_KEY, currentSession);
    }
    setSessionId(currentSession);
  }, []);

  return sessionId;
}
