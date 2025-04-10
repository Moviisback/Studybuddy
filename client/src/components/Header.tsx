import { useState } from "react";
import { Link, useLocation } from "wouter";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { logoutUser, signInWithGoogle } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIcon } from "lucide-react";

const Header = () => {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast({
        title: "Welcome!",
        description: "You've successfully signed in.",
      });
    } catch (error) {
      console.error("Sign in error:", error);
      
      // Handle Firebase errors
      if (error instanceof Error && 
          (error.message.includes("configuration-not-found") || 
           error.message.includes("unauthorized-domain"))) {
        toast({
          title: "Firebase Authentication Error",
          description: "Your domain needs to be added to Firebase authorized domains.",
          variant: "destructive",
        });
        setLocation("/login");
      } else {
        toast({
          title: "Sign In Failed",
          description: "There was an error signing in. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
      setLocation("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign Out Failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="px-4 py-4 md:py-6 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              className="w-8 h-8 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z"
                fill="currentColor"
              />
              <path
                d="M12 13.25V19.25M19.25 9V15L12 19.25L4.75 15V9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="text-xl md:text-2xl font-display font-bold text-primary">
              StudyFlowAI
            </h1>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-light transition-colors"
                >
                  <UserIcon className="h-5 w-5 mr-1" />
                  <span className="hidden md:inline">
                    {currentUser.displayName ||
                      currentUser.email?.split("@")[0] ||
                      "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setLocation("/profile")}
                  className="cursor-pointer"
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              className="flex items-center text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-light transition-colors"
              onClick={handleSignIn}
              disabled={loading}
            >
              Sign In
            </Button>
          )}

          <Button
            className="hidden md:flex items-center text-sm font-medium bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
            onClick={() => setLocation(currentUser ? "/create-summary" : "/")}
          >
            {currentUser ? "Create Summary" : "Get Started"}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
