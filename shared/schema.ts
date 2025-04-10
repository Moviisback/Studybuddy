import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").notNull().unique(),
  name: text("name"),
  firebaseUid: text("firebase_uid").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  studyStreak: integer("study_streak").default(0),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentId: integer("document_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  format: text("format").notNull(), // 'concise', 'detailed', 'bullet', 'sectioned'
  keyTerms: jsonb("key_terms"),
  readTime: integer("read_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  summaryId: integer("summary_id"),
  front: text("front").notNull(),
  back: text("back").notNull(),
  lastStudied: timestamp("last_studied"),
  interval: integer("interval").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  summaryId: integer("summary_id").notNull(),
  title: text("title").notNull(),
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard'
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  duration: integer("duration").notNull(), // in seconds
  activityType: text("activity_type").notNull(), // 'summary', 'flashcard', 'quiz'
  activityId: integer("activity_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  firebaseUid: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  title: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  content: true,
});

export const insertSummarySchema = createInsertSchema(summaries).pick({
  userId: true,
  documentId: true,
  title: true,
  content: true,
  format: true,
  keyTerms: true,
  readTime: true,
});

export const insertFlashcardSchema = createInsertSchema(flashcards).pick({
  userId: true,
  summaryId: true,
  front: true,
  back: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  userId: true,
  summaryId: true,
  title: true,
  difficulty: true,
  questions: true,
});

export const insertQuizResultSchema = createInsertSchema(quizResults).pick({
  userId: true,
  quizId: true,
  score: true,
  totalQuestions: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).pick({
  userId: true,
  duration: true,
  activityType: true,
  activityId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type Summary = typeof summaries.$inferSelect;

export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Flashcard = typeof flashcards.$inferSelect;

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;

export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessions.$inferSelect;
