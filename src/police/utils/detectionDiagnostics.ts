// Detection diagnostics utility to help debug plate detection issues

export interface DiagnosticInfo {
  environment: {
    isDevelopment: boolean;
    isHTTPS: boolean;
    hasThirdPartyScripts: boolean;
    userAgent: string;
  };
  tensorflow: {
    isReady: boolean;
    backend: string;
    version: string;
  };
  network: {
    isOnline: boolean;
    connection?: any;
  };
  performance: {
    memory?: any;
    timing?: any;
  };
}

export class DetectionDiagnostics {
  static async getDiagnosticInfo(): Promise<DiagnosticInfo> {
    const info: DiagnosticInfo = {
      environment: {
        isDevelopment: import.meta.env.DEV || false,
        isHTTPS: window.location.protocol === 'https:',
        hasThirdPartyScripts: this.checkForThirdPartyScripts(),
        userAgent: navigator.userAgent
      },
      tensorflow: {
        isReady: false,
        backend: 'unknown',
        version: 'unknown'
      },
      network: {
        isOnline: navigator.onLine
      },
      performance: {}
    };

    // Check TensorFlow.js status
    try {
      const tf = await import('@tensorflow/tfjs');
      await tf.ready();
      info.tensorflow.isReady = true;
      info.tensorflow.backend = tf.getBackend();
      info.tensorflow.version = tf.version.tfjs || 'unknown';
    } catch (error) {
      console.warn('TensorFlow.js not available:', error);
    }

    // Get network connection info
    if ('connection' in navigator) {
      info.network.connection = (navigator as any).connection;
    }

    // Get performance info
    if ('memory' in performance) {
      info.performance.memory = (performance as any).memory;
    }

    return info;
  }

  static checkForThirdPartyScripts(): boolean {
    const thirdPartyIndicators = [
      'fullstory',
      'fs.js',
      'google-analytics',
      'gtag',
      'hotjar',
      'mixpanel',
      'segment',
      'intercom'
    ];

    // Check script tags
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const hasThirdPartyScript = scripts.some(script => {
      const src = script.getAttribute('src') || '';
      return thirdPartyIndicators.some(indicator => 
        src.toLowerCase().includes(indicator)
      );
    });

    // Check window object for known third-party globals
    const hasThirdPartyGlobal = thirdPartyIndicators.some(indicator => {
      const upperIndicator = indicator.toUpperCase().replace(/[^A-Z]/g, '');
      return (window as any)[indicator] || (window as any)[upperIndicator];
    });

    return hasThirdPartyScript || hasThirdPartyGlobal;
  }

  static logDiagnostics(info: DiagnosticInfo): void {
    console.group('🔍 Detection System Diagnostics');
    
    console.log('🌍 Environment:', {
      development: info.environment.isDevelopment,
      https: info.environment.isHTTPS,
      thirdParty: info.environment.hasThirdPartyScripts
    });

    console.log('🧠 TensorFlow.js:', {
      ready: info.tensorflow.isReady,
      backend: info.tensorflow.backend,
      version: info.tensorflow.version
    });

    console.log('📡 Network:', {
      online: info.network.isOnline,
      connection: info.network.connection?.effectiveType || 'unknown'
    });

    if (info.performance.memory) {
      console.log('⚡ Memory:', {
        used: `${Math.round(info.performance.memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(info.performance.memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(info.performance.memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      });
    }

    // Recommendations
    const recommendations = this.generateRecommendations(info);
    if (recommendations.length > 0) {
      console.warn('💡 Recommendations:', recommendations);
    }

    console.groupEnd();
  }

  static generateRecommendations(info: DiagnosticInfo): string[] {
    const recommendations: string[] = [];

    if (!info.environment.isHTTPS && !info.environment.isDevelopment) {
      recommendations.push('Use HTTPS for better security and performance');
    }

    if (info.environment.hasThirdPartyScripts) {
      recommendations.push('Third-party scripts detected - may interfere with model loading');
    }

    if (!info.tensorflow.isReady) {
      recommendations.push('TensorFlow.js not ready - check for initialization errors');
    }

    if (!info.network.isOnline) {
      recommendations.push('Network offline - models cannot be downloaded');
    }

    if (info.network.connection?.effectiveType === 'slow-2g' || 
        info.network.connection?.effectiveType === '2g') {
      recommendations.push('Slow network detected - consider using fallback detection only');
    }

    if (info.performance.memory && 
        info.performance.memory.usedJSHeapSize > info.performance.memory.jsHeapSizeLimit * 0.8) {
      recommendations.push('High memory usage - consider cleanup or reduced model complexity');
    }

    return recommendations;
  }

  static async runNetworkTest(): Promise<{ success: boolean; latency?: number; error?: string }> {
    try {
      const start = performance.now();
      const response = await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      const latency = performance.now() - start;
      
      return { success: true, latency };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const diagnostics = new DetectionDiagnostics();
