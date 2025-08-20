// Global error handler for unhandled fetch errors and third-party script interference

export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections (like fetch errors)
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof Error) {
      const error = event.reason;
      
      // Check if this is a fetch-related error
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('fetch') ||
          error.name === 'TypeError') {
        
        console.warn('Caught unhandled fetch error:', error.message);
        
        // Prevent the error from showing in console
        event.preventDefault();
        
        // Don't show these errors to users as they're handled by fallbacks
        return;
      }
    }
  });

  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    if (error instanceof Error) {
      // Check if this is related to third-party scripts or fetch
      if (error.stack?.includes('fullstory') ||
          error.stack?.includes('fetch') ||
          error.message.includes('Failed to fetch')) {
        
        console.warn('Caught third-party or fetch error:', error.message);
        
        // Prevent error from propagating
        event.preventDefault();
        return;
      }
    }
  });

  console.log('Global error handling initialized');
};

// Utility function to safely execute fetch-related operations
export const safeAsyncOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string = 'operation'
): Promise<T> => {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    console.warn(`Safe async ${operationName} failed, using fallback:`, error);
    return fallback;
  }
};
