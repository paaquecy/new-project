import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Target, Clock, Zap } from 'lucide-react';

interface DetectionMetrics {
  totalDetections: number;
  successfulDetections: number;
  averageYoloConfidence: number;
  averageOcrConfidence: number;
  averageProcessingTime: number;
  detectionHistory: Array<{
    timestamp: string;
    yoloConfidence: number;
    ocrConfidence: number;
    processingTime: number;
    plateNumber: string;
  }>;
}

interface DetectionMetricsProps {
  onDetection?: (metrics: {
    yoloConfidence: number;
    ocrConfidence: number;
    processingTime: number;
    plateNumber: string;
  }) => void;
}

const DetectionMetrics: React.FC<DetectionMetricsProps> = ({ onDetection }) => {
  const [metrics, setMetrics] = useState<DetectionMetrics>({
    totalDetections: 0,
    successfulDetections: 0,
    averageYoloConfidence: 0,
    averageOcrConfidence: 0,
    averageProcessingTime: 0,
    detectionHistory: []
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (onDetection) {
      // This would be called from the parent component when a detection occurs
      // For now, we'll simulate some metrics
      const simulateMetrics = () => {
        const newDetection = {
          timestamp: new Date().toISOString(),
          yoloConfidence: 0.7 + Math.random() * 0.3,
          ocrConfidence: 0.6 + Math.random() * 0.4,
          processingTime: 1000 + Math.random() * 2000,
          plateNumber: `GH-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(20 + Math.random() * 5)}`
        };

        setMetrics(prev => {
          const newHistory = [...prev.detectionHistory, newDetection].slice(-10); // Keep last 10
          const successfulCount = prev.successfulDetections + (newDetection.yoloConfidence > 0.5 && newDetection.ocrConfidence > 0.6 ? 1 : 0);
          const totalCount = prev.totalDetections + 1;

          return {
            totalDetections: totalCount,
            successfulDetections: successfulCount,
            averageYoloConfidence: newHistory.reduce((sum, d) => sum + d.yoloConfidence, 0) / newHistory.length,
            averageOcrConfidence: newHistory.reduce((sum, d) => sum + d.ocrConfidence, 0) / newHistory.length,
            averageProcessingTime: newHistory.reduce((sum, d) => sum + d.processingTime, 0) / newHistory.length,
            detectionHistory: newHistory
          };
        });
      };

      // Simulate periodic detections for demonstration
      const interval = setInterval(simulateMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [onDetection]);

  const successRate = metrics.totalDetections > 0 ? (metrics.successfulDetections / metrics.totalDetections) * 100 : 0;

  const chartData = metrics.detectionHistory.map((detection, index) => ({
    detection: `#${index + 1}`,
    yolo: Math.round(detection.yoloConfidence * 100),
    ocr: Math.round(detection.ocrConfidence * 100),
    time: Math.round(detection.processingTime)
  }));

  if (!isVisible) {
    return (
      <div className="mb-4">
        <button
          onClick={() => setIsVisible(true)}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
        >
          <Activity className="w-4 h-4 mr-2" />
          Show Detection Metrics
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-600" />
          YOLOv8 + EasyOCR Performance Metrics
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Hide
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-purple-600">{successRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Zap className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Avg YOLO Conf.</p>
              <p className="text-2xl font-bold text-blue-600">{(metrics.averageYoloConfidence * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Avg OCR Conf.</p>
              <p className="text-2xl font-bold text-green-600">{(metrics.averageOcrConfidence * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Time</p>
              <p className="text-2xl font-bold text-orange-600">{(metrics.averageProcessingTime / 1000).toFixed(1)}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detection History Chart */}
      {metrics.detectionHistory.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-700 mb-3">Recent Detection Confidence</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="detection" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="yolo" fill="#8b5cf6" name="YOLO Confidence %" />
                <Bar dataKey="ocr" fill="#3b82f6" name="OCR Confidence %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Detections */}
      {metrics.detectionHistory.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Recent Detections</h4>
          <div className="max-h-40 overflow-y-auto">
            {metrics.detectionHistory.slice().reverse().map((detection, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {detection.plateNumber}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(detection.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-purple-600">
                    Y: {Math.round(detection.yoloConfidence * 100)}%
                  </span>
                  <span className="text-blue-600">
                    O: {Math.round(detection.ocrConfidence * 100)}%
                  </span>
                  <span className="text-orange-600">
                    {(detection.processingTime / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionMetrics;
