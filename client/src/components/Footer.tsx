import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <svg
              className="w-6 h-6 text-primary mr-2"
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
            <span className="text-lg font-display font-bold text-primary">
              StudyFlowAI
            </span>
          </div>

          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary-light transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary-light transition-colors">
              Terms
            </Link>
            <Link href="/help" className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary-light transition-colors">
              Help
            </Link>
            <Link href="/contact" className="text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary-light transition-colors">
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          &copy; {new Date().getFullYear()} StudyFlowAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
