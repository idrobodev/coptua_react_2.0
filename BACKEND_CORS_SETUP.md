# Backend CORS Configuration Guide

## Overview

This document provides comprehensive instructions for configuring Cross-Origin Resource Sharing (CORS) in the Spring Boot backend to enable communication with the React frontend application.

**Frontend URL (Development)**: `http://localhost:3001`  
**Backend URL (Development)**: `http://localhost:8080`  
**Frontend URL (Production)**: `https://todoporunalma.org`

## Why CORS Configuration is Needed

CORS is a security feature implemented by browsers to prevent malicious websites from making unauthorized requests to your API. When the frontend (running on port 3001) tries to communicate with the backend (running on port 8080), the browser blocks these requests unless the backend explicitly allows them through CORS headers.

## Implementation Options

### Option 1: Global CORS Configuration (Recommended)

This approach configures CORS globally for all endpoints using Spring's `WebMvcConfigurer`.

**File**: `src/main/java/com/todoporunalma/config/CorsConfig.java`

```java
package com.todoporunalma.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3001",           // Development frontend
                    "https://todoporunalma.org"        // Production frontend
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);  // Cache preflight response for 1 hour
    }
}
```

**Configuration Explanation**:

- `addMapping("/api/**")`: Applies CORS to all endpoints starting with `/api/`
- `allowedOrigins()`: Specifies which origins can access the API
- `allowedMethods()`: HTTP methods that are permitted
- `allowedHeaders("*")`: Allows all headers (can be restricted for security)
- `allowCredentials(true)`: Allows cookies and authentication headers
- `maxAge(3600)`: Browser caches preflight response for 1 hour

### Option 2: Spring Security CORS Configuration

If you're using Spring Security, configure CORS through the security filter chain.

**File**: `src/main/java/com/todoporunalma/config/SecurityConfig.java`

```java
package com.todoporunalma.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().configurationSource(corsConfigurationSource())
            .and()
            .csrf().disable()  // Disable CSRF if using token-based auth
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            );
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3001",
            "https://todoporunalma.org"
        ));
        
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        
        return source;
    }
}
```

### Option 3: Controller-Level CORS (Not Recommended for Global Use)

For specific controllers only:

```java
@RestController
@RequestMapping("/api/participants")
@CrossOrigin(
    origins = {"http://localhost:3001", "https://todoporunalma.org"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE},
    allowCredentials = "true"
)
public class ParticipantController {
    // Controller methods
}
```

**Note**: This approach requires adding `@CrossOrigin` to every controller, which is error-prone. Use Option 1 or 2 instead.

## Environment-Specific Configuration

For better security and flexibility, use environment variables or application properties:

**File**: `src/main/resources/application.yml`

```yaml
cors:
  allowed-origins:
    - ${FRONTEND_URL:http://localhost:3001}
    - ${PRODUCTION_URL:https://todoporunalma.org}
  allowed-methods:
    - GET
    - POST
    - PUT
    - DELETE
    - OPTIONS
    - PATCH
  allowed-headers: "*"
  allow-credentials: true
  max-age: 3600
```

**Updated CorsConfig.java**:

```java
package com.todoporunalma.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Value("${cors.allowed-origins}")
    private List<String> allowedOrigins;
    
    @Value("${cors.allowed-methods}")
    private List<String> allowedMethods;
    
    @Value("${cors.max-age}")
    private Long maxAge;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.toArray(new String[0]))
                .allowedMethods(allowedMethods.toArray(new String[0]))
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(maxAge);
    }
}
```

## Testing Instructions

### 1. Verify CORS Configuration is Active

Start your Spring Boot application and check the logs for CORS-related messages:

```bash
./mvnw spring-boot:run
```

### 2. Test with Browser DevTools

1. Open the frontend application at `http://localhost:3001`
2. Open Browser DevTools (F12)
3. Go to the **Network** tab
4. Attempt to login or make an API call
5. Look for the API request in the Network tab

**What to Check**:

- **Preflight Request (OPTIONS)**: Should return `200 OK`
- **Response Headers** should include:
  ```
  Access-Control-Allow-Origin: http://localhost:3001
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
  Access-Control-Allow-Headers: *
  Access-Control-Allow-Credentials: true
  ```

### 3. Test with cURL

Test the preflight request:

```bash
curl -X OPTIONS http://localhost:8080/api/auth/login \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Expected Response Headers**:
```
< HTTP/1.1 200
< Access-Control-Allow-Origin: http://localhost:3001
< Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS,PATCH
< Access-Control-Allow-Credentials: true
< Access-Control-Max-Age: 3600
```

Test an actual POST request:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Origin: http://localhost:3001" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -v
```

### 4. Test Health Endpoint

Create a simple health check endpoint to verify connectivity:

```java
@RestController
@RequestMapping("/api")
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}
```

Test from frontend:

```javascript
// In browser console at http://localhost:3001
fetch('http://localhost:8080/api/health')
  .then(res => res.json())
  .then(data => console.log('Backend is reachable:', data))
  .catch(err => console.error('CORS or connection error:', err));
```

## Troubleshooting Guide

### Issue 1: CORS Errors Still Appear

**Symptoms**:
```
Access to XMLHttpRequest at 'http://localhost:8080/api/auth/login' from origin 
'http://localhost:3001' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' 
header is present on the requested resource.
```

**Solutions**:

1. **Verify Configuration is Loaded**:
   - Add logging to your CorsConfig class:
   ```java
   @Override
   public void addCorsMappings(CorsRegistry registry) {
       System.out.println("🔧 Configuring CORS...");
       registry.addMapping("/api/**")
           // ... rest of config
       System.out.println("✅ CORS configured for origins: " + allowedOrigins);
   }
   ```

2. **Check Spring Security**:
   - If using Spring Security, ensure CORS is configured BEFORE other security filters
   - Make sure `.cors()` is called in the security configuration

3. **Restart Backend**:
   - Configuration changes require a full restart
   - Clear any caches: `./mvnw clean spring-boot:run`

4. **Check URL Matching**:
   - Ensure your API endpoints start with `/api/`
   - If not, adjust the mapping pattern in CORS config

### Issue 2: Preflight Request Fails (OPTIONS)

**Symptoms**:
```
OPTIONS request returns 403 Forbidden or 401 Unauthorized
```

**Solutions**:

1. **Permit OPTIONS in Security Config**:
   ```java
   @Bean
   public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
       http
           .cors().and()
           .authorizeHttpRequests(auth -> auth
               .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // Add this
               .requestMatchers("/api/**").authenticated()
               .anyRequest().permitAll()
           );
       return http.build();
   }
   ```

2. **Check Filter Order**:
   - CORS filter must run before authentication filters
   - Spring Security's `.cors()` handles this automatically

### Issue 3: Credentials Not Working

**Symptoms**:
```
Cookies or Authorization headers not being sent/received
```

**Solutions**:

1. **Frontend Configuration**:
   - Ensure axios is configured with `withCredentials: true`
   - Check `src/shared/services/api.js`:
   ```javascript
   const apiClient = axios.create({
       baseURL: API_BASE_URL,
       withCredentials: true  // Must be true if backend allows credentials
   });
   ```

2. **Backend Configuration**:
   - Ensure `.allowCredentials(true)` is set
   - Cannot use `allowedOrigins("*")` with credentials - must specify exact origins

3. **Cookie Settings**:
   - If using cookies, ensure `SameSite` attribute is set correctly:
   ```java
   Cookie cookie = new Cookie("token", jwtToken);
   cookie.setHttpOnly(true);
   cookie.setSecure(false);  // Set to true in production with HTTPS
   cookie.setPath("/");
   cookie.setMaxAge(3600);
   ```

### Issue 4: Works in Development but Not Production

**Symptoms**:
- CORS works with `localhost:3001` but fails with production domain

**Solutions**:

1. **Add Production Origin**:
   ```java
   .allowedOrigins(
       "http://localhost:3001",
       "https://todoporunalma.org",  // Add production domain
       "https://www.todoporunalma.org"  // Add www variant if needed
   )
   ```

2. **Use Environment Variables**:
   - Set `FRONTEND_URL` environment variable in production
   - Don't hardcode URLs

3. **Check HTTPS**:
   - Production should use HTTPS
   - Ensure SSL certificates are valid

### Issue 5: Specific Headers Not Allowed

**Symptoms**:
```
Request header field Authorization is not allowed by Access-Control-Allow-Headers
```

**Solutions**:

1. **Explicitly Allow Headers**:
   ```java
   .allowedHeaders("Content-Type", "Authorization", "X-Requested-With")
   ```

2. **Or Allow All Headers** (less secure but simpler):
   ```java
   .allowedHeaders("*")
   ```

## Security Best Practices

### 1. Restrict Origins in Production

Never use `allowedOrigins("*")` in production:

```java
// ❌ BAD - Too permissive
.allowedOrigins("*")

// ✅ GOOD - Specific origins
.allowedOrigins("https://todoporunalma.org")
```

### 2. Limit Allowed Methods

Only allow methods your API actually uses:

```java
// If you don't use PATCH, don't allow it
.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
```

### 3. Restrict Headers

Instead of allowing all headers, specify only what's needed:

```java
.allowedHeaders("Content-Type", "Authorization", "X-Request-ID")
```

### 4. Use HTTPS in Production

Always use HTTPS for production:

```java
.allowedOrigins("https://todoporunalma.org")  // Not http://
```

### 5. Set Appropriate Max Age

Balance between performance and security:

```java
.maxAge(3600)  // 1 hour is reasonable
// Don't set too high (e.g., 86400 = 24 hours) as it caches CORS config
```

## Additional Resources

- [Spring CORS Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-cors)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Spring Security CORS](https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html)

## Quick Reference

### Minimal Working Configuration

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3001")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### Common CORS Headers

| Header | Purpose | Example Value |
|--------|---------|---------------|
| `Access-Control-Allow-Origin` | Specifies allowed origin | `http://localhost:3001` |
| `Access-Control-Allow-Methods` | Specifies allowed HTTP methods | `GET, POST, PUT, DELETE` |
| `Access-Control-Allow-Headers` | Specifies allowed request headers | `Content-Type, Authorization` |
| `Access-Control-Allow-Credentials` | Allows cookies/auth headers | `true` |
| `Access-Control-Max-Age` | Preflight cache duration (seconds) | `3600` |

## Contact

If you encounter issues not covered in this guide, please:

1. Check browser console for specific CORS error messages
2. Check backend logs for any CORS-related errors
3. Verify both frontend and backend are running on correct ports
4. Test with the cURL commands provided above to isolate the issue
