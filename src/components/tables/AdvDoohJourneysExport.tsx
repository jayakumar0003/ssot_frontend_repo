import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type ColumnDef,
} from "@tanstack/react-table";

type AtvRow = {};

const AdvDoohJourneysExportTable = () => {
  // -----------------------------
  // 1️⃣ Static Empty Data
  // -----------------------------
  const data = useMemo<AtvRow[]>(() => [], []);

  // -----------------------------
  // 2️⃣ Column Definitions
  // -----------------------------
  const columns = useMemo<ColumnDef<AtvRow>[]>(() => [], []);

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

  return <div>AdvDOOH Journeys Export Table</div>;
};

export default AdvDoohJourneysExportTable;
