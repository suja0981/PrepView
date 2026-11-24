import { useEffect } from "react";
import { api } from "@/api/axios";

function App() {
  useEffect(() => {
    // Cold-start ping to wake up the backend
    api.get("/health").catch(() => {});
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Prepview</p>
        <h1>AI-powered technical interview platform</h1>
        <p className="body-copy">
          Frontend structure is now flattened and ready for the real product UI.
        </p>
      </section>
    </main>
  );
}

export default App;
