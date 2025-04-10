import { Summary } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SummaryModalProps {
  summary: Summary;
  isOpen: boolean;
  onClose: () => void;
}

const SummaryModal = ({ summary, isOpen, onClose }: SummaryModalProps) => {
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  const handleGenerateQuiz = async () => {
    try {
      setIsGeneratingQuiz(true);
      
      const response = await apiRequest("POST", "/api/quizzes/generate", {
        summaryId: summary.id,
        difficulty: "medium",
      });
      
      const quiz = await response.json();
      
      toast({
        title: "Quiz Generated",
        description: "Your quiz has been successfully generated.",
      });
      
      onClose();
      
      // In a real application, you would navigate to the quiz
      // navigate(`/quizzes/${quiz.id}`);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      setIsGeneratingFlashcards(true);
      
      const response = await apiRequest("POST", "/api/flashcards/generate", {
        summaryId: summary.id,
      });
      
      const flashcards = await response.json();
      
      toast({
        title: "Flashcards Generated",
        description: `Successfully generated ${flashcards.length} flashcards.`,
      });
      
      onClose();
      
      // In a real application, you would navigate to the flashcards
      // navigate('/flashcards');
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  // Format the creation date
  const createdDate = new Date(summary.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Summary Results</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-2">{summary.title}</h4>
            <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {summary.readTime} min read
              </span>
              <span className="mx-2">•</span>
              <span>Created {createdDate}</span>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              {summary.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          {summary.keyTerms && summary.keyTerms.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <h4 className="font-medium mb-3">Key Terms</h4>
              <div className="space-y-3">
                {summary.keyTerms.map((term, index) => (
                  <div key={index} className="bg-neutral-50 dark:bg-neutral-700 p-3 rounded">
                    <div className="font-medium">{term.term}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-300">
                      {term.definition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="border-t border-neutral-200 dark:border-neutral-700 p-4 flex-col-reverse sm:flex-row sm:justify-between sm:space-y-0">
          <Button
            variant="outline"
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            Edit Summary
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="default"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              onClick={onClose}
            >
              Close
            </Button>
            
            <Button
              variant="default"
              className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
              onClick={handleGenerateQuiz}
              disabled={isGeneratingQuiz}
            >
              {isGeneratingQuiz ? "Generating..." : "Generate Quiz"}
            </Button>
            
            <Button
              variant="outline"
              className="px-4 py-2 border border-primary text-primary hover:bg-primary-light/10 rounded-lg transition-colors"
              onClick={handleGenerateFlashcards}
              disabled={isGeneratingFlashcards}
            >
              {isGeneratingFlashcards ? "Generating..." : "Create Flashcards"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SummaryModal;
