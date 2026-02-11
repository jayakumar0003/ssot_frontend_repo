import { useRef, useState, useEffect } from "react";
import { ChevronDown, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import bg from "../assets/bg-image-2.png";
import { fetchRadiaPlanApi } from "@/api/radiaplan.api";
import { CsvRow } from "@/components/tables/RadiaplanTable";
import { useData } from "@/context/DataContext";

const HeroSection = () => {
  const navigate = useNavigate();
  const { radiaPlanData: contextData, setRadiaPlanData } = useData();

  // Set "All Agencies" as default (empty string represents All Agencies)
  const [selectedAgency, setSelectedAgency] = useState("");
  // Don't select any advertiser by default
  const [selectedAdvertiser, setSelectedAdvertiser] = useState("");
  const [isAgencyOpen, setIsAgencyOpen] = useState(false);
  const [isAdvertiserOpen, setIsAdvertiserOpen] = useState(false);
  const agencyDropdownRef = useRef<HTMLDivElement>(null);
  const advertiserDropdownRef = useRef<HTMLDivElement>(null);

  // State for fetched data
  const [agencies, setAgencies] = useState<string[]>([]);
  const [advertisers, setAdvertisers] = useState<string[]>([]);
  const [allAdvertisers, setAllAdvertisers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedData, setFetchedData] = useState<CsvRow[]>([]);

  const [agencySearch, setAgencySearch] = useState("");
  const [advertiserSearch, setAdvertiserSearch] = useState("");

  const filteredAgencies = agencies.filter((agency) =>
    agency.toLowerCase().includes(agencySearch.toLowerCase())
  );

  const filteredAdvertisers = advertisers.filter((advertiser) =>
    advertiser.toLowerCase().includes(advertiserSearch.toLowerCase())
  );

  // Add this ref to track if data was already fetched
  const hasFetchedData = useRef(false);

  // Fetch data on component mount
  useEffect(() => {
    // Only fetch if we haven't fetched before
    if (!hasFetchedData.current) {
      fetchData();
      hasFetchedData.current = true;
    }
  }, []);

  // Filter advertisers when agency is selected
  useEffect(() => {
    if (selectedAgency && fetchedData.length > 0) {
      const filteredData = fetchedData.filter(
        (row) => row.AGENCY_NAME === selectedAgency
      );

      const agencyAdvertisers = Array.from(
        new Set(
          filteredData.map((d) => d.ADVERTISER_NAME || "").filter(Boolean)
        )
      ).sort();

      setAdvertisers(agencyAdvertisers);

      // Reset selected advertiser if it's not in the new list
      if (
        selectedAdvertiser &&
        !agencyAdvertisers.includes(selectedAdvertiser)
      ) {
        setSelectedAdvertiser("");
      }
    } else if (fetchedData.length > 0) {
      // If "All Agencies" is selected or no agency selected, show all advertisers
      setAdvertisers(allAdvertisers);
    }
  }, [selectedAgency, fetchedData, allAdvertisers]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        agencyDropdownRef.current &&
        !agencyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAgencyOpen(false);
      }
      if (
        advertiserDropdownRef.current &&
        !advertiserDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAdvertiserOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data from API
  const fetchData = async () => {
    // Check if data is already loaded in context
    if (contextData.length > 0) {
      console.log("Using cached data from context");
      useCachedData(contextData);
      return;
    }

    try {
      setLoading(true);
      const data: CsvRow[] = await fetchRadiaPlanApi();
      setFetchedData(data);
      setRadiaPlanData(data);

      // Extract unique agencies and advertisers
      extractAndSetData(data);
      setError(null);
    } catch (err) {
      setError("Failed to load data. Please try again later.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to use cached data
  const useCachedData = (data: CsvRow[]) => {
    setFetchedData(data);
    extractAndSetData(data);
    setLoading(false);
  };

  // Helper function to extract data
  const extractAndSetData = (data: CsvRow[]) => {
    const uniqueAgencies = Array.from(
      new Set(data.map((d) => d.AGENCY_NAME || "").filter(Boolean))
    ).sort();

    const uniqueAdvertisers = Array.from(
      new Set(data.map((d) => d.ADVERTISER_NAME || "").filter(Boolean))
    ).sort();

    setAgencies(uniqueAgencies);
    setAllAdvertisers(uniqueAdvertisers);
    setAdvertisers(uniqueAdvertisers);
  };

  // Handle Go button click
  const handleGo = () => {
    if (loading) return;

    // Create navigation state
    const navState: any = {};

    // If agency is selected but advertiser is not, pass "__AGENCY_ONLY__" as advertiser
    if (selectedAgency && !selectedAdvertiser) {
      navState.selectedAdvertiser = "__AGENCY_ONLY__";
      navState.agencyFilter = selectedAgency; // Pass the agency name separately
    }
    // If advertiser is selected
    else if (selectedAdvertiser) {
      navState.selectedAdvertiser = selectedAdvertiser;
    }
    // If nothing is selected (both are "All")
    else {
      navState.selectedAdvertiser = ""; // Empty means show all
    }

    navigate("/table", {
      state: navState,
    });
  };

  const handleAgencySelect = (agency: string) => {
    setSelectedAgency(agency);
    setAgencySearch(""); // reset search
    setIsAgencyOpen(false);
  };

  const handleAdvertiserSelect = (advertiser: string) => {
    setSelectedAdvertiser(advertiser);
    setAdvertiserSearch(""); // reset search
    setIsAdvertiserOpen(false);
  };

  const handleRetry = () => {
    setError(null);
    fetchData();
  };

  // Determine if Go button should be enabled
  const isGoButtonEnabled = !loading && fetchedData.length > 0;

  // Helper function for display text
  const getDisplayText = () => {
    if (!selectedAdvertiser && !selectedAgency) {
      return "Will show all data in table";
    } else if (!selectedAdvertiser && selectedAgency) {
      return `Will show all advertisers for ${selectedAgency}`;
    } else if (selectedAdvertiser && !selectedAgency) {
      return `Will show ${selectedAdvertiser} data across all agencies`;
    } else {
      return `Will show ${selectedAdvertiser} data for ${selectedAgency}`;
    }
  };

  return (
    <div className="min-h-screen overflow-visible">
      <section className="relative min-h-screen flex items-center px-6 lg:px-16">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/60 via-purple-500/60 to-purple-800/80" />
        </div>

        {/* Content */}
        <div className="container mx-auto w-full relative z-10">
        <div className="flex justify-center items-center mt-16 mb-40 text-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full max-w-md lg:max-w-lg -translate-y-10"
            >
              {/* Centered Welcome Text */}
              <p className="text-purple-200 font-semibold tracking-wide text-lg mt-6 text-center">
                Welcome To
              </p>

              {/* Centered SSOT Title */}
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-3 text-white leading-none text-center">
                SSOT
              </h1>

              {/* Centered Subtitle */}
              <p className="text-white font-semibold text-md md:text-xl mb-8 text-center tracking-wide">
                Select your Agency & Advertiser
              </p>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl">
                  <p className="text-red-200 text-sm">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 px-3 py-1 bg-red-500/30 text-white text-xs rounded-lg hover:bg-red-500/40 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Dropdowns in a row */}
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6 w-full">
              {/* <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10"> */}
                {/* Agency Dropdown */}
                <div className="relative" ref={agencyDropdownRef}>
                  <div className="mb-2">
                  <label className="text-white ml-2 font-medium text-sm block text-center md:text-left">
                      Agency
                    </label>
                  </div>
                  <button
                    onClick={() => setIsAgencyOpen(!isAgencyOpen)}
                    disabled={loading}
                    className="w-80 flex items-center justify-between px-4 py-2 rounded-xl bg-gray-900/90 backdrop-blur-sm border border-purple-400/40 text-white hover:bg-gray-800/90 hover:border-purple-400/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span
                      className={
                        selectedAgency
                          ? "font-medium text-sm md:text-xs"
                          : "text-purple-200/80 text-sm md:text-sm"
                      }
                    >
                      {loading
                        ? "Loading..."
                        : selectedAgency || "All Agencies"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-purple-300 transition-transform ${
                        isAgencyOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isAgencyOpen && !loading && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full translate-y-[-6px] w-full rounded-xl bg-gray-900 border border-purple-500/40 shadow-2xl z-[999] overflow-hidden"
                      >
                        <div className="max-h-[35vh] overflow-y-auto">
                          {/* Option to clear agency selection (All Agencies) */}
                          <div className="p-3 border-b border-purple-500/20">
                            <input
                              type="text"
                              placeholder="Search agency..."
                              value={agencySearch}
                              onChange={(e) => setAgencySearch(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm outline-none border border-purple-500/30 focus:border-purple-400"
                            />
                          </div>
                          <button
                            onClick={() => handleAgencySelect("")}
                            className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-purple-500/20 transition border-b border-purple-500/20"
                          >
                            <span className="flex-1 text-left text-sm">
                              All Agencies
                            </span>
                            {!selectedAgency && (
                              <Check className="w-4 h-4 text-purple-300" />
                            )}
                          </button>

                          {filteredAgencies.map((agency) => (
                            <button
                              key={agency}
                              onClick={() => handleAgencySelect(agency)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-purple-500/20 transition border-b border-purple-500/20 last:border-none"
                            >
                              <span className="flex-1 text-left text-sm">
                                {agency}
                              </span>
                              {selectedAgency === agency && (
                                <Check className="w-4 h-4 text-purple-300" />
                              )}
                            </button>
                          ))}

                          {agencies.length === 0 && !loading && (
                            <div className="px-4 py-3.5 text-purple-200/80 text-sm">
                              No agencies found
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Advertiser Dropdown */}
                <div className="relative" ref={advertiserDropdownRef}>
                  <div className="mb-2">
                  <label className="text-white ml-2 font-medium text-sm block text-center md:text-left">
                      Advertiser
                    </label>
                  </div>
                  <button
                    onClick={() => setIsAdvertiserOpen(!isAdvertiserOpen)}
                    disabled={loading || advertisers.length === 0}
                    className="w-80 flex items-center justify-between px-4 py-2 rounded-xl bg-gray-900/90 backdrop-blur-sm border border-purple-400/40 text-white hover:bg-gray-800/90 hover:border-purple-400/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span
                      className={
                        selectedAgency
                          ? "font-medium text-sm md:text-xs"
                          : "text-purple-200/80 text-sm md:text-sm"
                      }
                    >
                      {loading
                        ? "Loading..."
                        : advertisers.length === 0
                        ? "No advertisers"
                        : selectedAdvertiser || "All Advertisers"}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-purple-300 transition-transform ${
                        isAdvertiserOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isAdvertiserOpen && !loading && advertisers.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full translate-y-[-6px] w-full rounded-xl bg-gray-900 border border-purple-500/40 shadow-2xl z-[999] overflow-hidden"
                      >
                        <div className="max-h-[35vh] overflow-y-auto">
                          {/* Option for All Advertisers */}
                          <div className="p-3 border-b border-purple-500/20">
                            <input
                              type="text"
                              placeholder="Search advertiser..."
                              value={advertiserSearch}
                              onChange={(e) =>
                                setAdvertiserSearch(e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm outline-none border border-purple-500/30 focus:border-purple-400"
                            />
                          </div>
                          <button
                            onClick={() => handleAdvertiserSelect("")}
                            className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-purple-500/20 transition border-b border-purple-500/20"
                          >
                            <span className="flex-1 text-left text-sm">
                              All Advertisers
                            </span>
                            {!selectedAdvertiser && (
                              <Check className="w-4 h-4 text-purple-300" />
                            )}
                          </button>

                          {filteredAdvertisers.map((advertiser) => (
                            <button
                              key={advertiser}
                              onClick={() => handleAdvertiserSelect(advertiser)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-purple-500/20 transition border-b border-purple-500/20 last:border-none"
                            >
                              <span className="flex-1 text-left text-sm">
                                {advertiser}
                              </span>
                              {selectedAdvertiser === advertiser && (
                                <Check className="w-4 h-4 text-purple-300" />
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Go Button below dropdowns */}
              <div className="pt-2">
                <motion.button
                  onClick={handleGo}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!isGoButtonEnabled}
                  className="w-full px-8 py-3 rounded-xl bg-gradient-to-r from-purple-800 to-pink-600 text-white font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                >
                  {loading ? "Loading..." : "Go"}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
