import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import { HelmetProvider } from "react-helmet-async";

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
