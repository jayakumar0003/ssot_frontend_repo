import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type ColumnDef,
} from "@tanstack/react-table";

type AdvDoohRow = {
  CLIENT_COMMERCIAL_MODEL: string;
  CLIENT: string;
  CAMPAIGN_NAME: string;
  BUDGET: string;
  FLIGHT_START_DATE: string;
  FLIGHT_END_DATE: string;
  TARGETING: string;
  CAMPAIGN_DETAILS: string;
  CREATIVE_DELIVERY: string;
  MARKETS: string;
  FORMATS: string;
  MEDIA_VENDORS: string;
  JOURNEYS_PLAN_LINK: string;
  DSP_SEAT: string;
  DOOH_SSP: string;
  TRADING_NOTES: string;
  CREATIVE_FOLDER_LINK: string;
  SF_OPP_LINK: string;
  R_CODE: string;
  P_CODE: string;

  ENHANCEMENTS_TYPE: string;
  // DESCRIPTION: string;
  // PARTNER: string;
  // CONTACTS: string; 
  // CPM_CHARGE: string;
  // LEAD_TIMES: string;
  // MINIMUM_REQUIREMENT: string;

  MEASUREMENT_TYPE: string;
  // DESCRIPTION: string;
  // PARTNER: string;
  // CONTACTS: string; 
  // CPM_CHARGE: string;
  // LEAD_TIMES: string;
  // MINIMUM_REQUIREMENT: string;

  GROSS_BUYING_CPM: string;
  NET_BUYING_CPM: string;
  ESTIMATED_IMPRESSIONS: string;
  ESTIMATED_MARGIN: string;
  TARGET_FEASIBILITY: string;
};

const AdvDoohAvailsCaseTable = () => {
  // -----------------------------
  // 1️⃣ Static Empty Data
  // -----------------------------
  const data = useMemo<AdvDoohRow[]>(() => [], []);

  // -----------------------------
  // 2️⃣ Column Definitions
  // -----------------------------
  const columns = useMemo<ColumnDef<AdvDoohRow>[]>(
    () => [
      { accessorKey: "CLIENT_COMMERCIAL_MODEL", header: "Client Commercial Model" },
      { accessorKey: "CLIENT", header: "Client" },
      { accessorKey: "CAMPAIGN_NAME", header: "Campaign Name" },
      { accessorKey: "BUDGET", header: "Budget" },
      { accessorKey: "FLIGHT_START_DATE", header: "Flight Start Date" },
      { accessorKey: "FLIGHT_END_DATE", header: "Flight End Date" },
      {
        accessorKey: "TARGETING",
        header: "Targeting (audience/proximity, 1st/3P Data)",
      },
      {
        accessorKey: "CAMPAIGN_DETAILS",
        header: "Campaign Details (KPIs, Storelist, cal upweights, trade radius)",
      },
      {
        accessorKey: "CREATIVE_DELIVERY",
        header: "Creative Delivery (even or split)",
      },
      { accessorKey: "MARKETS", header: "Markets" },
      { accessorKey: "FORMATS", header: "Formats" },
      { accessorKey: "MEDIA_VENDORS", header: "Media Vendors" },
      { accessorKey: "JOURNEYS_PLAN_LINK", header: "Journeys Plan Link" },
      { accessorKey: "DSP_SEAT", header: "DSP Seat" },
      { accessorKey: "DOOH_SSP", header: "DOOH SSP" },
      { accessorKey: "TRADING_NOTES", header: "Trading Notes" },
      { accessorKey: "CREATIVE_FOLDER_LINK", header: "Creative Folder Link" },
      { accessorKey: "SF_OPP_LINK", header: "SF Opp Link" },
      { accessorKey: "R_CODE", header: "R Code" },
      { accessorKey: "P_CODE", header: "P Code" },
      
      { accessorKey: "ENHANCEMENTS_TYPE", header: "Enhancements Type" },
      { accessorKey: "MEASUREMENT_TYPE", header: "Measurement Type" },
      { accessorKey: "GROSS_BUYING_CPM", header: "Gross buying CPM" },
      { accessorKey: "NET_BUYING_CPM", header: "Net Buying COM" },
      { accessorKey: "ESTIMATED_IMPRESSIONS", header: "Estimated Impressions" },
      { accessorKey: "ESTIMATED_MARGIN", header: "Estimated Margin" },
      { accessorKey: "TARGET_FEASIBILITY", header: "Target Feasibility" },
    ],
    []
  );

  // -----------------------------
  // 3️⃣ Table Instance
  // -----------------------------
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  return (
    <div className="rounded-lg overflow-hidden border border-purple-200/40 max-w-full mx-auto text-sm bg-white">
      <div className="overflow-auto max-h-[150vh]">
        <table className="min-w-full w-full text-xs">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-[#000050]">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-white font-semibold uppercase px-2 py-1.5 text-[9px] tracking-wider border-r border-[#000050]/30"
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
                  className={`hover:bg-purple-50/50 transition-colors ${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-purple-50/20"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-2 py-1.5 text-[10px] border-b border-[#000050]/30 border-r"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      ) || "—"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-500"
                >
                  No Advanced AdvDOOH - Avails Case data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="px-4 py-3 border-t border-purple-200/40 bg-white flex justify-between items-center text-sm">
          <div>
            Page{" "}
            <span className="font-medium">
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border border-purple-200 rounded-lg disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border border-purple-200 rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvDoohAvailsCaseTable;