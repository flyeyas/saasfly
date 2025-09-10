"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";

import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import { Close, Spinner } from "@saasfly/ui/icons";
import { Upload as UploadIcon } from "lucide-react";
import { toast } from "@saasfly/ui/use-toast";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64 and use as data URL for now
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onChange(dataUrl);
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onRemove();
    toast({
      title: "Success",
      description: "Image removed successfully",
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {value ? (
        <div className="relative">
          <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -right-2 -top-2"
            onClick={handleRemove}
            disabled={disabled}
          >
            <Close className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors hover:border-muted-foreground/50",
            isDragActive && "border-primary bg-primary/5",
            (disabled || isUploading) && "cursor-not-allowed opacity-50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isUploading}
          />
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-sm">
            {isUploading ? (
              <>
                <Spinner className="mb-4 h-10 w-10 animate-spin text-muted-foreground" />
                <p className="mb-2 font-medium">Uploading image...</p>
                <p className="text-muted-foreground">Please wait while we process your image.</p>
              </>
            ) : (
              <>
                <UploadIcon className="mb-4 h-10 w-10 text-muted-foreground" />
                <p className="mb-2 font-medium">
                  {isDragActive ? "Drop the image here" : "Click to upload or drag and drop"}
                </p>
                <p className="text-muted-foreground">
                  PNG, JPG, GIF, WebP up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}