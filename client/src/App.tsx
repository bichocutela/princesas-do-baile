import { Toaster } from "@/components/ui/sonner";
import GameCanvas from "@/components/GameCanvas";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <Toaster />
        <GameCanvas />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
