import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Edit, Download, Share, Trash } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import SummaryModal from "@/components/modals/SummaryModal";
import { Summary } from "@shared/schema";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SummaryCardProps {
  summary: Summary;
}

const SummaryCard = ({ summary }: SummaryCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiRequest("DELETE", `/api/summaries/${summary.id}`);
      
      // Invalidate the summaries query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/summaries'] });
      
      toast({
        title: "Summary Deleted",
        description: "The summary has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting summary:", error);
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting the summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      toast({
        title: "Generating Quiz",
        description: "Your quiz is being generated...",
      });
      
      const response = await apiRequest("POST", "/api/quizzes/generate", {
        summaryId: summary.id,
        difficulty: "medium",
      });
      
      const quiz = await response.json();
      
      // Invalidate the quizzes query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
      
      toast({
        title: "Quiz Generated",
        description: "Your quiz has been successfully generated.",
      });
      
      // In a real application, you would navigate to the quiz page
      // navigate(`/quizzes/${quiz.id}`);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format the creation date
  const createdDate = new Date(summary.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Get the format badge color
  const getFormatBadgeClass = () => {
    switch (summary.format) {
      case "concise":
        return "bg-accent-light dark:bg-accent-dark bg-opacity-20 dark:bg-opacity-30 text-accent-dark dark:text-accent";
      case "detailed":
        return "bg-primary-light dark:bg-primary-dark bg-opacity-20 dark:bg-opacity-30 text-primary";
      case "bullet":
        return "bg-secondary-light dark:bg-secondary-dark bg-opacity-20 dark:bg-opacity-30 text-secondary";
      case "sectioned":
        return "bg-error-light dark:bg-error-dark bg-opacity-20 dark:bg-opacity-30 text-error";
      default:
        return "bg-primary-light dark:bg-primary-dark bg-opacity-20 dark:bg-opacity-30 text-primary";
    }
  };

  // Capitalize first letter of format
  const formatDisplay = summary.format.charAt(0).toUpperCase() + summary.format.slice(1);

  return (
    <>
      <Card className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">{summary.title}</h3>
            <div className={`text-xs font-medium px-2 py-1 rounded ${getFormatBadgeClass()}`}>
              {formatDisplay}
            </div>
          </div>
          
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-3">
            {summary.content.substring(0, 200)}...
          </p>
          
          <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {summary.readTime} min read
            </span>
            <span className="mx-2">•</span>
            <span>Created {createdDate}</span>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary transition-colors rounded"
                onClick={() => setIsModalOpen(true)}
              >
                <Edit className="h-5 w-5" />
                <span className="sr-only">Edit</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary transition-colors rounded"
              >
                <Download className="h-5 w-5" />
                <span className="sr-only">Download</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary transition-colors rounded"
              >
                <Share className="h-5 w-5" />
                <span className="sr-only">Share</span>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-error dark:hover:text-error transition-colors rounded"
                  >
                    <Trash className="h-5 w-5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this summary. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-error hover:bg-error-dark text-white"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <Button 
              onClick={handleGenerateQuiz}
              className="px-3 py-1 text-xs font-medium bg-secondary hover:bg-secondary-dark text-white rounded transition-colors"
            >
              Quiz Me
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isModalOpen && (
        <SummaryModal 
          summary={summary} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default SummaryCard;
