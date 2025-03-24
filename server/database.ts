import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import * as schema from '../shared/schema';

// Connect to the database using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a Drizzle database instance
export const db = drizzle(pool, { schema });

// Log database operations
export async function logApiInteraction(
  type: string,
  operation: string,
  requestData?: any,
  responseData?: any,
  statusCode?: number,
  processingTimeMs?: number,
  sourceIp?: string,
  userAgent?: string,
  userId?: number
) {
  try {
    await db.insert(schema.apiLogs).values({
      type,
      operation,
      requestData,
      responseData,
      statusCode,
      processingTimeMs,
      sourceIp,
      userAgent,
      userId,
      timestamp: new Date(),
    });
    console.log(`API ${type} for ${operation} logged successfully`);
  } catch (error) {
    console.error('Error logging API interaction:', error);
  }
}

// Function to get all API logs with pagination
export async function getApiLogs(
  page = 1,
  limit = 20,
  operationFilter?: string
) {
  try {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Base query
    let query = db.select().from(schema.apiLogs);
    
    // Apply filters if provided
    if (operationFilter) {
      query = query.where(({ operation }) => sql`${operation} = ${operationFilter}`);
    }
    
    // Apply pagination and ordering
    const logs = await query
      .orderBy(({ timestamp }) => sql`${timestamp} DESC`)
      .limit(limit)
      .offset(offset);
    
    // Get total count for pagination
    let totalCount = 0;
    
    if (operationFilter) {
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(schema.apiLogs)
        .where(({ operation }) => sql`${operation} = ${operationFilter}`);
      totalCount = Number(countResult[0]?.count || 0);
    } else {
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(schema.apiLogs);
      totalCount = Number(countResult[0]?.count || 0);
    }
    const totalResult = await totalQuery;
    const total = Number(totalResult[0]?.count || 0);
    
    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching API logs:', error);
    throw error;
  }
}