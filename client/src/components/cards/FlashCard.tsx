import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Flashcard } from "@shared/schema";

interface FlashCardProps {
  flashcards: Flashcard[];
  onComplete?: () => void;
}

const FlashCard = ({ flashcards, onComplete }: FlashCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsCompleted, setCardsCompleted] = useState(0);

  // Reset when flashcards change
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCardsCompleted(0);
  }, [flashcards]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = async () => {
    // If we're moving to the next card, update the interval for spaced repetition
    if (isFlipped && flashcards.length > 0) {
      const currentCard = flashcards[currentIndex];
      // In a real app, you'd calculate the new interval based on user performance
      const newInterval = currentCard.interval + 1;
      
      try {
        await apiRequest("PATCH", `/api/flashcards/${currentCard.id}/interval`, {
          interval: newInterval
        });
      } catch (error) {
        console.error("Error updating flashcard interval:", error);
      }
      
      setCardsCompleted(prev => prev + 1);
    }

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  // Handle empty state
  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-600 dark:text-neutral-400">
          No flashcards available. Generate some from a summary first!
        </p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-64 w-full max-w-md mx-auto perspective-1000 my-4">
        <div 
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          onClick={handleFlip}
          style={{
            transformStyle: "preserve-3d",
            perspective: "1000px",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
          }}
        >
          {/* Front */}
          <Card 
            className="absolute w-full h-full bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-4">
              FRONT
            </div>
            <h3 className="text-xl font-medium text-center">{currentCard.front}</h3>
            <div className="mt-auto pt-4 text-xs text-neutral-500 dark:text-neutral-400">
              Click to flip
            </div>
          </Card>
          
          {/* Back */}
          <Card 
            className="absolute w-full h-full bg-primary bg-opacity-10 dark:bg-opacity-20 rounded-xl shadow-md p-6 flex flex-col items-center justify-center"
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
          >
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-4">
              BACK
            </div>
            <p className="text-center">{currentCard.back}</p>
            <div className="mt-auto pt-4 text-xs text-neutral-500 dark:text-neutral-400">
              Click to flip
            </div>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-center mt-6 space-x-4">
        <Button 
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="p-3 bg-white dark:bg-neutral-700 rounded-full shadow hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button 
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="p-3 bg-white dark:bg-neutral-700 rounded-full shadow hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="mt-8 text-sm text-center">
        <span className="text-neutral-500 dark:text-neutral-400">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
      </div>
    </div>
  );
};

export default FlashCard;
