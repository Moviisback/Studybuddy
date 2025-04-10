import { 
  users, type User, type InsertUser,
  documents, type Document, type InsertDocument,
  summaries, type Summary, type InsertSummary,
  flashcards, type Flashcard, type InsertFlashcard,
  quizzes, type Quiz, type InsertQuiz,
  quizResults, type QuizResult, type InsertQuizResult,
  studySessions, type StudySession, type InsertStudySession
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStreak(id: number, streak: number): Promise<User | undefined>;

  // Document methods
  getDocuments(userId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;

  // Summary methods
  getSummaries(userId: number): Promise<Summary[]>;
  getSummary(id: number): Promise<Summary | undefined>;
  createSummary(summary: InsertSummary): Promise<Summary>;
  deleteSummary(id: number): Promise<boolean>;

  // Flashcard methods
  getFlashcards(userId: number, summaryId?: number): Promise<Flashcard[]>;
  getFlashcard(id: number): Promise<Flashcard | undefined>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(id: number, interval: number): Promise<Flashcard | undefined>;
  deleteFlashcard(id: number): Promise<boolean>;

  // Quiz methods
  getQuizzes(userId: number): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  deleteQuiz(id: number): Promise<boolean>;

  // Quiz result methods
  getQuizResults(userId: number): Promise<QuizResult[]>;
  createQuizResult(result: InsertQuizResult): Promise<QuizResult>;

  // Study session methods
  getStudySessions(userId: number): Promise<StudySession[]>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private summaries: Map<number, Summary>;
  private flashcards: Map<number, Flashcard>;
  private quizzes: Map<number, Quiz>;
  private quizResults: Map<number, QuizResult>;
  private studySessions: Map<number, StudySession>;
  
  private userId: number;
  private documentId: number;
  private summaryId: number;
  private flashcardId: number;
  private quizId: number;
  private quizResultId: number;
  private studySessionId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.summaries = new Map();
    this.flashcards = new Map();
    this.quizzes = new Map();
    this.quizResults = new Map();
    this.studySessions = new Map();
    
    this.userId = 1;
    this.documentId = 1;
    this.summaryId = 1;
    this.flashcardId = 1;
    this.quizId = 1;
    this.quizResultId = 1;
    this.studySessionId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      studyStreak: 0
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStreak(id: number, streak: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, studyStreak: streak };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Document methods
  async getDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId
    );
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentId++;
    const now = new Date();
    const document: Document = {
      ...insertDocument,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Summary methods
  async getSummaries(userId: number): Promise<Summary[]> {
    return Array.from(this.summaries.values()).filter(
      (summary) => summary.userId === userId
    );
  }

  async getSummary(id: number): Promise<Summary | undefined> {
    return this.summaries.get(id);
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const id = this.summaryId++;
    const now = new Date();
    const summary: Summary = {
      ...insertSummary,
      id,
      createdAt: now,
    };
    this.summaries.set(id, summary);
    return summary;
  }

  async deleteSummary(id: number): Promise<boolean> {
    return this.summaries.delete(id);
  }

  // Flashcard methods
  async getFlashcards(userId: number, summaryId?: number): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values()).filter(
      (flashcard) => {
        if (summaryId) {
          return flashcard.userId === userId && flashcard.summaryId === summaryId;
        }
        return flashcard.userId === userId;
      }
    );
  }

  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    return this.flashcards.get(id);
  }

  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    const id = this.flashcardId++;
    const now = new Date();
    const flashcard: Flashcard = {
      ...insertFlashcard,
      id,
      lastStudied: null,
      createdAt: now,
      interval: 1,
    };
    this.flashcards.set(id, flashcard);
    return flashcard;
  }

  async updateFlashcard(id: number, interval: number): Promise<Flashcard | undefined> {
    const flashcard = await this.getFlashcard(id);
    if (!flashcard) return undefined;
    
    const now = new Date();
    const updatedFlashcard: Flashcard = {
      ...flashcard,
      lastStudied: now,
      interval,
    };
    this.flashcards.set(id, updatedFlashcard);
    return updatedFlashcard;
  }

  async deleteFlashcard(id: number): Promise<boolean> {
    return this.flashcards.delete(id);
  }

  // Quiz methods
  async getQuizzes(userId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      (quiz) => quiz.userId === userId
    );
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = this.quizId++;
    const now = new Date();
    const quiz: Quiz = {
      ...insertQuiz,
      id,
      createdAt: now,
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async deleteQuiz(id: number): Promise<boolean> {
    return this.quizzes.delete(id);
  }

  // Quiz result methods
  async getQuizResults(userId: number): Promise<QuizResult[]> {
    return Array.from(this.quizResults.values()).filter(
      (result) => result.userId === userId
    );
  }

  async createQuizResult(insertQuizResult: InsertQuizResult): Promise<QuizResult> {
    const id = this.quizResultId++;
    const now = new Date();
    const quizResult: QuizResult = {
      ...insertQuizResult,
      id,
      completedAt: now,
    };
    this.quizResults.set(id, quizResult);
    return quizResult;
  }

  // Study session methods
  async getStudySessions(userId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  async createStudySession(insertStudySession: InsertStudySession): Promise<StudySession> {
    const id = this.studySessionId++;
    const now = new Date();
    const studySession: StudySession = {
      ...insertStudySession,
      id,
      completedAt: now,
    };
    this.studySessions.set(id, studySession);
    return studySession;
  }
}

export const storage = new MemStorage();
