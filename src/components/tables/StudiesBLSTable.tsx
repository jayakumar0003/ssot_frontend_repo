import React, { useMemo, useState, useEffect } from "react";
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
import {
  Download,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";
import { fetchPackagesByDateApi } from "@/api/studies.api";

export type CsvRow = Record<string, string>;

interface Props {
  targetingData: CsvRow[];
  studiesData: CsvRow[];
  selectedPackage: string;
  setSelectedPackage: (value: string) => void;
  onSubmit?: (payload: any) => Promise<void>;

  selectedPackages: string[];
  setSelectedPackages: React.Dispatch<React.SetStateAction<string[]>>;

  expandedPackages: Set<string>;
  setExpandedPackages: React.Dispatch<React.SetStateAction<Set<string>>>;
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
  selectedPackages,
  setSelectedPackages,
  expandedPackages,
  setExpandedPackages,
}: Props) => {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState("");
  const [selectedPackageForEdit, setSelectedPackageForEdit] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [campaignStartDate, setCampaignStartDate] = useState("");
  const [campaignEndDate, setCampaignEndDate] = useState("");

  useEffect(() => {
    async function loadPackagesByDate() {
      try {
        if (!campaignStartDate && !campaignEndDate) {
          setSelectedPackages([]);
        }

        const packages = await fetchPackagesByDateApi(
          campaignStartDate,
          campaignEndDate
        );

        if (packages.length === 0) {
          setSelectedPackages([]);
          return;
        }

        setSelectedPackages(packages);
      } catch (error) {
        console.error("Failed to fetch packages by date:", error);
      }
    }

    loadPackagesByDate();
  }, [campaignStartDate, campaignEndDate]);

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

  const togglePackage = (pkg: string) => {
    if (selectedPackages.includes(pkg)) {
      setSelectedPackages(selectedPackages.filter((p) => p !== pkg));
    } else {
      setSelectedPackages([...selectedPackages, pkg]);
    }
  };

  // Toggle package expansion
  const toggleExpandPackage = (pkg: string) => {
    setExpandedPackages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pkg)) {
        newSet.delete(pkg);
      } else {
        newSet.add(pkg);
      }
      return newSet;
    });
  };

  // Get measurements for each package
  const packageData = useMemo(() => {
    if (selectedPackages.length === 0) return [];

    const result: Array<{
      packageName: string;
      measurements: Array<{
        measurement: string;
        data: any;
      }>;
    }> = [];

    selectedPackages.forEach((pkg) => {
      const targetingRow = targetingData.find(
        (row) => row.RADIA_OR_PRISMA_PACKAGE_NAME === pkg
      );

      if (!targetingRow) {
        result.push({
          packageName: pkg,
          measurements: [],
        });
        return;
      }

      if (!targetingRow.BLS_MEASUREMENT) {
        result.push({
          packageName: pkg,
          measurements: [],
        });
        return;
      }

      const measurements = targetingRow.BLS_MEASUREMENT.split(",").map((m) =>
        m.trim()
      );

      const measurementData = measurements.map((measurement) => {
        const studyRow = studiesData.find(
          (row) =>
            row.PACKAGE_NAME === pkg && row.BLS_MEASUREMENT === measurement
        );

        return {
          measurement,
          data: studyRow || null,
        };
      });

      result.push({
        packageName: pkg,
        measurements: measurementData,
      });
    });

    return result;
  }, [selectedPackages, targetingData, studiesData]);

  // Handle clicking on BLS Measurement
  const handleMeasurementClick = (measurement: string, pkg: string) => {
    setSelectedMeasurement(measurement);
    setSelectedPackageForEdit(pkg);

    const existingRow = studiesData.find(
      (row) => row.PACKAGE_NAME === pkg && row.BLS_MEASUREMENT === measurement
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
    const allMeasurements = packageData.flatMap((pkg) =>
      pkg.measurements.map((m) => ({
        packageName: pkg.packageName,
        measurement: m.measurement,
        data: m.data,
      }))
    );

    if (!allMeasurements.length) {
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

    const rows = allMeasurements.map((row) => [
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
    link.download = `studies_bls_${selectedPackages[0] || "export"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPackageCSV = (pkg: any) => {
    const rows = pkg.measurements.map((m: any) => [
      pkg.packageName,
      m.measurement,
      m.data?.SURVEY_COMPANIES || "",
      m.data?.SURVEY_METHODOLOGY || "",
      m.data?.CAMPAIGN_OBJECTIVE_KPI || "",
      m.data?.AD_SPEND_MINIMUMS || "",
      m.data?.AD_SET_CHANNEL_TYPES || "",
      m.data?.STUDY_FEES || "",
      m.data?.STUDY_BRAND_SAFETY || "",
      m.data?.SURVEY_QUESTIONS || "",
      m.data?.TARGET_AUDIENCE || "",
      m.data?.FLIGHT_DATES || "",
      m.data?.BRAND || "",
    ]);

    const headers = [
      "PACKAGE_NAME",
      "MEASUREMENT_STUDIES",
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

    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${pkg.packageName}_studies.csv`;
    link.click();
  };

  const downloadMeasurementCSV = (packageName: string, item: any) => {
    const headers = [
      "PACKAGE_NAME",
      "MEASUREMENT_STUDIES",
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

    const row = [
      packageName,
      item.measurement,
      item.data?.SURVEY_COMPANIES || "",
      item.data?.SURVEY_METHODOLOGY || "",
      item.data?.CAMPAIGN_OBJECTIVE_KPI || "",
      item.data?.AD_SPEND_MINIMUMS || "",
      item.data?.AD_SET_CHANNEL_TYPES || "",
      item.data?.STUDY_FEES || "",
      item.data?.STUDY_BRAND_SAFETY || "",
      item.data?.SURVEY_QUESTIONS || "",
      item.data?.TARGET_AUDIENCE || "",
      item.data?.FLIGHT_DATES || "",
      item.data?.BRAND || "",
    ];

    const csv = [headers, row]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${packageName}_${item.measurement}.csv`;
    link.click();
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      const currentSelectedPackage = selectedPackageForEdit;

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
      setFormData({});
      setSelectedMeasurement("");
      setSelectedPackageForEdit("");
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

  const totalMeasurements = packageData.reduce(
    (acc, pkg) => acc + pkg.measurements.length,
    0
  );

  const isFieldDisabled = (column: string) => {
    const measurement = selectedMeasurement.toLowerCase();
  
    if (measurement === "bls" && column === "Campaign Objective/KPI") {
      return true;
    }
  
    if (
      (measurement === "study1" || measurement === "study2") &&
      column === "Ad Spend Minimums"
    ) {
      return true;
    }
  
    return false;
  };

  return (
    <div className="bg-white rounded-xl border border-purple-200/40 shadow-lg overflow-hidden">
      {/* FILTER BAR */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50/30 border-b border-purple-200/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-purple-700 mb-1 tracking-wide">
                PACKAGE NAME
              </label>
              <div className="relative">
                <div className="relative w-[320px]">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full text-sm border-2 border-purple-300 rounded-lg px-3 py-2 bg-white flex items-center"
                  >
                    <span className="truncate flex-1 text-left">
                      {selectedPackages.length === 0
                        ? "Select Package"
                        : selectedPackages.join(", ")}
                    </span>

                    <ChevronDown
                      className={`w-4 h-4 text-purple-500 ml-2 flex-shrink-0 transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute z-50 mt-2 bg-white border border-purple-200 rounded-xl shadow-lg max-h-56 overflow-y-auto ">
                      {packageOptions.map((pkg) => (
                        <div
                          key={pkg}
                          onClick={() => togglePackage(pkg)}
                          className="flex items-center px-3 py-2 hover:bg-purple-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPackages.includes(pkg)}
                            readOnly
                            className="mr-2"
                          />

                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            {pkg}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* CAMPAIGN START DATE FILTER */}
            <div>
              <label className="block text-xs font-semibold text-purple-700 mb-1 tracking-wide">
                CAMPAIGN START DATE
              </label>

              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={campaignStartDate}
                  onChange={(e) => setCampaignStartDate(e.target.value)}
                  className="border-2 border-purple-300 text-xs"
                />

                <span className="text-gray-400 text-xs">to</span>

                <Input
                  type="date"
                  value={campaignEndDate}
                  onChange={(e) => setCampaignEndDate(e.target.value)}
                  className="border-2 border-purple-300 text-xs"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleExportCSV}
            disabled={!totalMeasurements}
            className="flex items-center gap-2 text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md mt-5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-auto max-h-[155vh]">
        <table className="w-full text-xs">
          {/* HEADER */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#000050]">
              {[
                "Package Name",
                "Measurement Studies",
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
              ].map((header, index) => {
                const isHighlight =
                  header === "Package Name" || header === "Measurement Studies";

                return (
                  <th
                    key={index}
                    className={`
                      uppercase font-semibold px-3 py-2.5 text-[10px] tracking-wider whitespace-nowrap border-r border-[#000050]/30 last:border-r-0
                      ${
                        isHighlight
                          ? "bg-teal-700 text-white"
                          : "bg-[#000050] text-white"
                      }
                      `}
                  >
                    {header}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {selectedPackages.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <FileText className="w-12 h-12 mb-3 text-purple-300" />
                    <p className="text-sm font-medium text-gray-500">
                      No packages selected
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Select packages from the dropdown above
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              packageData.map((pkg, pkgIndex) => {
                const isExpanded = expandedPackages.has(pkg.packageName);
                const hasMeasurements = pkg.measurements.length > 0;

                return (
                  <React.Fragment key={pkg.packageName}>
                    {/* Package Row */}
                    <tr
                      onMouseEnter={() =>
                        setHoveredRow(`pkg-${pkg.packageName}`)
                      }
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`
                        transition-all duration-200 cursor-pointer
                        ${
                          hoveredRow === `pkg-${pkg.packageName}`
                            ? "bg-purple-200/50 shadow-md"
                            : ""
                        }
                        font-medium
                      `}
                      onClick={() =>
                        hasMeasurements && toggleExpandPackage(pkg.packageName)
                      }
                    >
                      <td className="px-3 py-2.5 border-b border-r border-[#000050]/30 text-[10px] text-gray-800">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-10 h-10 text-purple-600" />
                          ) : (
                            <ChevronRight className="w-10 h-10 text-purple-600" />
                          )}

                          <span className="font-semibold">
                            {pkg.packageName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">
                              {pkg.measurements.length}
                            </span>

                            <Download
                              className="w-4 h-4 text-purple-600 cursor-pointer hover:text-purple-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadPackageCSV(pkg);
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td
                        colSpan={12}
                        className="px-3 py-2.5 border-b border-r border-[#000050]/30 text-[10px] text-gray-500 italic"
                      >
                        {hasMeasurements
                          ? isExpanded
                            ? ""
                            : pkg.measurements
                                .map((m) => m.measurement)
                                .join(", ")
                          : "No Studies available"}
                      </td>
                    </tr>

                    {/* Measurement Rows (shown when expanded) */}
                    {isExpanded &&
                      hasMeasurements &&
                      pkg.measurements.map((item, mIndex) => (
                        <tr
                          key={`${pkg.packageName}-${mIndex}`}
                          onMouseEnter={() =>
                            setHoveredRow(`meas-${pkg.packageName}-${mIndex}`)
                          }
                          onMouseLeave={() => setHoveredRow(null)}
                          className={`
                          transition-all duration-200
                          bg-white
                          ${
                            hoveredRow === `meas-${pkg.packageName}-${mIndex}`
                              ? "bg-purple-50/80 shadow-sm"
                              : ""
                          }
                        `}
                        >
                          <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-500 pl-8"></td>

                          <td
                            className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] cursor-pointer group"
                            onClick={() =>
                              handleMeasurementClick(
                                item.measurement,
                                pkg.packageName
                              )
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-md
        ${
          hoveredRow === `meas-${pkg.packageName}-${mIndex}`
            ? "bg-purple-200 text-purple-900"
            : "bg-purple-100 text-purple-800"
        }
        hover:bg-purple-200 hover:text-purple-900 transition-all duration-200
      `}
                              >
                                <span>{item.measurement}</span>

                                <Edit2
                                  className={`w-3 h-3 ${
                                    hoveredRow ===
                                    `meas-${pkg.packageName}-${mIndex}`
                                      ? "opacity-100"
                                      : "opacity-0 group-hover:opacity-100"
                                  } transition-opacity`}
                                />
                              </div>

                              <Download
                                className="w-3.5 h-3.5 text-purple-600 cursor-pointer hover:text-purple-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadMeasurementCSV(pkg.packageName, item);
                                }}
                              />
                            </div>
                          </td>

                          <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                            {item.data?.SURVEY_COMPANIES || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                            {item.data?.SURVEY_METHODOLOGY || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td
                            className={`px-3 py-2 border-b border-r border-[#000050]/30 text-[10px]
                              ${
                                item.measurement === "BLS"
                                  ? "bg-gray-200 text-gray-400"
                                  : "text-gray-600"
                              }`}
                          >
                            {item.measurement === "BLS"
                              ? ""
                              : item.data?.CAMPAIGN_OBJECTIVE_KPI || (
                                  <span className="text-gray-400">—</span>
                                )}
                          </td>
                          <td
                            className={`px-3 py-2 border-b border-r border-[#000050]/30 text-[10px]
                              ${
                                item.measurement === "study1" ||
                                item.measurement === "study2"
                                  ? "bg-gray-200 text-gray-400"
                                  : "text-gray-600"
                              }`}
                          >
                            {item.measurement === "Study1" ||
                            item.measurement === "Study2"
                              ? ""
                              : item.data?.AD_SPEND_MINIMUMS || (
                                  <span className="text-gray-400">—</span>
                                )}
                          </td>
                          <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                            {item.data?.AD_SET_CHANNEL_TYPES || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                            {item.data?.STUDY_FEES || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                            {item.data?.STUDY_BRAND_SAFETY || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                            {item.data?.SURVEY_QUESTIONS || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                            {item.data?.TARGET_AUDIENCE || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                            {item.data?.FLIGHT_DATES || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-b border-r border-[#000050]/30 text-[10px] text-gray-600">
                            {item.data?.BRAND || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FORM DIALOG */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-w-4xl max-h-[85vh] bg-white border border-purple-200 rounded-2xl shadow-2xl"
        >
          <DialogHeader className="border-b border-purple-200 pb-3">
            <DialogTitle className="text-lg font-semibold text-[#000050]">
              Edit Studies Measurement: {selectedMeasurement}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4 bg-purple-50/30 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
              {/* Package Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Package Name
                </label>
                <Input value={selectedPackageForEdit || ""} readOnly disabled />
              </div>

              {/* BLS Measurement */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Measurement Studies
                </label>
                <Input value={selectedMeasurement || ""} readOnly disabled />
              </div>

              {FORM_COLUMNS.map((column) => {
                const disabled = isFieldDisabled(column);

                if (disabled) return null; // completely remove the input

                return (
                  <div key={column} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {column}
                    </label>

                    <Input
                      value={formData[column] || ""}
                      onChange={(e) =>
                        handleInputChange(column, e.target.value)
                      }
                      className="focus:ring-2 focus:ring-purple-400"
                      placeholder={`Enter ${column}`}
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-purple-200 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setFormDialogOpen(false);
                setFormData({});
                setSelectedMeasurement("");
                setSelectedPackageForEdit("");
              }}
              className="border-[#000050] text-[#000050] hover:bg-[#000050]/10"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="min-w-[140px] bg-[#000050] text-white hover:opacity-90"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudiesBLSTable;
