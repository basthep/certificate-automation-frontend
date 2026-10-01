import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import api from "../api/axios";

interface Template {
  id: string;
  name: string;
  fileUrl: string;
  width: number | null;
  height: number | null;
  automationId: string;
}

interface PreviewField {
  id: string;
  fieldName: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: string;
  value: string;
}

interface PreviewResponse {
  template: Template;
  row: Record<string, unknown>;
  fields: PreviewField[];
}

const Preview = () => {
  const { automationId } = useParams<{
    automationId: string;
  }>();

  const [searchParams] = useSearchParams();

  const templateId = searchParams.get("templateId");
  const dataFileId = searchParams.get("dataFileId");

  const navigate = useNavigate();

  const [preview, setPreview] =
    useState<PreviewResponse | null>(null);

  const [rowIndex, setRowIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPreview = async (index: number) => {
    if (!templateId || !dataFileId) {
      setError("Missing template or data file.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        "/preview/certificate",
        {
          templateId,
          dataFileId,
          rowIndex: index,
        }
      );

      setPreview(response.data);
    } catch (error: any) {
      console.error("PREVIEW ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to generate preview."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview(rowIndex);
  }, [templateId, dataFileId, rowIndex]);

  const handlePrevious = () => {
    if (rowIndex === 0) return;

    setRowIndex((previous) => previous - 1);
  };

  const handleNext = () => {
    setRowIndex((previous) => previous + 1);
  };

  const handleGenerate = () => {
    navigate(
      `/automations/${automationId}/generate?templateId=${templateId}&dataFileId=${dataFileId}`
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Loading preview...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b bg-white px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              navigate(
                `/automations/${automationId}/mapping?templateId=${templateId}&dataFileId=${dataFileId}`
              )
            }
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="font-semibold">
              Certificate Preview
            </h1>

            <p className="text-xs text-gray-500">
              Review your generated document
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!preview}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Generate Certificates
          <ArrowRight size={17} />
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-3 text-sm">
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

          <div className="rounded-full bg-black px-4 py-2 text-white">
            4. Preview
          </div>

          <div className="h-px w-10 bg-gray-300" />

          <div className="rounded-full bg-gray-100 px-4 py-2 text-gray-500">
            5. Generate
          </div>          
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {preview && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Certificate preview */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {preview.template.name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Participant {rowIndex + 1}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={rowIndex === 0}
                    className="rounded-lg border p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="min-w-20 text-center text-sm text-gray-500">
                    {rowIndex + 1}
                  </span>

                  <button
                    onClick={handleNext}
                    className="rounded-lg border p-2 hover:bg-gray-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Certificate canvas */}
              <div className="flex justify-center overflow-auto rounded-xl bg-gray-100 p-6">
                <div
                  className="relative w-full max-w-4xl overflow-hidden bg-white shadow-lg"
                  style={{
                    aspectRatio:
                      preview.template.width &&
                      preview.template.height
                        ? `${preview.template.width}/${preview.template.height}`
                        : "1.414/1",
                  }}
                >
                  {/* Template image */}
                  <img
                    src={`http://localhost:5000${preview.template.fileUrl}`}
                    alt={preview.template.name}
                    className="absolute inset-0 h-full w-full object-contain"
                  />

                  {/* Dynamic fields */}
                  {preview.fields.map((field) => (
                    <div
                      key={field.id}
                      className="absolute whitespace-nowrap"
                      style={{
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        transform: "translate(-50%, -50%)",
                        fontSize: `${field.fontSize}px`,
                        fontFamily: field.fontFamily,
                        color: field.color,
                        textAlign:
                          field.alignment as
                            | "left"
                            | "center"
                            | "right",
                      }}
                    >
                      {field.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Data information */}
            <div className="h-fit rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="font-semibold">
                Participant Data
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Values used in this certificate
              </p>

              <div className="mt-6 space-y-4">
                {preview.fields.map((field) => (
                  <div
                    key={field.id}
                    className="border-b pb-3 last:border-b-0"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      {field.fieldName}
                    </p>

                    <p className="mt-1 wrap-break-word text-sm font-medium text-gray-800">
                      {field.value || "—"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="mt-6 border-t pt-5">
                <button
                  onClick={handleGenerate}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Generate Certificates
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Preview;

