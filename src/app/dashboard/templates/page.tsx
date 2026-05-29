"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Sparkles,
  ArrowRight,
  FileText,
  AlertTriangle,
  Upload,
  Star
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { templateSchema, TemplateInput } from "@/validations/template.schema";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Backdrop image states for visual template designs
  const [createBgImage, setCreateBgImage] = useState("");
  const [editBgImage, setEditBgImage] = useState("");

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const layoutFrontOptions = [
    { value: "default", label: "Classic Sweep" },
    { value: "minimal", label: "Centered Minimal" },
    { value: "classic", label: "Ornate Frame" },
    { value: "modern", label: "Dark Sleek" },
  ];

  const layoutBackOptions = [
    { value: "default", label: "Mesh Gradient" },
    { value: "minimal", label: "Light Minimal" },
    { value: "classic", label: "Classic Vintage" },
  ];

  const fontStyleOptions = [
    { value: "inter", label: "Sans-serif (Inter)" },
    { value: "playfair", label: "Elegant Serif" },
    { value: "cinzel", label: "Cinzel Roman" },
    { value: "mono", label: "Monospace Tech" },
    { value: "montserrat", label: "Bold Montserrat" },
  ];

  // Forms
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate },
    reset: resetCreate,
    watch: watchCreate,
  } = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      layoutFront: "default",
      layoutBack: "default",
      fontStyle: "inter",
      primaryColor: "#0f52ba",
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
    watch: watchEdit,
  } = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      layoutFront: "default",
      layoutBack: "default",
      fontStyle: "inter",
      primaryColor: "#0f52ba",
    },
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "8",
        search: searchTerm,
      });

      const res = await fetch(`/api/templates?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to load templates");

      setTemplates(json.data);
      setTotalPages(json.pagination.pages);
      setTotalCount(json.pagination.total);
    } catch (err: any) {
      toast({
        title: "Query Error",
        description: err.message || "Could not fetch templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTemplates();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(1);
    setLoading(true);
    fetch(`/api/templates?page=1&limit=8`)
      .then((res) => res.json())
      .then((json) => {
        setTemplates(json.data);
        setTotalPages(json.pagination.pages);
        setTotalCount(json.pagination.total);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Base64 file reader
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "create" | "edit"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 512000) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 500KB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === "create") {
        setCreateBgImage(base64String);
      } else {
        setEditBgImage(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const onCreateSubmit = async (data: TemplateInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          cardBgImage: createBgImage,
        }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to create template");

      toast({
        title: "Template Created",
        description: `Template "${data.name}" successfully created.`,
        variant: "success",
      });

      setIsCreateOpen(false);
      resetCreate();
      setCreateBgImage("");
      fetchTemplates();
    } catch (err: any) {
      toast({
        title: "Creation Error",
        description: err.message || "Failed to save template.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditSubmit = async (data: TemplateInput) => {
    if (!editingTemplate) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/templates/${editingTemplate._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          cardBgImage: editBgImage,
        }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to update template");

      toast({
        title: "Template Updated",
        description: `Template "${data.name}" successfully updated.`,
        variant: "success",
      });

      setEditingTemplate(null);
      setEditBgImage("");
      fetchTemplates();
    } catch (err: any) {
      toast({
        title: "Update Error",
        description: err.message || "Failed to edit template.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTemplateId) return;

    try {
      const res = await fetch(`/api/templates/${deleteTemplateId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to delete template");

      toast({
        title: "Template Deleted",
        description: "Template successfully deleted from database.",
        variant: "success",
      });

      setDeleteTemplateId(null);
      fetchTemplates();
    } catch (err: any) {
      toast({
        title: "Delete Error",
        description: err.message || "Failed to remove template.",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (template: any) => {
    setEditingTemplate(template);
    setEditBgImage(template.cardBgImage || "");
    resetEdit({
      name: template.name,
      layoutFront: template.layoutFront || "default",
      layoutBack: template.layoutBack || "default",
      fontStyle: template.fontStyle || "inter",
      primaryColor: template.primaryColor || "#0f52ba",
    });
  };

  const handleSetDefault = async (templateId: string) => {
    setSettingDefaultId(templateId);
    try {
      const res = await fetch(`/api/templates/${templateId}/set-default`, {
        method: "PATCH",
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to update default");

      // Optimistically update the local state
      setTemplates((prev) =>
        prev.map((t) => ({
          ...t,
          isDefault: t._id === templateId ? json.isDefault : false,
        }))
      );

      toast({
        title: json.isDefault ? "Default Template Set" : "Default Removed",
        description: json.message,
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Could not update default status.",
        variant: "destructive",
      });
    } finally {
      setSettingDefaultId(null);
    }
  };

  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex || !hex.startsWith('#')) return `rgba(15, 82, 186, ${alpha})`;
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch {
      return `rgba(15, 82, 186, ${alpha})`;
    }
  };

  const getPageNumbers = () => {
    const range = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };
  const pageNumbers = getPageNumbers();

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-900/50 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace Presets</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 leading-none">Warranty Templates</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Manage visual card layouts, custom backdrops, typography styles, and card presets.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-dent-blue-600 to-dent-blue-500 hover:opacity-95 text-white shadow-md shadow-dent-blue-500/10 shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Add Template
        </Button>
      </div>

      {/* Search Filter Toolbar */}
      <div className="flex gap-2">
        <form onSubmit={handleSearchSubmit} className="flex-grow flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search templates by name, material, or layout..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dent-blue-500/50"
            />
          </div>
          <Button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white shrink-0"
          >
            Search
          </Button>
        </form>

        {searchTerm && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClearSearch}
            className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 shrink-0"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Grid List View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20 animate-pulse"
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/20 dark:bg-slate-950/5 text-center">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Templates Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Create standard configurations to streamline card generations.
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            variant="outline"
            className="mt-4 border-slate-200 dark:border-slate-800 text-xs"
          >
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => {
              const templateFontClass = `font-style-${template.fontStyle || "inter"}`;
              return (
                <Card
                  key={template._id}
                  className={`group relative flex flex-col justify-between overflow-hidden backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 ${
                    template.isDefault
                      ? "border-2 border-amber-400/70 dark:border-amber-500/50 bg-amber-50/40 dark:bg-amber-950/10 shadow-md shadow-amber-400/10"
                      : "border border-slate-200/60 dark:border-slate-900/60 bg-white/60 dark:bg-slate-950/30 hover:border-dent-blue-500/50 dark:hover:border-dent-blue-500/30"
                  }`}
                >
                  {/* Default badge ribbon */}
                  {template.isDefault && (
                    <div className="absolute top-0 right-0 z-30">
                      <div className="bg-gradient-to-br from-amber-400 to-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        DEFAULT
                      </div>
                    </div>
                  )}

                  {/* Miniature Card Mockup header representing visual template design dynamically */}
                  <div className={`h-28 w-full relative overflow-hidden flex items-center justify-center border-b border-slate-200 dark:border-slate-800 ${templateFontClass} ${template.layoutFront === 'modern' ? 'bg-slate-950 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-800'}`}>
                    {template.cardBgImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={template.cardBgImage} className="absolute inset-0 w-full h-full object-cover opacity-50 dark:opacity-30" alt="Card Preview" />
                    ) : (
                      template.layoutFront !== 'modern' && <div className="absolute inset-0 bg-gradient-to-tr from-dent-blue-900/5 to-slate-900/5 opacity-10 pointer-events-none" />
                    )}
                    
                    {/* Minimal Layout Inner Frame */}
                    {template.layoutFront === 'minimal' && (
                      <div className="absolute inset-2 border border-dashed rounded-lg opacity-40 pointer-events-none" style={{ borderColor: template.primaryColor || '#0f52ba' }} />
                    )}
                    {/* Classic Layout Inner Frame */}
                    {template.layoutFront === 'classic' && (
                      <div className="absolute inset-1.5 border-2 border-double rounded pointer-events-none" style={{ borderColor: template.primaryColor || '#0f52ba' }} />
                    )}
                    {/* Default/Swoosh Layout path */}
                    {(template.layoutFront === 'default' || template.layoutFront === 'modern') && (
                      <svg className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M 100 0 Q 30 30 0 100 L 100 100 Z" style={{ fill: template.layoutFront === 'modern' ? '#020617' : '#e2e8f0', opacity: 0.8 }} />
                        <path d="M 100 -3 Q 27 27 -3 100" fill="none" style={{ stroke: template.primaryColor || '#0f52ba' }} strokeWidth="3.5" />
                      </svg>
                    )}

                    {/* Visual mockup text parameters */}
                    <div className="relative z-10 p-3 w-full h-full flex flex-col justify-between text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[7.5px] font-black uppercase tracking-widest leading-none truncate max-w-[125px]" style={{ color: template.layoutFront === 'modern' ? '#ffffff' : '#0f172a' }}>
                          {template.name}
                        </span>
                        <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded-full leading-none shrink-0" style={{ backgroundColor: hexToRgba(template.primaryColor || '#0f52ba', 0.1), color: template.primaryColor || '#0f52ba', border: `1px solid ${hexToRgba(template.primaryColor || '#0f52ba', 0.2)}` }}>
                          {template.fontStyle || "inter"}
                        </span>
                      </div>
                      <div className="flex items-end justify-between mt-auto">
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: template.primaryColor || '#0f52ba' }} />
                          <span className="text-[7px] font-mono font-bold uppercase leading-none" style={{ color: template.primaryColor || '#0f52ba' }}>
                            {template.primaryColor || '#0f52ba'}
                          </span>
                        </div>
                        <span className="text-[6.5px] uppercase font-black px-1.5 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 text-slate-450 leading-none shadow-sm shrink-0">
                          {template.layoutFront || "default"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-28 bottom-0 left-0 w-1 bg-gradient-to-b from-dent-blue-500 to-dent-blue-600 rounded-l-2xl"></div>
                  
                  <CardHeader className="pl-6 pb-2 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1 truncate">
                        {template.name}
                      </CardTitle>
                      <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                        {/* Star / Set Default button */}
                        <button
                          onClick={() => handleSetDefault(template._id)}
                          disabled={settingDefaultId === template._id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            template.isDefault
                              ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                              : "text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                          }`}
                          title={template.isDefault ? "Remove as Default" : "Set as Default"}
                        >
                          <Star className={`w-3.5 h-3.5 ${template.isDefault ? "fill-amber-500" : ""}`} />
                        </button>
                        <button
                          onClick={() => openEditModal(template)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                          title="Edit Template"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTemplateId(template._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                          title="Delete Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-wider">
                      {template.isDefault ? (
                        <span className="text-amber-500 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-500" />
                          Default Template · Shown on Dashboard
                        </span>
                      ) : (
                        <span className="text-dent-blue-400">Visual Design Preset</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pl-6 pt-2 pb-5 flex-grow flex flex-col justify-between">
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Font Style</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-350 truncate capitalize">{template.fontStyle || "inter"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Accent Color</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-3 h-3 rounded-full border border-slate-200 dark:border-slate-700 shrink-0" style={{ backgroundColor: template.primaryColor || "#0f52ba" }} />
                            <span className="font-mono text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase">{template.primaryColor || "#0f52ba"}</span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Front Design</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-350 truncate capitalize">{template.layoutFront || "default"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Back Design</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-350 truncate capitalize">{template.layoutBack || "default"}</span>
                        </div>
                      </div>

                      {template.cardBgImage && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-6 h-4 rounded overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={template.cardBgImage} alt="Backdrop" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wide">Custom Backdrop</span>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/cards/create?templateId=${template._id}`)}
                      className="w-full mt-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 border border-slate-200/50 dark:border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 py-2 group/btn"
                    >
                      Use Template
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/80 pt-6">
              <span className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{templates.length}</span> of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{totalCount}</span> templates
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 h-8 border-slate-200 dark:border-slate-800 disabled:opacity-50 text-xs"
                >
                  Prev
                </Button>
                {pageNumbers.map((num) => (
                  <Button
                    key={num}
                    size="sm"
                    variant={page === num ? "primary" : "outline"}
                    onClick={() => setPage(num)}
                    className={`w-8 h-8 p-0 text-xs font-bold ${
                      page === num
                        ? "bg-dent-blue-500 text-white shadow-md shadow-dent-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 h-8 border-slate-200 dark:border-slate-800 disabled:opacity-50 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          resetCreate();
          setCreateBgImage("");
        }}
        title="Add Warranty Template"
        description="Configure reusable card parameters and custom designs to save time."
        maxWidth="md"
      >
        <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4">
          <Input
            label="Template Name"
            placeholder="e.g. Dark Sleek Blue, Classic Minimal..."
            error={errorsCreate.name?.message}
            {...registerCreate("name")}
          />

          {/* Template Styling Presets */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Template Styling Presets</h4>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Front Layout"
                options={layoutFrontOptions}
                error={errorsCreate.layoutFront?.message}
                {...registerCreate("layoutFront")}
              />
              <Select
                label="Back Layout"
                options={layoutBackOptions}
                error={errorsCreate.layoutBack?.message}
                {...registerCreate("layoutBack")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Typography Font"
                options={fontStyleOptions}
                error={errorsCreate.fontStyle?.message}
                {...registerCreate("fontStyle")}
              />
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Accent Color
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="w-10 h-[38px] p-0.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 cursor-pointer shrink-0"
                    {...registerCreate("primaryColor")}
                  />
                  <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
                    {watchCreate("primaryColor") || "#0f52ba"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Backdrop Image Upload */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Card Backdrop Image (Optional)
              </label>
              <div className="flex items-center gap-4 py-1">
                <div className="w-20 h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden relative group shrink-0">
                  {createBgImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={createBgImage} alt="Card Background" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCreateBgImage("")}
                        className="absolute inset-0 bg-rose-600/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[8px] text-slate-400 font-semibold text-center px-1">No Backdrop</span>
                  )}
                </div>
                <label className="flex-grow cursor-pointer">
                  <div className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 select-none">
                    <Upload className="w-4 h-4" />
                    Upload Backdrop Image
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "create")}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-slate-400">Max 500KB. Used as the card background texture.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-900">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                resetCreate();
                setCreateBgImage("");
              }}
              className="border-slate-200 dark:border-slate-800 h-[42px] px-4 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-dent-blue-600 to-dent-blue-500 text-white h-[42px] px-6 font-semibold"
            >
              Save Template
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        isOpen={!!editingTemplate}
        onClose={() => {
          setEditingTemplate(null);
          setEditBgImage("");
        }}
        title="Edit Warranty Template"
        description="Update settings and visual backdrop for this reusable preset."
        maxWidth="md"
      >
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
          <Input
            label="Template Name"
            placeholder="e.g. Dark Sleek Blue, Classic Minimal..."
            error={errorsEdit.name?.message}
            {...registerEdit("name")}
          />

          {/* Template Styling Presets */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Template Styling Presets</h4>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Front Layout"
                options={layoutFrontOptions}
                error={errorsEdit.layoutFront?.message}
                {...registerEdit("layoutFront")}
              />
              <Select
                label="Back Layout"
                options={layoutBackOptions}
                error={errorsEdit.layoutBack?.message}
                {...registerEdit("layoutBack")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Typography Font"
                options={fontStyleOptions}
                error={errorsEdit.fontStyle?.message}
                {...registerEdit("fontStyle")}
              />
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Accent Color
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="w-10 h-[38px] p-0.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 cursor-pointer shrink-0"
                    {...registerEdit("primaryColor")}
                  />
                  <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
                    {watchEdit("primaryColor") || "#0f52ba"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Backdrop Image Upload */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Card Backdrop Image (Optional)
              </label>
              <div className="flex items-center gap-4 py-1">
                <div className="w-20 h-14 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden relative group shrink-0">
                  {editBgImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editBgImage} alt="Card Background" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditBgImage("")}
                        className="absolute inset-0 bg-rose-600/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-[8px] text-slate-400 font-semibold text-center px-1">No Backdrop</span>
                  )}
                </div>
                <label className="flex-grow cursor-pointer">
                  <div className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 select-none">
                    <Upload className="w-4 h-4" />
                    Upload Backdrop Image
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "edit")}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-slate-400">Max 500KB. Used as the card background texture.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-900">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingTemplate(null);
                setEditBgImage("");
              }}
              className="border-slate-200 dark:border-slate-800 h-[42px] px-4 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-dent-blue-600 to-dent-blue-500 text-white h-[42px] px-6 font-semibold"
            >
              Update Template
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTemplateId}
        onClose={() => setDeleteTemplateId(null)}
        onConfirm={handleDeleteTemplate}
        title="Confirm Template Deletion"
        description="Permanently remove this warranty template from the database. This template will no longer be available for pre-filling."
        type="danger"
        confirmText="Delete Template"
        cancelText="Keep Template"
        requireChecklist={true}
        checklistItems={[
          "I understand this action is permanent and cannot be undone.",
          "I understand this will not affect previously generated warranty cards."
        ]}
        useSlideToConfirm={false}
        icon={<Trash2 className="w-8 h-8 text-rose-500" />}
      />
    </div>
  );
}
