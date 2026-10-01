import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

interface Template {
  id: string;
  name: string;
  fileUrl: string;
  width: number | null;
  height: number | null;
  automationId: string;
}

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

const TemplateEditor = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const canvasRef = useRef<HTMLDivElement>(null);

  // Keeps the latest dragged position available
  // to mouseup even when React state has not updated yet.
  const dragPositionRef = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const [template, setTemplate] =
    useState<Template | null>(null);

  const [fields, setFields] = useState<TemplateField[]>(
    []
  );

  const [selectedField, setSelectedField] =
    useState<TemplateField | null>(null);

  const [fieldName, setFieldName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
   * Load template
   */

  useEffect(() => {
    if (!templateId) return;

    const loadTemplate = async () => {
      try {
        const response = await api.get(
          `/templates/${templateId}`
        );

        setTemplate(response.data.template);
      } catch (error: any) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load template"
        );
      }
    };

    loadTemplate();
  }, [templateId]);

  /*
   * Load template fields
   */

  useEffect(() => {
    if (!templateId) return;

    const loadFields = async () => {
      try {
        const response = await api.get(
          `/template-fields/template/${templateId}`
        );

        setFields(response.data.fields || []);
      } catch (error: any) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load template fields"
        );
      } finally {
        setLoading(false);
      }
    };

    loadFields();
  }, [templateId]);

  /*
   * Add new field
   */

  const addField = async () => {
    if (!templateId || !fieldName.trim()) {
      return;
    }

    try {
      setError("");

      const response = await api.post(
        "/template-fields",
        {
          templateId,
          fieldName: fieldName.trim(),
          x: 50,
          y: 50,
          fontSize: 32,
          fontFamily: "Arial",
          color: "#000000",
          alignment: "center",
        }
      );

      const newField = response.data.field;

      setFields((previous) => [
        ...previous,
        newField,
      ]);

      setSelectedField(newField);
      setFieldName("");
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to create field"
      );
    }
  };

  /*
   * Update field
   */

  const updateField = async (
    updates: Partial<TemplateField>
  ) => {
    if (!selectedField) return;

    try {
      setSaving(true);
      setError("");

      const response = await api.put(
        `/template-fields/${selectedField.id}`,
        updates
      );

      const updatedField =
        response.data.field;

      setFields((previous) =>
        previous.map((field) =>
          field.id === updatedField.id
            ? updatedField
            : field
        )
      );

      setSelectedField(updatedField);
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to update field"
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Delete field
   */

  const deleteField = async () => {
    if (!selectedField) return;

    try {
      setError("");

      await api.delete(
        `/template-fields/${selectedField.id}`
      );

      setFields((previous) =>
        previous.filter(
          (field) =>
            field.id !== selectedField.id
        )
      );

      setSelectedField(null);
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to delete field"
      );
    }
  };

  /*
   * Select field
   */

  const selectField = (
    field: TemplateField
  ) => {
    setSelectedField(field);
  };

  /*
   * Drag field
   */

  const handleFieldDrag = (
    event: React.MouseEvent,
    field: TemplateField
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!canvasRef.current) return;

    const canvas =
      canvasRef.current.getBoundingClientRect();

    const startMouseX = event.clientX;
    const startMouseY = event.clientY;

    const startX = field.x;
    const startY = field.y;

    // Store initial position
    dragPositionRef.current = {
      x: startX,
      y: startY,
    };

    const handleMouseMove = (
      moveEvent: MouseEvent
    ) => {
      const deltaX =
        moveEvent.clientX - startMouseX;

      const deltaY =
        moveEvent.clientY - startMouseY;

      const newX =
        startX +
        (deltaX / canvas.width) * 100;

      const newY =
        startY +
        (deltaY / canvas.height) * 100;

      const x = Math.max(
        0,
        Math.min(100, newX)
      );

      const y = Math.max(
        0,
        Math.min(100, newY)
      );

      // Always keep the latest position
      // outside React state.
      dragPositionRef.current = {
        x,
        y,
      };

      setFields((previous) =>
        previous.map((item) =>
          item.id === field.id
            ? {
                ...item,
                x,
                y,
              }
            : item
        )
      );

      setSelectedField((previous) =>
        previous && previous.id === field.id
          ? {
              ...previous,
              x,
              y,
            }
          : previous
      );
    };

    const handleMouseUp = async () => {
      document.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      document.removeEventListener(
        "mouseup",
        handleMouseUp
      );

      const finalPosition =
        dragPositionRef.current;

      if (!finalPosition) return;

      try {
        setSaving(true);
        setError("");

        const response = await api.put(
          `/template-fields/${field.id}`,
          {
            x: finalPosition.x,
            y: finalPosition.y,
          }
        );

        const updatedField =
          response.data.field;

        setFields((previous) =>
          previous.map((item) =>
            item.id === updatedField.id
              ? updatedField
              : item
          )
        );

        setSelectedField(updatedField);
      } catch (error: any) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to save field position"
        );
      } finally {
        setSaving(false);
        dragPositionRef.current = null;
      }
    };

    document.addEventListener(
      "mousemove",
      handleMouseMove
    );

    document.addEventListener(
      "mouseup",
      handleMouseUp
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading editor...
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">
          Template not found.
        </p>
      </div>
    );
  }

  const imageUrl =
    `http://localhost:5000${template.fileUrl}`;

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Header */}

      <header className="flex h-16 items-center justify-between border-b bg-white px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="font-semibold">
              {template.name}
            </h1>

            <p className="text-xs text-gray-500">
              Template Editor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {saving
              ? "Saving..."
              : "All changes saved"}
          </div>

          <button
            onClick={() =>
              navigate(
                `/automations/${template.automationId}/data?templateId=${templateId}`
              )
            }
            disabled={saving}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next: Upload Data →
          </button>
        </div>
      </header>

      {/* Error message */}

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Main editor */}

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}

        <aside className="w-72 overflow-y-auto border-r bg-white p-5">
          <h2 className="font-semibold">
            Fields
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add fields that will receive values from
            your Excel/CSV data.
          </p>

          {/* Add field */}

          <div className="mt-6">
            <input
              type="text"
              value={fieldName}
              onChange={(e) =>
                setFieldName(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addField();
                }
              }}
              placeholder="e.g. participantName"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
            />

            <button
              onClick={addField}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              <Plus size={16} />
              Add Field
            </button>
          </div>

          {/* Fields list */}

          <div className="mt-6 space-y-2">
            {fields.map((field) => (
              <button
                key={field.id}
                onClick={() =>
                  selectField(field)
                }
                className={`w-full rounded-lg border p-3 text-left ${
                  selectedField?.id === field.id
                    ? "border-black bg-gray-100"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium">
                  {field.fieldName}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  x: {Math.round(field.x)}% · y:{" "}
                  {Math.round(field.y)}%
                </p>
              </button>
            ))}
          </div>
        </aside>

        {/* Canvas */}

        <main className="flex flex-1 items-center justify-center overflow-auto bg-gray-200 p-8">
          <div
            ref={canvasRef}
            className="relative max-w-5xl shadow-2xl"
          >
            <img
              src={imageUrl}
              alt={template.name}
              className="block max-h-[75vh] max-w-full"
              draggable={false}
            />

            {fields.map((field) => (
              <div
                key={field.id}
                onClick={() =>
                  selectField(field)
                }
                onMouseDown={(event) =>
                  handleFieldDrag(
                    event,
                    field
                  )
                }
                className={`absolute cursor-move whitespace-nowrap select-none ${
                  selectedField?.id === field.id
                    ? "ring-2 ring-blue-500"
                    : "hover:ring-2 hover:ring-blue-300"
                }`}
                style={{
                  left: `${field.x}%`,
                  top: `${field.y}%`,
                  transform:
                    "translate(-50%, -50%)",
                  fontSize: `${field.fontSize}px`,
                  fontFamily:
                    field.fontFamily,
                  color: field.color,
                  textAlign:
                    field.alignment as
                      | "left"
                      | "center"
                      | "right",
                }}
              >
                {`{{${field.fieldName}}}`}
              </div>
            ))}
          </div>
        </main>

        {/* Right properties */}

        <aside className="w-72 overflow-y-auto border-l bg-white p-5">
          <h2 className="font-semibold">
            Field Properties
          </h2>

          {!selectedField ? (
            <div className="mt-8 text-center text-sm text-gray-500">
              Select a field to edit its properties.
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {/* Field name */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Field Name
                </label>

                <input
                  value={selectedField.fieldName}
                  onChange={(e) =>
                    setSelectedField({
                      ...selectedField,
                      fieldName: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                  onBlur={() =>
                    updateField({
                      fieldName:
                        selectedField.fieldName,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              {/* Font size */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Font Size
                </label>

                <input
                  type="number"
                  value={selectedField.fontSize}
                  onChange={(e) =>
                    setSelectedField({
                      ...selectedField,
                      fontSize: Number(
                        e.target.value
                      ),
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                  onBlur={() =>
                    updateField({
                      fontSize:
                        selectedField.fontSize,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              {/* Font */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Font Family
                </label>

                <select
                  value={
                    selectedField.fontFamily
                  }
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    setSelectedField({
                      ...selectedField,
                      fontFamily: value,
                    });

                    updateField({
                      fontFamily: value,
                    });
                  }}
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                >
                  <option>Arial</option>
                  <option>Georgia</option>
                  <option>
                    Times New Roman
                  </option>
                  <option>Verdana</option>
                  <option>Courier New</option>
                </select>
              </div>

              {/* Color */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Text Color
                </label>

                <input
                  type="color"
                  value={selectedField.color}
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    setSelectedField({
                      ...selectedField,
                      color: value,
                    });

                    updateField({
                      color: value,
                    });
                  }}
                  className="h-10 w-full cursor-pointer rounded border"
                />
              </div>

              {/* Alignment */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Alignment
                </label>

                <select
                  value={
                    selectedField.alignment
                  }
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    setSelectedField({
                      ...selectedField,
                      alignment: value,
                    });

                    updateField({
                      alignment: value,
                    });
                  }}
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                >
                  <option value="left">
                    Left
                  </option>

                  <option value="center">
                    Center
                  </option>

                  <option value="right">
                    Right
                  </option>
                </select>
              </div>

              {/* Delete */}

              <button
                onClick={deleteField}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete Field
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default TemplateEditor;
