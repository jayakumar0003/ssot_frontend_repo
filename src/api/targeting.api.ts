export type CsvRow = Record<string, string>;

const BASE_URL = "https://ssot-backend.vercel.app/api/targeting";

// -----------------------------
// FETCH TARGETING DATA
// -----------------------------
export async function fetchTargetingApi(): Promise<CsvRow[]> {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const result = await response.json();
  return result.data;
}

// -----------------------------
// UPDATE BY PACKAGE
// -----------------------------
export async function updateByPackageApi(payload: CsvRow): Promise<void> {
  const response = await fetch(`${BASE_URL}/by-package`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update package");
  }
}

// -----------------------------
// UPDATE BY PACKAGE + PLACEMENT
// -----------------------------
export async function updateByPackageAndPlacementApi(
  payload: CsvRow
): Promise<void> {
  const response = await fetch(`${BASE_URL}/by-package-and-placement`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update record");
  }
}

// NEW: Update Audience Info API
export async function updateAudienceInfoApi(
  packageName: string,
  placementName: string,
  audiences: string[]
): Promise<void> {
  const payload = {
    RADIA_OR_PRISMA_PACKAGE_NAME: packageName,
    PLACEMENTNAME: placementName,
    audiences: audiences,
  };

  const response = await fetch(`${BASE_URL}/audience-info`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update audience info");
  }
}

// Optional: Fetch audience options from backend
export async function fetchAudienceOptionsApi(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/audience-options`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch audience options");
  }

  const result = await response.json();
  return result.data;
}
