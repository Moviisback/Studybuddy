import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SummaryCard from "@/components/cards/SummaryCard";
import FlashCard from "@/components/cards/FlashCard";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Summary, Flashcard } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";
import { 
  FileText, 
  HelpCircle, 
  Book, 
  Flame 
} from "lucide-react";

const HomePage = () => {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const [flashcardIndex, setFlashcardIndex] = useState(0);

  // Fetch summaries
  const { 
    data: summaries = [],
    isLoading: isLoadingSummaries,
    error: summariesError
  } = useQuery<Summary[]>({
    queryKey: ['/api/summaries'],
    enabled: !!currentUser, // Only fetch if user is logged in
  });

  // Fetch flashcards
  const {
    data: flashcards = [],
    isLoading: isLoadingFlashcards
  } = useQuery<Flashcard[]>({
    queryKey: ['/api/flashcards'],
    enabled: !!currentUser, // Only fetch if user is logged in
  });

  // Fetch statistics
  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['/api/stats'],
    enabled: !!currentUser, // Only fetch if user is logged in
  });

  // Reset flashcard index when the flashcards change
  useEffect(() => {
    setFlashcardIndex(0);
  }, [flashcards]);

  // Show error toast if there's an error fetching summaries
  useEffect(() => {
    if (summariesError) {
      toast({
        title: "Error",
        description: "Failed to load your summaries. Please try again later.",
        variant: "destructive",
      });
    }
  }, [summariesError]);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="py-8 md:py-16 max-w-4xl mx-auto text-center slide-up">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
          Transform Your <span className="text-primary">Study Experience</span> with AI
        </h1>
        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
          Upload documents, generate concise summaries, create flashcards, and quiz yourself - all powered by AI to enhance your learning.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => setLocation(currentUser ? "/create-summary" : "/login")}
            className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Create Summary
          </Button>
          <Button
            onClick={() => setLocation(currentUser ? "/quizzes" : "/login")}
            variant="outline"
            className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 font-medium px-6 py-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            Generate Quiz
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-12" id="features">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-12">Key Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-primary-light dark:bg-primary-dark bg-opacity-20 dark:bg-opacity-30 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Summaries</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Generate concise summaries from documents or text with multiple format options.</p>
          </Card>
          
          <Card className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-secondary-light dark:bg-secondary-dark bg-opacity-20 dark:bg-opacity-30 rounded-lg flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Quiz Generation</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Create quizzes with different question types and difficulty levels to test your knowledge.</p>
          </Card>
          
          <Card className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-accent-light dark:bg-accent-dark bg-opacity-20 dark:bg-opacity-30 rounded-lg flex items-center justify-center mb-4">
              <Book className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Interactive Flashcards</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Study efficiently with flashcards using spaced repetition algorithms to optimize learning.</p>
          </Card>
        </div>
      </section>

      {/* Recent Summaries Section */}
      {currentUser && (
        <section className="py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold">Recent Summaries</h2>
            {summaries.length > 0 && (
              <Button 
                variant="link" 
                onClick={() => setLocation("/summaries")}
                className="text-primary hover:text-primary-dark font-medium flex items-center transition-colors"
              >
                View All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Button>
            )}
          </div>
          
          {isLoadingSummaries ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : summaries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {summaries.slice(0, 3).map(summary => (
                <SummaryCard key={summary.id} summary={summary} />
              ))}
            </div>
          ) : (
            <Card className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 className="text-lg font-medium mb-2">No summaries yet</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">Upload a document or text to create your first summary</p>
              <Button
                onClick={() => setLocation("/create-summary")}
                className="bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-lg inline-flex items-center font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create Summary
              </Button>
            </Card>
          )}
        </section>
      )}

      {/* Flashcard Section - Only show if logged in */}
      {currentUser && (
        <section className="py-12 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold">Flashcards</h2>
            <Button 
              variant="link"
              onClick={() => setLocation("/flashcards")}
              className="text-primary hover:text-primary-dark font-medium flex items-center transition-colors"
            >
              Create New
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </Button>
          </div>
          
          {isLoadingFlashcards ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <FlashCard 
              flashcards={flashcards} 
              onComplete={() => toast({
                title: "Flashcards Completed",
                description: "You've gone through all the flashcards. Great job!",
              })}
            />
          )}
        </section>
      )}

      {/* Progress Stats - Only show if logged in */}
      {currentUser && (
        <section className="py-12">
          <h2 className="text-2xl font-display font-bold mb-6">Your Progress</h2>
          
          {isLoadingStats ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Summaries</h3>
                  <div className="w-10 h-10 bg-primary-light dark:bg-primary-dark bg-opacity-20 dark:bg-opacity-30 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-semibold">{stats?.summariesThisMonth || 0}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Created this month</p>
              </Card>
              
              <Card className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Quizzes</h3>
                  <div className="w-10 h-10 bg-secondary-light dark:bg-secondary-dark bg-opacity-20 dark:bg-opacity-30 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-secondary" />
                  </div>
                </div>
                <p className="text-3xl font-semibold">{stats?.quizzesCompleted || 0}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Completed this month</p>
              </Card>
              
              <Card className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Flashcards</h3>
                  <div className="w-10 h-10 bg-accent-light dark:bg-accent-dark bg-opacity-20 dark:bg-opacity-30 rounded-full flex items-center justify-center">
                    <Book className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <p className="text-3xl font-semibold">{stats?.flashcardsPracticed || 0}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Practiced this month</p>
              </Card>
              
              <Card className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Study Streak</h3>
                  <div className="w-10 h-10 bg-error-light dark:bg-error-dark bg-opacity-20 dark:bg-opacity-30 rounded-full flex items-center justify-center">
                    <Flame className="w-5 h-5 text-error" />
                  </div>
                </div>
                <p className="text-3xl font-semibold">{stats?.studyStreak || 0} days</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Keep it up!</p>
              </Card>
            </div>
          )}
        </section>
      )}

    </div>
  );
};

export default HomePage;
