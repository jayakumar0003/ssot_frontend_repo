import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type RowData = {
  PACKAGE_NAME: string;
  LINE_ITEM_BREAKOUT: string;
  PLACEMENT_NAME: string;
  ROTATION: string;
  ASSET_NAME: string;
  CREATIVE_NAME: string;
  YOUTUBE_VIDEO_LINK: string;
  ASSET_LENGTH: string;
  ASSET_FLIGHT: string;

  CTA_COPY: string;
  HEADLINE: string;
  LONG_HEADLINE: string;
  DESCRIPTION: string;
  LINK_ALIGNMENT: string;
  LINK_DESCRIPTION: string;
  CLICK_THROUGH_URL: string;
  DV360_ADVERTISER_ID: string;
  DV360_IO_ID: string;
  DV360_LINE_ITEM_ID: string;
  DV360_AD_GROUP_ID: string;
  DV360_AD_GROUP_ID_CONTEXTUAL: string;
  APPLY_3P_VERIFICATOR: string;
  VENDOR_CLIENT_ID: string;
  MEASUREMENT_TYPE: string;
  ANY_3P_TRACKING: string;
  LIST_3P_TRACKERS: string;
  SUBMITTED_TO_ADOPS: string;
};

const SiteServedMappingTable = () => {
  const [editMode, setEditMode] = useState<"EDIT" | null>(null);
  const [formData, setFormData] = useState<RowData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const NON_EDITABLE_FIELDS = new Set(["PACKAGE_NAME", "PLACEMENT_NAME"]);

  // ---------------------------
  // 1️⃣ Static Data
  // ---------------------------
  const [tableData, setTableData] = useState<RowData[]>([
      {
        PACKAGE_NAME:
          "GroupmNexus_2026_BIC_Atlanta_English_Standard Display_IPPE Package_Industries_NA_Cross-Device_DCPM_Awareness_Geo_3P_ABM_P3C8P9L",
        LINE_ITEM_BREAKOUT: "",
        PLACEMENT_NAME:
          "GroupmNexus_2026_BIC_Atlanta_English_Standard Display_IPPE During Event_FoodBev_300x250_Cross-Device_DCPM_Awareness_Geo_3P_ABM_P3C8PFP",
        ROTATION: `Example
-rotate all asset across all placement
-Rotate asset based on length
-Rotate asset based on placement name `,
        ASSET_NAME: "Name on YouTube",
        CREATIVE_NAME: "Name used on reporting",
        YOUTUBE_VIDEO_LINK: "-",
        ASSET_LENGTH: "",
        ASSET_FLIGHT: "",
        CTA_COPY: "",
        HEADLINE: "",
        LONG_HEADLINE: "",
        DESCRIPTION: "",
        LINK_ALIGNMENT: `Example: 
-Based on Asset 
-Based on length
- Based on audience 
-Based on P code
-Same across all `,
        LINK_DESCRIPTION: `Example: 
-include asset name/cell merger alligns with column E/F/G/H
-include length/cell merger alligns with length column 
-Same across all / NA
- Include audience name `,
        CLICK_THROUGH_URL: "",
        DV360_ADVERTISER_ID: "",
        DV360_IO_ID: "",
        DV360_LINE_ITEM_ID: "",
        DV360_AD_GROUP_ID: "",
        DV360_AD_GROUP_ID_CONTEXTUAL: "",
        APPLY_3P_VERIFICATOR: "",
        VENDOR_CLIENT_ID: "",
        MEASUREMENT_TYPE: "",
        ANY_3P_TRACKING: "",
        LIST_3P_TRACKERS: "",
        SUBMITTED_TO_ADOPS: "",
      },
]);

  // ---------------------------
  // 2️⃣ Column Definitions with custom width for LINK_DESCRIPTION
  // ---------------------------
  const columns = useMemo<ColumnDef<RowData>[]>(
    () => [
      {
        accessorKey: "PACKAGE_NAME",
        header: "Package Name",
        cell: ({ row, getValue }) => (
          <div
            className="cursor-pointer text-[#000050] "
            onClick={() => {
              setFormData(row.original);
              setEditMode("EDIT");
            }}
          >
            {getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "LINE_ITEM_BREAKOUT",
        header: "Line item breakout (optional as needed)",
      },
      {
        accessorKey: "PLACEMENT_NAME",
        header: "Placement Name",
        cell: ({ row, getValue }) => (
          <div
            className="cursor-pointer text-[#000050]"
            onClick={() => {
              setFormData(row.original);
              setEditMode("EDIT");
            }}
          >
            {getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "ROTATION",
        header: "Rotation (optional as needed) ",
      },
      {
        accessorKey: "ASSET_NAME",
        header: "Asset Name",
      },
      {
        accessorKey: "CREATIVE_NAME",
        header: "Creative Name (optional as needed)",
      },
      {
        accessorKey: "YOUTUBE_VIDEO_LINK",
        header: "YouTube Video Link",
      },
      {
        accessorKey: "ASSET_LENGTH",
        header: "Asset Length (optional as needed)",
      },
      {
        accessorKey: "ASSET_FLIGHT",
        header: "Asset Flight (optional as needed)",
      },
      {
        accessorKey: "CTA_COPY",
        header: "CTA / Copy",
      },
      {
        accessorKey: "HEADLINE",
        header: "Headline",
      },
      {
        accessorKey: "LONG_HEADLINE",
        header: "Long Headline",
      },
      {
        accessorKey: "DESCRIPTION",
        header: "Description",
      },
      {
        accessorKey: "LINK_ALIGNMENT",
        header: "Link allignment (optional needed if multiple applied)",
      },
      {
        accessorKey: "LINK_DESCRIPTION",
        header: "Link Description",
        // Add custom styling for this column
        cell: ({ getValue }) => (
          <div className="whitespace-pre-line break-words min-w-[300px] ">
            {(getValue() as string) || "—"}
          </div>
        ),
      },
      {
        accessorKey: "CLICK_THROUGH_URL",
        header: "Click Through URL (UTM)",
      },
      {
        accessorKey: "DV360_ADVERTISER_ID",
        header: "DV360 Advertiser ID",
      },
      {
        accessorKey: "DV360_IO_ID",
        header: "DV360 IO ID",
      },
      {
        accessorKey: "DV360_LINE_ITEM_ID",
        header: "DV360 Line Item ID",
      },
      {
        accessorKey: "DV360_AD_GROUP_ID",
        header: "DV360 Ad Group ID",
      },
      {
        accessorKey: "DV360_AD_GROUP_ID_CONTEXTUAL",
        header: "DV360 Ad Group ID - Contextual",
      },
      {
        accessorKey: "APPLY_3P_VERIFICATOR",
        header:
          "Apply Internal 3rd party verificator (MOAT, IAS (MWB), DV, ETC.? (Y/N)",
      },
      {
        accessorKey: "VENDOR_CLIENT_ID",
        header: "Vendor Client ID (VCID)",
      },
      {
        accessorKey: "MEASUREMENT_TYPE",
        header:
          "Measurement Type - Options are Viewability, Brand Safety, Brand Lift, or Reach",
      },
      {
        accessorKey: "ANY_3P_TRACKING",
        header: "Any 3P Tracking? (Y/N)",
      },
      {
        accessorKey: "LIST_3P_TRACKERS",
        header: "List out 3P trackers if applicable",
      },
      {
        accessorKey: "SUBMITTED_TO_ADOPS",
        header: "Submitted to AdOps",
      },
    ],
    []
  );

  // ---------------------------
  // 3️⃣ Table Instance
  // ---------------------------
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleSubmit = async () => {
    if (!formData) return;
  
    try {
      setIsSaving(true);
  
      setTableData((prev) =>
        prev.map((row) =>
          row.PACKAGE_NAME === formData.PACKAGE_NAME &&
          row.PLACEMENT_NAME === formData.PLACEMENT_NAME
            ? formData
            : row
        )
      );
  
      setEditMode(null);
      setFormData(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border border-purple-200/40 max-w-full mx-auto text-sm bg-white">
      {/* TABLE */}
      <div className="overflow-auto max-h-[150vh]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-[#000050]">
                {hg.headers.map((header) => {
                  // Apply special styling to the LINK_DESCRIPTION header
                  const isLinkDescription = header.id === "LINK_DESCRIPTION";

                  return (
                    <th
                      key={header.id}
                      className={`text-white font-semibold uppercase px-2 py-1.5 text-[9px] tracking-wider border-r border-[#000050]/30 ${
                        isLinkDescription ? "min-w-[300px]" : ""
                      }`}
                    >
                      <div className="truncate">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={`hover:bg-purple-50/50 transition-colors ${
                  rowIndex % 2 === 0 ? "bg-white" : "bg-purple-50/20"
                }`}
              >
                {row.getVisibleCells().map((cell) => {
                  // Check if this is the LINK_DESCRIPTION cell
                  const isLinkDescription =
                    cell.column.id === "LINK_DESCRIPTION";

                  return (
                    <td
                      key={cell.id}
                      className={`px-2 text-[10px] border-b border-[#000050]/30 border-r ${
                        isLinkDescription ? "min-w-[300px] max-w-[400px]" : ""
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {table.getPageCount() > 1 && (
        <div className="px-4 py-3 border-t border-[#000050]/30 bg-white flex justify-between items-center text-sm">
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
              className="px-3 py-1 border border-[#000050]/30 rounded-lg disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border border-[#000050]/30 rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {/* FORM DIALOG */}
      <Dialog
        open={editMode === "EDIT"}
        onOpenChange={(open) => {
          if (!open) {
            setEditMode(null);
          }
        }}
      >
        <DialogContent
          className="max-w-4xl max-h-[85vh] bg-white border border-purple-200 rounded-2xl shadow-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="border-b border-purple-200 pb-3">
            <DialogTitle className="text-lg font-semibold text-[#000050]">
              Edit Site Served Mapping
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4 bg-purple-50/30 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
              {formData &&
                Object.entries(formData).map(([key, value]) => {
                  const readOnly = NON_EDITABLE_FIELDS.has(key);
                  return (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        {key.replace(/_/g, " ")}
                      </label>
                      <Input
                        type="text"
                        value={value || ""}
                        readOnly={readOnly}
                        disabled={readOnly}
                        onChange={(e) => {
                          if (!readOnly && formData) {
                            setFormData({
                              ...formData,
                              [key]: e.target.value,
                            });
                          }
                        }}
                        className={
                          readOnly
                            ? "bg-gray-100 text-gray-500"
                            : "focus:ring-2 focus:ring-[#000050]"
                        }
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
    </div>
  );
};

export default SiteServedMappingTable;
