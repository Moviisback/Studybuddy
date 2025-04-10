import { useState } from "react";
import { useLocation } from "wouter";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SiGoogle } from "react-icons/si";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const LoginPage = () => {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showFirebaseAlert, setShowFirebaseAlert] = useState(false);

  // Redirect to home if already logged in
  if (currentUser) {
    setLocation("/");
    return null;
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      toast({
        title: "Welcome",
        description: "You've successfully signed in!",
      });
      setLocation("/");
    } catch (error) {
      console.error("Error signing in:", error);
      
      // Show configuration alert for specific Firebase errors
      if (error instanceof Error && 
          (error.message.includes("configuration-not-found") || 
           error.message.includes("unauthorized-domain"))) {
        setShowFirebaseAlert(true);
      } else {
        toast({
          title: "Sign In Failed",
          description: "There was an error signing in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to StudyFlowAI</CardTitle>
          <CardDescription>
            Sign in to access your study materials, flashcards, and quizzes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              className="flex items-center justify-center gap-2 border-gray-300 py-6 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-b-transparent border-gray-600 rounded-full"></div>
              ) : (
                <>
                  <SiGoogle className="h-5 w-5 text-[#4285F4]" />
                  Sign in with Google
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                Benefits
              </span>
            </div>
          </div>

          <div className="grid gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-1">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>Generate AI-powered summaries from your texts and documents</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-1">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>Create and practice with intelligent flashcards</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-1">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>Test your knowledge with customized quizzes</div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-6">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardFooter>
      </Card>

      {/* Firebase Configuration Alert */}
      <AlertDialog open={showFirebaseAlert} onOpenChange={setShowFirebaseAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Firebase Authentication Domain Error</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div>We're unable to authenticate with Firebase because your Replit domain is not authorized in your Firebase project. To fix this, please:</div>
            
            <div className="ml-4">
              <div className="mb-1">1. Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Firebase console</a></div>
              <div className="mb-1">2. Select your project: <span className="font-semibold">{import.meta.env.VITE_FIREBASE_PROJECT_ID}</span></div>
              <div className="mb-1">3. Navigate to Authentication → Settings</div>
              <div className="mb-1">4. In the "Authorized domains" section, click "Add domain"</div>
              <div className="mb-1">5. Add your Replit domain: <span className="font-semibold">{window.location.hostname}</span></div>
            </div>
            
            <div className="font-medium text-red-500">
              Error: auth/unauthorized-domain
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowFirebaseAlert(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LoginPage;