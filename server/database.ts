import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql, eq } from 'drizzle-orm';
import * as schema from '../shared/schema';

// Create a SQL client connection
const sql_client = neon(process.env.DATABASE_URL!);

// Create a Drizzle database instance
export const db = drizzle(sql_client, { schema });

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
    
    // Get logs with pagination and ordering
    let logs;
    if (operationFilter) {
      logs = await db.query.apiLogs.findMany({
        where: eq(schema.apiLogs.operation, operationFilter),
        orderBy: (apiLogs, { desc }) => [desc(apiLogs.timestamp)],
        limit: limit,
        offset: offset
      });
    } else {
      logs = await db.query.apiLogs.findMany({
        orderBy: (apiLogs, { desc }) => [desc(apiLogs.timestamp)],
        limit: limit,
        offset: offset
      });
    }
    
    // Get total count for pagination
    const countQuery = operationFilter
      ? sql`SELECT COUNT(*) as count FROM api_logs WHERE operation = ${operationFilter}`
      : sql`SELECT COUNT(*) as count FROM api_logs`;
    
    const countResult = await db.execute(countQuery);
    const totalCount = Number(countResult.rows[0]?.count || 0);
    
    return {
      data: logs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching API logs:', error);
    throw error;
  }
}