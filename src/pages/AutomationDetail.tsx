import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";

interface Automation {
  id: string;
  name: string;
  type: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Certificate {
  id: string;
  participantName: string;
  email: string;
  format: string;
  status: string;
  createdAt: string;
}

interface AutomationDetailResponse {
  automation: Automation;
  certificates: Certificate[];
  stats: {
    certificates: number;
    sent: number;
    failed: number;
  };
}

const AutomationDetail = () => {
  const { automationId } = useParams<{
    automationId: string;
  }>();

  const navigate = useNavigate();

  const [data, setData] =
    useState<AutomationDetailResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAutomationDetail = async () => {
      if (!automationId) {
        setError("Automation ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/automations/${automationId}`
        );

        setData(response.data);
      } catch (error: any) {
        console.error(
          "AUTOMATION DETAIL ERROR:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load automation."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAutomationDetail();
  }, [automationId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Loading automation...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-sm text-red-500">
            {error || "Automation not found."}
          </p>

          <button
            onClick={() =>
              navigate("/automations")
            }
            className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Back to Automations
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Certificates",
      value: data.stats.certificates,
      icon: FileText,
    },
    {
      title: "Sent",
      value: data.stats.sent,
      icon: CheckCircle,
    },
    {
      title: "Failed",
      value: data.stats.failed,
      icon: XCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                navigate("/automations")
              }
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {data.automation.name}
              </h1>

              <p className="text-xs text-gray-500">
                Automation details
              </p>
            </div>
          </div>

          <span className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
            {data.automation.type}
          </span>
        </div>
      </header>

      {/* Main */}

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Automation information */}

        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {data.automation.name}
          </h2>

          <p className="mt-1 text-gray-500">
            {data.automation.description ||
              "No description provided."}
          </p>

          <p className="mt-3 text-xs text-gray-400">
            Created{" "}
            {new Date(
              data.automation.createdAt
            ).toLocaleDateString()}
          </p>
        </div>

        {/* Statistics */}

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-100 p-3">
                    <Icon
                      size={22}
                      className="text-gray-700"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Certificates */}

        <div className="mt-8 rounded-xl border bg-white">
          <div className="border-b px-6 py-5">
            <h3 className="font-semibold text-gray-900">
              Certificates
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Certificates generated by this automation
            </p>
          </div>

          {!data.certificates.length ? (
            <div className="px-6 py-14 text-center">
              <FileText
                size={40}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm text-gray-500">
                No certificates generated yet.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {data.certificates.map(
                (certificate) => (
                  <div
                    key={certificate.id}
                    className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {certificate.participantName}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {certificate.email}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(
                          certificate.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium uppercase text-gray-600">
                        {certificate.format}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          certificate.status ===
                          "SENT"
                            ? "bg-green-100 text-green-700"
                            : certificate.status ===
                              "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {certificate.status}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AutomationDetail;
