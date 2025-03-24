import { Node } from "@/types/graph";

/**
 * Utility functions for working with Wikipedia APIs to enhance node taxonomies
 */

/**
 * Interface for category hierarchies
 */
export interface CategoryHierarchy {
  name: string;
  parentCategories: CategoryHierarchy[];
  depth: number;
}

/**
 * Fetch parent categories for a given entity from Wikipedia
 * 
 * @param term The term to search for categories
 * @returns Promise with array of parent categories
 */
export async function getWikipediaCategories(term: string): Promise<string[]> {
  try {
    // Encode the term for URL
    const encodedTerm = encodeURIComponent(term);
    
    // Call the Wikipedia API to get categories for the term
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=categories&titles=${encodedTerm}&format=json&origin=*`
    );
    
    if (!response.ok) {
      throw new Error(`Wikipedia API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract categories from the response
    const pages = data.query?.pages || {};
    const pageIds = Object.keys(pages);
    
    if (pageIds.length === 0) {
      return [];
    }
    
    // Get the first page's categories
    const page = pages[pageIds[0]];
    const categories = page.categories || [];
    
    // Filter out administrative categories and extract the category names
    return categories
      .filter((cat: any) => {
        const title = cat.title || '';
        
        // Filter out Wikipedia maintenance categories
        return title.includes('Category:') && 
          !title.includes('articles with') && 
          !title.includes('Articles ') && 
          !title.includes('CS1') && 
          !title.includes('Wikipedia');
      })
      .map((cat: any) => cat.title.replace('Category:', '').trim());
      
  } catch (error) {
    console.error('Error fetching Wikipedia categories:', error);
    return [];
  }
}

/**
 * Fetch parent categories for a given category name
 * 
 * @param categoryName The category to get parents for
 * @returns Promise with array of parent category names
 */
export async function getCategoryParents(categoryName: string): Promise<string[]> {
  try {
    // Make sure we have the Category: prefix
    const fullCategoryName = categoryName.startsWith('Category:') 
      ? categoryName 
      : `Category:${categoryName}`;
    
    const encodedCategory = encodeURIComponent(fullCategoryName);
    
    // Call the Wikipedia API to get parents of this category
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=categories&titles=${encodedCategory}&format=json&origin=*`
    );
    
    if (!response.ok) {
      throw new Error(`Wikipedia API returned ${response.status} for ${categoryName}`);
    }
    
    const data = await response.json();
    
    // Extract categories from the response
    const pages = data.query?.pages || {};
    const pageIds = Object.keys(pages);
    
    if (pageIds.length === 0) {
      return [];
    }
    
    // Get the page's parent categories
    const page = pages[pageIds[0]];
    const categories = page.categories || [];
    
    // Filter out administrative categories and extract the category names
    return categories
      .filter((cat: any) => {
        const title = cat.title || '';
        
        // Filter out Wikipedia maintenance categories and hidden categories
        return title.includes('Category:') && 
          !title.includes('articles with') && 
          !title.includes('Articles ') && 
          !title.includes('CS1') && 
          !title.includes('Wikipedia') &&
          !title.includes('Hidden categories') &&
          !title.includes('Tracking categories') &&
          !title.includes('maintenance categories');
      })
      .map((cat: any) => cat.title.replace('Category:', '').trim());
      
  } catch (error) {
    console.error(`Error fetching parent categories for ${categoryName}:`, error);
    return [];
  }
}

/**
 * Checks if a node type exists in Wikipedia and gets its parent categories
 * 
 * @param nodeType The type of node to check
 * @returns Promise with array of parent categories
 */
export async function getNodeTypeWikipediaCategories(nodeType: string): Promise<string[]> {
  // Extract the main type without parentheses
  const mainType = nodeType.split('(')[0].trim();
  return await getWikipediaCategories(mainType);
}

/**
 * Enriches a node with Wikipedia category information
 * Adds the categories to the node properties
 * 
 * @param node The node to enrich
 * @returns Promise with the enriched node
 */
export async function enrichNodeWithWikipediaCategories(node: Node): Promise<Node> {
  try {
    // Skip if node already has Wikipedia categories
    if (node.properties.wikipediaCategories) {
      return node;
    }
    
    // Get categories for the node type
    const categories = await getNodeTypeWikipediaCategories(node.type);
    
    // Create a copy of the node
    const enrichedNode = { ...node };
    
    // Add categories to node properties
    if (!enrichedNode.properties) {
      enrichedNode.properties = {};
    }
    
    enrichedNode.properties.wikipediaCategories = categories;
    
    return enrichedNode;
  } catch (error) {
    console.error('Error enriching node with Wikipedia categories:', error);
    return node;
  }
}

/**
 * Recursively builds a category hierarchy by getting parent categories
 * 
 * @param categoryName The starting category name
 * @param maxDepth Maximum depth to traverse (default 4)
 * @param currentDepth Current depth in the recursion
 * @param visitedCategories Set of already visited categories to avoid cycles
 * @returns Promise with the category hierarchy
 */
export async function buildCategoryHierarchy(
  categoryName: string, 
  maxDepth: number = 4, 
  currentDepth: number = 0,
  visitedCategories: Set<string> = new Set()
): Promise<CategoryHierarchy> {
  // Base case: max depth reached or category already visited (avoid cycles)
  if (currentDepth >= maxDepth || visitedCategories.has(categoryName)) {
    return {
      name: categoryName,
      parentCategories: [],
      depth: currentDepth
    };
  }
  
  // Mark this category as visited
  visitedCategories.add(categoryName);
  
  // Get parent categories
  const parentCategoryNames = await getCategoryParents(categoryName);
  
  // Build parent hierarchies (with recursion and delay to avoid rate limiting)
  const parentCategories: CategoryHierarchy[] = [];
  
  for (const parentName of parentCategoryNames) {
    // Add a delay between API calls to avoid hitting rate limits
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Recursively get parent's hierarchy
    const parentHierarchy = await buildCategoryHierarchy(
      parentName,
      maxDepth,
      currentDepth + 1,
      new Set(visitedCategories) // Create a new copy to avoid shared state
    );
    
    parentCategories.push(parentHierarchy);
  }
  
  // Return the complete hierarchy for this category
  return {
    name: categoryName,
    parentCategories,
    depth: currentDepth
  };
}

/**
 * Builds a deep taxonomy for node types based on Wikipedia categories, 
 * following category hierarchies up to specified depth
 * 
 * @param nodeTypes Array of node type strings
 * @param maxDepth Maximum depth to traverse up the category hierarchy (default 4)
 * @returns Promise with a taxonomy object mapping types to their categories and hierarchies
 */
export async function buildDeepNodeTypeTaxonomy(
  nodeTypes: string[], 
  maxDepth: number = 4
): Promise<Record<string, CategoryHierarchy[]>> {
  const deepTaxonomy: Record<string, CategoryHierarchy[]> = {};
  
  // Process each node type sequentially
  for (const nodeType of nodeTypes) {
    // Skip duplicate processing
    if (deepTaxonomy[nodeType]) continue;
    
    console.log(`Building taxonomy for node type: ${nodeType}`);
    
    // Get initial categories for this node type
    const initialCategories = await getNodeTypeWikipediaCategories(nodeType);
    const categoryHierarchies: CategoryHierarchy[] = [];
    
    // Build a deep hierarchy for each category
    for (const category of initialCategories) {
      console.log(`  Processing category: ${category}`);
      
      // Add a delay between node types to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const hierarchy = await buildCategoryHierarchy(category, maxDepth);
      categoryHierarchies.push(hierarchy);
    }
    
    deepTaxonomy[nodeType] = categoryHierarchies;
  }
  
  return deepTaxonomy;
}

/**
 * Builds a taxonomy for node types based on Wikipedia categories
 * (simpler version that just gets direct categories)
 * 
 * @param nodeTypes Array of node type strings
 * @returns Promise with a taxonomy object mapping types to their parent categories
 */
export async function buildNodeTypeTaxonomy(nodeTypes: string[]): Promise<Record<string, string[]>> {
  const taxonomy: Record<string, string[]> = {};
  
  // Process each node type sequentially to avoid rate limiting
  for (const nodeType of nodeTypes) {
    // Skip duplicate processing
    if (taxonomy[nodeType]) continue;
    
    // Get categories for this node type
    const categories = await getNodeTypeWikipediaCategories(nodeType);
    taxonomy[nodeType] = categories;
    
    // Add a small delay to avoid hitting rate limits
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return taxonomy;
}

/**
 * Find related node types based on shared Wikipedia categories
 * 
 * @param nodeType The node type to find relations for
 * @param taxonomy The taxonomy mapping
 * @returns Array of related node types with their common categories
 */
export function findRelatedNodeTypes(
  nodeType: string, 
  taxonomy: Record<string, string[]>
): Array<{type: string, commonCategories: string[]}> {
  const results: Array<{type: string, commonCategories: string[]}> = [];
  
  // Get categories for the target node type
  const targetCategories = taxonomy[nodeType] || [];
  if (targetCategories.length === 0) return results;
  
  // Compare with all other node types
  for (const [type, categories] of Object.entries(taxonomy)) {
    // Skip comparing with itself
    if (type === nodeType) continue;
    
    // Find common categories
    const commonCategories = targetCategories.filter(category => 
      categories.includes(category)
    );
    
    // If there are common categories, add to results
    if (commonCategories.length > 0) {
      results.push({
        type,
        commonCategories
      });
    }
  }
  
  // Sort results by number of common categories (most common first)
  return results.sort((a, b) => b.commonCategories.length - a.commonCategories.length);
}