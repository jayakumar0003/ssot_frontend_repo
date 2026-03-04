import React, { useMemo, useState } from "react";
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
import { Download, Edit2, Save, X, ChevronDown, FileText } from "lucide-react";

export type CsvRow = Record<string, string>;

interface Props {
  targetingData: CsvRow[];
  studiesData: CsvRow[];
  selectedPackage: string;
  setSelectedPackage: (value: string) => void;
  onSubmit?: (payload: any) => Promise<void>;
}

// All the empty columns that should appear as input fields in the form
const FORM_COLUMNS = [
  "Survey Companies",
  "Survey Methodology",
  "Campaign Objective/KPI",
  "Ad Spend Minimums",
  "Ad Set Channel Types",
  "Study Fees",
  "Study Brand Safety",
  "Survey Questions",
  "Target Audience",
  "Flight Dates",
  "Brand",
];

const StudiesBLSTable = ({
  targetingData,
  studiesData,
  selectedPackage,
  setSelectedPackage,
  onSubmit,
}: Props) => {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Get unique packages
  const packageOptions = useMemo(() => {
    const unique = new Set<string>();
    targetingData.forEach((row) => {
      if (row.RADIA_OR_PRISMA_PACKAGE_NAME) {
        unique.add(row.RADIA_OR_PRISMA_PACKAGE_NAME);
      }
    });
    return Array.from(unique);
  }, [targetingData]);

  // Find selected row
  const selectedRow = useMemo(() => {
    return targetingData.find(
      (row) => row.RADIA_OR_PRISMA_PACKAGE_NAME === selectedPackage
    );
  }, [selectedPackage, targetingData]);

  // Create rows based on BLS_MEASUREMENT
  const measurementRows = useMemo(() => {
    if (!selectedRow || !selectedRow.BLS_MEASUREMENT) return [];

    const measurements = selectedRow.BLS_MEASUREMENT.split(",").map((m) =>
      m.trim()
    );

    return measurements.map((measurement) => {
      const studyRow = studiesData.find(
        (row) =>
          row.PACKAGE_NAME === selectedRow.RADIA_OR_PRISMA_PACKAGE_NAME &&
          row.BLS_MEASUREMENT === measurement
      );

      return {
        packageName: selectedRow.RADIA_OR_PRISMA_PACKAGE_NAME,
        measurement,
        source: studyRow ? "studies" : "targeting",
        data: studyRow || null,
      };
    });
  }, [selectedRow, studiesData]);

  // Handle clicking on BLS Measurement
  const handleMeasurementClick = (measurement: string) => {
    setSelectedMeasurement(measurement);

    const existingRow = studiesData.find(
      (row) =>
        row.PACKAGE_NAME === selectedPackage &&
        row.BLS_MEASUREMENT === measurement
    );

    const initialFormData: Record<string, string> = {};

    FORM_COLUMNS.forEach((col) => {
      const key = col.toUpperCase().replace(/\s/g, "_").replace("/", "_");
      initialFormData[col] = existingRow?.[key] || "";
    });

    setFormData(initialFormData);
    setFormDialogOpen(true);
  };

  // Export table data to CSV
  const handleExportCSV = () => {
    if (!measurementRows.length) {
      alert("No data to export");
      return;
    }

    const headers = [
      "PACKAGE_NAME",
      "BLS_MEASUREMENT",
      "SURVEY_COMPANIES",
      "SURVEY_METHODOLOGY",
      "CAMPAIGN_OBJECTIVE_KPI",
      "AD_SPEND_MINIMUMS",
      "AD_SET_CHANNEL_TYPES",
      "STUDY_FEES",
      "STUDY_BRAND_SAFETY",
      "SURVEY_QUESTIONS",
      "TARGET_AUDIENCE",
      "FLIGHT_DATES",
      "BRAND",
    ];

    const rows = measurementRows.map((row) => [
      row.packageName,
      row.measurement,
      row.data?.SURVEY_COMPANIES || "",
      row.data?.SURVEY_METHODOLOGY || "",
      row.data?.CAMPAIGN_OBJECTIVE_KPI || "",
      row.data?.AD_SPEND_MINIMUMS || "",
      row.data?.AD_SET_CHANNEL_TYPES || "",
      row.data?.STUDY_FEES || "",
      row.data?.STUDY_BRAND_SAFETY || "",
      row.data?.SURVEY_QUESTIONS || "",
      row.data?.TARGET_AUDIENCE || "",
      row.data?.FLIGHT_DATES || "",
      row.data?.BRAND || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((e) => e.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `studies_bls_${selectedPackage || 'export'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      const currentSelectedPackage = selectedPackage;

      const payload = {
        packageName: currentSelectedPackage,
        measurement: selectedMeasurement,
        ...formData,
      };

      if (onSubmit) {
        await onSubmit(payload);
      } else {
        console.log("Submitting data:", payload);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setFormDialogOpen(false);
      setSelectedPackage(currentSelectedPackage);
      setFormData({});
      setSelectedMeasurement("");
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to save data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input change
  const handleInputChange = (column: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  return (
    <div className="bg-white rounded-xl border border-purple-200/40 shadow-lg overflow-hidden">
      {/* FILTER BAR - Enhanced */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50/30 border-b border-purple-200/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-purple-700 mb-1 tracking-wide">
                PACKAGE NAME
              </label>
              <div className="relative">
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="appearance-none text-sm border-2 border-purple-300 rounded-lg pl-3 pr-8 py-2 w-[320px] bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 transition-all"
                >
                  <option value="">Select Package</option>
                  {packageOptions.map((pkg) => (
                    <option key={pkg} value={pkg}>
                      {pkg}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 pointer-events-none" />
              </div>
            </div>
            
            {/* {selectedPackage && (
              <div className="flex items-center gap-2 mt-5">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-purple-600 font-medium">
                  {measurementRows.length} measurement{measurementRows.length !== 1 ? 's' : ''} found
                </span>
              </div>
            )} */}
          </div>

          <Button
            onClick={handleExportCSV}
            disabled={!measurementRows.length}
            className="flex items-center gap-2 text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md mt-5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* TABLE - Enhanced */}
      <div className="overflow-auto max-h-[calc(100vh-280px)]">
        <table className="w-full text-xs">
          {/* HEADER */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#000050]">
              {[
                "Package Name",
                "BLS Measurement",
                "Survey Companies",
                "Survey Methodology",
                "Campaign Objective/KPI",
                "Ad Spend Minimums",
                "Ad Set Channel Types",
                "Study Fees",
                "Study Brand Safety",
                "Survey Questions",
                "Target Audience",
                "Flight Dates",
                "Brand",
              ].map((header, index) => (
                <th
                  key={index}
                  className="text-white uppercase font-semibold px-3 py-2.5 text-[10px] tracking-wider whitespace-nowrap border-r border-[#000050]/30 last:border-r-0"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {measurementRows.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <FileText className="w-12 h-12 mb-3 text-purple-300" />
                    <p className="text-sm font-medium text-gray-500">No measurements found</p>
                    <p className="text-xs text-gray-400 mt-1">Select a package from the dropdown above</p>
                  </div>
                </td>
              </tr>
            ) : (
              measurementRows.map((row, index) => (
                <tr
                  key={index}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`
                    transition-all duration-200
                    ${index % 2 === 0 ? "bg-white" : "bg-purple-50/20"}
                    ${hoveredRow === index ? "bg-purple-100/50 shadow-md" : ""}
                  `}
                >
                  <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      {row.packageName}
                    </div>
                  </td>

                  <td
                    className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] cursor-pointer group"
                    onClick={() => handleMeasurementClick(row.measurement)}
                  >
                    <div className={`
                      inline-flex items-center gap-1.5 px-2 py-1 rounded-md
                      ${hoveredRow === index 
                        ? "bg-purple-200 text-purple-900" 
                        : "bg-purple-100 text-purple-800"
                      }
                      hover:bg-purple-200 hover:text-purple-900 transition-all duration-200
                    `}>
                      <span>{row.measurement}</span>
                      <Edit2 className={`w-3 h-3 ${hoveredRow === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
                    </div>
                  </td>

                  {/* Data cells with improved styling */}
                  <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                    {row.data?.SURVEY_COMPANIES || <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                    {row.data?.SURVEY_METHODOLOGY || <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                    {row.data?.CAMPAIGN_OBJECTIVE_KPI || <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                    {row.data?.AD_SPEND_MINIMUMS || <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                    {row.data?.AD_SET_CHANNEL_TYPES || <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                    {row.data?.STUDY_FEES || <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                    {row.data?.STUDY_BRAND_SAFETY || <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                    {row.data?.SURVEY_QUESTIONS || <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                    {row.data?.TARGET_AUDIENCE || <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                    {row.data?.FLIGHT_DATES || <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                    {row.data?.BRAND || <span className="text-gray-500">—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FORM DIALOG - Enhanced */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-w-4xl max-h-[85vh] bg-white border border-purple-200 rounded-2xl shadow-2xl"
        >
          <DialogHeader className="border-b border-purple-200 pb-3">
            <DialogTitle className="text-lg font-semibold text-[#000050]">
              Edit BLS Measurement: {selectedMeasurement}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4 bg-purple-50/30 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
              {/* Placement Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Placement Name
                </label>
                <Input value={selectedPackage} readOnly disabled />
              </div>

              {/* BLS Measurement */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  BLS Measurement
                </label>
                <Input value={selectedMeasurement} readOnly disabled />
              </div>
              {FORM_COLUMNS.map((column) => (
                <div key={column} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {column}
                  </label>
                  <Input
                    value={formData[column] || ""}
                    onChange={(e) => handleInputChange(column, e.target.value)}
                    className="focus:ring-2 focus:ring-purple-400"
                    placeholder={`Enter ${column}`}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-purple-200 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setFormDialogOpen(false);
                setFormData({});
                setSelectedMeasurement("");
              }}
              className="border-[#000050] text-[#000050] hover:bg-[#000050]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="min-w-[140px] bg-[#000050] text-white hover:opacity-90"
            >
              {isSaving ? "Submitting..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudiesBLSTable;