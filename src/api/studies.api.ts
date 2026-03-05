export type CsvRow = Record<string, string>;

const BASE_URL = "https://ssot-backend.vercel.app/api/studies-bls";

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