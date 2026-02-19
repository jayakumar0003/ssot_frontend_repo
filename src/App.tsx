import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TablePage from "./pages/TablePage"; // Add this import
import NotFound from "./pages/NotFound";
import { DataProvider } from './context/DataContext';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
      <DataProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/table" element={<TablePage />} /> 
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;