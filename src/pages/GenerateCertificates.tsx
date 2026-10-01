import { useState } from "react";
import {
  ArrowLeft,
  FileImage,
  FileText,
  Image,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import api from "../api/axios";

type OutputFormat = "pdf" | "png" | "jpg";

const GenerateCertificates = () => {
  const { automationId } = useParams<{
    automationId: string;
  }>();

  const [searchParams] = useSearchParams();

  const templateId = searchParams.get("templateId");
  const dataFileId = searchParams.get("dataFileId");

  const selectedFormat = searchParams.get("outputFormat");

  const navigate = useNavigate();

  const [outputFormat, setOutputFormat] =
    useState<OutputFormat>(
      selectedFormat === "png" || selectedFormat === "jpg"
        ? selectedFormat
        : "pdf"
    );

  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!templateId || !dataFileId) {
      setError(
        "Missing template or data file information."
      );
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setSuccess(false);

      // Wait until certificate generation API is completed
      await api.post("/generate-bulk/certificates", {
        templateId,
        dataFileId,
        outputFormat,
      });

      // Generation completed successfully
      setSuccess(true);

      // Give the user a moment to see the success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error(
        "CERTIFICATE GENERATION ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to generate certificates."
      );

      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b bg-white px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (generating) return;

              navigate(
                `/automations/${automationId}/preview?templateId=${templateId}&dataFileId=${dataFileId}&outputFormat=${outputFormat}`
              );
            }}
            disabled={generating}
            className="rounded-lg p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="font-semibold">
              Generate Certificates
            </h1>

            <p className="text-xs text-gray-500">
              Generate documents for all participants
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Progress */}
        <div className="mb-10 flex items-center justify-center gap-3 text-sm">
          <div className="rounded-full bg-green-100 px-4 py-2 text-green-700">
            ✓ Template
          </div>

          <div className="h-px w-10 bg-gray-300" />

          <div className="rounded-full bg-green-100 px-4 py-2 text-green-700">
            ✓ Data
          </div>

          <div className="h-px w-10 bg-gray-300" />

          <div className="rounded-full bg-green-100 px-4 py-2 text-green-700">
            ✓ Mapping
          </div>

          <div className="h-px w-10 bg-gray-300" />

          <div className="rounded-full bg-green-100 px-4 py-2 text-green-700">
            ✓ Preview
          </div>

          <div className="h-px w-10 bg-gray-300" />

          <div className="rounded-full bg-black px-4 py-2 text-white">
            5. Generate
          </div>
        </div>

        {/* Main card */}
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              {generating ? (
                <Loader2
                  size={30}
                  className="animate-spin"
                />
              ) : success ? (
                <CheckCircle
                  size={30}
                  className="text-green-600"
                />
              ) : (
                <FileText size={30} />
              )}
            </div>

            <h2 className="mt-5 text-2xl font-semibold">
              {generating
                ? "Generating your certificates..."
                : success
                ? "Certificates generated successfully!"
                : "Generate your certificates"}
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
              {generating
                ? "Your certificates are currently being generated. Please stay on this page and do not close or refresh your browser."
                : success
                ? "Your certificates have been generated successfully. Redirecting you to the dashboard..."
                : "Your template and participant data are ready. Choose the output format and generate all certificates."}
            </p>
          </div>

          {/* Generating warning */}
          {generating && (
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-yellow-600"
              />

              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  Please stay on this page
                </p>

                <p className="mt-1 text-xs leading-5 text-yellow-700">
                  Certificate generation is in progress.
                  Do not close, refresh, or navigate away
                  from this page until the process is
                  complete.
                </p>
              </div>
            </div>
          )}

          {/* Format selection */}
          {!generating && !success && (
            <div className="mt-10">
              <h3 className="mb-4 text-sm font-semibold">
                Output format
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* PDF */}
                <button
                  type="button"
                  onClick={() =>
                    setOutputFormat("pdf")
                  }
                  className={`rounded-xl border-2 p-5 text-left transition ${
                    outputFormat === "pdf"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <FileText size={26} />

                  <p className="mt-4 font-semibold">
                    PDF
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Best for printing and sharing
                  </p>

                  {outputFormat === "pdf" && (
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium">
                      <CheckCircle size={14} />
                      Selected
                    </div>
                  )}
                </button>

                {/* PNG */}
                <button
                  type="button"
                  onClick={() =>
                    setOutputFormat("png")
                  }
                  className={`rounded-xl border-2 p-5 text-left transition ${
                    outputFormat === "png"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <FileImage size={26} />

                  <p className="mt-4 font-semibold">
                    PNG
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    High-quality image format
                  </p>

                  {outputFormat === "png" && (
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium">
                      <CheckCircle size={14} />
                      Selected
                    </div>
                  )}
                </button>

                {/* JPG */}
                <button
                  type="button"
                  onClick={() =>
                    setOutputFormat("jpg")
                  }
                  className={`rounded-xl border-2 p-5 text-left transition ${
                    outputFormat === "jpg"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Image size={26} />

                  <p className="mt-4 font-semibold">
                    JPG
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Smaller image files
                  </p>

                  {outputFormat === "jpg" && (
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium">
                      <CheckCircle size={14} />
                      Selected
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !generating && (
            <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle
                  className="mt-0.5 text-green-600"
                  size={21}
                />

                <div>
                  <h3 className="font-semibold text-green-800">
                    Generation completed successfully
                  </h3>

                  <p className="mt-1 text-sm text-green-700">
                    All certificates have been generated.
                    Redirecting to your dashboard...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || success}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Generating Certificates...
              </>
            ) : success ? (
              <>
                <CheckCircle size={18} />
                Generation Completed
              </>
            ) : (
              `Generate Certificates as ${outputFormat.toUpperCase()}`
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default GenerateCertificates;
