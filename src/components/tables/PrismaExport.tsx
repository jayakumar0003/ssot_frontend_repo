import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type ColumnDef,
} from "@tanstack/react-table";

type PrismaRow = {
  PLACEMENT_TYPE: string;
  NAME: string;
  PLACEMENT_ID: string;
  AD_SERVER_PLACEMENT_ID: string;
  MEDIA_OUTLET_SITE: string;
  START_DATE: string;
  END_DATE: string;
  BUY_TYPE: string;
  COST_METHOD: string;
  UNIT_TYPE: string;
  RATE: string;
  UNITS: string;
  COST: string;
  BUY_CATEGORY: string;
  AD_SIZE: string;
  SERVED_BY: string;
  CPA_KPI: string;
  TARGETING_AUDIENCE_TYPE: string;
  INVENTORY_TYPE_2: string;
  TARGETING_CONTEXT_TYPE: string;
  BUY_TYPE_1: string;
};

const PrismaExport = () => {
  // -----------------------------
  // 1️⃣ Static Empty Data (Add Later)
  // -----------------------------
  const data = useMemo<PrismaRow[]>(() => [], []);

  // -----------------------------
  // 2️⃣ Column Definitions
  // -----------------------------
  const columns = useMemo<ColumnDef<PrismaRow>[]>(
    () => [
      { accessorKey: "PLACEMENT_TYPE", header: "Placement Type" },
      { accessorKey: "NAME", header: "Name" },
      { accessorKey: "PLACEMENT_ID", header: "Placement ID" },
      {
        accessorKey: "AD_SERVER_PLACEMENT_ID",
        header: "Advertiser Ad-server Placement ID",
      },
      { accessorKey: "MEDIA_OUTLET_SITE", header: "Media Outlet Site" },
      { accessorKey: "START_DATE", header: "Start Date" },
      { accessorKey: "END_DATE", header: "End Date" },
      { accessorKey: "BUY_TYPE", header: "Buy Type" },
      { accessorKey: "COST_METHOD", header: "Cost Method" },
      { accessorKey: "UNIT_TYPE", header: "Unit Type" },
      { accessorKey: "RATE", header: "Rate" },
      { accessorKey: "UNITS", header: "Units" },
      { accessorKey: "COST", header: "Cost" },
      { accessorKey: "BUY_CATEGORY", header: "Buy Category" },
      { accessorKey: "AD_SIZE", header: "Ad Size" },
      { accessorKey: "SERVED_BY", header: "Served By" },
      { accessorKey: "CPA_KPI", header: "CPA KPI" },
      {
        accessorKey: "TARGETING_AUDIENCE_TYPE",
        header: "Targeting Audience Type",
      },
      { accessorKey: "INVENTORY_TYPE_2", header: "Inventory Type 2" },
      {
        accessorKey: "TARGETING_CONTEXT_TYPE",
        header: "Targeting Context Type",
      },
      { accessorKey: "BUY_TYPE_1", header: "Buy Type 1" },
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
                  No Prisma Export data available
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

export default PrismaExport;