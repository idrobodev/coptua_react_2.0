# Design Document: CORS and Performance Fixes

## Overview

This design addresses two critical issues affecting the application:

1. **CORS Errors**: The frontend (running on localhost:3001) cannot communicate with the backend API (localhost:8080) due to missing CORS headers
2. **Performance Issues**: Unnecessary re-renders and hot reload problems affecting development experience

The solution involves backend CORS configuration (documented for backend team), frontend API client improvements, React optimization patterns, and webpack/dev server configuration enhancements.

### Key Design Principles

- **Separation of Concerns**: Backend handles CORS headers; frontend handles proper request configuration
- **Performance First**: Minimize re-renders through proper memoization and context splitting
- **Developer Experience**: Ensure hot reload works reliably with Fast Refresh
- **Error Transparency**: Provide clear error messages for debugging CORS and network issues

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│                   localhost:3001                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Client (axios)                                   │  │
│  │  - Request interceptors                               │  │
│  │  - Response interceptors                              │  │
│  │  - Error handling                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          │ HTTP Requests                     │
│                          │ (with proper headers)             │
│                          ▼                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ CORS Preflight (OPTIONS)
                           │ Actual Request (GET/POST/etc)
                           │
┌─────────────────────────▼───────────────────────────────────┐
│                  Backend (Spring Boot)                       │
│                   localhost:8080                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CORS Configuration                                   │  │
│  │  - Allow Origin: http://localhost:3001                │  │
│  │  - Allow Methods: GET, POST, PUT, DELETE, OPTIONS     │  │
│  │  - Allow Headers: Content-Type, Authorization         │  │
│  │  - Allow Credentials: true                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### React Component Optimization Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AuthProvider                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AuthStateContext (memoized)                           │ │
│  │  - currentUser                                         │ │
│  │  - loading                                             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AuthActionsContext (memoized)                         │ │
│  │  - login (useCallback)                                 │ │
│  │  - logout (useCallback)                                │ │
│  │  - forgetPassword (useCallback)                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Only components using
                           │ changed values re-render
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Child Components                          │
│  - Use useAuthState() for state                             │
│  - Use useAuthActions() for actions                         │
│  - Wrapped in React.memo() where appropriate                │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Backend CORS Configuration (Documentation for Backend Team)

**Location**: Backend Spring Boot application (not in this repository)

**Required Configuration**:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3001",  // Development
                    "https://todoporunalma.org"  // Production
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

**Alternative: Spring Security Configuration**:

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors().configurationSource(corsConfigurationSource());
    // ... other security config
    return http.build();
}

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3001",
        "https://todoporunalma.org"
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", configuration);
    return source;
}
```

### 2. Frontend API Client Enhancements

**File**: `src/shared/services/api.js`

**Changes**:

1. **Improved Error Handling**:
   - Detect CORS errors specifically
   - Provide actionable error messages
   - Log detailed debugging information

2. **Request Configuration**:
   - Ensure proper headers are sent
   - Handle credentials correctly
   - Add timeout handling

3. **Response Interceptor**:
   - Better error extraction
   - Network error detection
   - CORS error detection

**Interface**:

```javascript
class ApiService {
  // Enhanced error handling
  handleNetworkError(error) {
    if (error.message === 'Network Error' || !error.response) {
      return {
        isCorsError: this.detectCorsError(error),
        message: this.getErrorMessage(error),
        suggestions: this.getErrorSuggestions(error)
      };
    }
  }
  
  detectCorsError(error) {
    // Check for CORS-specific error patterns
  }
  
  getErrorSuggestions(error) {
    // Provide actionable suggestions
  }
}
```

### 3. API Client Configuration

**File**: `src/shared/services/api.js`

**Axios Instance Configuration**:

```javascript
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: false,  // Set to true only if backend supports credentials
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
```

**Key Decisions**:
- `withCredentials: false` by default (enable only if backend sets `Access-Control-Allow-Credentials: true`)
- Explicit `Accept` header for better content negotiation
- 30-second timeout to prevent hanging requests

### 4. AuthContext Optimization

**File**: `src/shared/contexts/AuthContext.jsx`

**Current Implementation** (Already Good):
- ✅ Split contexts (AuthStateContext, AuthActionsContext)
- ✅ Memoized state values with useMemo
- ✅ Memoized action functions with useCallback
- ✅ Separate hooks for state and actions

**Minor Improvements Needed**:
- Add dependency arrays to useCallback where missing
- Ensure all callbacks are properly memoized
- Add performance tracking in development mode

### 5. Component Memoization Strategy

**Pattern to Apply**:

```javascript
// Wrap expensive components in React.memo
const ExpensiveComponent = React.memo(({ data, onAction }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function (optional)
  return prevProps.data === nextProps.data && 
         prevProps.onAction === nextProps.onAction;
});

// Use useMemo for expensive computations
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback((id) => {
  // Handler implementation
}, [/* dependencies */]);
```

**Components to Optimize**:
- `DashboardHeader` - ✅ Already memoized
- `Participantes` - ✅ Already memoized
- `Finance` - ✅ Already memoized
- `Sedes` - Needs React.memo wrapper
- Other dashboard pages - Evaluate case by case

### 6. Hot Reload Configuration

**File**: `craco.config.js`

**Current Configuration** (Already Good):
- ✅ React Fast Refresh enabled
- ✅ Filesystem caching for faster rebuilds
- ✅ Optimized source maps
- ✅ Proper watch options

**Improvements Needed**:
- Ensure React Refresh plugin is not duplicated
- Add error overlay configuration
- Optimize dev server settings

**File**: `package.json`

**Current Configuration**:
```json
{
  "scripts": {
    "start": "cross-env BROWSER=none PORT=3001 FAST_REFRESH=true craco start"
  }
}
```

**Analysis**:
- ✅ `BROWSER=none` prevents auto-opening browser
- ✅ `PORT=3001` avoids conflicts
- ✅ `FAST_REFRESH=true` enables Fast Refresh

### 7. Development Proxy Configuration

**Option 1: Package.json Proxy** (Simplest)

**File**: `package.json`

```json
{
  "proxy": "http://localhost:8080"
}
```

**Pros**:
- Simplest configuration
- Automatically handles CORS for API calls
- No code changes needed

**Cons**:
- Only works in development
- Less flexible than custom configuration

**Option 2: CRACO Dev Server Proxy** (More Control)

**File**: `craco.config.js`

```javascript
devServer: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug'
    }
  }
}
```

**Pros**:
- More control over proxy behavior
- Can proxy multiple paths
- Better debugging options

**Cons**:
- More complex configuration
- Requires understanding of proxy options

**Recommendation**: Start with Option 1 (package.json proxy) for simplicity. If more control is needed, migrate to Option 2.

## Data Models

### Error Response Model

```typescript
interface ApiError {
  message: string;
  status: number;
  isCorsError: boolean;
  isNetworkError: boolean;
  suggestions: string[];
  originalError: Error;
}
```

### API Configuration Model

```typescript
interface ApiConfig {
  baseURL: string;
  timeout: number;
  withCredentials: boolean;
  headers: Record<string, string>;
}
```

## Error Handling

### CORS Error Detection

**Strategy**:

1. **Network Error Detection**:
   - Check if `error.response` is undefined
   - Check if `error.message` contains "Network Error"
   - Check if `error.code` is "ERR_NETWORK"

2. **CORS-Specific Detection**:
   - Check console for CORS error messages
   - Check if preflight request failed
   - Check if response headers are missing

3. **User-Friendly Messages**:
   ```javascript
   const getCorsErrorMessage = () => {
     return `
       No se puede conectar con el servidor.
       
       Posibles causas:
       1. El servidor backend no está ejecutándose en http://localhost:8080
       2. El servidor no tiene configurado CORS correctamente
       3. Hay un problema de red
       
       Soluciones:
       1. Verifica que el servidor backend esté corriendo
       2. Revisa la configuración CORS del backend
       3. Verifica la consola del navegador para más detalles
     `;
   };
   ```

### Network Error Handling

**Interceptor Enhancement**:

```javascript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error handling
    if (!error.response) {
      // Network error or CORS error
      const enhancedError = {
        message: 'Error de conexión con el servidor',
        isCorsError: detectCorsError(error),
        isNetworkError: true,
        suggestions: getErrorSuggestions(error),
        originalError: error
      };
      
      console.error('🔥 Error de red:', enhancedError);
      return Promise.reject(enhancedError);
    }
    
    // HTTP error
    return Promise.reject(error.response.data || error);
  }
);
```

## Testing Strategy

### Manual Testing Checklist

1. **CORS Testing**:
   - [ ] Start backend on localhost:8080
   - [ ] Start frontend on localhost:3001
   - [ ] Attempt login
   - [ ] Verify no CORS errors in console
   - [ ] Verify successful authentication

2. **Hot Reload Testing**:
   - [ ] Make a change to a React component
   - [ ] Verify component updates without full page reload
   - [ ] Verify component state is preserved
   - [ ] Verify no console errors

3. **Performance Testing**:
   - [ ] Enable React DevTools Profiler
   - [ ] Perform actions that trigger re-renders
   - [ ] Verify only affected components re-render
   - [ ] Measure render counts before and after optimization

4. **Error Handling Testing**:
   - [ ] Stop backend server
   - [ ] Attempt API call
   - [ ] Verify user-friendly error message
   - [ ] Verify detailed error in console

### Automated Testing

**Unit Tests** (Optional):

```javascript
describe('API Service', () => {
  it('should detect CORS errors', () => {
    const error = new Error('Network Error');
    error.config = { url: '/api/test' };
    
    const result = api.detectCorsError(error);
    expect(result).toBe(true);
  });
  
  it('should provide error suggestions', () => {
    const error = new Error('Network Error');
    const suggestions = api.getErrorSuggestions(error);
    
    expect(suggestions).toContain('Verifica que el servidor backend esté corriendo');
  });
});
```

### Performance Testing

**React DevTools Profiler**:

1. Open React DevTools
2. Go to Profiler tab
3. Click "Record"
4. Perform actions
5. Stop recording
6. Analyze render counts and timing

**Expected Results**:
- AuthContext updates should only trigger re-renders in components using changed values
- Memoized components should not re-render when props haven't changed
- Callback functions should maintain referential equality across renders

## Implementation Notes

### Backend Requirements

The backend team needs to implement CORS configuration. Provide them with:

1. **Documentation**: Share the CORS configuration code examples
2. **Testing Endpoint**: Request a `/api/health` endpoint for testing
3. **Allowed Origins**: Specify `http://localhost:3001` for development
4. **Allowed Methods**: Specify all HTTP methods used by the frontend
5. **Credentials**: Clarify if credentials (cookies, auth headers) are needed

### Frontend Implementation Order

1. **Phase 1: CORS Fixes** (Highest Priority)
   - Document backend CORS requirements
   - Add proxy configuration to package.json
   - Enhance API error handling
   - Test with backend team

2. **Phase 2: Performance Optimization**
   - Audit components for unnecessary re-renders
   - Add React.memo to appropriate components
   - Verify memoization in contexts
   - Add performance monitoring

3. **Phase 3: Hot Reload Improvements**
   - Verify Fast Refresh configuration
   - Test hot reload with various file types
   - Document any limitations

### Development Workflow

1. **Start Backend**: `cd backend && ./mvnw spring-boot:run`
2. **Start Frontend**: `npm start`
3. **Verify Connection**: Check console for API connection logs
4. **Test Features**: Login, fetch data, perform CRUD operations

### Troubleshooting Guide

**Issue**: CORS errors persist after backend configuration

**Solutions**:
1. Clear browser cache
2. Verify backend CORS configuration is active
3. Check backend logs for CORS-related messages
4. Use browser DevTools Network tab to inspect headers
5. Try the proxy configuration approach

**Issue**: Hot reload not working

**Solutions**:
1. Verify `FAST_REFRESH=true` in start script
2. Check for syntax errors in files
3. Restart dev server
4. Clear webpack cache: `rm -rf node_modules/.cache`

**Issue**: Components re-rendering unnecessarily

**Solutions**:
1. Use React DevTools Profiler to identify culprits
2. Verify useMemo/useCallback dependencies
3. Check if context values are properly memoized
4. Consider splitting large contexts

## Performance Metrics

### Target Metrics

- **Initial Load**: < 2 seconds
- **Hot Reload**: < 500ms
- **Component Re-renders**: Only when props/state change
- **API Response Time**: < 1 second (depends on backend)

### Monitoring

Use the existing `PerformanceDebugOverlay` component to monitor:
- Render counts
- Render timing
- Component tree depth
- Context update frequency

Enable in development:
```javascript
// In App.js or index.js
{process.env.NODE_ENV === 'development' && <PerformanceDebugOverlay />}
```
