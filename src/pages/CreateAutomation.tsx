import { FormEvent, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateAutomation = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [type, setType] = useState("Certificate");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/automations", {
        name,
        type,
        description,
      });

      const automation = response.data.automation;

      // After creating automation,
      // move directly to template upload.
      navigate(`/automations/${automation.id}/template`);
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to create automation"
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
            onClick={() => navigate("/dashboard")}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Create Automation
            </h1>

            <p className="text-sm text-gray-500">
              Set up a new document automation
            </p>
          </div>
        </div>
      </header>

      {/* Form */}

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Automation Details
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Tell us what type of documents you want to
              automate.
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
            {/* Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Automation Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. Annual Competition Certificates"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Type */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Document Type
              </label>

              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value="Certificate">
                  Certificate
                </option>

                <option value="Invoice">
                  Invoice
                </option>

                <option value="Sales Report">
                  Sales Report
                </option>

                <option value="Payslip">
                  Payslip
                </option>

                <option value="Offer Letter">
                  Offer Letter
                </option>
              </select>
            </div>

            {/* Description */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
                <span className="ml-1 text-gray-400">
                  (optional)
                </span>
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe what this automation is used for..."
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Submit */}

            <div className="flex justify-end gap-3 border-t pt-6">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={18} />

                {loading
                  ? "Creating..."
                  : "Create Automation"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateAutomation;