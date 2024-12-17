import { OpenAI } from 'openai';
import fs from 'fs/promises';
import path from 'path';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Request Queue Implementation
interface QueuedRequest {
  id: string;
  message: string;
  userIdentifier: string;
  timestamp: number;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing: boolean = false;
  private maxConcurrent: number = 2; // Maximum concurrent requests
  private currentProcessing: number = 0;
  private maxQueueSize: number = 100; // Maximum queue size
  private requestTimeout: number = 30000; // 30 seconds timeout

  async enqueue(request: QueuedRequest): Promise<any> {
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error('Queue is full. Please try again later.');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.queue = this.queue.filter(req => req.id !== request.id);
        reject(new Error('Request timeout'));
      }, this.requestTimeout);

      this.queue.push({
        ...request,
        timestamp: Date.now()
      });

      const checkResult = setInterval(() => {
        const index = this.queue.findIndex(req => req.id === request.id);
        if (index === -1) {
          clearInterval(checkResult);
          clearTimeout(timeoutId);
        }
      }, 100);

      this.processQueue().then(resolve).catch(reject);
    });
  }

  private async processQueue() {
    if (this.processing || this.currentProcessing >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    this.currentProcessing++;

    try {
      const request = this.queue.shift();
      if (!request) {
        return;
      }

      const result = await this.processRequest(request);
      this.currentProcessing--;
      this.processing = false;
      this.processQueue(); // Process next request
      return result;

    } catch (error) {
      this.currentProcessing--;
      this.processing = false;
      this.processQueue(); // Process next request even if there was an error
      throw error;
    }
  }

  private async processRequest(request: QueuedRequest) {
    // Initialize embeddings if needed
    await initializeEmbeddings();
    
    // Find relevant context using embeddings
    const context = await findRelevantDocuments(request.message);
    
    // Get response from OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that answers questions about Idan Assis based on the provided context. Keep your answers concise and relevant."
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nUser Query:\n${request.message}\n\nAssistant Answer:`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  }
}

// Initialize the request queue
const requestQueue = new RequestQueue();

// Document corpus
const documents = [
  "My name is Idan Assis. I am a Data Science and Machine Learning Engineer at Intel, where I develop and deploy machine learning models to enhance data-driven decision-making. My work includes analyzing large-scale datasets using tools like Splunk and OpenSearch, building predictive models, and creating dashboards to visualize insights effectively.",
  "I hold a Bachelor's degree in Electrical and Electronic Engineering (with honors) and am pursuing a Master's in Electrical Engineering, specializing in data science and signal processing. My final project utilized transformers to classify movies from fMRI data, demonstrating the correlation between neural and artificial representations, achieving top recognition.",
  "My technical expertise includes Python, SQL, Pandas, NumPy, Scikit-learn, TensorFlow, and PyTorch. I specialize in developing machine learning models, preprocessing data, feature engineering, and creating pipelines for end-to-end ML solutions.",
  "I transitioned from System Validation Engineer to Data Analyst and now to Data Science and Machine Learning Engineer, showcasing my growth and focus on leveraging machine learning techniques to solve complex problems and deliver actionable insights.",
  "In addition to my technical expertise, I am also a professional photographer with experience in using tools like Photoshop and Lightroom. My creativity and attention to detail extend beyond my professional work in data science, enriching my approach to problem-solving and visualization.",
  "I aim to drive impactful results in machine learning and data science by building robust models, uncovering valuable insights from data, and contributing to innovative projects that solve real-world problems."
];

// Rate limiting types and constants
interface RateLimit {
  count: number;
  lastReset: string;
}

interface RateLimitStore {
  [key: string]: RateLimit;
}

const MAX_REQUESTS_PER_DAY = 10;
const RATE_LIMIT_FILE = path.join(process.cwd(), 'data', 'rate-limits.json');

// Cache for document embeddings
let documentEmbeddings: number[][] | null = null;

// Helper function to get a valid user identifier
function getUserIdentifier(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0];
  const realIp = req.headers.get('x-real-ip');
  const connectionRemoteAddr = req.headers.get('connection-remote-addr');
  
  const identifier = forwardedFor || realIp || connectionRemoteAddr || 
    `anonymous-${new Date().getTime()}`;

  console.log('User identifier:', identifier);
  return identifier;
}

// Embedding and similarity search functions
async function getEmbeddings(input: string) {
  const response = await client.embeddings.create({
    model: "text-embedding-ada-002",
    input: input,
  });
  return response.data[0].embedding;
}

async function initializeEmbeddings() {
  if (!documentEmbeddings) {
    console.log('Initializing document embeddings...');
    documentEmbeddings = await Promise.all(
      documents.map(doc => getEmbeddings(doc))
    );
    console.log('Document embeddings initialized.');
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function findRelevantDocuments(query: string, k: number = 2): Promise<string> {
  const queryEmbedding = await getEmbeddings(query);
  
  if (!documentEmbeddings) {
    throw new Error('Document embeddings not initialized');
  }

  const similarities = documentEmbeddings.map(docEmb => 
    cosineSimilarity(queryEmbedding, docEmb)
  );

  const topIndices = similarities
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(item => item.index);

  return topIndices.map(index => documents[index]).join('\n\n');
}

// Rate limiting functions
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function loadRateLimits(): Promise<RateLimitStore> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(RATE_LIMIT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveRateLimits(limits: RateLimitStore) {
  await ensureDataDirectory();
  await fs.writeFile(RATE_LIMIT_FILE, JSON.stringify(limits, null, 2));
}

async function cleanupRateLimits() {
  const limits = await loadRateLimits();
  const now = new Date();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  const cleanedLimits: RateLimitStore = {};
  for (const [identifier, limit] of Object.entries(limits)) {
    const lastReset = new Date(limit.lastReset);
    if (now.getTime() - lastReset.getTime() < dayInMs * 2) {
      cleanedLimits[identifier] = limit;
    }
  }
  
  await saveRateLimits(cleanedLimits);
}

async function checkRateLimit(userIdentifier: string): Promise<{ allowed: boolean; remaining: number }> {
  if (Math.random() < 0.01) {
    await cleanupRateLimits();
  }

  const now = new Date();
  const limits = await loadRateLimits();
  const limit = limits[userIdentifier];

  if (!limit) {
    limits[userIdentifier] = {
      count: 1,
      lastReset: now.toISOString()
    };
    await saveRateLimits(limits);
    return { allowed: true, remaining: MAX_REQUESTS_PER_DAY - 1 };
  }

  const lastReset = new Date(limit.lastReset);
  const timeDiff = now.getTime() - lastReset.getTime();
  const dayInMs = 24 * 60 * 60 * 1000;

  if (timeDiff >= dayInMs) {
    limits[userIdentifier] = {
      count: 1,
      lastReset: now.toISOString()
    };
    await saveRateLimits(limits);
    return { allowed: true, remaining: MAX_REQUESTS_PER_DAY - 1 };
  }

  if (limit.count >= MAX_REQUESTS_PER_DAY) {
    return { allowed: false, remaining: 0 };
  }

  limit.count += 1;
  limits[userIdentifier] = limit;
  await saveRateLimits(limits);
  return { allowed: true, remaining: MAX_REQUESTS_PER_DAY - limit.count };
}

export async function POST(req: Request) {
  try {
    const userIdentifier = getUserIdentifier(req);
    console.log(`Processing request for user: ${userIdentifier}`);
    
    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(userIdentifier);
    
    if (!allowed) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        message: 'You have reached your daily message limit. Please try again tomorrow.',
        remainingMessages: 0
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { message } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ 
        error: 'Invalid request',
        message: 'Message is required and must be a string'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      // Add request to queue
      const response = await requestQueue.enqueue({
        id: Math.random().toString(36).substring(7),
        message,
        userIdentifier,
        timestamp: Date.now()
      });

      return new Response(JSON.stringify({
        response,
        remainingMessages: remaining
      }), {
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Request processing error:', error);
      return new Response(JSON.stringify({ 
        error: 'Request processing failed',
        message: error instanceof Error ? error.message : 'Unable to process request'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
