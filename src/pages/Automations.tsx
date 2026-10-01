import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FolderKanban,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

interface Automation {
  id: string;
  name: string;
  type: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

const Automations = () => {
  const navigate = useNavigate();

  const [automations, setAutomations] = useState<Automation[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/automations");

        const automationData =
          response.data.automations ||
          response.data;

        const sortedAutomations = [...automationData].sort(
          (a: Automation, b: Automation) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

        setAutomations(sortedAutomations);
      } catch (error: any) {
        console.error(
          "AUTOMATIONS ERROR:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load automations."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAutomations();
  }, []);

  const handleDelete = async (
    event: React.MouseEvent,
    automationId: string,
    automationName: string
  ) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${automationName}"?\n\nThis will permanently delete this automation and its related data.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/automations/${automationId}`
      );

      setAutomations((current) =>
        current.filter(
          (automation) =>
            automation.id !== automationId
        )
      );
    } catch (error: any) {
      console.error(
        "DELETE AUTOMATION ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete automation."
      );
    }
  };

  const filteredAutomations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return automations;
    }

    return automations.filter((automation) => {
      return (
        automation.name
          .toLowerCase()
          .includes(query) ||
        automation.type
          .toLowerCase()
          .includes(query) ||
        automation.description
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [automations, search]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Loading automations...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-lg p-2 hover:bg-gray-100"
              title="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Automations
              </h1>

              <p className="text-xs text-gray-500">
                Manage your document automations
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              navigate("/automations/create")
            }
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={17} />
            Create Automation
          </button>
        </div>
      </header>

      {/* Main */}

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page heading */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              All Automations
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {automations.length}{" "}
              {automations.length === 1
                ? "automation"
                : "automations"}{" "}
              created
            </p>
          </div>

          {/* Search */}

          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search automations..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-500"
            />
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty state */}

        {!error &&
          filteredAutomations.length === 0 && (
            <div className="mt-8 rounded-xl border bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
                <FolderKanban
                  size={26}
                  className="text-gray-500"
                />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                {search
                  ? "No automations found"
                  : "No automations yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                {search
                  ? "Try a different search term."
                  : "Create your first automation to start generating documents."}
              </p>

              {!search && (
                <button
                  onClick={() =>
                    navigate("/automations/create")
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                  <Plus size={17} />
                  Create Automation
                </button>
              )}
            </div>
          )}

        {/* Automation list */}

        {filteredAutomations.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-xl border bg-white">
            {/* Table header */}

            <div className="hidden border-b bg-gray-50 px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 md:grid md:grid-cols-[1fr_180px_160px_80px] md:gap-6">
              <div>Automation</div>
              <div>Type</div>
              <div>Created</div>
              <div className="text-right">
                Actions
              </div>
            </div>

            {/* Rows */}

            <div className="divide-y">
              {filteredAutomations.map(
                (automation) => (
                  <div
                    key={automation.id}
                    className="group flex w-full flex-col gap-4 px-6 py-5 transition hover:bg-gray-50 md:grid md:grid-cols-[1fr_180px_160px_80px] md:items-center md:gap-6"
                  >
                    {/* Automation */}

                    <div
                      onClick={() =>
                        navigate(
                          `/automations/${automation.id}`
                        )
                      }
                      className="flex min-w-0 cursor-pointer items-center gap-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <FolderKanban
                          size={21}
                          className="text-gray-700"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">
                          {automation.name}
                        </p>

                        {automation.description ? (
                          <p className="mt-1 truncate text-sm text-gray-500">
                            {automation.description}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-400">
                            No description
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Type */}

                    <div>
                      <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {automation.type}
                      </span>
                    </div>

                    {/* Created */}

                    <div>
                      <p className="text-sm text-gray-600">
                        {new Date(
                          automation.createdAt
                        ).toLocaleDateString()}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(
                          automation.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Actions */}

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) =>
                          handleDelete(
                            event,
                            automation.id,
                            automation.name
                          )
                        }
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete automation"
                      >
                        <Trash2 size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/automations/${automation.id}`
                          )
                        }
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        title="Open automation"
                      >
                        <ArrowRight
                          size={18}
                          className="transition group-hover:translate-x-1"
                        />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Result count */}

        {search &&
          filteredAutomations.length > 0 && (
            <p className="mt-4 text-sm text-gray-500">
              Showing {filteredAutomations.length} of{" "}
              {automations.length} automations
            </p>
          )}
      </main>
    </div>
  );
};

export default Automations;
