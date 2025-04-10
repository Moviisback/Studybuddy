import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { currentUser, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.displayName) {
      setDisplayName(currentUser.displayName);
    }
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await logout();
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

  const handleSaveProfile = () => {
    // For now, just show a toast notification
    // In a real implementation, we would update the user profile in Firebase
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    }, 1000);
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    } else if (currentUser?.email) {
      return currentUser.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={currentUser?.photoURL || ""}
                      alt={currentUser?.displayName || "User"}
                    />
                    <AvatarFallback className="text-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-xl font-semibold">
                      {currentUser?.displayName || "User"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {currentUser?.email || "No email available"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 mt-6">
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/")}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Study Statistics</CardTitle>
                <CardDescription>
                  View your study progress and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <span className="text-3xl font-bold text-primary">0</span>
                    <span className="text-sm text-muted-foreground">Summaries Created</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <span className="text-3xl font-bold text-primary">0</span>
                    <span className="text-sm text-muted-foreground">Flashcards Studied</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <span className="text-3xl font-bold text-primary">0</span>
                    <span className="text-sm text-muted-foreground">Quizzes Completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Sign out</h3>
                      <p className="text-sm text-muted-foreground">
                        Sign out from your account
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;