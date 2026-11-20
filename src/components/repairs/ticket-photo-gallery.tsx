"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  ZoomIn,
  X,
  Plus,
  Calendar,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TicketAttachment } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

interface TicketPhotoGalleryProps {
  ticketId: string;
  initialPhotos?: TicketAttachment[];
  onPhotoUploaded?: () => void;
  canUpload?: boolean;
}

export function TicketPhotoGallery({
  ticketId,
  initialPhotos = [],
  onPhotoUploaded,
  canUpload = true,
}: TicketPhotoGalleryProps) {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<TicketAttachment[]>(initialPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<TicketAttachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<"intake" | "diagnosis" | "repair" | "handover">("intake");
  const [caption, setCaption] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Sync if initialPhotos change
  React.useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("caption", caption.trim());
      if (currentUser?.id) {
        formData.append("staffId", currentUser.id);
      }

      const res = await fetch(`/api/tickets/${ticketId}/photos`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload photograph");
      }

      toast.success("Device photograph attached successfully!");
      setPhotos((prev) => [data.photo, ...prev]);
      setCaption("");
      setShowUploadForm(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onPhotoUploaded) onPhotoUploaded();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-blue-600" /> Device Condition Photographs ({photos.length})
          </h3>
          <p className="text-[11px] text-slate-500">
            Intake condition records and technician diagnostic photos
          </p>
        </div>

        {canUpload && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="h-8 text-xs gap-1.5 border-slate-200"
          >
            {showUploadForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showUploadForm ? "Cancel" : "Add Photograph"}
          </Button>
        )}
      </div>

      {/* Upload Form Drawer / Panel */}
      {showUploadForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold text-slate-700">Photo Stage / Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="intake">Intake (Counter Check)</option>
                <option value="diagnosis">Diagnosis (Internal / Board)</option>
                <option value="repair">In Repair (Replaced Part)</option>
                <option value="handover">Quality Check & Handover</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700">Condition Note / Caption</Label>
              <Input
                placeholder="e.g. Screen hairline crack top-left, bezel scratched"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading & Storing Photo..." : "Choose Image File from Computer / Camera"}
            </Button>
            <p className="text-[10px] text-slate-400 text-center mt-1">
              Supports JPEG, PNG, HEIC, WebP up to 10MB.
            </p>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h4 className="text-xs font-bold text-slate-800">No condition photographs attached</h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Staff can record photographs during intake to document cosmetic flaws, screen fractures, and existing liquid indicators.
          </p>
          {canUpload && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowUploadForm(true);
                setTimeout(() => fileInputRef.current?.click(), 100);
              }}
              className="h-8 text-xs gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" /> Attach First Intake Photo
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.file_url}
                  alt={photo.file_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ZoomIn className="w-6 h-6" />
                </div>
                <span
                  className={`absolute top-2 left-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm text-white ${
                    photo.category === "intake"
                      ? "bg-blue-600"
                      : photo.category === "diagnosis"
                      ? "bg-amber-600"
                      : photo.category === "repair"
                      ? "bg-indigo-600"
                      : "bg-emerald-600"
                  }`}
                >
                  {photo.category}
                </span>
              </div>
              <div className="p-2.5 text-left">
                <div className="text-[11px] font-semibold text-slate-800 truncate" title={photo.file_name}>
                  {photo.file_name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDateTime(photo.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white ${
                    selectedPhoto.category === "intake"
                      ? "bg-blue-600"
                      : selectedPhoto.category === "diagnosis"
                      ? "bg-amber-600"
                      : selectedPhoto.category === "repair"
                      ? "bg-indigo-600"
                      : "bg-emerald-600"
                  }`}
                >
                  {selectedPhoto.category}
                </span>
                <span className="text-xs font-bold text-slate-900 truncate">
                  {selectedPhoto.file_name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center overflow-auto max-h-[70vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto.file_url}
                alt={selectedPhoto.file_name}
                className="max-h-[65vh] w-auto object-contain rounded shadow-lg"
              />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <span>Recorded: {formatDateTime(selectedPhoto.created_at)}</span>
                {selectedPhoto.file_size && (
                  <span>Size: {(selectedPhoto.file_size / 1024).toFixed(1)} KB</span>
                )}
              </div>
              <a
                href={selectedPhoto.file_url}
                target="_blank"
                rel="noreferrer"
                download
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Open Original Image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
