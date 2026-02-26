// RadiaplanTable.tsx - UPDATED WITH CHANNEL SUPPORT
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

// Export the type
export type CsvRow = Record<string, string>;

interface Props {
  data: CsvRow[];
  selectedAgency?: string;
  selectedAdvertiser?: string;
  selectedChannel?: string; // Add channel prop
}

// Custom Dropdown Component (unchanged but improved)
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
    const allFilteredSelected =
      filteredOptions.length > 0 &&
      filteredOptions.every((opt) => selectedOptions.includes(opt));

    if (allFilteredSelected) {
      // If all filtered options are selected, deselect EVERYTHING
      onSelectionChange([]);
    } else {
      // If not all are selected, select all filtered options
      // But keep any previously selected options that are not in filtered view
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
        <div className="absolute z-50 mt-2 w-72 bg-white border border-purple-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
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

export default function RadiaplanTable({
  data,
  selectedAgency,
  selectedAdvertiser,
  selectedChannel,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [selectedAdvertisers, setSelectedAdvertisers] = useState<string[]>([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]); // Add channels state
  console.log(selectedChannel);
  // Get ALL unique options from data
  const allAgencies = useMemo(
    () =>
      Array.from(
        new Set(data.map((d) => d.AGENCY_NAME || "").filter(Boolean))
      ).sort(),
    [data]
  );

  const allAdvertisers = useMemo(
    () =>
      Array.from(
        new Set(data.map((d) => d.ADVERTISER_NAME || "").filter(Boolean))
      ).sort(),
    [data]
  );

  const allCampaigns = useMemo(
    () =>
      Array.from(
        new Set(data.map((d) => d.CAMPAIGN_ID || "").filter(Boolean))
      ).sort(),
    [data]
  );

  // Add all channels
  const allChannels = useMemo(
    () =>
      Array.from(
        new Set(data.map((d) => d.CHANNEL || "").filter(Boolean))
      ).sort(),
    [data]
  );

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    // Get all column headers
    const headers = table.getAllLeafColumns().map((col) => col.id);

    // Convert rows
    const csvRows = filteredData.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";

          // Escape double quotes
          const escaped = String(value).replace(/"/g, '""');

          // Wrap in quotes to handle commas/newlines
          return `"${escaped}"`;
        })
        .join(",")
    );

    const csvContent = headers.join(",") + "\n" + csvRows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `radiaplan_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setSelectedAgencies(allAgencies);
    setSelectedAdvertisers(allAdvertisers);
    setSelectedCampaignIds(allCampaigns);
    setSelectedChannels(allChannels); // Reset channels
  };

  // Effect to automatically select values when props change
  useEffect(() => {
    if (data.length === 0) return;

    let filtered = data;

    if (selectedAgency) {
      filtered = filtered.filter((row) => row.AGENCY_NAME === selectedAgency);
    }

    if (selectedAdvertiser && selectedAdvertiser !== "__AGENCY_ONLY__") {
      filtered = filtered.filter(
        (row) => row.ADVERTISER_NAME === selectedAdvertiser
      );
    }

    if (selectedChannel) {
      filtered = filtered.filter((row) => row.CHANNEL === selectedChannel);
    }

    // Now extract dropdown options from filtered result

    const agenciesToSelect = Array.from(
      new Set(filtered.map((d) => d.AGENCY_NAME || "").filter(Boolean))
    ).sort();

    const advertisersToSelect = Array.from(
      new Set(filtered.map((d) => d.ADVERTISER_NAME || "").filter(Boolean))
    ).sort();

    const campaignsToSelect = Array.from(
      new Set(filtered.map((d) => d.CAMPAIGN_ID || "").filter(Boolean))
    ).sort();

    const channelsToSelect = Array.from(
      new Set(filtered.map((d) => d.CHANNEL || "").filter(Boolean))
    ).sort();

    setSelectedAgencies(agenciesToSelect);
    setSelectedAdvertisers(advertisersToSelect);
    setSelectedCampaignIds(campaignsToSelect);
    setSelectedChannels(channelsToSelect);
  }, [data, selectedAgency, selectedAdvertiser, selectedChannel]);

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
    if (selectedChannels.length > 0) {
      filteredData = filteredData.filter((row) =>
        selectedChannels.includes(row.CHANNEL || "")
      );
    }
    return Array.from(
      new Set(filteredData.map((d) => d.AGENCY_NAME || "").filter(Boolean))
    ).sort();
  }, [data, selectedAdvertisers, selectedCampaignIds, selectedChannels]);

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
    if (selectedChannels.length > 0) {
      filteredData = filteredData.filter((row) =>
        selectedChannels.includes(row.CHANNEL || "")
      );
    }
    return Array.from(
      new Set(filteredData.map((d) => d.ADVERTISER_NAME || "").filter(Boolean))
    ).sort();
  }, [data, selectedAgencies, selectedCampaignIds, selectedChannels]);

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
    if (selectedChannels.length > 0) {
      filteredData = filteredData.filter((row) =>
        selectedChannels.includes(row.CHANNEL || "")
      );
    }
    return Array.from(
      new Set(filteredData.map((d) => d.CAMPAIGN_ID || "").filter(Boolean))
    ).sort();
  }, [data, selectedAgencies, selectedAdvertisers, selectedChannels]);

  // Channel options
  const channelOptions = useMemo(() => {
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
    if (selectedCampaignIds.length > 0) {
      filteredData = filteredData.filter((row) =>
        selectedCampaignIds.includes(row.CAMPAIGN_ID || "")
      );
    }
    return Array.from(
      new Set(filteredData.map((d) => d.CHANNEL || "").filter(Boolean))
    ).sort();
  }, [data, selectedAgencies, selectedAdvertisers, selectedCampaignIds]);

  // Initialize with all options (only when no props are provided)
  useEffect(() => {
    if (data.length === 0) return;

    // If no external filters are applied,
    // always reset to full dataset
    if (!selectedAdvertiser && !selectedAgency && !selectedChannel) {
      setSelectedAgencies(allAgencies);
      setSelectedAdvertisers(allAdvertisers);
      setSelectedCampaignIds(allCampaigns);
      setSelectedChannels(allChannels);
    }
  }, [
    data,
    selectedAdvertiser,
    selectedAgency,
    selectedChannel,
    allAgencies,
    allAdvertisers,
    allCampaigns,
    allChannels,
  ]);

  // Filter data
  const filteredData = useMemo(() => {
    // 🔴 If any filter is completely empty → show nothing
    if (
      selectedAgencies.length === 0 ||
      selectedAdvertisers.length === 0 ||
      selectedCampaignIds.length === 0 ||
      selectedChannels.length === 0
    ) {
      return [];
    }

    return data.filter((row) => {
      return (
        selectedAgencies.includes(row.AGENCY_NAME || "") &&
        selectedAdvertisers.includes(row.ADVERTISER_NAME || "") &&
        selectedCampaignIds.includes(row.CAMPAIGN_ID || "") &&
        selectedChannels.includes(row.CHANNEL || "")
      );
    });
  }, [
    data,
    selectedAgencies,
    selectedAdvertisers,
    selectedCampaignIds,
    selectedChannels,
  ]);

  // Table columns
  const columns = useMemo<ColumnDef<CsvRow>[]>(() => {
    if (data.length === 0) return [];
    const allKeys = new Set<string>();
    data.forEach((row) => {
      Object.keys(row).forEach((key) => allKeys.add(key));
    });
    return Array.from(allKeys).map((key) => ({
      accessorKey: key,
      header: key.replace(/_/g, " "),
    
      // 👇 Increase width for CHANNEL & CAMPAIGN_NAME
      size:
        key === "CHANNEL"
          ? 160
          : key === "CAMPAIGN_NAME"
          ? 160
          : undefined,
    
      cell: ({ getValue }) => {
        const value = getValue();
    
        // 👇 Special cell styling for wider columns
        if (key === "CHANNEL") {
          return (
            <div className="whitespace-normal text-xs py-1 min-w-[120px]">
              {value ? String(value) : "—"}
            </div>
          );
        }
    
        if (key === "CAMPAIGN_NAME") {
          return (
            <div className="whitespace-normal text-xs py-1 min-w-[220px]">
              {value ? String(value) : "—"}
            </div>
          );
        }
    
        return (
          <div className="truncate whitespace-normal text-xs py-1 leading-tight">
            {value ? String(value) : "—"}
          </div>
        );
      },
    }));
  }, [data]);

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
        pageSize: 100,
      },
    },
  });

  // Check if filtered
  const isFiltered = useMemo(() => {
    if (data.length === 0) return false;
    return (
      selectedAgencies.length !== allAgencies.length ||
      selectedAdvertisers.length !== allAdvertisers.length ||
      selectedCampaignIds.length !== allCampaigns.length ||
      selectedChannels.length !== allChannels.length
    );
  }, [
    data,
    selectedAgencies,
    selectedAdvertisers,
    selectedCampaignIds,
    selectedChannels,
    allAgencies,
    allAdvertisers,
    allCampaigns,
    allChannels,
  ]);

  return (
    <div className="rounded-lg overflow-hidden border border-purple-200/40 max-w-[1200px] mx-auto text-sm">
      {/* FILTER BAR */}
      <div className="px-3 py-2 border-b border-purple-200/40 bg-gradient-to-r from-purple-50 to-pink-50/30">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 flex-wrap">
            <CustomDropdown
              label={`Agency`}
              options={agencyOptions}
              selectedOptions={selectedAgencies}
              onSelectionChange={setSelectedAgencies}
              disabled={
                selectedAdvertisers.length === 0 ||
                selectedCampaignIds.length === 0 ||
                selectedChannels.length === 0
              }
            />
            <CustomDropdown
              label={`Advertiser`}
              options={advertiserOptions}
              selectedOptions={selectedAdvertisers}
              onSelectionChange={setSelectedAdvertisers}
              disabled={
                selectedAgencies.length === 0 ||
                selectedCampaignIds.length === 0 ||
                selectedChannels.length === 0
              }
            />
            {/* Add Channel dropdown */}
            <CustomDropdown
              label={`Channel`}
              options={channelOptions}
              selectedOptions={selectedChannels}
              onSelectionChange={setSelectedChannels}
              disabled={
                selectedAgencies.length === 0 ||
                selectedAdvertisers.length === 0 ||
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
                selectedAdvertisers.length === 0 ||
                selectedChannels.length === 0
              }
            />
          </div>

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
      <div className="overflow-auto max-h-[150vh] min-h-[250px]">
      <table className="w-full text-xs">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-[#000050] ">
                {hg.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className={`
                      text-white 
                      font-semibold 
                      uppercase 
                      text-left 
                      px-3 py-2 text-[11px]
                      tracking-wider
                      sticky top-0
                      ${
                        index < hg.headers.length - 1
                          ? "border-r border-[#000050]/40"
                          : ""
                      }
                    `}
                    style={{
                      width:
                        header.column.id === "CHANNEL"
                          ? "160px"
                          : header.column.id === "CAMPAIGN_NAME"
                          ? "220px"
                          : undefined,
                    }}
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
                            ? "border-r border-purple-300/50"
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
                  selectedCampaignIds.length === 0 ||
                  selectedChannels.length === 0 ? (
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
    </div>
  );
}
