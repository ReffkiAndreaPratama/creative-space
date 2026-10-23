import { useState, useRef, type DragEvent } from "react";
import { UploadCloud, Video, X, AlertCircle } from "lucide-react";
import { SEO } from "@/components/seo";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useCreateMedia } from "@/hooks/use-media";
import { useToast } from "@/hooks/use-toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { uploadFile, validateFile, BUCKETS, type BucketName } from "@/lib/storage";
import { generateFileName } from "@/lib/utils";
import type { MediaType } from "@/types/database";
import { PHOTOGRAPHY_CATEGORIES, ARTWORK_CATEGORIES, GUITAR_CATEGORIES, VIDEO_JOURNAL_CATEGORIES } from "@/types/database";
import { cn } from "@/lib/utils";

const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: "photography", label: "Photography" },
  { value: "artwork", label: "Art & Sketchbook" },
  { value: "guitar", label: "Guitar Sessions" },
  { value: "video_journal", label: "Video Journal" },
];

const CATEGORY_MAP: Record<MediaType, readonly string[]> = {
  photography: PHOTOGRAPHY_CATEGORIES,
  artwork: ARTWORK_CATEGORIES,
  guitar: GUITAR_CATEGORIES,
  video_journal: VIDEO_JOURNAL_CATEGORIES,
};

interface PendingFile {
  file: File;
  previewUrl: string;
  error: string | null;
  uploaded: boolean;
}

export function AdminUploadPage() {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>("photography");
  const [category, setCategory] = useState<string>(PHOTOGRAPHY_CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [altText, setAltText] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMedia = useCreateMedia();
  void createMedia; // available for future direct API use
  const { toast } = useToast();

  const categories = CATEGORY_MAP[mediaType];

  const handleMediaTypeChange = (value: MediaType) => {
    setMediaType(value);
    setCategory(CATEGORY_MAP[value][0]);
  };

  const handleFiles = (files: FileList) => {
    const newFiles: PendingFile[] = [];
    for (const file of Array.from(files)) {
      const isVideo = mediaType === "guitar" || mediaType === "video_journal";
      const error = validateFile(file, isVideo ? "video" : "image");
      const previewUrl = error ? "" : URL.createObjectURL(file);
      newFiles.push({ file, previewUrl, error, uploaded: false });
    }
    setPendingFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => {
      const file = prev[index];
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) {
      toast({ type: "warning", title: "No files selected", message: "Please select files to upload." });
      return;
    }

    const validFiles = pendingFiles.filter((f) => !f.error);
    if (validFiles.length === 0) {
      toast({ type: "error", title: "All files have errors", message: "Please fix or remove invalid files." });
      return;
    }

    if (!isSupabaseConfigured) {
      toast({ type: "error", title: "Supabase not configured", message: "Add credentials to .env first." });
      return;
    }

    setUploading(true);
    setProgress(0);

    const bucket: BucketName = isPublic ? BUCKETS.PUBLIC_MEDIA : BUCKETS.PRIVATE_MEDIA;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validFiles.length; i++) {
      const { file } = validFiles[i];
      const fileTitle = pendingFiles.length > 1 ? file.name.replace(/\.[^.]+$/, "") : (title || file.name.replace(/\.[^.]+$/, ""));
      const fileName = generateFileName(file.name);

      try {
        // Step 1: Upload file to storage
        const uploadResult = await uploadFile({
          bucket,
          file,
          fileName,
          onProgress: (p) => setProgress(Math.round(((i + p / 100) / validFiles.length) * 100)),
        });

        // Step 2: Save metadata to database
        const storagePath = bucket === BUCKETS.PUBLIC_MEDIA
          ? uploadResult.publicUrl
          : uploadResult.path;

        const { error: dbError } = await supabase.from("media_assets").insert({
          title: fileTitle,
          slug: fileTitle.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
          description: description || null,
          media_type: mediaType,
          category,
          storage_path: storagePath,
          thumbnail_path: null,
          external_url: externalUrl || null,
          external_provider: externalUrl ? "youtube" : null,
          mime_type: file.type,
          file_size: file.size,
          visibility: isPublic ? "public" : "private",
          is_featured: isFeatured,
          alt_text: altText || fileTitle,
        });

        if (dbError) {
          // Metadata save failed — clean up orphan file
          console.error("[Nexreff] Metadata save failed, cleaning up orphan file:", dbError);
          try {
            await supabase.storage.from(bucket).remove([uploadResult.path]);
          } catch (cleanupErr) {
            console.error("[Nexreff] Failed to clean up orphan file:", cleanupErr);
          }
          throw dbError;
        }

        successCount++;
      } catch (err) {
        console.error("[Nexreff] Upload failed for", file.name, err);
        failCount++;
      }
    }

    setUploading(false);
    setProgress(0);

    if (successCount > 0) {
      toast({
        type: "success",
        title: `${successCount} file${successCount > 1 ? "s" : ""} uploaded successfully`,
      });
      // Reset form
      setPendingFiles([]);
      setTitle("");
      setDescription("");
      setAltText("");
      setExternalUrl("");
      setIsFeatured(false);
    }

    if (failCount > 0) {
      toast({
        type: "error",
        title: `${failCount} file${failCount > 1 ? "s" : ""} failed to upload`,
        message: "Check your connection and storage quota, then try again.",
      });
    }
  };

  const hasVideo = mediaType === "guitar" || mediaType === "video_journal";

  return (
    <>
      <SEO title="Upload Media" />
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Upload Media</h1>
          <p className="mt-1 text-sm text-muted">Upload photos, art, or videos to your gallery.</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 rounded-lg border border-amber-700/30 bg-amber-900/10 p-4">
            <p className="text-sm text-amber-400">
              Supabase is not configured. Add credentials to .env to enable uploads.
            </p>
          </div>
        )}

        <div className="space-y-6 rounded-xl border border-border bg-surface p-6">
          {/* Media type selection */}
          <div className="space-y-2">
            <Label htmlFor="media-type">Media Type</Label>
            <Select
              id="media-type"
              value={mediaType}
              onChange={(e) => handleMediaTypeChange(e.target.value as MediaType)}
            >
              {MEDIA_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>

          {/* External URL for videos */}
          {hasVideo && (
            <div className="space-y-2">
              <Label htmlFor="external-url">External Video URL (YouTube) — Optional</Label>
              <Input
                id="external-url"
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted">
                For large videos, embed a YouTube link instead of uploading the file directly.
                This saves storage quota.
              </p>
            </div>
          )}

          {/* Drop zone */}
          {!externalUrl && (
            <div
              className={cn(
                "rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                dragging ? "border-accent bg-accent/5" : "border-border"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <UploadCloud className="mx-auto h-12 w-12 text-muted" />
              <p className="mt-3 text-sm text-foreground">
                Drag and drop files here, or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-sm font-medium text-accent hover:text-accent-hover"
              >
                browse from your computer
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={hasVideo ? "video/*" : "image/*"}
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
                aria-label="Select files"
              />
              <p className="mt-2 text-xs text-muted">
                Max 50 MB per file · {hasVideo ? "MP4, WebM" : "JPEG, PNG, WebP, GIF"}
              </p>
            </div>
          )}

          {/* Pending files */}
          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({pendingFiles.length})</Label>
              {pendingFiles.map((pending, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised p-3"
                >
                  {pending.previewUrl ? (
                    pending.file.type.startsWith("image/") ? (
                      <img src={pending.previewUrl} alt="" className="h-12 w-12 rounded object-cover" />
                    ) : (
                      <Video className="h-8 w-8 text-muted" />
                    )
                  ) : (
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-foreground line-clamp-1">{pending.file.name}</p>
                    <p className="text-xs text-muted">
                      {(pending.file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                    {pending.error && (
                      <p className="text-xs text-destructive">{pending.error}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-muted hover:text-destructive transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Metadata form */}
          {pendingFiles.length <= 1 && !externalUrl && (
            <div className="space-y-4 border-t border-border pt-4">
              <div className="space-y-2">
                <Label htmlFor="upload-title">Title</Label>
                <Input
                  id="upload-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your work a title"
                />
                <p className="text-xs text-muted">Leave empty to use the file name.</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="upload-description">Description</Label>
            <Textarea
              id="upload-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your work..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-category">Category</Label>
            <Select
              id="upload-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-alt">Alt Text</Label>
            <Input
              id="upload-alt"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-raised p-3">
            <div>
              <Label htmlFor="upload-featured">Featured</Label>
              <p className="text-xs text-muted">Show on the home page</p>
            </div>
            <Switch id="upload-featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-raised p-3">
            <div>
              <Label htmlFor="upload-public">Public</Label>
              <p className="text-xs text-muted">Visible to all visitors</p>
            </div>
            <Switch id="upload-public" checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Uploading...</span>
                <span className="text-foreground">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-hover">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleUpload}
            disabled={uploading || (!pendingFiles.length && !externalUrl) || !isSupabaseConfigured}
            className="w-full"
          >
            {uploading ? (
              "Uploading..."
            ) : externalUrl ? (
              "Save External Video"
            ) : (
              <>
                <UploadCloud className="h-4 w-4" /> Upload {pendingFiles.length > 0 ? `(${pendingFiles.length})` : ""}
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
