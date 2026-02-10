// RadiaplanTable.tsx
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
  selectedAdvertiser?: string; // Add this prop
}

// Custom Dropdown Component
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
    if (selectedOptions.length === options.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...options]);
    }
  };

  const isAllSelected =
    options.length > 0 && selectedOptions.length === options.length;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          px-4 py-2.5
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

          {options.map((option) => (
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

          {options.length === 0 && (
            <div className="px-4 py-2.5 text-sm text-gray-500">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RadiaplanTable({ data, selectedAdvertiser }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [selectedAdvertisers, setSelectedAdvertisers] = useState<string[]>([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);

  // Effect to automatically select the advertiser when prop changes
  useEffect(() => {
    if (selectedAdvertiser && data.length > 0) {
      // Check if this advertiser exists in the data
      const allAdvertisers = Array.from(
        new Set(data.map((d) => d.ADVERTISER_NAME || "").filter(Boolean))
      );
      
      if (allAdvertisers.includes(selectedAdvertiser)) {
        // Select only this advertiser
        setSelectedAdvertisers([selectedAdvertiser]);
        
        // Also select all agencies and campaigns for this advertiser
        const advertiserData = data.filter(
          (row) => row.ADVERTISER_NAME === selectedAdvertiser
        );
        
        const advertiserAgencies = Array.from(
          new Set(advertiserData.map((d) => d.AGENCY_NAME || "").filter(Boolean))
        );
        
        const advertiserCampaigns = Array.from(
          new Set(advertiserData.map((d) => d.CAMPAIGN_ID || "").filter(Boolean))
        );
        
        setSelectedAgencies(advertiserAgencies);
        setSelectedCampaignIds(advertiserCampaigns);
      }
    }
  }, [selectedAdvertiser, data]);

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
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && data.length > 0 && !selectedAdvertiser) {
      const allAgencies = Array.from(
        new Set(data.map((d) => d.AGENCY_NAME || "").filter(Boolean))
      );
      const allAdvertisers = Array.from(
        new Set(data.map((d) => d.ADVERTISER_NAME || "").filter(Boolean))
      );
      const allCampaigns = Array.from(
        new Set(data.map((d) => d.CAMPAIGN_ID || "").filter(Boolean))
      );
      setSelectedAgencies(allAgencies);
      setSelectedAdvertisers(allAdvertisers);
      setSelectedCampaignIds(allCampaigns);
      initialized.current = true;
    }
  }, [data, selectedAdvertiser]);

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
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <div className="break-words whitespace-normal text-sm py-3">
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
        pageSize: 100, // 100 rows per page
      },
    },
  });

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

  return (
    <div className="rounded-xl overflow-hidden border border-purple-200/40">
      {/* FILTER BAR */}
      <div className="p-4 border-b border-purple-200/40 bg-gradient-to-r from-purple-50 to-pink-50/30">
        <div className="flex items-center justify-between ">
          {isFiltered && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <FilterX className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
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
              selectedAgencies.length === 0 || selectedCampaignIds.length === 0
            }
          />
          <CustomDropdown
            label={`Campaign`}
            options={campaignOptions}
            selectedOptions={selectedCampaignIds}
            onSelectionChange={setSelectedCampaignIds}
            disabled={
              selectedAgencies.length === 0 || selectedAdvertisers.length === 0
            }
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-auto max-h-[calc(150vh-300px)]">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
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
                        px-4 
                        py-2
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
                      <button
                        onClick={clearAllFilters}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        Clear Filters
                      </button>
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