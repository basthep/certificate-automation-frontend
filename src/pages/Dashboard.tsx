import { useEffect, useState } from "react";
import {
  FileText,
  FolderKanban,
  LayoutTemplate,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  LogOut,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface Automation {
  id: string;
  name: string;
  type: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DashboardData {
  automations: number;
  templates: number;
  certificates: number;
  sent: number;
  failed: number;
  pending: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [recentAutomations, setRecentAutomations] =
    useState<Automation[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardResponse, automationsResponse] =
          await Promise.all([
            api.get("/dashboard"),
            api.get("/automations"),
          ]);

        setData(dashboardResponse.data.stats);

        const automations =
          automationsResponse.data.automations ||
          automationsResponse.data;

        const sortedAutomations = [...automations]
          .sort(
            (
              a: Automation,
              b: Automation
            ) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
          .slice(0, 5);

        setRecentAutomations(sortedAutomations);
      } catch (error: any) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Automations",
      value: data?.automations ?? 0,
      icon: FolderKanban,
    },
    {
      title: "Templates",
      value: data?.templates ?? 0,
      icon: LayoutTemplate,
    },
    {
      title: "Certificates",
      value: data?.certificates ?? 0,
      icon: FileText,
    },
    {
      title: "Sent",
      value: data?.sent ?? 0,
      icon: CheckCircle,
    },
    {
      title: "Pending",
      value: data?.pending ?? 0,
      icon: Clock,
    },
    {
      title: "Failed",
      value: data?.failed ?? 0,
      icon: XCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Certificate Automation
            </h1>

            <p className="text-xs text-gray-500">
              Document automation platform
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.name}
              </p>

              <p className="text-xs text-gray-500">
                {user?.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h2>

            <p className="mt-1 text-gray-500">
              Welcome back, {user?.name}.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/automations/create")
            }
            className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={18} />
            Create Automation
          </button>
        </div>

        {/* Statistics */}

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Recent Automations */}

        <div className="mt-8 rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-6 py-5">
            <div>
              <h3 className="font-semibold text-gray-900">
                Recent Automations
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Your recently created automations
              </p>
            </div>

            <button
              onClick={() => navigate("/automations")}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black"
            >
              View all
              <ArrowRight size={15} />
            </button>
          </div>

          {!recentAutomations.length ? (
            <div className="px-6 py-12 text-center">
              <FolderKanban
                size={40}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-gray-500">
                No automations created yet.
              </p>

              <button
                onClick={() =>
                  navigate("/automations/create")
                }
                className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white"
              >
                Create your first automation
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {recentAutomations.map(
                (automation, index) => (
                  <button
                    key={automation.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/automations/${automation.id}`
                      )
                    }
                    className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <FolderKanban
                          size={20}
                          className="text-gray-700"
                        />
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          {automation.name}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {automation.type}
                          </span>

                          <span className="text-gray-300">
                            •
                          </span>

                          <span className="text-xs text-gray-500">
                            {new Date(
                              automation.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 sm:inline-block">
                        #{index + 1}
                      </span>

                      <ArrowRight
                        size={18}
                        className="text-gray-400"
                      />
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
