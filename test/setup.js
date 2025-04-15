/**
 * Global test setup environment
 *
 * This file is automatically loaded before Jest tests run,
 * and initializes the test environment with cleanup handlers.
 */

// ==============================
// Process Related Mocks
// ==============================

/**
 * Mock process.exit
 * Prevents the application from terminating so tests can continue
 */
const originalExit = process.exit;
process.exit = (code) => {
  console.log(`[Mock] process.exit was called (code: ${code})`);
  // Don't terminate the process
  return;
};

// ==============================
// Environment Variables Setup
// ==============================

/**
 * Set up test environment variables
 */
const setupEnvironmentVariables = () => {
  process.env.ROLLBAR_PROJECT_TOKEN = "test-project-token";
  process.env.ROLLBAR_ACCOUNT_TOKEN = "test-account-token";
  process.env.ROLLBAR_PROJECT_NAME = "test-project";
  process.env.ROLLBAR_PROJECT_ID = "123";
};

/**
 * Clear environment variables
 */
const clearEnvironmentVariables = () => {
  process.env.ROLLBAR_PROJECT_TOKEN = undefined;
  process.env.ROLLBAR_ACCOUNT_TOKEN = undefined;
  process.env.ROLLBAR_PROJECT_NAME = undefined;
  process.env.ROLLBAR_PROJECT_ID = undefined;
};

// Initialize environment variables
setupEnvironmentVariables();

// ==============================
// Axios Mocks
// ==============================

/**
 * Global helper function to set up Axios mocks
 * @returns {Object} Mocked Axios methods (mockGet, mockPost)
 */
global.setupAxiosMocks = () => {
  const mockGet = jest.fn().mockImplementation((url) => {
    if (url.includes("/projects")) {
      return Promise.resolve({
        data: {
          result: [
            { id: 123, name: "test-project" },
            { id: 456, name: "other-project" },
          ],
        },
      });
    }

    if (url.includes("/items")) {
      return Promise.resolve({
        data: {
          result: {
            items: [
              { id: 1, title: "Error 1" },
              { id: 2, title: "Error 2" },
            ],
          },
        },
      });
    }

    return Promise.resolve({ data: { result: {} } });
  });

  const mockPost = jest.fn().mockResolvedValue({
    data: { result: { success: true } },
  });

  return { mockGet, mockPost };
};

// ==============================
// Test Cleanup
// ==============================

/**
 * Cleanup after all tests have completed
 */
afterAll(() => {
  // Uncomment to restore the original process.exit if needed
  // process.exit = originalExit;

  // Clear environment variables
  clearEnvironmentVariables();
});
