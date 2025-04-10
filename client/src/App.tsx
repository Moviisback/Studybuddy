import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import CreateSummaryPage from "@/pages/CreateSummaryPage";
import FlashcardsPage from "@/pages/FlashcardsPage";
import QuizzesPage from "@/pages/QuizzesPage";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/not-found";

import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        
        {/* Protected Routes */}
        <Route path="/create-summary">
          <ProtectedRoute>
            <CreateSummaryPage />
          </ProtectedRoute>
        </Route>
        
        <Route path="/flashcards">
          <ProtectedRoute>
            <FlashcardsPage />
          </ProtectedRoute>
        </Route>
        
        <Route path="/quizzes">
          <ProtectedRoute>
            <QuizzesPage />
          </ProtectedRoute>
        </Route>

        <Route path="/profile">
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
