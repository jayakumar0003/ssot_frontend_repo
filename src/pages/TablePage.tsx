// TablePage.tsx - UPDATED WITH CHANNEL SUPPORT
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo-wpp-media.png";
import RadiaplanTable, { CsvRow } from "@/components/tables/RadiaplanTable";
import MediaplanTable from "@/components/tables/MediaplanTable";
import CampaignOverviewTable from "@/components/tables/CampaignOverviewTable";
import TargetingAndAnalyticsTable from "@/components/tables/TargetingAndAnalyicsTable";
import {
  fetchMediaPlanApi,
  updateMediaPlanAndTargetingApi,
} from "@/api/mediaplan.api";
import { fetchRadiaPlanApi } from "@/api/radiaplan.api";
import { fetchCampaignApi } from "@/api/campaign.api";
import {
  fetchTargetingApi,
  updateByPackageAndPlacementApi,
  updateByPackageApi,
} from "@/api/targeting.api";
import { useData } from "@/context/DataContext";

// Define the tab structure
const tabs = [
  { id: "radia-plan", label: "Radia Plan" },
  { id: "media-plan", label: "Media Plan" },
  { id: "campaign-overview", label: "Campaign Overview" },
  { id: "targeting-analytics", label: "Targeting & Analytics" },
];

const TablePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { radiaPlanData: contextData } = useData();
  
  // Get selected advertiser, agency, and channel from navigation state
  const initialAdvertiser = location.state?.selectedAdvertiser || "";
  const initialAgency = location.state?.selectedAgency || "";
  const initialChannel = location.state?.selectedChannel || ""; // Add channel
  
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "radia-plan"
  );
  const [selectedAdvertiser, setSelectedAdvertiser] = useState(initialAdvertiser);
  const [selectedAgency, setSelectedAgency] = useState(initialAgency);
  const [selectedChannel, setSelectedChannel] = useState(initialChannel); // Add channel state

  // State for each tab's data
  const [radiaPlanData, setRadiaPlanData] = useState<CsvRow[]>([]);
  const [mediaPlanData, setMediaPlanData] = useState<CsvRow[]>([]);
  const [campaignOverviewData, setCampaignOverviewData] = useState<CsvRow[]>([]);
  const [targetingAnalyticsData, setTargetingAnalyticsData] = useState<CsvRow[]>([]);

  // State for loading and error for each tab
  const [radiaPlanLoading, setRadiaPlanLoading] = useState(true);
  const [mediaPlanLoading, setMediaPlanLoading] = useState(false);
  const [campaignOverviewLoading, setCampaignOverviewLoading] = useState(false);
  const [targetingAnalyticsLoading, setTargetingAnalyticsLoading] = useState(false);

  const [radiaPlanError, setRadiaPlanError] = useState<string | null>(null);
  const [mediaPlanError, setMediaPlanError] = useState<string | null>(null);
  const [campaignOverviewError, setCampaignOverviewError] = useState<string | null>(null);
  const [targetingAnalyticsError, setTargetingAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    if (location.state) {
      const newAgency = location.state?.selectedAgency || "";
      const newAdvertiser = location.state?.selectedAdvertiser || "";
      const newChannel = location.state?.selectedChannel || ""; // Add channel
      
      setSelectedAgency(newAgency);
      setSelectedAdvertiser(newAdvertiser);
      setSelectedChannel(newChannel); // Set channel
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Update radiaPlanData when contextData changes
  useEffect(() => {
    if (contextData && contextData.length > 0) {
      setRadiaPlanData(contextData);
      setRadiaPlanLoading(false);
    }
  }, [contextData]);

  // Method to load Radia Plan data (for refresh)
  const loadRadiaPlanData = async () => {
    try {
      setRadiaPlanLoading(true);
      console.log("Refreshing Radia Plan data from API...");
      const data = await fetchRadiaPlanApi();
      setRadiaPlanData(data);
      // Update context
      // Note: You need to get setRadiaPlanData from context
      setRadiaPlanError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setRadiaPlanError(
        `Failed to load Radia Plan data: ${errorMessage}. Please try again later.`
      );
      console.error("Error fetching Radia Plan data:", err);
    } finally {
      setRadiaPlanLoading(false);
    }
  };

  // Other data loading methods
  const loadMediaPlanData = async () => {
    try {
      setMediaPlanLoading(true);
      const data = await fetchMediaPlanApi();
      setMediaPlanData(data);
      setMediaPlanError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setMediaPlanError(
        `Failed to load Media Plan data: ${errorMessage}. Please try again later.`
      );
      console.error("Error fetching Media Plan data:", err);
    } finally {
      setMediaPlanLoading(false);
    }
  };

  const loadCampaignOverviewData = async () => {
    try {
      setCampaignOverviewLoading(true);
      const data = await fetchCampaignApi();
      setCampaignOverviewData(data);
      setCampaignOverviewError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setCampaignOverviewError(
        `Failed to load Campaign Overview data: ${errorMessage}. Please try again later.`
      );
      console.error("Error fetching Campaign Overview data:", err);
    } finally {
      setCampaignOverviewLoading(false);
    }
  };

  const loadTargetingAnalyticsData = async () => {
    try {
      setTargetingAnalyticsLoading(true);
      const data = await fetchTargetingApi();
      setTargetingAnalyticsData(data);
      setTargetingAnalyticsError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setTargetingAnalyticsError(
        `Failed to load Targeting & Analytics data: ${errorMessage}. Please try again later.`
      );
      console.error("Error fetching Targeting & Analytics data:", err);
    } finally {
      setTargetingAnalyticsLoading(false);
    }
  };

  // Update handlers
  async function updateByPackage(payload: CsvRow) {
    try {
      await updateByPackageApi(payload);
      await loadTargetingAnalyticsData();
    } catch (err) {
      alert("Failed to update package");
      throw err;
    }
  }

  async function updateByPackageAndPlacement(payload: CsvRow) {
    try {
      await updateByPackageAndPlacementApi(payload);
      await loadTargetingAnalyticsData();
    } catch (err) {
      alert("Failed to update record");
      throw err;
    }
  }

  async function updateMediaPlanAndTargeting(payload: CsvRow) {
    try {
      await updateMediaPlanAndTargetingApi(payload);
      await loadTargetingAnalyticsData();
      await loadMediaPlanData();
    } catch (err) {
      alert("Failed to update package");
      throw err;
    }
  }

  // Load other data when tab changes
  useEffect(() => {
    switch (activeTab) {
      case "media-plan":
        if (mediaPlanData.length === 0 && !mediaPlanLoading) {
          loadMediaPlanData();
        }
        break;
      case "campaign-overview":
        if (campaignOverviewData.length === 0 && !campaignOverviewLoading) {
          loadCampaignOverviewData();
        }
        break;
      case "targeting-analytics":
        if (targetingAnalyticsData.length === 0 && !targetingAnalyticsLoading) {
          loadTargetingAnalyticsData();
        }
        break;
      default:
        break;
    }
  }, [
    activeTab,
    mediaPlanData.length,
    mediaPlanLoading,
    campaignOverviewData.length,
    campaignOverviewLoading,
    targetingAnalyticsData.length,
    targetingAnalyticsLoading,
  ]);

  // Handle navigation from NavPanel
  const handleNavigate = (page: string) => {
    setActiveTab(page);
  };

  // // Handle refresh data for current tab
  // const handleRefreshData = () => {
  //   switch (activeTab) {
  //     case "radia-plan":
  //       loadRadiaPlanData();
  //       break;
  //     case "media-plan":
  //       loadMediaPlanData();
  //       break;
  //     case "campaign-overview":
  //       loadCampaignOverviewData();
  //       break;
  //     case "targeting-analytics":
  //       loadTargetingAnalyticsData();
  //       break;
  //     default:
  //       break;
  //   }
  // };

  // Helper function to get the current filter status display
  const getFilterStatus = () => {
    const parts = [];
    
    if (selectedAgency) parts.push(`Agency: ${selectedAgency}`);
    if (selectedAdvertiser && selectedAdvertiser !== "__AGENCY_ONLY__") {
      parts.push(`Advertiser: ${selectedAdvertiser}`);
    }
    if (selectedChannel) parts.push(`Channel: ${selectedChannel}`);
    
    if (parts.length === 0) {
      return "Showing all data";
    } else if (selectedAdvertiser === "__AGENCY_ONLY__" && selectedAgency) {
      return `Showing all advertisers for ${selectedAgency}`;
    } else {
      return `Showing data for ${parts.join(", ")}`;
    }
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "radia-plan":
        return (
          <div className="bg-white rounded-xl shadow-lg p-4">
            
            {radiaPlanLoading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <div className="text-gray-500">Loading Radia Plan data...</div>
                <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
              </div>
            ) : radiaPlanError ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-red-500 text-center p-4">
                  {radiaPlanError}
                </div>
                <button
                  onClick={loadRadiaPlanData}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : radiaPlanData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-gray-500 text-center p-4">
                  No Radia Plan data available
                </div>
                <button
                  onClick={loadRadiaPlanData}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Load Data
                </button>
              </div>
            ) : (
              <RadiaplanTable 
                data={radiaPlanData} 
                selectedAdvertiser={selectedAdvertiser}
                selectedAgency={selectedAgency}
                selectedChannel={selectedChannel} // Pass the channel prop
              />
            )}
          </div>
        );

      case "media-plan":
        return (
          <div className="bg-white rounded-xl shadow-lg p-4">
            {mediaPlanLoading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <div className="text-gray-500">Loading Media Plan data...</div>
              </div>
            ) : mediaPlanError ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-red-500 text-center p-4">
                  {mediaPlanError}
                </div>
                <button
                  onClick={loadMediaPlanData}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <MediaplanTable
                data={mediaPlanData}
                onSubmitMediaPlan={updateMediaPlanAndTargeting}
              />
            )}
          </div>
        );

      case "campaign-overview":
        return (
          <div className="bg-white rounded-xl shadow-lg p-4">
            {campaignOverviewLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">
                  Loading Campaign Overview data...
                </div>
              </div>
            ) : campaignOverviewError ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-red-500 text-center p-4">
                  {campaignOverviewError}
                </div>
                <button
                  onClick={loadCampaignOverviewData}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <CampaignOverviewTable data={campaignOverviewData} />
            )}
          </div>
        );

      case "targeting-analytics":
        return (
          <div className="bg-white rounded-xl shadow-lg p-4">
            {targetingAnalyticsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">
                  Loading Targeting & Analytics data...
                </div>
              </div>
            ) : targetingAnalyticsError ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-red-500 text-center p-4">
                  {targetingAnalyticsError}
                </div>
                <button
                  onClick={loadTargetingAnalyticsData}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <TargetingAndAnalyticsTable
                data={targetingAnalyticsData}
                onUpdateByPackage={updateByPackage}
                onUpdateByPackageAndPlacement={updateByPackageAndPlacement}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const title = "Single Source of Truth";

  return (
    <div className="min-h-screen bg-purple-500/60 ">
      {/* Top Header with Title and Logo */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-purple-200/40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            
            <h1 
            onClick={() => navigate("/", { state: { preserveData: true } })}
            className="text-3xl font-extrabold flex flex-wrap gap-x-3 leading-tight cursor-pointer">
              {title.split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="flex items-end">
                  {word.split("").map((char, charIndex) => (
                    <span
                      key={charIndex}
                      className={`
                        bg-gradient-to-t from-purple-600 to-pink-600
                        bg-clip-text text-transparent
                        transition-all duration-200
                        ${charIndex === 0 ? "text-4xl" : "text-3xl"}
                        ${charIndex % 2 === 0 ? "opacity-100" : "opacity-80"}
                      `}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <img src={logo} alt="WPP Media" className="h-10" />
          </div>
        </div>
      </div>

      {/* Always Open NavPanel on Left */}
      <div className="fixed left-2 top-0 h-full w-60 pt-20">
        <div className="h-full bg-white/95 backdrop-blur-sm border-r rounded-xl border-purple-200/40">
          <div className="p-4">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleNavigate(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div className="flex items-center">{tab.label}</div>
                </button>
              ))}
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pl-64 pt-20 p-6">
        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-full overflow-x-auto"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default TablePage;