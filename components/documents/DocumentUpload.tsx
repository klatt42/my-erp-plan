"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, File, AlertCircle, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DocumentUploadProps {
  orgId: string;
  onUploadComplete?: (documentId: string) => void;
}

export function DocumentUpload({ orgId, onUploadComplete }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(false);
    setUploadedFile(file);
    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orgId", orgId);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload document");
      }

      setSuccess(true);
      if (onUploadComplete && data.document) {
        onUploadComplete(data.document.id);
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setUploadedFile(null);
        setIsUploading(false);
        setProgress(0);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document");
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setError(null);
    setSuccess(false);
    setProgress(0);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative overflow-hidden rounded-xl",
          "bg-gradient-to-br from-white/90 to-white/60",
          "dark:from-gray-800/90 dark:to-gray-900/60",
          "border-2 border-dashed",
          "backdrop-blur-xl",
          "transition-all duration-300",
          isDragging
            ? "border-primary bg-primary/5 shadow-glass-lg"
            : "border-gray-300 dark:border-gray-700 hover:border-primary/50",
          "cursor-pointer"
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isUploading}
        />

        <div className="relative p-12 text-center">
          {/* Upload Icon */}
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mb-4"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
              <div className="relative rounded-full bg-primary/10 p-6">
                <Upload className={cn(
                  "h-12 w-12 mx-auto transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragging ? "Drop your file here" : "Drag & drop your document"}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: PDF, DOCX, XLSX, Images (max 10MB)
            </p>
          </div>
        </div>
      </motion.div>

      {/* File Preview & Status */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "relative overflow-hidden rounded-xl p-6",
              "bg-gradient-to-br from-white/90 to-white/60",
              "dark:from-gray-800/90 dark:to-gray-900/60",
              "border border-gray-200/50 dark:border-gray-700/50",
              "shadow-glass backdrop-blur-xl"
            )}
          >
            <div className="flex items-start gap-4">
              {/* File Icon */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />
                <div className="relative rounded-lg bg-primary/10 p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Status Icon */}
                  {!isUploading && !error && success && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </motion.div>
                  )}

                  {error && (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  )}

                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFile}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="mt-4 space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {progress < 100
                        ? `Uploading... ${progress}%`
                        : "Processing document with AI..."}
                    </p>
                  </div>
                )}

                {/* Success Message */}
                {success && !isUploading && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-green-600 dark:text-green-400 mt-2"
                  >
                    Document uploaded successfully! Processing data...
                  </motion.p>
                )}

                {/* Error Message */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-600 dark:text-red-400 mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "rounded-xl p-4",
          "bg-blue-50 dark:bg-blue-900/20",
          "border border-blue-200/50 dark:border-blue-700/50"
        )}
      >
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">AI-Powered Extraction</p>
            <p className="text-xs">
              Claude AI will automatically extract contacts, equipment, facility information, and procedures from your document.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
