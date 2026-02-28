import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type ColumnDef,
} from "@tanstack/react-table";

type AtvRow = {
  CAMPAIGN_NAME: string;
  BUYLINE_NAME: string;
  FLIGHT_DATES: string;
  CREATIVE_LENGTH: string;
  CREATIVE_ROTATION_REQUIREMENTS: string;
  CLIENT_CPM: string;
  ESTIMATED_BUDGET: string;
  DSP: string;
  TARGETING: string;
  THIRD_PARTY_DATA_PROVIDER: string;
  THIRD_PARTY_AUDIENCE_DESCRIPTION: string;
  FCAP_INCIDENCE_HOUSEHOLD_PERCENT: string;
  FCAP_AUDIENCE_DESCRIPTION: string;
  CLIENT_FACING_AUDIENCE_DESCRIPTION: string;
  ADVANCED_MEASUREMENT: string;
  SPECIAL_INSTRUCTIONS: string;
};

const AtvAvailsCaseTable = () => {
  // -----------------------------
  // 1️⃣ Static Empty Data
  // -----------------------------
  const data = useMemo<AtvRow[]>(() => [], []);

  // -----------------------------
  // 2️⃣ Column Definitions
  // -----------------------------
  const columns = useMemo<ColumnDef<AtvRow>[]>(
    () => [
      { accessorKey: "CAMPAIGN_NAME", header: "Campaign Name" },
      { accessorKey: "BUYLINE_NAME", header: "Buyline Name" },
      { accessorKey: "FLIGHT_DATES", header: "Flight Dates" },
      { accessorKey: "CREATIVE_LENGTH", header: "Creative Length" },
      {
        accessorKey: "CREATIVE_ROTATION_REQUIREMENTS",
        header: "Creative Rotation Requirements",
      },
      { accessorKey: "CLIENT_CPM", header: "Client CPM" },
      { accessorKey: "ESTIMATED_BUDGET", header: "Estimated Budget" },
      { accessorKey: "DSP", header: "DSP" },
      { accessorKey: "TARGETING", header: "Targeting" },
      {
        accessorKey: "THIRD_PARTY_DATA_PROVIDER",
        header: "3P Data Provider",
      },
      {
        accessorKey: "THIRD_PARTY_AUDIENCE_DESCRIPTION",
        header: "3P Audience Description",
      },
      {
        accessorKey: "FCAP_INCIDENCE_HOUSEHOLD_PERCENT",
        header: "FCAP Incidence Household %",
      },
      {
        accessorKey: "FCAP_AUDIENCE_DESCRIPTION",
        header: "FCAP Audience Description",
      },
      {
        accessorKey: "CLIENT_FACING_AUDIENCE_DESCRIPTION",
        header: "Client Facing Audience Description",
      },
      {
        accessorKey: "ADVANCED_MEASUREMENT",
        header: "Advanced Measurement",
      },
      {
        accessorKey: "SPECIAL_INSTRUCTIONS",
        header: "Special Instructions",
      },
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
                  No ATV Avails Case data available
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

export default AtvAvailsCaseTable;