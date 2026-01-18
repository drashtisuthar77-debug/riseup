import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Pages
import Auth from "./pages/Auth";
import Unauthorized from "./pages/Unauthorized";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Contractors from "./pages/Contractors";
import FieldVerification from "./pages/FieldVerification";
import Reports from "./pages/Reports";
import LiveTracking from "./pages/LiveTracking";
import Analytics from "./pages/Analytics";
import BinStatus from "./pages/BinStatus";
import VerificationQueue from "./pages/VerificationQueue";
import ReportWaste from "./pages/ReportWaste";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/report" element={<ReportWaste />} />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute allowedRoles={['officer', 'contractor']}>
                  <Tasks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contractors" 
              element={
                <ProtectedRoute allowedRoles={['officer', 'analyst']}>
                  <Contractors />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/verification" 
              element={
                <ProtectedRoute allowedRoles={['officer', 'verifier']}>
                  <FieldVerification />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute allowedRoles={['officer', 'analyst']}>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tracking" 
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <LiveTracking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute allowedRoles={['officer', 'analyst']}>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bins" 
              element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <BinStatus />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/queue" 
              element={
                <ProtectedRoute allowedRoles={['verifier']}>
                  <VerificationQueue />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
