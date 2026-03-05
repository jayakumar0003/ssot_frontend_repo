
export type CsvRow = Record<string, string>;

const BASE_URL = "https://ssot-backend.vercel.app/api/radiaplan";

// -----------------------------
// FETCH RADIA PLAN
// -----------------------------
export async function fetchRadiaPlanApi(): Promise<CsvRow[]> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch Radia plan data");
  }

  const result = await response.json();
  console.log(result.data)
  return result.data;
}