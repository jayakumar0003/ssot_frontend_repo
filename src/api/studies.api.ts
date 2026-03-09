export type CsvRow = Record<string, string>;

const BASE_URL = "http://localhost:3000/api/studies-bls";

/* -----------------------------
   FETCH STUDIES BLS DATA
----------------------------- */
export async function fetchStudiesBlsApi(): Promise<CsvRow[]> {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch Studies BLS data");
  }

  const result = await response.json();
  console.log(result)
  return result.data;
}

/* -----------------------------
   CREATE STUDIES BLS ROW
----------------------------- */
export async function createStudiesBlsApi(payload: CsvRow): Promise<void> {
  const response = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create Studies BLS row");
  }
}

/* -----------------------------
   UPDATE STUDIES BLS ROW
----------------------------- */
export async function updateStudiesBlsApi(payload: CsvRow): Promise<void> {
  const response = await fetch(`${BASE_URL}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update Studies BLS row");
  }
}

/* -----------------------------
   FETCH PACKAGES BY DATE
----------------------------- */
export async function fetchPackagesByDateApi(
  startDate: string,
  endDate: string
): Promise<string[]> {
  const response = await fetch(
    `${BASE_URL}/filter-packages-by-date?startDate=${startDate}&endDate=${endDate}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch packages by date");
  }

  const result = await response.json();

  return result.packages || [];
}