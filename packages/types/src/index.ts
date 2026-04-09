export type Plan = 'FREE' | 'PRO';

export type ReviewStatus = 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED';

export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface IUser {
  id: string;
  email: string;
  name: string | null;
  plan: Plan;
  createdAt: Date;
}

export interface IResume {
  id: string;
  userId: string;
  filename: string;
  storageUrl: string;
  createdAt: Date;
}

export interface IRewriteSuggestion {
  original: string;
  improved: string;
  reason: string;
}

export interface IReviewFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  suggestions: IRewriteSuggestion[];
  summary: string;
}

export interface IReview {
  id: string;
  userId: string;
  resumeId: string;
  jobDescription: string;
  status: ReviewStatus;
  feedback: IReviewFeedback | null;
  createdAt: Date;
}

export interface ISubscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
}

export interface ICreateReviewRequest {
  resumeId: string;
  jobDescription: string;
}

export interface ICreateReviewResponse {
  reviewId: string;
}

export interface IUploadResumeResponse {
  resume: IResume;
}

export interface IApiError {
  statusCode: number;
  message: string;
  error?: string;
}