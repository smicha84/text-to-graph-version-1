import { 
  users, type User, type InsertUser,
  apiTemplates, type ApiTemplate, type InsertApiTemplate,
  apiCalls, type ApiCall, type InsertApiCall
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // API Template methods
  getApiTemplate(id: number): Promise<ApiTemplate | undefined>;
  getApiTemplatesByUser(userId: number): Promise<ApiTemplate[]>;
  createApiTemplate(template: InsertApiTemplate): Promise<ApiTemplate>;
  updateApiTemplate(id: number, template: Partial<ApiTemplate>): Promise<ApiTemplate | undefined>;
  deleteApiTemplate(id: number): Promise<boolean>;
  
  // API Call History methods
  getApiCall(id: number): Promise<ApiCall | undefined>;
  getApiCallsByUser(userId: number, limit?: number): Promise<ApiCall[]>;
  createApiCall(call: InsertApiCall): Promise<ApiCall>;
  updateApiCall(id: number, call: Partial<ApiCall>): Promise<ApiCall | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiTemplates: Map<number, ApiTemplate>;
  private apiCalls: Map<number, ApiCall>;
  private userIdCounter: number;
  private templateIdCounter: number;
  private apiCallIdCounter: number;

  constructor() {
    this.users = new Map();
    this.apiTemplates = new Map();
    this.apiCalls = new Map();
    this.userIdCounter = 1;
    this.templateIdCounter = 1;
    this.apiCallIdCounter = 1;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // API Template methods
  async getApiTemplate(id: number): Promise<ApiTemplate | undefined> {
    return this.apiTemplates.get(id);
  }

  async getApiTemplatesByUser(userId: number): Promise<ApiTemplate[]> {
    return Array.from(this.apiTemplates.values()).filter(
      (template) => template.userId === userId
    );
  }

  async createApiTemplate(template: InsertApiTemplate): Promise<ApiTemplate> {
    const id = this.templateIdCounter++;
    // Ensure required fields have default values for type safety
    const newTemplate: ApiTemplate = { 
      ...template, 
      id,
      userId: template.userId ?? null,
      description: template.description ?? null,
      thinkingEnabled: template.thinkingEnabled ?? true,
      thinkingBudget: template.thinkingBudget ?? 2000
    };
    this.apiTemplates.set(id, newTemplate);
    return newTemplate;
  }

  async updateApiTemplate(id: number, updates: Partial<ApiTemplate>): Promise<ApiTemplate | undefined> {
    const template = this.apiTemplates.get(id);
    if (!template) return undefined;
    
    const updatedTemplate = { ...template, ...updates };
    this.apiTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteApiTemplate(id: number): Promise<boolean> {
    return this.apiTemplates.delete(id);
  }

  // API Call History methods
  async getApiCall(id: number): Promise<ApiCall | undefined> {
    return this.apiCalls.get(id);
  }

  async getApiCallsByUser(userId: number, limit: number = 20): Promise<ApiCall[]> {
    return Array.from(this.apiCalls.values())
      .filter(call => call.userId === userId)
      .sort((a, b) => new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime())
      .slice(0, limit);
  }

  async createApiCall(call: InsertApiCall): Promise<ApiCall> {
    const id = this.apiCallIdCounter++;
    // Ensure required fields have default values for type safety
    const newCall: ApiCall = { 
      ...call, 
      id,
      userId: call.userId ?? null,
      responseTime: call.responseTime ?? null,
      responseData: call.responseData ?? null,
      errorMessage: call.errorMessage ?? null,
      apiTemplateId: call.apiTemplateId ?? null
    };
    this.apiCalls.set(id, newCall);
    return newCall;
  }

  async updateApiCall(id: number, updates: Partial<ApiCall>): Promise<ApiCall | undefined> {
    const call = this.apiCalls.get(id);
    if (!call) return undefined;
    
    const updatedCall = { ...call, ...updates };
    this.apiCalls.set(id, updatedCall);
    return updatedCall;
  }
}

export const storage = new MemStorage();
