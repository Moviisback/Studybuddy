import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  RotateCcw, 
  Plus, 
  Clock, 
  CheckCircle2,
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen
} from "lucide-react";
import FlashCard from "@/components/cards/FlashCard";
import { Flashcard, Summary } from "@shared/schema";

const FlashcardsPage = () => {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedSummaryId, setSelectedSummaryId] = useState<number | null>(null);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studyDuration, setStudyDuration] = useState(0);
  const [studyInterval, setStudyInterval] = useState<NodeJS.Timeout | null>(null);
  const [newFlashcardDialog, setNewFlashcardDialog] = useState(false);
  const [newFlashcard, setNewFlashcard] = useState({ front: "", back: "" });

  // Redirect to login if not authenticated
  if (!currentUser) {
    toast({
      title: "Authentication Required",
      description: "Please sign in to access flashcards.",
      variant: "destructive",
    });
    setLocation("/");
    return null;
  }

  // Start/stop study timer
  useEffect(() => {
    if (isStudyMode && !studyInterval) {
      const interval = setInterval(() => {
        setStudyDuration(prev => prev + 1);
      }, 1000);
      setStudyInterval(interval);
    } else if (!isStudyMode && studyInterval) {
      clearInterval(studyInterval);
      setStudyInterval(null);
    }

    return () => {
      if (studyInterval) {
        clearInterval(studyInterval);
      }
    };
  }, [isStudyMode, studyInterval]);

  // Fetch all summaries for the dropdown
  const { data: summaries = [] } = useQuery<Summary[]>({
    queryKey: ['/api/summaries'],
  });

  // Fetch flashcards, filtered by summary if one is selected
  const { 
    data: flashcards = [],
    isLoading: isLoadingFlashcards,
    refetch: refetchFlashcards
  } = useQuery<Flashcard[]>({
    queryKey: ['/api/flashcards', selectedSummaryId],
    queryFn: async () => {
      const url = selectedSummaryId 
        ? `/api/flashcards?summaryId=${selectedSummaryId}` 
        : '/api/flashcards';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch flashcards');
      }
      return response.json();
    }
  });

  // Create new flashcard mutation
  const createFlashcardMutation = useMutation({
    mutationFn: async (flashcard: { front: string, back: string }) => {
      const response = await apiRequest("POST", "/api/flashcards", {
        userId: 1, // This would normally come from auth
        summaryId: selectedSummaryId,
        front: flashcard.front,
        back: flashcard.back,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcards'] });
      toast({
        title: "Flashcard Created",
        description: "Your new flashcard has been added.",
      });
      setNewFlashcardDialog(false);
      setNewFlashcard({ front: "", back: "" });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: "Failed to create flashcard. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Generate flashcards from summary mutation
  const generateFlashcardsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSummaryId) {
        throw new Error("No summary selected");
      }
      
      const response = await apiRequest("POST", "/api/flashcards/generate", {
        summaryId: selectedSummaryId,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/flashcards'] });
      toast({
        title: "Flashcards Generated",
        description: `Successfully created ${data.length} flashcards.`,
      });
      refetchFlashcards();
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Record study session mutation
  const recordStudySessionMutation = useMutation({
    mutationFn: async (duration: number) => {
      return apiRequest("POST", "/api/study-sessions", {
        duration,
        activityType: "flashcard",
        activityId: selectedSummaryId || flashcards[0]?.id || 1,
      });
    },
    onSuccess: () => {
      toast({
        title: "Study Session Recorded",
        description: "Your progress has been saved.",
      });
    }
  });

  // Format study duration as mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateFlashcard = () => {
    if (newFlashcard.front.trim() === "" || newFlashcard.back.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Both front and back content are required.",
        variant: "destructive",
      });
      return;
    }
    
    createFlashcardMutation.mutate(newFlashcard);
  };

  const handleGenerateFlashcards = () => {
    if (!selectedSummaryId) {
      toast({
        title: "No Summary Selected",
        description: "Please select a summary to generate flashcards from.",
        variant: "destructive",
      });
      return;
    }
    
    generateFlashcardsMutation.mutate();
  };

  const handleEndStudySession = () => {
    setIsStudyMode(false);
    if (studyDuration > 0) {
      recordStudySessionMutation.mutate(studyDuration);
    }
    setStudyDuration(0);
  };

  return (
    <div className="space-y-8 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Flashcards</h1>
        
        <div className="flex items-center space-x-4">
          {isStudyMode ? (
            <>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatDuration(studyDuration)}
              </div>
              <Button 
                variant="outline" 
                className="border-error text-error hover:bg-error/10"
                onClick={handleEndStudySession}
              >
                End Session
              </Button>
            </>
          ) : (
            <>
              <Dialog open={newFlashcardDialog} onOpenChange={setNewFlashcardDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Flashcard
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Flashcard</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="summary">Related Summary (Optional)</Label>
                      <Select 
                        value={selectedSummaryId?.toString() || ""} 
                        onValueChange={(value) => setSelectedSummaryId(value ? parseInt(value) : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a summary" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {summaries.map((summary) => (
                            <SelectItem key={summary.id} value={summary.id.toString()}>
                              {summary.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="front">Front (Question/Term)</Label>
                      <Textarea
                        id="front"
                        value={newFlashcard.front}
                        onChange={(e) => setNewFlashcard({...newFlashcard, front: e.target.value})}
                        placeholder="Enter the question or term"
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="back">Back (Answer/Definition)</Label>
                      <Textarea
                        id="back"
                        value={newFlashcard.back}
                        onChange={(e) => setNewFlashcard({...newFlashcard, back: e.target.value})}
                        placeholder="Enter the answer or definition"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setNewFlashcardDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateFlashcard}
                      disabled={createFlashcardMutation.isPending}
                    >
                      {createFlashcardMutation.isPending ? "Creating..." : "Create Flashcard"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="default"
                className="bg-secondary hover:bg-secondary-dark text-white"
                onClick={handleGenerateFlashcards}
                disabled={!selectedSummaryId || generateFlashcardsMutation.isPending}
              >
                {generateFlashcardsMutation.isPending ? "Generating..." : "Generate from Summary"}
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-72 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Flashcards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary-filter">By Summary</Label>
                <Select 
                  value={selectedSummaryId?.toString() || ""} 
                  onValueChange={(value) => setSelectedSummaryId(value ? parseInt(value) : null)}
                >
                  <SelectTrigger id="summary-filter">
                    <SelectValue placeholder="All flashcards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All flashcards</SelectItem>
                    {summaries.map((summary) => (
                      <SelectItem key={summary.id} value={summary.id.toString()}>
                        {summary.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => setIsStudyMode(true)}
                  disabled={flashcards.length === 0}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Start Study Session
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {flashcards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Study Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Mastery Progress</span>
                    <span className="text-sm font-medium">
                      {Math.round((flashcards.filter(f => f.interval > 1).length / flashcards.length) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(flashcards.filter(f => f.interval > 1).length / flashcards.length) * 100}
                    className="h-2"
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Total Cards</span>
                  <span className="font-medium">{flashcards.length}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Mastered</span>
                  <span className="font-medium">{flashcards.filter(f => f.interval > 3).length}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Learning</span>
                  <span className="font-medium">{flashcards.filter(f => f.interval > 0 && f.interval <= 3).length}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Not Studied</span>
                  <span className="font-medium">{flashcards.filter(f => !f.lastStudied).length}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {isLoadingFlashcards ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : flashcards.length > 0 ? (
            <Card className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm">
              <CardContent className="p-0">
                <FlashCard 
                  flashcards={flashcards}
                  onComplete={() => {
                    if (isStudyMode) {
                      handleEndStudySession();
                      toast({
                        title: "Study Session Complete",
                        description: "Great job! You've studied all the flashcards.",
                      });
                    }
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-8 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No flashcards yet</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                Create your own flashcards or generate them from your summaries
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setNewFlashcardDialog(true)}
                  className="flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Flashcard
                </Button>
                <Button
                  onClick={() => setLocation("/create-summary")}
                  className="bg-primary hover:bg-primary-dark text-white flex items-center"
                >
                  Create a Summary First
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardsPage;
