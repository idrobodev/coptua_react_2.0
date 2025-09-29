// Visitor Counter Service
const VisitorCounterService = class {
  constructor() {
    this.storageKey = 'todoporunalma_visitor_count';
    this.sessionKey = 'todoporunalma_session_visited';
    this.apiEndpoint = process.env.REACT_APP_API_URL || null;
  }

  // Check if this is a new session visit
  isNewVisit() {
    return !sessionStorage.getItem(this.sessionKey);
  }

  // Mark current session as visited
  markSessionVisited() {
    sessionStorage.setItem(this.sessionKey, 'true');
  }

  // Get current visitor count from localStorage
  getLocalCount() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? parseInt(stored, 10) : 1250; // Starting count
  }

  // Save visitor count to localStorage
  saveLocalCount(count) {
    localStorage.setItem(this.storageKey, count.toString());
  }

  // Increment visitor count
  incrementCount() {
    if (this.isNewVisit()) {
      const currentCount = this.getLocalCount();
      const newCount = currentCount + 1;
      this.saveLocalCount(newCount);
      this.markSessionVisited();
      
      // Try to sync with API if available
      this.syncWithAPI(newCount);
      
      return newCount;
    }
    return this.getLocalCount();
  }

  // Sync with API (for future implementation)
  async syncWithAPI(count) {
    if (!this.apiEndpoint) return;
    
    try {
      await fetch(`${this.apiEndpoint}/visitor-count`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count, timestamp: new Date().toISOString() }),
      });
    } catch (error) {
      console.log('Visitor count sync failed (API not available):', error.message);
    }
  }

  // Get formatted count with separators
  getFormattedCount() {
    const count = this.getLocalCount();
    return count.toLocaleString('es-CO');
  }

  // Simulate realistic visitor growth
  simulateRealisticGrowth() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Higher activity during business hours and weekdays
    const isBusinessHours = hour >= 8 && hour <= 18;
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    
    let growthFactor = 1;
    if (isBusinessHours) growthFactor += 0.3;
    if (isWeekday) growthFactor += 0.2;
    
    // Random growth between 1-5 visitors per session
    const randomGrowth = Math.floor(Math.random() * 5 * growthFactor) + 1;
    
    const currentCount = this.getLocalCount();
    const newCount = currentCount + randomGrowth;
    this.saveLocalCount(newCount);
    
    return newCount;
  }
}

const visitorCounterServiceInstance = new VisitorCounterService();
export default visitorCounterServiceInstance;
