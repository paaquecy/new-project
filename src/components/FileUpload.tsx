import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, Image, Video } from 'lucide-react';
import { api } from '../lib/api';

interface FileUploadProps {
  onFileUploaded?: (url: string) => void;
  onFilesUploaded?: (urls: string[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  bucket?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFilesUploaded,
  accept = "image/*,video/*,.pdf",
  multiple = true,
  maxFiles = 5,
  maxSize = 10,
  bucket = 'evidence',
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; type: string }>>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File ${file.name} is too large. Maximum size is ${maxSize}MB.`;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileType = file.type;
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    const isAccepted = acceptedTypes.some(acceptedType => {
      if (acceptedType.includes('*')) {
        return fileType.startsWith(acceptedType.replace('*', ''));
      }
      return acceptedType === fileType || acceptedType === fileExtension;
    });

    if (!isAccepted) {
      return `File ${file.name} is not an accepted file type.`;
    }

    return null;
  };

  const uploadFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validate files
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }
    }

    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of fileArray) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        try {
          const url = await api.uploadFile(file, bucket);
          uploadedUrls.push(url);
          
          const newFile = {
            name: file.name,
            url,
            type: file.type
          };
          
          setUploadedFiles(prev => [...prev, newFile]);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          
          if (onFileUploaded) {
            onFileUploaded(url);
          }
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          alert(`Failed to upload ${file.name}. Please try again.`);
        }
      }

      if (onFilesUploaded && uploadedUrls.length > 0) {
        onFilesUploaded(uploadedUrls);
      }
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <Upload className={`mx-auto mb-4 ${uploading ? 'animate-pulse' : ''}`} size={48} />
        <p className="text-gray-600 mb-2">
          {uploading ? 'Uploading files...' : 'Drag & drop files here or click to browse'}
        </p>
        <p className="text-sm text-gray-500">
          Supported formats: Images, Videos, PDFs (Max {maxSize}MB each, {maxFiles} files max)
        </p>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{fileName}</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(file.type)}
                <div>
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View file
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;