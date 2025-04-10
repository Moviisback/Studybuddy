import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global CSS for elements that need custom behavior
const style = document.createElement("style");
style.innerHTML = `
  .perspective-1000 {
    perspective: 1000px;
  }
  .transform-style-preserve-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .slide-up {
    animation: slideUp 0.3s ease-out forwards;
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .card-hover {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
`;

document.head.appendChild(style);

// Add metadata to the document head
document.title = "StudyFlowAI - AI-powered Study Assistant";

// Add Google fonts
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

createRoot(document.getElementById("root")!).render(<App />);
