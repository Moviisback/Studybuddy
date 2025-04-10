import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { 
  Timer, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Star, 
  Trophy, 
  HelpCircle, 
  Clock,
  Calendar
} from "lucide-react";
import { Quiz, Summary } from "@shared/schema";

// Component for when no quizzes are available
const EmptyQuizState = () => {
  const [, setLocation] = useLocation();
  
  return (
    <Card className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-8 text-center">
      <HelpCircle className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
      <h3 className="text-lg font-medium mb-2">No quizzes yet</h3>
      <p className="text-neutral-500 dark:text-neutral-400 mb-4">
        Generate quizzes from your summaries to test your knowledge
      </p>
      <Button
        onClick={() => setLocation("/create-summary")}
        className="bg-primary hover:bg-primary-dark text-white inline-flex items-center"
      >
        Create Summary First
      </Button>
    </Card>
  );
};

// Component for generating a new quiz
const GenerateQuizForm = ({ 
  summaries, 
  onGenerate, 
  isGenerating 
}: { 
  summaries: Summary[], 
  onGenerate: (summaryId: number, difficulty: string) => void, 
  isGenerating: boolean 
}) => {
  const [selectedSummaryId, setSelectedSummaryId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<string>("medium");
  
  const handleGenerateQuiz = () => {
    if (!selectedSummaryId) {
      toast({
        title: "No Summary Selected",
        description: "Please select a summary to generate a quiz from.",
        variant: "destructive",
      });
      return;
    }
    
    onGenerate(selectedSummaryId, difficulty);
  };
  
  return (
    <Card className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Generate New Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="summary">Select Summary</Label>
          <Select 
            value={selectedSummaryId?.toString() || ""} 
            onValueChange={(value) => setSelectedSummaryId(value ? parseInt(value) : null)}
          >
            <SelectTrigger id="summary">
              <SelectValue placeholder="Choose a summary" />
            </SelectTrigger>
            <SelectContent>
              {summaries.map((summary) => (
                <SelectItem key={summary.id} value={summary.id.toString()}>
                  {summary.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <RadioGroup 
            value={difficulty} 
            onValueChange={setDifficulty}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="easy" id="easy" />
              <Label htmlFor="easy" className="cursor-pointer">Easy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="cursor-pointer">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hard" id="hard" />
              <Label htmlFor="hard" className="cursor-pointer">Hard</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateQuiz}
          disabled={!selectedSummaryId || isGenerating}
          className="bg-primary hover:bg-primary-dark text-white"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
              Generating...
            </>
          ) : (
            <>Generate Quiz</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Component for a quiz card in the list
const QuizCard = ({ 
  quiz,
  onTakeQuiz
}: { 
  quiz: Quiz, 
  onTakeQuiz: (quiz: Quiz) => void 
}) => {
  // Format the date
  const createdDate = new Date(quiz.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  
  // Get difficulty class color
  const getDifficultyClass = () => {
    switch (quiz.difficulty) {
      case "easy":
        return "bg-secondary-light dark:bg-secondary-dark bg-opacity-20 dark:bg-opacity-30 text-secondary";
      case "medium":
        return "bg-primary-light dark:bg-primary-dark bg-opacity-20 dark:bg-opacity-30 text-primary";
      case "hard":
        return "bg-error-light dark:bg-error-dark bg-opacity-20 dark:bg-opacity-30 text-error";
      default:
        return "bg-primary-light dark:bg-primary-dark bg-opacity-20 dark:bg-opacity-30 text-primary";
    }
  };
  
  // Capitalize the difficulty
  const difficultyDisplay = quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1);
  
  return (
    <Card className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{quiz.title}</h3>
          <div className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyClass()}`}>
            {difficultyDisplay}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          <span className="flex items-center mr-3">
            <HelpCircle className="w-4 h-4 mr-1" />
            {quiz.questions.length} questions
          </span>
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {createdDate}
          </span>
        </div>
        
        <Button 
          onClick={() => onTakeQuiz(quiz)}
          className="w-full bg-primary hover:bg-primary-dark text-white mt-4"
        >
          Take Quiz
        </Button>
      </CardContent>
    </Card>
  );
};

// Component for quiz taking interface
const QuizTakingInterface = ({ 
  quiz, 
  onComplete 
}: { 
  quiz: Quiz, 
  onComplete: (score: number) => void 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Start timer
  useState(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  });
  
  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctCount++;
        }
      });
      
      const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
      setScore(finalScore);
      setIsCompleted(true);
      onComplete(finalScore);
    }
  };
  
  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (isCompleted) {
    return (
      <Card className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm">
        <CardContent className="text-center py-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            You scored {score}% on this quiz
          </p>
          
          <div className="max-w-md mx-auto mb-8">
            <div className="mb-2 flex justify-between text-sm">
              <span>Score</span>
              <span>{score}%</span>
            </div>
            <Progress value={score} className="h-2 mb-4" />
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded-lg">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Time Taken</p>
                <p className="font-semibold">{formatTime(timeElapsed)}</p>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded-lg">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Questions</p>
                <p className="font-semibold">{quiz.questions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setTimeElapsed(0);
                setIsCompleted(false);
              }}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const question = quiz.questions[currentQuestion];
  
  return (
    <Card className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">{quiz.title}</CardTitle>
          <div className="flex items-center text-sm text-neutral-500">
            <Clock className="w-4 h-4 mr-1" />
            {formatTime(timeElapsed)}
          </div>
        </div>
        <div className="flex justify-between items-center text-sm mt-2">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            quiz.difficulty === 'easy' 
              ? 'bg-secondary/20 text-secondary' 
              : quiz.difficulty === 'medium'
                ? 'bg-primary/20 text-primary'
                : 'bg-error/20 text-error'
          }`}>
            {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
          </span>
        </div>
      </CardHeader>
      
      <Progress 
        value={((currentQuestion + 1) / quiz.questions.length) * 100} 
        className="h-1 mb-6"
      />
      
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          
          <RadioGroup 
            value={answers[currentQuestion] || ""}
            onValueChange={(value) => handleAnswer(currentQuestion, value)}
            className="space-y-3"
          >
            {question.options.map((option) => (
              <div 
                key={option.id}
                className={`flex items-center space-x-2 p-3 rounded-lg border ${
                  answers[currentQuestion] === option.id
                    ? 'border-primary bg-primary/10'
                    : 'border-neutral-200 dark:border-neutral-700'
                } hover:border-primary transition-colors cursor-pointer`}
                onClick={() => handleAnswer(currentQuestion, option.id)}
              >
                <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-neutral-500">
          {currentQuestion + 1} of {quiz.questions.length}
        </div>
        <Button 
          onClick={handleNextQuestion}
          disabled={!answers[currentQuestion]}
          className="bg-primary hover:bg-primary-dark text-white"
        >
          {currentQuestion < quiz.questions.length - 1 ? (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Complete Quiz"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Main component
const QuizzesPage = () => {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    toast({
      title: "Authentication Required",
      description: "Please sign in to access quizzes.",
      variant: "destructive",
    });
    setLocation("/");
    return null;
  }
  
  // Fetch quizzes
  const { 
    data: quizzes = [], 
    isLoading: isLoadingQuizzes 
  } = useQuery<Quiz[]>({
    queryKey: ['/api/quizzes'],
  });
  
  // Fetch summaries for the dropdown
  const { 
    data: summaries = [] 
  } = useQuery<Summary[]>({
    queryKey: ['/api/summaries'],
  });
  
  // Generate quiz mutation
  const generateQuizMutation = useMutation({
    mutationFn: async ({ summaryId, difficulty }: { summaryId: number, difficulty: string }) => {
      const response = await apiRequest("POST", "/api/quizzes/generate", {
        summaryId,
        difficulty,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
      toast({
        title: "Quiz Generated",
        description: "Your quiz has been successfully created.",
      });
      setActiveQuiz(data);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Record quiz result mutation
  const recordQuizResultMutation = useMutation({
    mutationFn: async ({ quizId, score, totalQuestions }: { quizId: number, score: number, totalQuestions: number }) => {
      return apiRequest("POST", "/api/quiz-results", {
        quizId,
        score,
        totalQuestions,
      });
    },
    onSuccess: () => {
      toast({
        title: "Result Saved",
        description: "Your quiz result has been recorded.",
      });
    }
  });
  
  // Record study session mutation
  const recordStudySessionMutation = useMutation({
    mutationFn: async ({ duration, quizId }: { duration: number, quizId: number }) => {
      return apiRequest("POST", "/api/study-sessions", {
        duration,
        activityType: "quiz",
        activityId: quizId,
      });
    }
  });
  
  const handleGenerateQuiz = (summaryId: number, difficulty: string) => {
    generateQuizMutation.mutate({ summaryId, difficulty });
  };
  
  const handleTakeQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
  };
  
  const handleQuizComplete = (score: number) => {
    if (activeQuiz) {
      // Record the quiz result
      recordQuizResultMutation.mutate({
        quizId: activeQuiz.id,
        score,
        totalQuestions: activeQuiz.questions.length,
      });
      
      // Record study session (using 5 minutes per quiz as an example)
      recordStudySessionMutation.mutate({
        duration: activeQuiz.questions.length * 30, // Rough estimate of time spent
        quizId: activeQuiz.id,
      });
    }
  };
  
  // If a quiz is active, show the quiz taking interface
  if (activeQuiz) {
    return (
      <div className="max-w-3xl mx-auto py-6">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-4"
            onClick={() => setActiveQuiz(null)}
          >
            <ArrowRight className="h-5 w-5 rotate-180" />
            <span className="ml-2">Back to Quizzes</span>
          </Button>
        </div>
        
        <QuizTakingInterface 
          quiz={activeQuiz} 
          onComplete={handleQuizComplete} 
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-8 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Quizzes</h1>
      </div>
      
      {/* Generate Quiz Form */}
      <GenerateQuizForm 
        summaries={summaries} 
        onGenerate={handleGenerateQuiz}
        isGenerating={generateQuizMutation.isPending}
      />
      
      {/* Quizzes List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Quizzes</h2>
        
        {isLoadingQuizzes ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz} 
                onTakeQuiz={handleTakeQuiz} 
              />
            ))}
          </div>
        ) : (
          <EmptyQuizState />
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;
