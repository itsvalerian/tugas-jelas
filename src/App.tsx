import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { Layout } from "@/components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Workspaces from "./pages/Workspaces";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import CalendarPage from "./pages/Calendar";
import GanttPage from "./pages/Gantt";
import TodoPage from "./pages/Todo";
import ExportPage from "./pages/Export";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="workspaces" element={<Workspaces />} />
                <Route path="projects" element={<Projects />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="gantt" element={<GanttPage />} />
                <Route path="todo" element={<TodoPage />} />
                <Route path="export" element={<ExportPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
