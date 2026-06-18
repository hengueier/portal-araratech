import express, { Express } from "express";
import passport from "passport";
import mongoSanitize from "express-mongo-sanitize";

/**
 * @function bootConfig
 * @description Configures essential middlewares for the Express application, including
 *              JSON parsing, URL encoding, security enhancements, and request sanitization.
 *
 * @param {Express} app - The Express application instance.
 *
 * @note
 * - This function sets up fundamental configurations for handling requests and protecting the application.
 * - Includes security features like request sanitization (`express-mongo-sanitize`) to prevent injection attacks.
 * - Initializes `passport` for authentication workflows.
 *
 * @middlewares
 * - `express.json()`: Parses incoming requests with JSON payloads.
 * - `express.urlencoded()`: Parses URL-encoded payloads (e.g., from forms).
 * - `app.set("trust proxy", 1)`: Enables trust for reverse proxies like Nginx or AWS Load Balancers.
 * - `passport.initialize()`: Initializes the Passport authentication middleware.
 * - `mongoSanitize()`: Prevents injection of malicious MongoDB operators into query parameters.
 *
 * @important
 * - Use `app.set("trust proxy", 1)` cautiously; this is necessary for applications behind reverse proxies
 *   and is required for features like secure cookies.
 * - Ensure the `passport` configuration is set up elsewhere to handle authentication strategies.
 */
export const bootConfig = (app: Express) => {
  // Enable JSON parsing for incoming requests
  app.use(express.json());

  // Trust the first reverse proxy (e.g., Nginx, AWS Load Balancers)
  app.set("trust proxy", 1);

  // Enable URL-encoded payload parsing for form submissions
  app.use(express.urlencoded({ extended: true }));

  // Initialize Passport for authentication workflows
  app.use(passport.initialize());

  // Protect against injection attacks targeting MongoDB
  app.use(mongoSanitize());
};
