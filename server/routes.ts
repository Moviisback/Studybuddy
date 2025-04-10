import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fileProcessor } from "./services/fileProcessor";
import { summarizer } from "./services/summarizer";
import { requireAuth } from "./middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { insertSummarySchema, insertDocumentSchema, insertQuizSchema, insertFlashcardSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create the HTTP server
  const httpServer = createServer(app);
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // API endpoints
  // Document upload and processing
  app.post('/api/documents/upload', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const { originalname, mimetype, buffer } = req.file;
      
      // Check file type
      const allowedTypes = ['text/plain', 'application/pdf'];
      if (!allowedTypes.includes(mimetype)) {
        return res.status(400).json({ message: 'File type not supported. Please upload a PDF or text file.' });
      }
      
      // Process file and save to disk
      const fileMetadata = await fileProcessor.saveFile(buffer, originalname, mimetype);
      
      // Get user ID from authenticated request
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Create document record
      const documentData = {
        userId,
        title: originalname.replace(/\.[^/.]+$/, ""), // Remove file extension
        fileName: fileMetadata.originalName,
        fileType: fileMetadata.mimetype,
        fileSize: fileMetadata.size,
        content: fileMetadata.content,
      };
      
      // Validate document data
      const validatedData = insertDocumentSchema.parse(documentData);
      
      // Save document to storage
      const document = await storage.createDocument(validatedData);
      
      res.status(201).json({
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        createdAt: document.createdAt,
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ message: 'Error uploading document' });
    }
  });

  // Get all documents for a user
  app.get('/api/documents', requireAuth, async (req: Request, res: Response) => {
    try {
      // Get user ID from authenticated request
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const documents = await storage.getDocuments(userId);
      
      res.json(documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        createdAt: doc.createdAt,
      })));
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: 'Error fetching documents' });
    }
  });

  // Get a specific document
  app.get('/api/documents/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid document ID' });
      }
      
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      res.json(document);
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({ message: 'Error fetching document' });
    }
  });

  // Delete a document
  app.delete('/api/documents/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid document ID' });
      }
      
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      await storage.deleteDocument(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ message: 'Error deleting document' });
    }
  });

  // Generate a summary
  app.post('/api/summaries/generate', async (req: Request, res: Response) => {
    try {
      const summarySchema = z.object({
        documentId: z.number(),
        format: z.enum(['concise', 'detailed', 'bullet', 'sectioned']),
        readability: z.enum(['simple', 'academic']),
        extractKeyTerms: z.boolean(),
      });
      
      const { documentId, format, readability, extractKeyTerms } = summarySchema.parse(req.body);
      
      // Get document
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Generate summary
      const summaryResult = await summarizer.generateSummary(
        document.content || '', 
        document.title,
        { format, readability, extractKeyTerms }
      );
      
      // Get user ID (in a real app, this would come from authentication)
      const userId = 1; // Placeholder
      
      // Create summary record
      const summaryData = {
        userId,
        documentId,
        title: document.title,
        content: summaryResult.content,
        format,
        keyTerms: summaryResult.keyTerms,
        readTime: summaryResult.readTime,
      };
      
      // Validate summary data
      const validatedData = insertSummarySchema.parse(summaryData);
      
      // Save summary to storage
      const summary = await storage.createSummary(validatedData);
      
      res.status(201).json(summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      res.status(500).json({ message: 'Error generating summary' });
    }
  });

  // Get all summaries for a user
  app.get('/api/summaries', async (req: Request, res: Response) => {
    try {
      // Get user ID (in a real app, this would come from authentication)
      const userId = 1; // Placeholder
      
      const summaries = await storage.getSummaries(userId);
      
      res.json(summaries);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      res.status(500).json({ message: 'Error fetching summaries' });
    }
  });

  // Get a specific summary
  app.get('/api/summaries/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid summary ID' });
      }
      
      const summary = await storage.getSummary(id);
      
      if (!summary) {
        return res.status(404).json({ message: 'Summary not found' });
      }
      
      res.json(summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({ message: 'Error fetching summary' });
    }
  });

  // Delete a summary
  app.delete('/api/summaries/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid summary ID' });
      }
      
      const summary = await storage.getSummary(id);
      
      if (!summary) {
        return res.status(404).json({ message: 'Summary not found' });
      }
      
      await storage.deleteSummary(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting summary:', error);
      res.status(500).json({ message: 'Error deleting summary' });
    }
  });

  // Generate a quiz
  app.post('/api/quizzes/generate', async (req: Request, res: Response) => {
    try {
      const quizSchema = z.object({
        summaryId: z.number(),
        difficulty: z.enum(['easy', 'medium', 'hard']),
      });
      
      const { summaryId, difficulty } = quizSchema.parse(req.body);
      
      // Get summary
      const summary = await storage.getSummary(summaryId);
      
      if (!summary) {
        return res.status(404).json({ message: 'Summary not found' });
      }
      
      // Generate quiz
      const quizResult = await summarizer.generateQuiz(
        summary.content,
        summary.title,
        difficulty
      );
      
      // Get user ID (in a real app, this would come from authentication)
      const userId = 1; // Placeholder
      
      // Create quiz record
      const quizData = {
        userId,
        summaryId,
        title: quizResult.title,
        difficulty,
        questions: quizResult.questions,
      };
      
      // Validate quiz data
      const validatedData = insertQuizSchema.parse(quizData);
      
      // Save quiz to storage
      const quiz = await storage.createQuiz(validatedData);
      
      res.status(201).json(quiz);
    } catch (error) {
      console.error('Error generating quiz:', error);
      res.status(500).json({ message: 'Error generating quiz' });
    }
  });

  // Get all quizzes for a user
  app.get('/api/quizzes', async (req: Request, res: Response) => {
    try {
      // Get user ID (in a real app, this would come from authentication)
      const userId = 1; // Placeholder
      
      const quizzes = await storage.getQuizzes(userId);
      
      res.json(quizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      res.status(500).json({ message: 'Error fetching quizzes' });
    }
  });

  // Get a specific quiz
  app.get('/api/quizzes/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid quiz ID' });
      }
      
      const quiz = await storage.getQuiz(id);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      
      res.json(quiz);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      res.status(500).json({ message: 'Error fetching quiz' });
    }
  });

  // Generate flashcards
  app.post('/api/flashcards/generate', async (req: Request, res: Response) => {
    try {
      const flashcardSchema = z.object({
        summaryId: z.number(),
      });
      
      const { summaryId } = flashcardSchema.parse(req.body);
      
      // Get summary
      const summary = await storage.getSummary(summaryId);
      
      if (!summary) {
        return res.status(404).json({ message: 'Summary not found' });
      }
      
      // Generate flashcards
      const flashcardResults = await summarizer.generateFlashcards(
        summary.content,
        summary.title
      );
      
      // Get user ID (in a real app, this would come from authentication)
      const userId = 1; // Placeholder
      
      // Save flashcards to storage
      const savedFlashcards = [];
      
      for (const result of flashcardResults) {
        const flashcardData = {
          userId,
          summaryId,
          front: result.front,
          back: result.back,
        };
        
        // Validate flashcard data
        const validatedData = insertFlashcardSchema.parse(flashcardData);
        
        // Save flashcard to storage
        const flashcard = await storage.createFlashcard(validatedData);
        savedFlashcards.push(flashcard);
      }
      
      res.status(201).json(savedFlashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      res.status(500).json({ message: 'Error generating flashcards' });
    }
  });

  // Get all flashcards for a user
  app.get('/api/flashcards', async (req: Request, res: Response) => {
    try {
      // Get user ID (in a real app, this would come from authentication)
      const userId = 1; // Placeholder
      const summaryId = req.query.summaryId ? parseInt(req.query.summaryId as string) : undefined;
      
      const flashcards = await storage.getFlashcards(userId, summaryId);
      
      res.json(flashcards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      res.status(500).json({ message: 'Error fetching flashcards' });
    }
  });

  // Get a specific flashcard
  app.get('/api/flashcards/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid flashcard ID' });
      }
      
      const flashcard = await storage.getFlashcard(id);
      
      if (!flashcard) {
        return res.status(404).json({ message: 'Flashcard not found' });
      }
      
      res.json(flashcard);
    } catch (error) {
      console.error('Error fetching flashcard:', error);
      res.status(500).json({ message: 'Error fetching flashcard' });
    }
  });

  // Update flashcard interval (for spaced repetition)
  app.patch('/api/flashcards/:id/interval', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid flashcard ID' });
      }
      
      const intervalSchema = z.object({
        interval: z.number().int().positive(),
      });
      
      const { interval } = intervalSchema.parse(req.body);
      
      const flashcard = await storage.updateFlashcard(id, interval);
      
      if (!flashcard) {
        return res.status(404).json({ message: 'Flashcard not found' });
      }
      
      res.json(flashcard);
    } catch (error) {
      console.error('Error updating flashcard:', error);
      res.status(500).json({ message: 'Error updating flashcard' });
    }
  });

  // Record study session
  app.post('/api/study-sessions', async (req: Request, res: Response) => {
    try {
      const sessionSchema = z.object({
        duration: z.number().int().positive(),
        activityType: z.enum(['summary', 'flashcard', 'quiz']),
        activityId: z.number().int().positive(),
      });
      
      const { duration, activityType, activityId } = sessionSchema.parse(req.body);
      
      // Get user ID (in a real app, this would come from authentication)
      const userId = 1; // Placeholder
      
      // Save study session
      const session = await storage.createStudySession({
        userId,
        duration,
        activityType,
        activityId,
      });
      
      // Update user streak (simplified logic - in a real app, this would be more complex)
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUserStreak(userId, user.studyStreak + 1);
      }
      
      res.status(201).json(session);
    } catch (error) {
      console.error('Error recording study session:', error);
      res.status(500).json({ message: 'Error recording study session' });
    }
  });

  // Get study statistics
  app.get('/api/stats', async (req: Request, res: Response) => {
    try {
      // Get user ID (in a real app, this would come from authentication)
      const userId = 1; // Placeholder
      
      // Get user data
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get all user data
      const summaries = await storage.getSummaries(userId);
      const quizzes = await storage.getQuizzes(userId);
      const flashcards = await storage.getFlashcards(userId);
      const studySessions = await storage.getStudySessions(userId);
      
      // Calculate statistics
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const summariesThisMonth = summaries.filter(s => 
        new Date(s.createdAt) >= oneMonthAgo
      ).length;
      
      const quizzesCompleted = studySessions.filter(s => 
        s.activityType === 'quiz' && new Date(s.completedAt) >= oneMonthAgo
      ).length;
      
      const flashcardsPracticed = studySessions.filter(s => 
        s.activityType === 'flashcard' && new Date(s.completedAt) >= oneMonthAgo
      ).length;
      
      const studyStreak = user.studyStreak;
      
      res.json({
        summariesThisMonth,
        quizzesCompleted,
        flashcardsPracticed,
        studyStreak
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ message: 'Error fetching statistics' });
    }
  });

  return httpServer;
}
