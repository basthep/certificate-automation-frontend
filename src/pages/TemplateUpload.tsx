import { ChangeEvent, FormEvent, useState } from "react";
import { ArrowLeft, Upload, FileImage } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const TemplateUpload = () => {
  const { automationId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please select a PNG or JPG image.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!automationId) {
      setError("Automation ID is missing.");
      return;
    }

    if (!file) {
      setError("Please select a template image.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter a template name.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("template", file);
      formData.append("name", name);
      formData.append("automationId", automationId);

      const response = await api.post(
        "/templates/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const template = response.data.template;

      navigate(`/templates/${template.id}/editor`);
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to upload template"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-xl font-bold">
              Upload Template
            </h1>

            <p className="text-sm text-gray-500">
              Upload the background for your document
            </p>
          </div>
        </div>
      </header>

      {/* Content */}

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">
              Document Template
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Start with a PNG or JPG certificate design.
              You will add dynamic fields in the next step.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Template name */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Template Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. Annual Sports Certificate"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            {/* File upload */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Template Image
              </label>

              <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition hover:border-gray-500 hover:bg-gray-100">
                {file ? (
                  <>
                    <FileImage
                      size={42}
                      className="text-green-600"
                    />

                    <p className="mt-4 font-medium text-gray-900">
                      {file.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {(
                        file.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </p>

                    <p className="mt-4 text-sm text-gray-500">
                      Click to choose another file
                    </p>
                  </>
                ) : (
                  <>
                    <Upload
                      size={42}
                      className="text-gray-400"
                    />

                    <p className="mt-4 font-medium text-gray-700">
                      Click to upload your template
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      PNG, JPG or JPEG · Maximum 10 MB
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Buttons */}

            <div className="flex justify-end gap-3 border-t pt-6">
              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload size={18} />

                {loading
                  ? "Uploading..."
                  : "Upload Template"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TemplateUpload;