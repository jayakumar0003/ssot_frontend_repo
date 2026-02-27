// TargetingAndAnalyticsTable.tsx
import { useMemo, useState, useEffect, useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Check,
  FilterX,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Export the type
export type CsvRow = Record<string, string>;

interface Props {
  data: CsvRow[];
  onUpdateByPackage: (payload: CsvRow) => Promise<void>;
  onUpdateByPackageAndPlacement: (payload: CsvRow) => Promise<void>;
  onUpdateAudienceInfo?: (
    rowData: CsvRow,
    selectedAudiences: string[]
  ) => Promise<void>;
}

type EditMode = "PACKAGE" | "PACKAGE_AND_PLACEMENT" | "AUDIENCE_INFO" | null;

// Define read-only columns for the form - Updated from your other project
const PACKAGE_READ_ONLY_COLUMNS = new Set([
  "RADIA_OR_PRISMA_PACKAGE_NAME",
  "PLACEMENTNAME",
  "LINE_ITEM_BREAK_DSP_SPECIFIC",
  "BOOLEAN_LOGIC",
  "CAMPAIGN_ID",
  "ADVERTISER_NAME",
  "AGENCY_NAME",
  "TARGETING_BLURB",
  "AUDIENCE_INFO",
  "DEMOGRAPHICS",
  "DATA_SOURCE_DSP",
  "PRIMARY_KPI",
  "BENCHMARKS",
  "DEAL_NAME",
  "DEAL_IDS",
  "FLOOR_PRICE",
  "DEVICE",
  "BUY_MODEL",
  "FREQUENCY_CAP",
  "GEO",
  "PIXELS_FLOODLIGHT",
]);

const PACKAGE_AND_PLACEMENT_READ_ONLY_COLUMNS = new Set([
  "RADIA_OR_PRISMA_PACKAGE_NAME",
  "PLACEMENTNAME",
  "CAMPAIGN_ID",
  "ADVERTISER_NAME",
  "AGENCY_NAME",
  "TACTIC",
  "BUY_MODEL",
  "BRAND_SAFETY",
  "BLS_MEASUREMENT",
  "LIVE_DATE",
]);

// Custom Dropdown Component - Same as MediaplanTable
interface DropdownProps {
  label: string;
  options: string[];
  selectedOptions: string[];
  onSelectionChange: (selected: string[]) => void;
  disabled?: boolean;
}

function CustomDropdown({
  label,
  options,
  selectedOptions,
  onSelectionChange,
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleToggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      onSelectionChange(selectedOptions.filter((o) => o !== option));
    } else {
      onSelectionChange([...selectedOptions, option]);
    }
  };

  const handleSelectAll = () => {
    const allFilteredSelected = filteredOptions.every((opt) =>
      selectedOptions.includes(opt)
    );

    if (allFilteredSelected) {
      // remove only filtered options
      onSelectionChange(
        selectedOptions.filter((opt) => !filteredOptions.includes(opt))
      );
    } else {
      // add only filtered options
      const newSelection = [
        ...new Set([...selectedOptions, ...filteredOptions]),
      ];
      onSelectionChange(newSelection);
    }
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((opt) => selectedOptions.includes(opt));

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          px-3 py-1.5 text-xs rounded-lg
border-2 border-purple-300
flex items-center gap-2
min-w-[90px]
justify-between
          ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-gray-100"
              : "hover:bg-purple-50 cursor-pointer bg-white shadow-sm hover:shadow-md transition-all"
          }
        `}
      >
        <span className="font-medium truncate text-gray-700">{label}</span>
        <svg
          className={`w-4 h-4 text-purple-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 w-72 bg-white border border-purple-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          <div className="p-3 border-b border-purple-100">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div
            onClick={handleSelectAll}
            className="flex items-center px-4 py-2.5 hover:bg-purple-50 cursor-pointer border-b border-purple-100 font-semibold"
          >
            <span className="w-5 mr-2 flex items-center justify-center">
              {isAllSelected && <Check className="h-4 w-4 text-purple-600" />}
            </span>
            <span className="text-sm text-gray-700">Select All</span>
          </div>

          <div className="border-t border-purple-100"></div>

          {filteredOptions.map((option) => (
            <div key={option}>
              <div
                onClick={() => handleToggleOption(option)}
                className="flex items-center px-4 py-2.5 hover:bg-purple-50 cursor-pointer"
              >
                <span className="w-5 mr-2 flex items-center justify-center">
                  {selectedOptions.includes(option) && (
                    <Check className="h-4 w-4 text-purple-600" />
                  )}
                </span>
                <span className="text-sm text-gray-700 truncate">{option}</span>
              </div>
            </div>
          ))}

          {filteredOptions.length === 0 && (
            <div className="px-4 py-2.5 text-sm text-gray-500">
              No matching results
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// New Audience Info Popup Component
interface AudienceInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedAudiences: string[]) => void;
  currentValue?: string;
}

function AudienceInfoPopup({
  isOpen,
  onClose,
  onSubmit,
  currentValue,
}: AudienceInfoPopupProps) {
  // Sample audience data - you can replace this with actual data later
  const audienceOptions = [
    "Tech Enthusiasts",
    "Business Professionals",
    "Students (18-24)",
    "Young Professionals (25-34)",
    "Parents with Young Children",
    "Luxury Shoppers",
    "Fitness Enthusiasts",
    "Travel Lovers",
    "Foodies",
    "Gamers",
    "Sports Fans",
    "Movie Buffs",
    "Music Lovers",
    "Pet Owners",
    "Home Improvement DIYers",
    "Fashion Forward",
    "Eco-Conscious Consumers",
    "Early Adopters",
    "Health & Wellness Seekers",
    "Remote Workers",
  ];

  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse current value if it exists
  useEffect(() => {
    if (currentValue) {
      // Assuming the current value is comma-separated
      const parsed = currentValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      setSelectedAudiences(parsed);
    }
  }, [currentValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  const filteredOptions = audienceOptions.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOption = (option: string) => {
    setSelectedAudiences((prev) => {
      if (prev.includes(option)) {
        return prev.filter((o) => o !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleSelectAll = () => {
    const allFilteredSelected = filteredOptions.every((opt) =>
      selectedAudiences.includes(opt)
    );

    if (allFilteredSelected) {
      setSelectedAudiences((prev) =>
        prev.filter((opt) => !filteredOptions.includes(opt))
      );
    } else {
      setSelectedAudiences((prev) => [
        ...new Set([...prev, ...filteredOptions]),
      ]);
    }
  };

  const handleRemoveAudience = (audience: string) => {
    setSelectedAudiences((prev) => prev.filter((a) => a !== audience));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(selectedAudiences);
      onClose();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAllSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((opt) => selectedAudiences.includes(opt));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-white border border-purple-200 rounded-2xl shadow-2xl overflow-visible">
        <DialogHeader className="border-b border-purple-200 pb-3">
          <DialogTitle className="text-lg font-semibold text-purple-700">
            Select Audience Information
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Dropdown + Buttons Row */}
          <div className="flex justify-between gap-4">
            {/* Dropdown */}
            <div className="relative w-full max-w-[380px]" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-2.5 text-left border border-purple-300 rounded-lg bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all flex justify-between items-center"
              >
                <span className="text-sm text-gray-700">
                  {selectedAudiences.length > 0
                    ? `${selectedAudiences.length} selected`
                    : "Select audiences"}
                </span>

                <svg
                  className={`w-5 h-5 text-purple-500 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-full bg-white border border-purple-200 rounded-lg shadow-lg max-h-[35vh] overflow-y-auto z-50">
                  {/* Search */}
                  <div className="p-2 border-b border-purple-100 sticky top-0 bg-white">
                    <input
                      type="text"
                      placeholder="Search audiences..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-purple-200 rounded-md outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  {/* Select All */}
                  <div
                    onClick={handleSelectAll}
                    className="flex items-center px-3 py-2 hover:bg-purple-50 cursor-pointer border-b border-purple-100 font-medium"
                  >
                    <span className="w-5 mr-2 flex items-center justify-center">
                      {isAllSelected && (
                        <Check className="h-4 w-4 text-purple-600" />
                      )}
                    </span>
                    <span className="text-sm text-gray-700">Select All</span>
                  </div>

                  {/* Options */}
                  {filteredOptions.map((option) => (
                    <div
                      key={option}
                      onClick={() => handleToggleOption(option)}
                      className="flex items-center px-3 py-2 hover:bg-purple-50 cursor-pointer"
                    >
                      <span className="w-5 mr-2 flex items-center justify-center">
                        {selectedAudiences.includes(option) && (
                          <Check className="h-4 w-4 text-purple-600" />
                        )}
                      </span>
                      <span className="text-sm text-gray-700">{option}</span>
                    </div>
                  ))}

                  {filteredOptions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No matching audiences found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Cancel
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
          {/* Selected audiences display */}
          {selectedAudiences.length > 0 && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Selected Audiences:
              </label>

              <div className="flex flex-wrap gap-2">
                {selectedAudiences.map((audience) => (
                  <span
                    key={audience}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {audience}
                    <button
                      onClick={() => handleRemoveAudience(audience)}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-purple-200 pt-4" />
      </DialogContent>
    </Dialog>
  );
}

const HIDDEN_COLUMNS = ["AGENCY_NAME", "ADVERTISER_NAME", "CAMPAIGN_ID"];

export default function TargetingAndAnalyticsTable({
  data,
  onUpdateByPackage,
  onUpdateByPackageAndPlacement,
  onUpdateAudienceInfo,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [selectedAdvertisers, setSelectedAdvertisers] = useState<string[]>([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);

  // Form dialog state
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [formData, setFormData] = useState<CsvRow>({});
  const [isSaving, setIsSaving] = useState(false);

  // Audience info popup state
  const [audiencePopupOpen, setAudiencePopupOpen] = useState(false);
  const [currentAudienceRow, setCurrentAudienceRow] = useState<CsvRow | null>(
    null
  );

  const handleResetFilters = () => {
    setSelectedAgencies(allAgencies);
    setSelectedAdvertisers(allAdvertisers);
    setSelectedCampaignIds(allCampaigns);
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = table.getAllLeafColumns().map((col) => col.id);

    const csvRows = filteredData.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    );

    const csvContent = headers.join(",") + "\n" + csvRows.join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `targeting_analytics_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // In TargetingAndAnalyticsTable.tsx, update the handleAudienceSubmit function:

  const handleAudienceSubmit = async (selectedAudiences: string[]) => {
    if (currentAudienceRow && onUpdateAudienceInfo) {
      try {
        // Show loading state if needed
        await onUpdateAudienceInfo(currentAudienceRow, selectedAudiences);

        // Optional: Show success message
        // You can add a toast notification here if you have one
        console.log("Audience info updated successfully");

        // Close the popup
        setAudiencePopupOpen(false);
        setCurrentAudienceRow(null);
      } catch (error) {
        console.error("Error updating audience info:", error);
        alert("Failed to update audience info. Please try again.");
      }
    }
  };

  const allAgencies = useMemo(
    () =>
      Array.from(new Set(data.map((d) => d.AGENCY_NAME || "").filter(Boolean))),
    [data]
  );

  const allAdvertisers = useMemo(
    () =>
      Array.from(
        new Set(data.map((d) => d.ADVERTISER_NAME || "").filter(Boolean))
      ),
    [data]
  );

  const allCampaigns = useMemo(
    () =>
      Array.from(new Set(data.map((d) => d.CAMPAIGN_ID || "").filter(Boolean))),
    [data]
  );

  // Campaign ID options
  const campaignOptions = useMemo(() => {
    let filteredData = data;
    if (selectedAgencies.length > 0) {
      filteredData = filteredData.filter((row) =>
        selectedAgencies.includes(row.AGENCY_NAME || "")
      );
    }
    if (selectedAdvertisers.length > 0) {
      filteredData = filteredData.filter((row) =>
        selectedAdvertisers.includes(row.ADVERTISER_NAME || "")
      );
    }
    return Array.from(
      new Set(filteredData.map((d) => d.CAMPAIGN_ID || "").filter(Boolean))
    ).sort();
  }, [data, selectedAgencies, selectedAdvertisers]);

  // Advertiser options
  const advertiserOptions = useMemo(() => {
    let filteredData = data;
    if (selectedAgencies.length > 0) {
      filteredData = filteredData.filter((row) =>
        selectedAgencies.includes(row.AGENCY_NAME || "")
      );
    }
    if (selectedCampaignIds.length > 0) {
      filteredData = filteredData.filter((row) =>
        selectedCampaignIds.includes(row.CAMPAIGN_ID || "")
      );
    }
    return Array.from(
      new Set(filteredData.map((d) => d.ADVERTISER_NAME || "").filter(Boolean))
    ).sort();
  }, [data, selectedAgencies, selectedCampaignIds]);

  // Agency options
  const agencyOptions = useMemo(() => {
    let filteredData = data;
    if (selectedAdvertisers.length > 0) {
      filteredData = filteredData.filter((row) =>
        selectedAdvertisers.includes(row.ADVERTISER_NAME || "")
      );
    }
    if (selectedCampaignIds.length > 0) {
      filteredData = filteredData.filter((row) =>
        selectedCampaignIds.includes(row.CAMPAIGN_ID || "")
      );
    }
    return Array.from(
      new Set(filteredData.map((d) => d.AGENCY_NAME || "").filter(Boolean))
    ).sort();
  }, [data, selectedAdvertisers, selectedCampaignIds]);

  // Initialize with all options
  useEffect(() => {
    if (data.length > 0) {
      setSelectedAgencies(allAgencies);
      setSelectedAdvertisers(allAdvertisers);
      setSelectedCampaignIds(allCampaigns);
    }
  }, [data, allAgencies, allAdvertisers, allCampaigns]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedAgencies([]);
    setSelectedAdvertisers([]);
    setSelectedCampaignIds([]);
  };

  // Filter data
  const filteredData = useMemo(() => {
    if (
      selectedAgencies.length === 0 ||
      selectedAdvertisers.length === 0 ||
      selectedCampaignIds.length === 0
    ) {
      return [];
    }
    return data.filter((row) => {
      if (
        selectedAgencies.length > 0 &&
        !selectedAgencies.includes(row.AGENCY_NAME || "")
      ) {
        return false;
      }
      if (
        selectedAdvertisers.length > 0 &&
        !selectedAdvertisers.includes(row.ADVERTISER_NAME || "")
      ) {
        return false;
      }
      if (
        selectedCampaignIds.length > 0 &&
        !selectedCampaignIds.includes(row.CAMPAIGN_ID || "")
      ) {
        return false;
      }
      return true;
    });
  }, [data, selectedAgencies, selectedAdvertisers, selectedCampaignIds]);

  // Check if filtered
  const isFiltered = useMemo(() => {
    if (data.length === 0) return false;
    const allAgencies = Array.from(
      new Set(data.map((d) => d.AGENCY_NAME || "").filter(Boolean))
    );
    const allAdvertisers = Array.from(
      new Set(data.map((d) => d.ADVERTISER_NAME || "").filter(Boolean))
    );
    const allCampaigns = Array.from(
      new Set(data.map((d) => d.CAMPAIGN_ID || "").filter(Boolean))
    );
    return (
      selectedAgencies.length !== allAgencies.length ||
      selectedAdvertisers.length !== allAdvertisers.length ||
      selectedCampaignIds.length !== allCampaigns.length
    );
  }, [data, selectedAgencies, selectedAdvertisers, selectedCampaignIds]);

  // Table columns with two clickable columns
  const columns = useMemo<ColumnDef<CsvRow>[]>(() => {
    if (data.length === 0) return [];

    const allKeys = new Set<string>();
    data.forEach((row) => {
      Object.keys(row).forEach((key) => allKeys.add(key));
    });

    const keysArray = Array.from(allKeys);

    const result: ColumnDef<CsvRow>[] = [];

    keysArray.forEach((key) => {
      // Add actual column
      result.push({
        accessorKey: key,
        header: key === "PIXELS_FLOODLIGHT" ? "PIXELS" : key.replace(/_/g, " "),
        cell: ({ getValue, row }) => {
          const value = getValue();

          if (key === "RADIA_OR_PRISMA_PACKAGE_NAME") {
            return (
              <div
                className="truncate text-[10px] leading-tight whitespace-normal cursor-pointer"
                onClick={() => {
                  setFormData(row.original);
                  setEditMode("PACKAGE");
                }}
              >
                {value ? String(value) : "—"}
              </div>
            );
          }

          if (key === "PLACEMENTNAME") {
            return (
              <div
                className="truncate text-[10px] leading-tight whitespace-normal cursor-pointer"
                onClick={() => {
                  setFormData(row.original);
                  setEditMode("PACKAGE_AND_PLACEMENT");
                }}
              >
                {value ? String(value) : "—"}
              </div>
            );
          }

          if (key === "AUDIENCE_INFO") {
            return (
              <div
                className="truncate text-[10px] leading-tight whitespace-normal cursor-pointer"
                onClick={() => {
                  setCurrentAudienceRow(row.original);
                  setAudiencePopupOpen(true);
                }}
              >
                {value ? String(value) : "—"}
              </div>
            );
          }

          return (
            <div className="truncate text-[10px] leading-tight">
              {value ? String(value) : "—"}
            </div>
          );
        },
      });

      // ✅ Insert TYPE column immediately after PIXELS_FLOODLIGHT
      if (key === "PIXELS_FLOODLIGHT") {
        result.push({
          id: "TYPE",
          header: "TYPE",
          cell: () => (
            <div className="truncate text-[10px] leading-tight">—</div>
          ),
        });
      }
    });

    // ✅ Add COMMENTS column at the end
    result.push({
      id: "COMMENTS",
      header: "COMMENTS",
      cell: () => <div className="truncate text-[10px] leading-tight">—</div>,
    });

    return result;
  }, [data]);

  useEffect(() => {
    if (columns.length > 0) {
      const hiddenState: VisibilityState = {};

      HIDDEN_COLUMNS.forEach((col) => {
        hiddenState[col] = false; // false = hidden
      });

      setColumnVisibility(hiddenState);
    }
  }, [columns]);

  // Create table with pagination
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 100, // 100 rows per page
      },
    },
  });

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSaving(true);

      if (editMode === "PACKAGE") {
        await onUpdateByPackage(formData);
      } else if (editMode === "PACKAGE_AND_PLACEMENT") {
        await onUpdateByPackageAndPlacement(formData);
      }

      setEditMode(null);
      setFormData({});
    } catch (error) {
      console.error("Error submitting data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border border-purple-200/40 max-w-screen mx-auto text-sm">
      {/* FILTER BAR */}
      <div className="px-3 py-2 border-b border-purple-200/40 bg-gradient-to-r from-purple-50 to-pink-50/30">
        <div className="flex justify-between items-center flex-wrap gap-3">
          {/* LEFT SIDE FILTERS */}
          <div className="flex gap-3 flex-wrap">
            <CustomDropdown
              label={`Agency`}
              options={agencyOptions}
              selectedOptions={selectedAgencies}
              onSelectionChange={setSelectedAgencies}
              disabled={
                selectedAdvertisers.length === 0 ||
                selectedCampaignIds.length === 0
              }
            />
            <CustomDropdown
              label={`Advertiser`}
              options={advertiserOptions}
              selectedOptions={selectedAdvertisers}
              onSelectionChange={setSelectedAdvertisers}
              disabled={
                selectedAgencies.length === 0 ||
                selectedCampaignIds.length === 0
              }
            />
            <CustomDropdown
              label={`Campaign`}
              options={campaignOptions}
              selectedOptions={selectedCampaignIds}
              onSelectionChange={setSelectedCampaignIds}
              disabled={
                selectedAgencies.length === 0 ||
                selectedAdvertisers.length === 0
              }
            />
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-xs bg-white border-2 border-purple-300 rounded-xl hover:bg-purple-50 transition-all font-medium"
            >
              Reset
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredData.length === 0}
              className="px-3 py-1.5 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-auto max-h-[155vh]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-[#000050]">
                {hg.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className={`
                      text-white 
                      font-semibold 
                      uppercase  
                      px-2 py-1.5 text-[9px]
                      tracking-wider
                      sticky top-0
                      ${
                        index < hg.headers.length - 1
                          ? "border-r border-[#000050]/30"
                          : ""
                      }
                    `}
                  >
                    <div className="truncate">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`
                    hover:bg-purple-50/50 transition-colors
                    ${rowIndex % 2 === 0 ? "bg-white" : "bg-purple-50/20"}
                  `}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <td
                      key={cell.id}
                      className={`
                        px-2 py-1 text-xs
                        border-b border-[#000050]/30
                        ${
                          index < row.getVisibleCells().length - 1
                            ? "border-r border-[#000050]/30"
                            : ""
                        }
                      `}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="text-center py-8 text-gray-500"
                >
                  {selectedAgencies.length === 0 ||
                  selectedAdvertisers.length === 0 ||
                  selectedCampaignIds.length === 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-lg font-medium text-gray-400">
                        Select filter options to view data
                      </div>
                      <div className="text-sm text-gray-400">
                        Choose values from the dropdowns above
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-lg font-medium text-gray-400">
                        No data matches your filters
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      {table.getPageCount() > 1 && (
        <div className="px-4 py-3 border-t border-purple-200/40 bg-white flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-purple-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-50"
            >
              <ChevronsLeft className="w-4 h-4 text-purple-600" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-purple-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-50"
            >
              <ChevronLeft className="w-4 h-4 text-purple-600" />
            </button>

            <div className="flex items-center gap-1 mx-2">
              {(() => {
                const pageCount = table.getPageCount();
                const currentPage = table.getState().pagination.pageIndex;
                const maxVisiblePages = 5;

                let startPage = Math.max(
                  0,
                  currentPage - Math.floor(maxVisiblePages / 2)
                );
                startPage = Math.min(
                  startPage,
                  Math.max(0, pageCount - maxVisiblePages)
                );
                startPage = Math.max(0, startPage);

                const visiblePages = Math.min(maxVisiblePages, pageCount);

                return Array.from({ length: visiblePages }, (_, i) => {
                  const pageIndex = startPage + i;
                  if (pageIndex >= pageCount) return null;

                  return (
                    <button
                      key={pageIndex}
                      onClick={() => table.setPageIndex(pageIndex)}
                      className={`w-8 h-8 rounded-lg text-sm ${
                        currentPage === pageIndex
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : "border border-purple-200 text-gray-700 hover:bg-purple-50"
                      }`}
                    >
                      {pageIndex + 1}
                    </button>
                  );
                }).filter(Boolean);
              })()}
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-purple-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-50"
            >
              <ChevronRight className="w-4 h-4 text-purple-600" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-purple-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-50"
            >
              <ChevronsRight className="w-4 h-4 text-purple-600" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Page{" "}
              <span className="font-medium">
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Go to:</span>
              <input
                type="number"
                min="1"
                max={table.getPageCount()}
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(
                    Math.min(Math.max(page, 0), table.getPageCount() - 1)
                  );
                }}
                className="w-16 px-2 py-1 border border-purple-200 rounded-lg text-sm"
              />
            </div>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-1 border border-purple-200 rounded-lg text-sm"
            >
              {[50, 100, 200, 500].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* FOOTER WITH ROW COUNT */}
      {table.getRowModel().rows.length > 0 && (
        <div className="px-4 py-3 border-t border-purple-200/40 bg-white text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <div>
              Showing{" "}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              {" - "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                filteredData.length
              )}
              {" of "}
              {filteredData.length} rows
            </div>
            <div className="text-xs text-gray-500">
              Total columns: {columns.length}
            </div>
          </div>
        </div>
      )}

      {/* FORM DIALOG */}
      <Dialog
        open={editMode === "PACKAGE" || editMode === "PACKAGE_AND_PLACEMENT"}
        onOpenChange={(open) => {
          if (!open) {
            setEditMode(null);
            setFormData({});
          }
        }}
      >
        <DialogContent
          className="max-w-4xl max-h-[85vh] bg-white border border-purple-200 rounded-2xl shadow-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="border-b border-purple-200 pb-3">
            <DialogTitle className="text-lg font-semibold text-[#000050]">
              {editMode === "PACKAGE"
                ? "Edit Based On Package"
                : "Edit Based On Package & Placement"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4 bg-purple-50/30 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
              {Object.entries(formData).map(([key, value]) => {
                const readOnly =
                  editMode === "PACKAGE"
                    ? PACKAGE_READ_ONLY_COLUMNS.has(key)
                    : PACKAGE_AND_PLACEMENT_READ_ONLY_COLUMNS.has(key);
                return (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {key.replace(/_/g, " ")}
                    </label>
                    <Input
                      type={key === "LIVE_DATE" ? "date" : "text"}
                      value={value || ""}
                      readOnly={readOnly}
                      disabled={readOnly}
                      onChange={(e) => {
                        if (!readOnly) {
                          setFormData((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }));
                        }
                      }}
                      className={`
                        ${
                          readOnly
                            ? "bg-gray-100 text-gray-500"
                            : "focus:ring-2 focus:ring-purple-400"
                        }
                      `}
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditMode(null);
                setFormData({});
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="min-w-[140px] bg-[#000050] text-white"
            >
              {isSaving ? "Submitting..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Audience Info Popup */}
      <AudienceInfoPopup
        isOpen={audiencePopupOpen}
        onClose={() => {
          setAudiencePopupOpen(false);
          setCurrentAudienceRow(null);
        }}
        onSubmit={handleAudienceSubmit}
        currentValue={currentAudienceRow?.AUDIENCE_INFO}
      />
    </div>
  );
}
