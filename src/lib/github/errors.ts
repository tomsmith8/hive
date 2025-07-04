// ============================================================================
// GITHUB OAUTH ERROR HANDLING
// ============================================================================

export interface GitHubOAuthError {
  code: string;
  message: string;
  userMessage: string;
  action?: string;
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
export function handleGitHubAPIError(error: any): GitHubOAuthError {
  if (error.message?.includes('rate limit')) {
    return GITHUB_OAUTH_ERRORS.rate_limit_exceeded;
  }
  
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return GITHUB_OAUTH_ERRORS.network_error;
  }
  
  if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
    return GITHUB_OAUTH_ERRORS.invalid_token;
  }
  
  return {
    code: 'api_error',
    message: error.message || 'Unknown GitHub API error',
    userMessage: 'Failed to communicate with GitHub. Please try again.',
    action: 'retry'
  };
} 