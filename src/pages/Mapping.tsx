import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Link2,
} from "lucide-react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import api from "../api/axios";

interface TemplateField {
  id: string;
  fieldName: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: string;
}

interface DataFile {
  id: string;
  name: string;
  rowCount: number;
  columns: string[];
}

interface Mapping {
  id: string;
  templateFieldId: string;
  columnName: string;
}

const Mapping = () => {
  const navigate = useNavigate();
  const { automationId } = useParams<{
    automationId: string;
  }>();
  const [searchParams] = useSearchParams();

  const templateId = searchParams.get("templateId");
  const dataFileId = searchParams.get("dataFileId");

  const [fields, setFields] = useState<TemplateField[]>([]);
  const [dataFile, setDataFile] = useState<DataFile | null>(
    null
  );

  const [mappings, setMappings] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!templateId || !dataFileId) {
      setError("Missing template or data file.");
      setLoading(false);
      return;
    }

    loadData();
  }, [templateId, dataFileId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [fieldsResponse, dataResponse, mappingsResponse] =
        await Promise.all([
          api.get(
            `/template-fields/template/${templateId}`
          ),
          api.get(`/data/${dataFileId}`),
          api.get(`/mappings/template/${templateId}`),
        ]);

      const loadedFields =
        fieldsResponse.data.fields || [];

      const loadedDataFile =
        dataResponse.data.dataFile ||
        dataResponse.data;

      const loadedMappings =
        mappingsResponse.data.mappings || [];

      setFields(loadedFields);
      setDataFile(loadedDataFile);

      const mappingState: Record<string, string> = {};

      loadedMappings.forEach((mapping: Mapping) => {
        mappingState[mapping.templateFieldId] =
          mapping.columnName;
      });

      setMappings(mappingState);
    } catch (error: any) {
      console.error("MAPPING LOAD ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load mapping data."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (
    fieldId: string,
    columnName: string
  ) => {
    setMappings((previous) => ({
      ...previous,
      [fieldId]: columnName,
    }));
  };

  const handleSaveMappings = async () => {
    try {
      setSaving(true);
      setError("");

      const entries = Object.entries(mappings).filter(
        ([, columnName]) => columnName
      );

      for (const [templateFieldId, columnName] of entries) {
        await api.post("/mappings", {
          templateFieldId,
          columnName,
        });
      }

      navigate(
        `/automations/${automationId}/preview?templateId=${templateId}&dataFileId=${dataFileId}`
      );
    } catch (error: any) {
      console.error("SAVE MAPPING ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to save mappings."
      );
    } finally {
      setSaving(false);
    }
  };

  const mappedCount = Object.values(mappings).filter(
    Boolean
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Loading mapping...
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
                `/automations/${automationId}/data?templateId=${templateId}`
              )
            }
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="font-semibold">
              Field Mapping
            </h1>

            <p className="text-xs text-gray-500">
              Connect spreadsheet columns to template fields
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveMappings}
          disabled={saving || fields.length === 0}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving..." : "Next: Preview"}
          {!saving && <ArrowRight size={17} />}
        </button>
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

          <div className="rounded-full bg-black px-4 py-2 text-white">
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

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Data information */}
        {dataFile && (
          <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  {dataFile.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {dataFile.rowCount} rows •{" "}
                  {dataFile.columns.length} columns
                </p>
              </div>

              <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                {mappedCount}/{fields.length} mapped
              </div>
            </div>
          </div>
        )}

        {/* Mapping table */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="font-semibold">
              Map your fields
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select which spreadsheet column should fill
              each template field.
            </p>
          </div>

          <div className="divide-y">
            {fields.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-500">
                  No template fields found.
                </p>

                <button
                  onClick={() =>
                    navigate(
                      `/templates/${templateId}/editor`
                    )
                  }
                  className="mt-4 text-sm font-medium underline"
                >
                  Return to Template Editor
                </button>
              </div>
            ) : (
              fields.map((field) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-[1fr_auto_1fr] md:items-center"
                >
                  {/* Template field */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Template Field
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="rounded-lg bg-gray-100 p-2">
                        <Link2 size={17} />
                      </div>

                      <div>
                        <p className="font-medium">
                          {field.fieldName}
                        </p>

                        <p className="text-xs text-gray-400">
                          {field.fontFamily} •{" "}
                          {field.fontSize}px
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden text-gray-300 md:block">
                    →
                  </div>

                  {/* Spreadsheet column */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Spreadsheet Column
                    </p>

                    <select
                      value={
                        mappings[field.id] || ""
                      }
                      onChange={(event) =>
                        handleMappingChange(
                          field.id,
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                    >
                      <option value="">
                        Select a column
                      </option>

                      {dataFile?.columns.map(
                        (column) => (
                          <option
                            key={column}
                            value={column}
                          >
                            {column}
                          </option>
                        )
                      )}
                    </select>

                    {mappings[field.id] && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                        <Check size={14} />
                        Mapped
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom action */}
        {fields.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {mappedCount} of {fields.length} fields mapped
            </p>

            <button
              onClick={handleSaveMappings}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save & Continue"}

              {!saving && <ArrowRight size={17} />}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Mapping;
