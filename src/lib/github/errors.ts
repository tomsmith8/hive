// ============================================================================
// GITHUB OAUTH ERROR HANDLING
// ============================================================================

export interface GitHubOAuthError {
  code: string;
  message: string;
  userMessage: string;
  action?: string;
  retryAfter?: number;
}

export const GITHUB_OAUTH_ERRORS: Record<string, GitHubOAuthError> = {
  oauth_denied: {
    code: 'oauth_denied',
    message: 'User denied GitHub OAuth authorization',
    userMessage: 'GitHub authorization was cancelled. Please try again to connect your account.',
    action: 'retry'
  },
  no_code: {
    code: 'no_code',
    message: 'No authorization code received from GitHub',
    userMessage: 'GitHub authorization failed. Please try connecting again.',
    action: 'retry'
  },
  invalid_state: {
    code: 'invalid_state',
    message: 'Invalid or expired OAuth state parameter',
    userMessage: 'Your session has expired. Please try connecting to GitHub again.',
    action: 'retry'
  },
  user_not_found: {
    code: 'user_not_found',
    message: 'User not found in database',
    userMessage: 'Your account could not be found. Please log in again.',
    action: 'login'
  },
  callback_failed: {
    code: 'callback_failed',
    message: 'GitHub OAuth callback processing failed',
    userMessage: 'Failed to complete GitHub connection. Please try again.',
    action: 'retry'
  },
  oauth_init_failed: {
    code: 'oauth_init_failed',
    message: 'Failed to initiate GitHub OAuth flow',
    userMessage: 'Failed to start GitHub connection. Please try again.',
    action: 'retry'
  },
  rate_limit_exceeded: {
    code: 'rate_limit_exceeded',
    message: 'GitHub API rate limit exceeded',
    userMessage: 'GitHub is temporarily limiting requests. Please try again in a few minutes.',
    action: 'wait'
  },
  network_error: {
    code: 'network_error',
    message: 'Network error during GitHub API call',
    userMessage: 'Network connection error. Please check your internet connection and try again.',
    action: 'retry'
  },
  invalid_token: {
    code: 'invalid_token',
    message: 'Invalid or expired GitHub access token',
    userMessage: 'Your GitHub connection has expired. Please reconnect your account.',
    action: 'reconnect'
  }
};

/**
 * Get user-friendly error information for a GitHub OAuth error
 * @param errorCode - The error code from the OAuth flow
 * @returns Error information with user-friendly message
 */
export function getGitHubOAuthError(errorCode: string): GitHubOAuthError {
  return GITHUB_OAUTH_ERRORS[errorCode] || {
    code: errorCode,
    message: `Unknown GitHub OAuth error: ${errorCode}`,
    userMessage: 'An unexpected error occurred. Please try again.',
    action: 'retry'
  };
}

/**
 * Handle GitHub API errors and return appropriate error information
 * @param error - The error from GitHub API
 * @returns Error information with user-friendly message
 */
export function handleGitHubAPIError(error: unknown): GitHubOAuthError {
  console.error('GitHub API Error:', error);
  
  // Handle different types of errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('rate limit')) {
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'GitHub API rate limit exceeded',
        userMessage: 'GitHub API rate limit exceeded. Please try again later.',
        action: 'retry',
        retryAfter: 60,
      };
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        code: 'UNAUTHORIZED',
        message: 'GitHub authorization expired',
        userMessage: 'GitHub authorization expired. Please reconnect your account.',
        action: 'login',
      };
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient GitHub permissions',
        userMessage: 'Insufficient permissions. Please check your GitHub account settings.',
        action: 'login',
      };
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return {
        code: 'RESOURCE_NOT_FOUND',
        message: 'GitHub resource not found',
        userMessage: 'The requested resource was not found.',
        action: 'retry',
      };
    }
  }
  
  // Default error
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Unknown GitHub API error',
    userMessage: 'An unexpected error occurred. Please try again.',
    action: 'retry',
  };
} 