# Todo Por Un Alma - Frontend Application

React-based frontend application for the Todo Por Un Alma organization management system.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend API server running on `http://localhost:8080`

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

The application uses environment variables for configuration. Copy the example file and adjust as needed:

```bash
cp .env.example .env.development.local
```

See the **Environment Variables** section below for configuration options.

### 3. Start the Backend Server

Before starting the frontend, ensure the backend API is running:

```bash
# Navigate to your backend directory
cd /path/to/backend

# Start the Spring Boot application
./mvnw spring-boot:run
```

The backend should be accessible at `http://localhost:8080`.

### 4. Start the Frontend Development Server

```bash
npm start
```

The application will start on `http://localhost:3001` and automatically proxy API requests to the backend.

## Environment Variables

### Available Variables

- `REACT_APP_API_BASE_URL`: Base URL for the backend API
  - Default: `http://localhost:8080/api`
  - Production: `https://api.todoporunalma.org/api`

- `PORT`: Port for the development server
  - Default: `3001`

- `BROWSER`: Control browser auto-opening
  - Default: `none` (disabled)

### When to Use Proxy vs Direct API URL

#### Development Proxy (Recommended)

The application is configured with a proxy in `package.json` that automatically forwards API requests to the backend. This is the **recommended approach** for local development because:

- ✅ Automatically handles CORS issues
- ✅ No additional configuration needed
- ✅ Simulates production-like environment
- ✅ Works out of the box

**How it works**: When you make a request to `/api/*`, the dev server automatically forwards it to `http://localhost:8080/api/*`.

#### Direct API URL (Alternative)

If you need to connect to a different backend (e.g., staging server), you can override the API URL:

1. Create `.env.development.local` file (see `.env.development.local.example`)
2. Set `REACT_APP_API_BASE_URL` to your backend URL
3. Ensure the backend has proper CORS configuration (see **CORS Configuration** section)

**When to use**:
- Testing against a remote backend
- Backend running on a different port
- Multiple developers sharing a backend instance

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3001](http://localhost:3001).

- Hot reload enabled with React Fast Refresh
- Component state preserved during updates
- Browser auto-open disabled

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

- Optimized for best performance
- Minified and bundled
- Ready for deployment

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## CORS Configuration

### Frontend Configuration

The frontend is configured to work with CORS out of the box using the development proxy. No additional frontend configuration is needed for local development.

### Backend Configuration Required

The backend **must** have CORS properly configured to allow requests from the frontend. See `BACKEND_CORS_SETUP.md` for detailed backend configuration instructions.

**Required CORS headers**:
- `Access-Control-Allow-Origin: http://localhost:3001`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
- `Access-Control-Allow-Credentials: true`

## Troubleshooting

### CORS Errors

**Symptom**: Console shows errors like "Access to XMLHttpRequest has been blocked by CORS policy"

**Solutions**:

1. **Verify backend is running**
   ```bash
   curl http://localhost:8080/api/health
   ```
   If this fails, start the backend server.

2. **Check backend CORS configuration**
   - Ensure the backend has CORS configured (see `BACKEND_CORS_SETUP.md`)
   - Verify `http://localhost:3001` is in the allowed origins list
   - Check backend logs for CORS-related errors

3. **Clear browser cache**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or clear cache in browser settings

4. **Verify proxy configuration**
   - Check `package.json` has `"proxy": "http://localhost:8080"`
   - Restart the dev server after changing proxy settings

5. **Check network tab**
   - Open browser DevTools → Network tab
   - Look for failed OPTIONS (preflight) requests
   - Inspect response headers for CORS headers

### Backend Connection Issues

**Symptom**: "Error de conexión con el servidor" or network errors

**Solutions**:

1. **Verify backend is accessible**
   ```bash
   curl http://localhost:8080/api/health
   ```

2. **Check backend port**
   - Ensure backend is running on port 8080
   - If using a different port, update the proxy in `package.json`

3. **Check firewall settings**
   - Ensure localhost connections are allowed
   - Temporarily disable firewall to test

### Hot Reload Not Working

**Symptom**: Changes to files don't reflect in the browser

**Solutions**:

1. **Check for syntax errors**
   - Look for errors in the terminal
   - Check browser console for errors

2. **Restart dev server**
   ```bash
   # Stop the server (Ctrl+C)
   npm start
   ```

3. **Clear webpack cache**
   ```bash
   rm -rf node_modules/.cache
   npm start
   ```

4. **Verify Fast Refresh is enabled**
   - Check that `FAST_REFRESH=true` is in the start script
   - Ensure no duplicate React Refresh plugins in babel config

### Performance Issues / Slow Rendering

**Symptom**: Application feels sluggish or components re-render unnecessarily

**Solutions**:

1. **Enable performance monitoring**
   - Open React DevTools → Profiler tab
   - Record interactions and analyze render counts

2. **Check for unnecessary re-renders**
   - Look for components rendering multiple times
   - Verify memoization is working correctly

3. **Clear browser cache and restart**
   ```bash
   # Clear cache, then restart dev server
   npm start
   ```

### Port Already in Use

**Symptom**: "Port 3001 is already in use"

**Solutions**:

1. **Kill the process using the port**
   ```bash
   # Find the process
   lsof -ti:3001
   
   # Kill it
   kill -9 $(lsof -ti:3001)
   ```

2. **Use a different port**
   ```bash
   PORT=3002 npm start
   ```

## Project Structure

```
src/
├── app/                    # Main App component
├── assets/                 # Images, videos, static files
├── components/             # Reusable UI components
│   ├── UI/                # Generic UI components (Button, Modal, etc.)
│   ├── common/            # Common business components
│   └── layout/            # Layout components (Header, Sidebar, etc.)
├── features/              # Feature-specific components
│   ├── auth/             # Authentication features
│   ├── dashboard/        # Dashboard features
│   └── landing/          # Landing page features
├── pages/                 # Page components (routes)
├── shared/                # Shared utilities and services
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   └── utils/            # Utility functions
└── index.js              # Application entry point
```

## Technology Stack

- **React** 18.x - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **CRACO** - Create React App Configuration Override
- **Chart.js** - Data visualization

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code
   - Test locally
   - Ensure hot reload is working

3. **Test your changes**
   ```bash
   npm test
   ```

4. **Build for production** (optional)
   ```bash
   npm run build
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

## Additional Documentation

- `BACKEND_CORS_SETUP.md` - Backend CORS configuration guide
- `VERIFICATION_RESULTS.md` - Verification and testing results

## Support

For issues or questions, please contact the development team or create an issue in the project repository.
