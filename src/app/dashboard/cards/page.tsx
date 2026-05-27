"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useProfile } from "@/context/ProfileContext";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  Download,
  FileArchive,
  Printer,
  X,
  CreditCard,
  AlertTriangle,
  LayoutGrid,
  List,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { downloadImage, downloadPdf, downloadAllAsZip } from "@/utils/card-export";
import CardFront from "@/components/warranty/card-front";
import CardBack from "@/components/warranty/card-back";
import WarrantyCardPreview from "@/components/warranty/warranty-card-preview";

export default function CardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [zipLoading, setZipLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [yearsFilter, setYearsFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const hasFilters = searchTerm !== "" || materialFilter !== "" || yearsFilter !== "";

  const handleClearFilters = () => {
    setSearchTerm("");
    setMaterialFilter("");
    setYearsFilter("");
    setPage(1);
    // Fetch directly with empty filters
    setLoading(true);
    fetch(`/api/warranty?page=1&limit=10`)
      .then(res => res.json())
      .then(json => {
        setCards(json.data);
        setTotalPages(json.pagination.pages);
        setTotalCount(json.pagination.total);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  // Modals state
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);

  const { data: session } = useSession();
  const { profile } = useProfile();
  const { toast } = useToast();
  const router = useRouter();

  // DOM Refs for capture / export
  const exportFrontRef = useRef<HTMLDivElement>(null);
  const exportBackRef = useRef<HTMLDivElement>(null);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: searchTerm,
        material: materialFilter,
        years: yearsFilter,
      });

      const res = await fetch(`/api/warranty?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to load cards");

      setCards(json.data);
      setTotalPages(json.pagination.pages);
      setTotalCount(json.pagination.total);
    } catch (err: any) {
      toast({
        title: "Query Error",
        description: err.message || "Could not fetch certificates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, materialFilter, yearsFilter]);

  // Handle search with custom submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCards();
  };

  // Delete Card handler
  const handleDeleteCard = async () => {
    if (!deleteCardId) return;

    try {
      const res = await fetch(`/api/warranty/${deleteCardId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to delete card");

      toast({
        title: "Card Deleted",
        description: "Warranty card successfully deleted from database.",
        variant: "success",
      });

      setDeleteCardId(null);
      fetchCards();
    } catch (err: any) {
      toast({
        title: "Delete Error",
        description: err.message || "Failed to remove card.",
        variant: "destructive",
      });
    }
  };

  // Individual card downloads
  const handleExport = async (type: "png" | "jpeg" | "pdf" | "print") => {
    if (!selectedCard) return;

    // Wait a millisecond to let DOM elements mount completely
    await new Promise((resolve) => setTimeout(resolve, 100));

    const front = exportFrontRef.current;
    const back = exportBackRef.current;

    if (!front || !back) {
      toast({
        title: "Export Error",
        description: "Visual card elements could not be localized.",
        variant: "destructive",
      });
      return;
    }

    try {
      const filename = `${selectedCard.jobId}_warranty`;
      if (type === "png") {
        await downloadImage(front, `${filename}_front.png`, "png");
        await downloadImage(back, `${filename}_back.png`, "png");
      } else if (type === "jpeg") {
        await downloadImage(front, `${filename}_front.jpg`, "jpeg");
        await downloadImage(back, `${filename}_back.jpg`, "jpeg");
      } else if (type === "pdf") {
        await downloadPdf(front, back, `${filename}.pdf`);
      } else if (type === "print") {
        // Trigger browser print logic
        window.print();
      }

      toast({
        title: "Export Successful",
        description: "Certificate successfully downloaded.",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Export Failure",
        description: err.message || "Failed to export card.",
        variant: "destructive",
      });
    }
  };

  // Zip Download Helper (creates visual card components dynamically and passes to jszip engine)
  const handleZipDownload = async () => {
    if (cards.length === 0) {
      toast({
        title: "No Data",
        description: "There are no cards in the current view to ZIP.",
        variant: "destructive",
      });
      return;
    }

    setZipLoading(true);

    try {
      // Fetch all matching cards without pagination for complete ZIP compilation
      const params = new URLSearchParams({
        page: "1",
        limit: "100", // Grab up to 100 cards matching filters
        search: searchTerm,
        material: materialFilter,
        years: yearsFilter,
      });

      const res = await fetch(`/api/warranty?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to batch query cards");

      const allCardsList = json.data;

      // Define renderer helper to build DOM elements offscreen
      const renderCardFn = (card: any, side: "front" | "back") => {
        const wrapper = document.createElement("div");
        wrapper.style.width = "500px";
        wrapper.style.height = "315px";
        wrapper.style.borderRadius = "16px";
        wrapper.style.overflow = "hidden";
        wrapper.style.fontSize = "16px";

        // Root container to render components inside
        const container = document.createElement("div");
        wrapper.appendChild(container);

        if (side === "front") {
          // Mount card front design using plain HTML string to mimic React representation exactly
          wrapper.className = "metallic-blue-gradient relative text-white p-6 flex flex-col justify-between border border-slate-700/30 shadow-2xl select-none";
          wrapper.innerHTML = `
            <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
            <div class="flex items-center justify-between z-10">
              <div class="flex items-center gap-2">
                ${card.labLogo ? `<img src="${card.labLogo}" class="w-8 h-8 object-cover rounded-lg border border-white/20" />` : `<div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-sm">S</div>`}
                <span class="font-bold text-[10px] uppercase tracking-widest text-emerald-400">${session?.user?.labName || "32 Dental Design"}</span>
              </div>
              <span class="text-[8px] uppercase font-bold text-white/50 tracking-wider">Official Certificate</span>
            </div>
            <div class="flex justify-between items-center my-auto z-10">
              <div>
                <h2 class="text-xl font-bold tracking-wider leading-none text-white font-mono">WARRANTY</h2>
                <h3 class="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400 mt-1">Certificate of Authenticity</h3>
              </div>
            </div>
            <div class="absolute left-0 right-0 top-[60%] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/80 to-transparent pointer-events-none"></div>
            <div class="flex items-end justify-between z-10">
              <div class="flex gap-4">
                <div class="flex flex-col text-left">
                  <span class="text-[8px] uppercase tracking-wider text-slate-400">Material Type</span>
                  <span class="text-[10px] font-bold tracking-wide uppercase text-slate-200">${card.materialType}</span>
                </div>
                <div class="flex flex-col text-left">
                  <span class="text-[8px] uppercase tracking-wider text-slate-400">Term Limit</span>
                  <span class="text-[10px] font-bold tracking-wide uppercase text-emerald-400">${card.warrantyYears} Years Warranty</span>
                </div>
              </div>
              <div class="flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <span class="text-[8px] uppercase font-bold tracking-wider text-emerald-400">Genuine Product</span>
              </div>
            </div>
          `;
        } else {
          // Card back side
          wrapper.className = "bg-white border border-slate-350 text-slate-800 p-6 flex flex-col justify-between relative shadow-2xl select-none";
          wrapper.innerHTML = `
            <div class="absolute left-0 right-0 top-3 h-5 bg-slate-900/5 pointer-events-none"></div>
            <div class="flex justify-between items-start gap-4 h-full mt-4">
              <div class="flex-grow grid grid-cols-2 gap-x-4 gap-y-3.5 mt-2">
                <div class="flex flex-col text-left">
                  <span class="text-[8px] uppercase font-bold text-slate-400 leading-none">Job Identifier</span>
                  <span class="text-xs font-bold text-slate-900 font-mono tracking-tight mt-1">${card.jobId}</span>
                </div>
                <div class="flex flex-col text-left">
                  <span class="text-[8px] uppercase font-bold text-slate-400 leading-none">Issue Date</span>
                  <span class="text-[10px] font-semibold text-slate-700 mt-1">${new Date(card.date).toLocaleDateString()}</span>
                </div>
                <div class="flex flex-col col-span-2 text-left">
                  <span class="text-[8px] uppercase font-bold text-slate-400 leading-none">Patient Name</span>
                  <span class="text-[10px] font-bold text-slate-850 truncate mt-1">${card.patientName}</span>
                </div>
                <div class="flex flex-col col-span-2 text-left">
                  <span class="text-[8px] uppercase font-bold text-slate-400 leading-none">Prescribing Doctor</span>
                  <span class="text-[10px] font-bold text-slate-800 truncate mt-1">${card.doctorName}</span>
                </div>
                <div class="flex flex-col text-left">
                  <span class="text-[8px] uppercase font-bold text-slate-400 leading-none">Tooth Designation</span>
                  <span class="text-[10px] font-bold text-dent-blue-600 font-mono mt-1">${card.toothNumber}</span>
                </div>
              </div>
              <div class="flex flex-col items-center justify-between h-full border-l border-slate-100 pl-4 w-[130px]">
                <div class="flex flex-col items-center">
                  <div class="w-16 h-16 bg-slate-150 border border-slate-200 rounded flex items-center justify-center text-[7px] text-slate-400 font-bold">QR CODE</div>
                  <span class="text-[7px] uppercase font-bold text-slate-400 tracking-wide mt-1">Scan to Verify</span>
                </div>
                <div class="w-full flex flex-col items-center">
                  <span class="text-[7.5px] uppercase font-bold text-slate-400 tracking-wider mb-1">Signature</span>
                  <div class="h-10 border border-dashed border-slate-350 rounded bg-slate-50 w-full flex items-center justify-center text-[7.5px] text-slate-400">
                    ${card.signature ? `<img src="${card.signature}" class="max-h-full max-w-full p-0.5 object-contain" />` : "Authorized"}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center border-t border-slate-100 pt-2 text-[7.5px] text-slate-400 font-medium">
              <span>* Verify warranty online or scan barcode.</span>
              <span class="font-bold text-emerald-600">SECURE SYSTEM</span>
            </div>
          `;
        }

        return wrapper;
      };

      await downloadAllAsZip(allCardsList, renderCardFn);

      toast({
        title: "ZIP Compiled",
        description: `Successfully zipped ${allCardsList.length} warranty cards.`,
        variant: "success",
      });
    } catch (e: any) {
      toast({
        title: "ZIP Compilation Error",
        description: e.message || "Failed to batch build cards.",
        variant: "destructive",
      });
    } finally {
      setZipLoading(false);
    }
  };

  const materialOptions = [
    { value: "", label: "All Materials" },
    { value: "Zirconia Premium", label: "Zirconia Premium" },
    { value: "Zirconia Multi-layer", label: "Zirconia Multi-layer" },
    { value: "IPS e.max Press", label: "IPS e.max Press" },
    { value: "PFM Noble", label: "PFM Noble" },
    { value: "PFM Co-Cr", label: "PFM Co-Cr" },
    { value: "Composite Crown", label: "Composite Crown" },
    { value: "Titanium Abutment", label: "Titanium Abutment" },
  ];

  return (
    <div className="space-y-6">

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-450 uppercase tracking-widest font-bold">Lab Database</p>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white mt-1">
            Issued Warranty Certificates ({totalCount})
          </h2>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          {/* Grid vs Table View Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 mr-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-white dark:bg-slate-800 text-dent-blue-500 shadow-xs" : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-200"}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-800 text-dent-blue-500 shadow-xs" : "text-slate-500 hover:text-slate-850 dark:hover:text-slate-200"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            onClick={handleZipDownload}
            isLoading={zipLoading}
            className="flex-grow sm:flex-grow-0 gap-2 border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50"
            title="Download ZIP"
          >
            <FileArchive className="w-4 h-4 text-emerald-500" />
            Batch ZIP
          </Button>

          <Link href="/dashboard/cards/create" className="flex-grow sm:flex-grow-0">
            <Button className="w-full gap-2 shadow-md">
              <Plus className="w-4.5 h-4.5" />
              Generate Card
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4 mt-0">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search Input */}
            <div className="flex-grow w-full">
              <div className="relative">
                <Input
                  placeholder="Search by Patient, Doctor, or Job ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3.5 bottom-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Material Filter */}
            <div className="w-full lg:w-48 shrink-0">
              <Select
                options={materialOptions}
                value={materialFilter}
                onChange={(e) => {
                  setMaterialFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Warranty Years Filter */}
            <div className="w-full lg:w-44 shrink-0">
              <Select
                options={[
                  { value: "", label: "All Terms" },
                  { value: "1", label: "1 Year" },
                  { value: "2", label: "2 Years" },
                  { value: "3", label: "3 Years" },
                  { value: "5", label: "5 Years" },
                  { value: "7", label: "7 Years" },
                  { value: "10", label: "10 Years" },
                  { value: "15", label: "15 Years" },
                  { value: "20", label: "20 Years" },
                ]}
                value={yearsFilter}
                onChange={(e) => {
                  setYearsFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex gap-2 w-full lg:w-auto shrink-0">
              <Button type="submit" variant="primary" className="flex-grow lg:w-auto px-6 h-[42px]">
                Apply Filter
              </Button>
              {hasFilters && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClearFilters}
                  className="px-4 h-[42px]"
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Cards Table / Grid */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {viewMode === "grid" ? (
            loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="w-full h-[220px] rounded-2xl border border-slate-200/80 dark:border-slate-800/85 bg-white dark:bg-slate-950 p-5 flex flex-col justify-between shadow-xs animate-pulse">
                    <div className="flex justify-between items-center"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" /><div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" /></div>
                    <div className="space-y-2"><div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" /><div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" /></div>
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                ))}
              </div>
            ) : cards.length === 0 ? (
              <div className="p-16 text-center text-slate-400 font-semibold">
                No warranty certificates found in search criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                {cards.map((card) => (
                  <MiniWarrantyCard
                    key={card._id}
                    card={card}
                    profile={profile}
                    session={session}
                    onPreview={() => setSelectedCard(card)}
                    onDelete={() => setDeleteCardId(card._id)}
                  />
                ))}
              </div>
            )
          ) : (
            /* Table View */
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200/40 dark:border-slate-800/30 text-[10px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="p-4">Job ID</th>
                    <th className="p-4">Patient Name</th>
                    <th className="p-4">Prescribing Doctor</th>
                    <th className="p-4">Tooth Designation</th>
                    <th className="p-4">Material</th>
                    <th className="p-4">Issuance Date</th>
                    <th className="p-4">Warranty</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/10 dark:divide-slate-900/10 text-xs">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                        <td className="p-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                        <td className="p-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                        <td className="p-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                        <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                        <td className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                        <td className="p-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                        <td className="p-4"><div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                      </tr>
                    ))
                  ) : cards.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400 font-semibold">
                        No warranty certificates found in search criteria.
                      </td>
                    </tr>
                  ) : (
                    cards.map((card) => (
                      <tr key={card._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 font-mono font-bold text-dent-blue-500">{card.jobId}</td>
                        <td className="p-4 font-semibold">{card.patientName}</td>
                        <td className="p-4 font-medium text-slate-500 dark:text-slate-400">{card.doctorName}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-[120px]">
                            {card.toothNumber.split(",").map((t: string, idx: number) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-dent-blue-500/5 dark:bg-dent-blue-500/10 border border-dent-blue-500/15 rounded text-[10px] font-mono">
                                {t.trim()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-650 dark:text-slate-300">{card.materialType}</td>
                        <td className="p-4 text-slate-450 font-medium">
                          {new Date(card.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {card.warrantyYears} Yrs
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View details */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedCard(card)}
                              className="w-8 h-8 rounded-lg text-slate-500 hover:text-dent-blue-500"
                              title="Preview Certificate"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </Button>

                            {/* Edit Details */}
                            <Link href={`/dashboard/cards/edit/${card._id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg text-slate-500 hover:text-emerald-500"
                                title="Edit Parameters"
                              >
                                <Edit className="w-4.5 h-4.5" />
                              </Button>
                            </Link>

                            {/* Delete Card */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteCardId(card._id)}
                              className="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-500"
                              title="Delete Card"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-950/10 gap-4">
              <span className="text-xs text-slate-400 font-semibold">
                Showing Page {page} of {totalPages} ({totalCount} certificates total)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1 || loading}
                  onClick={() => setPage(page - 1)}
                  className="px-3"
                >
                  Previous
                </Button>

                <div className="hidden sm:flex items-center gap-1">
                  {pageNumbers.map((num) => (
                    <Button
                      key={num}
                      variant={page === num ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setPage(num)}
                      className={`w-8 h-8 p-0 rounded-lg text-xs ${page === num ? "shadow-xs" : ""}`}
                    >
                      {num}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages || loading}
                  onClick={() => setPage(page + 1)}
                  className="px-3"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden Card elements for html-to-image capture */}
      {selectedCard && (
        <div className="absolute top-[-9999px] left-[-9999px] z-[-100] flex gap-4 bg-transparent p-0">
          <div ref={exportFrontRef} className="w-[500px] h-[315px] rounded-2xl overflow-hidden shrink-0">
            <CardFront
              labName={profile?.labName || session?.user?.labName}
              labLogo={selectedCard.labLogo || profile?.labLogo || session?.user?.labLogo}
              patientName={selectedCard.patientName}
              doctorName={selectedCard.doctorName}
              date={selectedCard.date}
              materialType={selectedCard.materialType}
              jobId={selectedCard.jobId}
              warrantyYears={selectedCard.warrantyYears}
              cardBgImage={selectedCard.cardBgImage || profile?.cardBgImage || ""}
            />
          </div>
          <div ref={exportBackRef} className="w-[500px] h-[315px] rounded-2xl overflow-hidden shrink-0">
            <CardBack
              jobId={selectedCard.jobId}
              signature={selectedCard.signature || profile?.signature || session?.user?.signature}
              labPhone={selectedCard.labPhone || profile?.labPhone || "+91 12345 67890"}
              labEmail={selectedCard.labEmail || profile?.labEmail || "info@yourlab.com"}
              labWebsite={selectedCard.labWebsite || profile?.labWebsite || "www.yourlab.com"}
              labAddress={selectedCard.labAddress || profile?.labAddress || ""}
              cardBgImage={selectedCard.cardBgImage || profile?.cardBgImage || ""}
            />
          </div>
        </div>
      )}

      {/* Card Preview Modal Dialog */}
      <Dialog
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        title="Dental Card Premium Preview"
        description="Verify layout aesthetics and export high-resolution copies."
        maxWidth="2xl"
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            {/* Verification Link */}
            <Link
              href={`/verify/${selectedCard?.jobId}`}
              target="_blank"
              className="text-xs font-bold text-dent-blue-500 hover:underline flex items-center gap-1 shrink-0"
            >
              Public Verification Webpage
            </Link>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("png")}
                className="gap-1.5 py-2 px-3 flex-1 sm:flex-none justify-center bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              >
                <Download className="w-4 h-4 text-dent-blue-500" />
                PNG Images
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("pdf")}
                className="gap-1.5 py-2 px-3 flex-1 sm:flex-none justify-center bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              >
                <Download className="w-4 h-4 text-rose-500" />
                A4 PDF
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport("print")}
                className="gap-1.5 py-2 px-3 flex-1 sm:flex-none justify-center text-xs"
              >
                <Printer className="w-4 h-4 text-indigo-500" />
                Print Certificate
              </Button>
            </div>
          </div>
        }
      >
        {selectedCard && (
          <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 min-h-[350px]">
            {/* Inject print-area ID for window print selectors */}
            <div id="print-area" className="flex flex-col gap-6 md:gap-0 md:block">
              <WarrantyCardPreview
                jobId={selectedCard.jobId}
                doctorName={selectedCard.doctorName}
                patientName={selectedCard.patientName}
                toothNumber={selectedCard.toothNumber}
                warrantyYears={selectedCard.warrantyYears}
                materialType={selectedCard.materialType}
                date={selectedCard.date}
                signature={selectedCard.signature || profile?.signature || session?.user?.signature}
                labLogo={selectedCard.labLogo || profile?.labLogo || session?.user?.labLogo}
                labName={profile?.labName || session?.user?.labName}
                labPhone={selectedCard.labPhone || profile?.labPhone || "+91 12345 67890"}
                labEmail={selectedCard.labEmail || profile?.labEmail || "info@yourlab.com"}
                labWebsite={selectedCard.labWebsite || profile?.labWebsite || "www.yourlab.com"}
                labAddress={selectedCard.labAddress || profile?.labAddress || ""}
                cardBgImage={selectedCard.cardBgImage || profile?.cardBgImage || ""}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Card Confirm Modal */}
      <ConfirmDialog
        isOpen={!!deleteCardId}
        onClose={() => setDeleteCardId(null)}
        onConfirm={handleDeleteCard}
        title="Confirm Certificate Deletion"
        description="Permanently remove this warranty card record from the secure registry database."
        type="danger"
        confirmText="Delete"
        cancelText="Keep Certificate"
        requireChecklist={true}
        checklistItems={[
          "I understand this action is permanent and cannot be undone.",
          "I understand matching physical card QR codes will fail public validation checks with an authenticity alert."
        ]}
        useSlideToConfirm={false}
        icon={<Trash2 className="w-8 h-8 text-rose-500" />}
      />

    </div>
  );
}

function MiniWarrantyCard({ card, onPreview, onDelete, profile, session }: { card: any, onPreview: () => void, onDelete: () => void, profile: any, session: any }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative w-full h-[220px] perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full h-full transform-style-3d relative"
      >
        {/* FRONT */}
        <div className="absolute inset-0 backface-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all select-none">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-xs shrink-0">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[7.5px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Job ID</span>
                <span className="text-xs font-bold font-mono text-dent-blue-600 dark:text-dent-blue-400 truncate block">{card.jobId}</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {card.warrantyYears} Yrs
            </span>
          </div>

          <div className="space-y-1.5 my-2 text-left">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider shrink-0">Patient:</span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">{card.patientName}</span>
            </div>
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider shrink-0">Doctor:</span>
              <span className="text-xs font-semibold text-slate-650 dark:text-slate-400 truncate">{card.doctorName}</span>
            </div>
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider shrink-0">Material:</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-450 truncate">{card.materialType}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-900/60">
            <span className="text-[9px] text-slate-400 font-medium">
              {new Date(card.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="text-[8px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-widest">
              Click to Flip
            </span>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-950 text-white p-5 flex flex-col justify-between shadow-md select-none">
          <div className="space-y-2.5 text-left">
            <h4 className="text-[8px] font-black text-amber-500 tracking-wider">LAB PRESCRIPTION PRESSETS</h4>
            <div className="space-y-1.5 text-[9.5px] text-slate-300 font-medium leading-tight">
              <p className="truncate"><span className="text-slate-500 font-bold mr-1">Phone:</span> {card.labPhone || profile?.labPhone || "+91 12345 67890"}</p>
              <p className="truncate"><span className="text-slate-500 font-bold mr-1">Email:</span> {card.labEmail || profile?.labEmail || "info@yourlab.com"}</p>
              {card.labAddress && <p className="line-clamp-2"><span className="text-slate-500 font-bold mr-1">Address:</span> {card.labAddress}</p>}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-800/80 z-10" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              className="flex-grow py-1.5 text-[10px] bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
            >
              <Eye className="w-3.5 h-3.5 mr-1 text-dent-blue-500" /> Preview
            </Button>
            <Link href={`/dashboard/cards/edit/${card._id}`} className="flex-grow">
              <Button
                variant="outline"
                size="sm"
                className="w-full py-1.5 text-[10px] bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
              >
                <Edit className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Edit
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-950/20 shrink-0"
              title="Delete Card"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
