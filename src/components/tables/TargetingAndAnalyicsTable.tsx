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
}

type EditMode = "PACKAGE" | "PACKAGE_AND_PLACEMENT" | null;

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
          px-3 py-2
          border-2 border-purple-300 
          rounded-xl 
          flex items-center gap-2
          min-w-[100px]
          justify-between 
          text-sm
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
const HIDDEN_COLUMNS = ["AGENCY_NAME", "ADVERTISER_NAME", "CAMPAIGN_ID"];

export default function TargetingAndAnalyticsTable({
  data,
  onUpdateByPackage,
  onUpdateByPackageAndPlacement,
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
    return Array.from(allKeys).map((key) => ({
      accessorKey: key,
      header: key.replace(/_/g, " "),
      cell: ({ getValue, row }) => {
        const value = getValue();

        // Make RADIA_OR_PRISMA_PACKAGE_NAME clickable to open package edit form
        if (key === "RADIA_OR_PRISMA_PACKAGE_NAME") {
          return (
            <div
              className="break-words whitespace-normal text-sm py-3 cursor-pointer"
              onClick={() => {
                setFormData(row.original);
                setEditMode("PACKAGE");
              }}
            >
              {value ? String(value) : "—"}
            </div>
          );
        }

        // Make PLACEMENTNAME clickable to open package & placement edit form
        if (key === "PLACEMENTNAME") {
          return (
            <div
              className="break-words whitespace-normal text-sm py-3 cursor-pointer"
              onClick={() => {
                setFormData(row.original);
                setEditMode("PACKAGE_AND_PLACEMENT");
              }}
            >
              {value ? String(value) : "—"}
            </div>
          );
        }

        return (
          <div className="break-words whitespace-normal text-sm py-3">
            {value ? String(value) : "—"}
          </div>
        );
      },
    }));
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
    <div className="rounded-xl overflow-hidden border border-purple-200/40">
      {/* FILTER BAR */}
      <div className="p-4 border-b border-purple-200/40 bg-gradient-to-r from-purple-50 to-pink-50/30">
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
              className="px-4 py-2 bg-white border-2 border-purple-300 rounded-xl hover:bg-purple-50 transition-all text-sm font-medium"
            >
              Reset
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredData.length === 0}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-auto max-h-[calc(150vh-300px)]">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-purple-600">
                {hg.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className={`
                      text-white 
                      font-semibold 
                      uppercase 
                      text-left 
                      px-4 py-3
                      text-xs
                      tracking-wider
                      sticky top-0
                      ${
                        index < hg.headers.length - 1
                          ? "border-r border-purple-500/40"
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
                        px-2 
                        border-b border-purple-100/40
                        ${
                          index < row.getVisibleCells().length - 1
                            ? "border-r border-purple-100/40"
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
        open={!!editMode}
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
            <DialogTitle className="text-lg font-semibold text-purple-700">
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
                        ${readOnly ? "bg-gray-100 text-gray-500" : "focus:ring-2 focus:ring-purple-400"}
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
              className="min-w-[140px]"
            >
              {isSaving ? "Submitting..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
