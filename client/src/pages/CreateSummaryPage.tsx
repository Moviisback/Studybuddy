import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Document } from "@shared/schema";
import { ArrowLeft, ArrowRight, Upload, FileText, FileUp } from "lucide-react";

// Component for upload step
const UploadStep = ({ 
  onFileSelect, 
  onContinue, 
  selectedFile, 
  documents, 
  isLoading, 
  isUploading
}: { 
  onFileSelect: (file: File) => void, 
  onContinue: () => void, 
  selectedFile: File | null,
  documents: Document[],
  isLoading: boolean,
  isUploading: boolean
}) => {
  const fileInputRef = useState<HTMLInputElement | null>(null)[1];
  const [recentDocId, setRecentDocId] = useState<number | null>(null);

  const triggerFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.txt';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    };
    input.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSelectDocument = (docId: number) => {
    setRecentDocId(docId);
  };

  return (
    <div className="p-6">
      <div 
        className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Upload Your Document</h3>
        <p className="text-neutral-500 dark:text-neutral-400 mb-4">
          Drag and drop your PDF or text file here, or click to browse
        </p>
        <Button 
          onClick={triggerFileInput}
          className="bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-lg inline-flex items-center font-medium transition-colors"
          disabled={isUploading}
        >
          <FileUp className="w-5 h-5 mr-2" />
          {isUploading ? "Uploading..." : "Browse Files"}
        </Button>
        {selectedFile && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg text-left flex items-center">
            <FileText className="w-5 h-5 text-primary mr-2" />
            <div>
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-neutral-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
          Supported formats: PDF, TXT (max 10MB)
        </p>
      </div>
      
      {!isLoading && documents.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">Recent Uploads</h4>
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg divide-y divide-neutral-200 dark:divide-neutral-700">
            {documents.slice(0, 3).map((doc) => (
              <div 
                key={doc.id} 
                className={`p-4 flex items-center ${recentDocId === doc.id ? 'bg-primary/10' : ''}`}
                onClick={() => handleSelectDocument(doc.id)}
              >
                <div className="w-10 h-10 bg-primary-light dark:bg-primary-dark bg-opacity-20 dark:bg-opacity-30 rounded flex items-center justify-center mr-3">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium">{doc.title}</h5>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Checkbox 
                  checked={recentDocId === doc.id}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleSelectDocument(doc.id);
                    } else {
                      setRecentDocId(null);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-end mt-8 space-x-4">
        <Button
          variant="outline"
          className="px-4 py-2 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          Cancel
        </Button>
        <Button
          className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
          onClick={onContinue}
          disabled={!selectedFile && !recentDocId}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Component for customize step
const CustomizeStep = ({ 
  onBack, 
  onContinue, 
  selectedDocument,
  setOptions,
  options
}: { 
  onBack: () => void, 
  onContinue: () => void, 
  selectedDocument: Document | null,
  setOptions: (options: any) => void,
  options: {
    format: string;
    readability: string;
    extractKeyTerms: boolean;
  }
}) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Customize Summary Options</h3>
        
        {selectedDocument && (
          <div className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded-lg mb-6">
            <h4 className="font-medium">Selected Document</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {selectedDocument.title} ({(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="format">Summary Format</Label>
            <Select 
              value={options.format} 
              onValueChange={(value) => setOptions({...options, format: value})}
            >
              <SelectTrigger id="format" className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise - Brief overview</SelectItem>
                <SelectItem value="detailed">Detailed - Comprehensive summary</SelectItem>
                <SelectItem value="bullet">Bullet Points - Key takeaways</SelectItem>
                <SelectItem value="sectioned">Sectioned - Organized by topics</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="readability">Readability Level</Label>
            <Select 
              value={options.readability} 
              onValueChange={(value) => setOptions({...options, readability: value})}
            >
              <SelectTrigger id="readability" className="w-full">
                <SelectValue placeholder="Select readability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple - Easy to understand</SelectItem>
                <SelectItem value="academic">Academic - Scholarly language</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="extract-terms" 
              checked={options.extractKeyTerms}
              onCheckedChange={(checked) => setOptions({...options, extractKeyTerms: checked})}
            />
            <Label htmlFor="extract-terms" className="cursor-pointer">Extract Key Terms and Definitions</Label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 flex items-center"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          className="px-6 py-2 bg-primary hover:bg-primary-dark text-white flex items-center"
          onClick={onContinue}
        >
          Generate Summary
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Component for save step
const SaveStep = ({ 
  onBack, 
  summary, 
  isLoading
}: { 
  onBack: () => void, 
  summary: any,
  isLoading: boolean
}) => {
  const [, setLocation] = useLocation();
  
  return (
    <div className="p-6">
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Generating Summary...</p>
          <p className="text-neutral-500 dark:text-neutral-400">This may take a moment depending on the document size.</p>
        </div>
      ) : summary ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium mb-2">{summary.title}</h3>
            <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {summary.readTime} min read
              </span>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              {summary.content.split('\n').map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          {summary.keyTerms && summary.keyTerms.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <h4 className="font-medium mb-3">Key Terms</h4>
              <div className="space-y-3">
                {summary.keyTerms.map((term: any, index: number) => (
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
          
          <div className="flex justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              variant="outline"
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 flex items-center"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Options
            </Button>
            
            <div className="space-x-3">
              <Button
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white"
                onClick={() => setLocation("/summaries")}
              >
                View All Summaries
              </Button>
              <Button
                className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white"
                onClick={() => {
                  toast({
                    title: "Generating Quiz",
                    description: "Your quiz is being created from this summary.",
                  });
                  
                  // In a real application, this would navigate to a quiz page
                  // with the generated quiz
                  setTimeout(() => {
                    setLocation("/quizzes");
                  }, 1500);
                }}
              >
                Generate Quiz
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-error">Error generating summary</p>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            There was an error generating your summary. Please try again.
          </p>
          <Button
            variant="outline"
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-700"
            onClick={onBack}
          >
            Back to Options
          </Button>
        </div>
      )}
    </div>
  );
};

// Main component
const CreateSummaryPage = () => {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [summaryOptions, setSummaryOptions] = useState({
    format: "detailed",
    readability: "simple",
    extractKeyTerms: true
  });
  const [generatedSummary, setGeneratedSummary] = useState<any>(null);

  // Redirect to login if not authenticated
  if (!currentUser) {
    toast({
      title: "Authentication Required",
      description: "Please sign in to create a summary.",
      variant: "destructive",
    });
    setLocation("/");
    return null;
  }

  // Fetch user's documents
  const { 
    data: documents = [], 
    isLoading: isLoadingDocuments 
  } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setSelectedDocument(data);
      setSelectedDocId(data.id);
      toast({
        title: "Upload Successful",
        description: "Your document has been uploaded.",
      });
      setCurrentStep(2);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload document.",
        variant: "destructive",
      });
    },
  });

  // Generate summary mutation
  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDocId) {
        throw new Error("No document selected");
      }
      
      const response = await apiRequest("POST", "/api/summaries/generate", {
        documentId: selectedDocId,
        format: summaryOptions.format,
        readability: summaryOptions.readability,
        extractKeyTerms: summaryOptions.extractKeyTerms,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/summaries'] });
      setGeneratedSummary(data);
      toast({
        title: "Summary Generated",
        description: "Your summary has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate summary.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleUploadStep = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    } else if (selectedDocId) {
      // Find the selected document in the documents list
      const doc = documents.find(d => d.id === selectedDocId);
      if (doc) {
        setSelectedDocument(doc);
        setCurrentStep(2);
      }
    }
  };

  const handleCustomizeStep = () => {
    generateSummaryMutation.mutate();
    setCurrentStep(3);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-6">Create a New Summary</h1>
      
      <Card className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
        {/* Progress Steps */}
        <div className="border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
          <div className="flex items-center">
            <div className="flex items-center relative">
              <div className={`rounded-full w-8 h-8 ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'} flex items-center justify-center font-medium z-10`}>
                1
              </div>
              <div className={`absolute top-4 h-0.5 w-full ${currentStep >= 2 ? 'bg-primary' : 'bg-neutral-200 dark:bg-neutral-700'}`}></div>
            </div>
            <div className="w-full"></div>
            <div className="flex items-center relative">
              <div className={`rounded-full w-8 h-8 ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'} flex items-center justify-center font-medium z-10`}>
                2
              </div>
              <div className={`absolute top-4 h-0.5 w-full ${currentStep >= 3 ? 'bg-primary' : 'bg-neutral-200 dark:bg-neutral-700'}`}></div>
            </div>
            <div className="w-full"></div>
            <div className="flex items-center">
              <div className={`rounded-full w-8 h-8 ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'} flex items-center justify-center font-medium z-10`}>
                3
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={currentStep >= 1 ? "text-primary font-medium" : "text-neutral-500"}>
              Upload
            </span>
            <span className={currentStep >= 2 ? "text-primary font-medium" : "text-neutral-500"}>
              Customize
            </span>
            <span className={currentStep >= 3 ? "text-primary font-medium" : "text-neutral-500"}>
              Save
            </span>
          </div>
        </div>
        
        <CardContent className="p-0">
          {currentStep === 1 && (
            <UploadStep 
              onFileSelect={handleFileSelect} 
              onContinue={handleUploadStep} 
              selectedFile={selectedFile}
              documents={documents}
              isLoading={isLoadingDocuments}
              isUploading={uploadMutation.isPending}
            />
          )}
          
          {currentStep === 2 && (
            <CustomizeStep 
              onBack={() => setCurrentStep(1)} 
              onContinue={handleCustomizeStep}
              selectedDocument={selectedDocument}
              setOptions={setSummaryOptions}
              options={summaryOptions}
            />
          )}
          
          {currentStep === 3 && (
            <SaveStep 
              onBack={() => setCurrentStep(2)}
              summary={generatedSummary}
              isLoading={generateSummaryMutation.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSummaryPage;
