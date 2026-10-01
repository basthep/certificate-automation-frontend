import { ChangeEvent, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileSpreadsheet, Upload } from "lucide-react";
import api from "../api/axios";

interface DataFile {
  id: string;
  name: string;
  fileUrl: string;
  sheetName: string | null;
  rowCount: number;
  columns: string[];
}

const DataUpload = () => {
  const { automationId } = useParams<{ automationId: string }>();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("templateId");
  
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [dataFile, setDataFile] = useState<DataFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const extension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError("Please upload an Excel or CSV file.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
    setDataFile(null);
  };

  const handleUpload = async () => {
    if (!file || !automationId) {
      setError("Please select a file.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();

      formData.append("data", file);
      formData.append("automationId", automationId);

      const response = await api.post("/data/upload", formData);

      setDataFile(response.data.dataFile);
    } catch (error: any) {
      console.error("DATA UPLOAD ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to upload data file."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (!dataFile || !templateId) return;

    navigate(
      `/automations/${automationId}/mapping?templateId=${templateId}&dataFileId=${dataFile.id}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b bg-white px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              navigate(`/automations/${automationId}/template`)
            }
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="font-semibold">
              Upload Data
            </h1>

            <p className="text-xs text-gray-500">
              Upload participant data
            </p>
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={!dataFile}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next: Field Mapping →
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Step indicator */}
        <div className="mb-10 flex items-center justify-center gap-3 text-sm">
          <div className="rounded-full bg-green-100 px-4 py-2 text-green-700">
            ✓ Template
          </div>

          <div className="h-px w-10 bg-gray-300" />

          <div className="rounded-full bg-black px-4 py-2 text-white">
            2. Data
          </div>

          <div className="h-px w-10 bg-gray-300" />

          <div className="rounded-full bg-gray-100 px-4 py-2 text-gray-500">
            3. Mapping
          </div>

          <div className="h-px w-10 bg-gray-300" />

          <div className="rounded-full bg-gray-100 px-4 py-2 text-gray-500">
            4. Preview
          </div>

          <div className="h-px w-10 bg-gray-300" />

          <div className="rounded-full bg-gray-100 px-4 py-2 text-gray-500">
            5. Generate
          </div>          
        </div>

        {/* Upload card */}
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-xl font-semibold">
              Upload your data
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload an Excel or CSV file containing the
              participant information.
            </p>
          </div>

          {/* Upload area */}
          <label
            htmlFor="data-file"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-16 text-center transition hover:border-gray-500 hover:bg-gray-50"
          >
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <Upload size={28} />
            </div>

            <h3 className="font-medium">
              {file
                ? file.name
                : "Click to upload your file"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              XLSX, XLS or CSV
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Maximum file size: 10MB
            </p>

            <input
              id="data-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Upload button */}
          {file && !dataFile && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload size={17} />

                {uploading
                  ? "Uploading..."
                  : "Upload Data"}
              </button>
            </div>
          )}
        </div>

        {/* Uploaded file information */}
        {dataFile && (
          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-green-100 p-3 text-green-700">
                  <FileSpreadsheet size={26} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    {dataFile.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {dataFile.rowCount} rows
                    {dataFile.sheetName &&
                      ` • Sheet: ${dataFile.sheetName}`}
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Uploaded
              </span>
            </div>

            {/* Columns */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-medium">
                Detected columns
              </h4>

              <div className="flex flex-wrap gap-2">
                {dataFile.columns.map((column) => (
                  <span
                    key={column}
                    className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700"
                  >
                    {column}
                  </span>
                ))}
              </div>
            </div>

            {/* Success */}
            <div className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              Data uploaded successfully. You can now map
              spreadsheet columns to your template fields.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DataUpload;

