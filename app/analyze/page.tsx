"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { TechMatrixData, TechnologyItem } from "~/types/techMatrix";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { loadRadarData, saveRadarData } from "~/lib/radarService";
import Toast from "~/components/Toast";

// Interactive TechRadarMatrix component with drag-and-drop and Firebase persistence
function TechRadarMatrix({ data, repoUrl }: { data: TechMatrixData; repoUrl?: string }) {
  const [showDetails, setShowDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [radarData, setRadarData] = useState<TechMatrixData>(data);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddTech, setShowAddTech] = useState(false);
  const [newTechName, setNewTechName] = useState("");
  const [newTechCategory, setNewTechCategory] = useState("");
  const [newTechStage, setNewTechStage] = useState<keyof Pick<TechMatrixData, "assess" | "trial" | "adopt" | "hold" | "remove">>("adopt");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [renameCategoryValue, setRenameCategoryValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null);
  const [showAddInCell, setShowAddInCell] = useState<string | null>(null);
  const [inlineTechName, setInlineTechName] = useState("");

  // Extract all unique categories from radar data
  useEffect(() => {
    const allCategories = new Set<string>();
    ["assess", "trial", "adopt", "hold", "remove"].forEach((stage) => {
      const stageData = radarData[stage as keyof TechMatrixData];
      if (Array.isArray(stageData)) {
        stageData.forEach((item: TechnologyItem) => allCategories.add(item.category));
      }
    });
    
    // Preserve empty categories that were manually added
    setCategories(prev => {
      const existingEmpty = prev.filter(cat => !allCategories.has(cat));
      const combined = new Set([...existingEmpty, ...Array.from(allCategories)]);
      return Array.from(combined).sort((a, b) => {
        if (a === "Other" && b !== "Other") return 1;
        if (a !== "Other" && b === "Other") return -1;
        return a.localeCompare(b);
      });
    });
  }, [radarData]);

  const handleSave = async () => {
    if (!repoUrl) return;
    setSaving(true);
    try {
      await saveRadarData(repoUrl, radarData);
      setToast({ message: "Radar saved successfully!", type: "success" });
    } catch (error) {
      console.error("Failed to save:", error);
      setToast({ message: "Failed to save radar. Please check your Firebase configuration.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // If dropped in same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Check if dragging a package (format: "package-stage-category-techIdx-depIdx")
    if (draggableId.startsWith("package-")) {
      // Packages can ONLY be dropped into package zones (droppableId starts with "packages-")
      // Reject any drops on cell zones (stage|||category format)
      if (!destination.droppableId.startsWith("packages-")) {
        return; // Block the drop
      }
      
      const [, sourceStage, , techIdxStr, depIdxStr] = draggableId.split("-");
      const [, destStage, , destTechIdxStr] = destination.droppableId.split("-");
      
      const sourceTechIdx = parseInt(techIdxStr);
      const depIdx = parseInt(depIdxStr);
      const destTechIdx = parseInt(destTechIdxStr);
      
      // Find source and dest tech
      const sourceStageItems = radarData[sourceStage as keyof TechMatrixData] as TechnologyItem[];
      const sourceTech = sourceStageItems[sourceTechIdx];
      if (!sourceTech) return;
      
      const destStageItems = radarData[destStage as keyof TechMatrixData] as TechnologyItem[];
      const destTech = destStageItems[destTechIdx];
      if (!destTech) return;
      
      const packageName = sourceTech.dependencies[depIdx];
      if (!packageName) return;
      
      // Can't drop into same tech
      if (sourceStage === destStage && sourceTechIdx === destTechIdx) {
        return;
      }
      
      // Remove from source
      const newRadarData = { ...radarData };
      const newSourceItems = [...sourceStageItems];
      newSourceItems[sourceTechIdx] = {
        ...sourceTech,
        dependencies: sourceTech.dependencies.filter((_, idx) => idx !== depIdx)
      };
      (newRadarData[sourceStage as keyof TechMatrixData] as TechnologyItem[]) = newSourceItems;
      
      // Add to destination tech
      const newDestItems = [...destStageItems];
      newDestItems[destTechIdx] = {
        ...destTech,
        dependencies: [...destTech.dependencies, packageName]
      };
      (newRadarData[destStage as keyof TechMatrixData] as TechnologyItem[]) = newDestItems;
      
      setRadarData(newRadarData);
      return;
    }

    // If dropping a card into a package zone, reject it
    if (destination.droppableId.startsWith("packages-")) {
      return; // Block the drop
    }

    // Parse droppableId: format is "stage|||category"
    const [sourceStage, sourceCategory] = source.droppableId.split("|||");
    const [destStage, destCategory] = destination.droppableId.split("|||");

    // Get items from source stage filtered by category
    const sourceStageItems = radarData[sourceStage as keyof TechMatrixData] as TechnologyItem[];
    const sourceCategoryItems = sourceStageItems.filter(item => item.category === sourceCategory);
    
    // Get the dragged item from the filtered list
    const draggedItem = sourceCategoryItems[source.index];
    if (!draggedItem) return;

    // Create new radar data
    const newRadarData = { ...radarData };

    // Remove the item from source stage
    const newSourceItems = sourceStageItems.filter(item => item !== draggedItem);
    (newRadarData[sourceStage as keyof TechMatrixData] as TechnologyItem[]) = newSourceItems;

    // Update category if changed
    const updatedItem = { ...draggedItem, category: destCategory };

    // Add to destination stage
    const destStageItems = [...(newRadarData[destStage as keyof TechMatrixData] as TechnologyItem[])];
    
    // Insert at the correct position within the destination category
    const destCategoryStartIndex = destStageItems.findIndex(item => item.category === destCategory);
    const insertIndex = destCategoryStartIndex === -1 ? destStageItems.length : destCategoryStartIndex + destination.index;
    
    destStageItems.splice(insertIndex, 0, updatedItem);
    (newRadarData[destStage as keyof TechMatrixData] as TechnologyItem[]) = destStageItems;

    setRadarData(newRadarData);
  };

  const handleAddTechnology = () => {
    if (!newTechName.trim() || !newTechCategory.trim()) {
      setToast({ message: "Please enter both technology name and category", type: "warning" });
      return;
    }

    const newTech: TechnologyItem = {
      name: newTechName.trim(),
      category: newTechCategory.trim(),
      dependencies: [],
    };

    const newRadarData = { ...radarData };
    const stageItems = [...(newRadarData[newTechStage] as TechnologyItem[])];
    stageItems.push(newTech);
    (newRadarData[newTechStage] as TechnologyItem[]) = stageItems;

    setRadarData(newRadarData);
    setNewTechName("");
    setNewTechCategory("");
    setShowAddTech(false);
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    if (categoryToDelete === "Other") {
      return;
    }

    const newRadarData = { ...radarData };
    ["assess", "trial", "adopt", "hold", "remove"].forEach((stage) => {
      const stageItems = newRadarData[stage as keyof TechMatrixData] as TechnologyItem[];
      (newRadarData[stage as keyof TechMatrixData] as TechnologyItem[]) = stageItems.map((item) =>
        item.category === categoryToDelete ? { ...item, category: "Other" } : item
      );
    });

    setRadarData(newRadarData);
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName || oldName === "Other") {
      setEditingCategory(null);
      return;
    }

    const newRadarData = { ...radarData };
    ["assess", "trial", "adopt", "hold", "remove"].forEach((stage) => {
      const stageItems = newRadarData[stage as keyof TechMatrixData] as TechnologyItem[];
      (newRadarData[stage as keyof TechMatrixData] as TechnologyItem[]) = stageItems.map((item) =>
        item.category === oldName ? { ...item, category: newName.trim() } : item
      );
    });

    setRadarData(newRadarData);
    
    // Update the categories list to replace old name with new name
    setCategories(prev => 
      prev.map(cat => cat === oldName ? newName.trim() : cat)
    );
    
    setEditingCategory(null);
  };

  const handleAddCategory = () => {
    // Add empty category to the categories list
    const newCategoryName = "A New Category";
    setCategories(prev => [newCategoryName, ...prev]);
    setEditingCategory(newCategoryName);
    setRenameCategoryValue(newCategoryName);
    // Focus the input element after a brief delay to allow render
    setTimeout(() => {
      const input = document.querySelector(`input[value="${newCategoryName}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 150);
  };

  const handleAddInlinetech = (stage: string, category: string) => {
    if (!inlineTechName.trim()) {
      return;
    }

    const newTech: TechnologyItem = {
      name: inlineTechName.trim(),
      category: category,
      dependencies: [],
    };

    const newRadarData = { ...radarData };
    const stageItems = [...(newRadarData[stage as keyof TechMatrixData] as TechnologyItem[])];
    stageItems.push(newTech);
    (newRadarData[stage as keyof TechMatrixData] as TechnologyItem[]) = stageItems;

    setRadarData(newRadarData);
    setInlineTechName("");
    setShowAddInCell(null);
  };

  const _handleAddPackage = (stage: string, category: string, techIndex: number, packageName: string) => {
    if (!packageName.trim()) return;

    const newRadarData = { ...radarData };
    const stageItems = [...(newRadarData[stage as keyof TechMatrixData] as TechnologyItem[])];
    const techItem = stageItems.find((item, idx) => item.category === category && idx === techIndex);
    
    if (techItem && !techItem.dependencies.includes(packageName.trim())) {
      techItem.dependencies.push(packageName.trim());
      setRadarData(newRadarData);
    }
  };

  const handleRemovePackage = (stage: string, category: string, techIndex: number, packageName: string) => {
    const newRadarData = { ...radarData };
    const stageItems = [...(newRadarData[stage as keyof TechMatrixData] as TechnologyItem[])];
    const techItem = stageItems.find((item, idx) => item.category === category && idx === techIndex);
    
    if (techItem) {
      // Remove the package from the technology
      techItem.dependencies = techItem.dependencies.filter(dep => dep !== packageName);
      
      // If no dependencies left, move the entire technology to "Other" category
      if (techItem.dependencies.length === 0) {
        techItem.category = "Other";
      }
      
      setRadarData(newRadarData);
    }
  };



  return (
    <div className="p-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-teal-600">Tech Radar Matrix</h2>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="rounded-lg bg-teal-600 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-700"
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
            <button
              onClick={async () => {
                if (editMode) {
                  await handleSave();
                }
                setEditMode(!editMode);
              }}
              disabled={editMode && saving}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {editMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              )}
              {editMode ? (saving ? "Saving..." : "Save") : "Edit"}
            </button>
          </div>
        </div>
        
        {/* Add Technology Modal */}
        {showAddTech && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add Technology</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technology Name
                  </label>
                  <input
                    type="text"
                    value={newTechName}
                    onChange={(e) => setNewTechName(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="e.g., React, TypeScript, PostgreSQL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newTechCategory}
                    onChange={(e) => setNewTechCategory(e.target.value)}
                    list="categories"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="Select or create category"
                  />
                  <datalist id="categories">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage
                  </label>
                  <select
                    value={newTechStage}
                    onChange={(e) => setNewTechStage(e.target.value as keyof Pick<TechMatrixData, "assess" | "trial" | "adopt" | "hold" | "remove">)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900"
                  >
                    <option value="assess">Assess</option>
                    <option value="trial">Trial</option>
                    <option value="adopt">Adopt</option>
                    <option value="hold">Hold</option>
                    <option value="remove">Remove</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowAddTech(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTechnology}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-teal-100">
                  <th className="border border-teal-300 px-4 py-2 text-left font-bold text-teal-900">
                    <div className="flex items-center justify-between">
                      <span>Category</span>
                      {editMode && (
                        <button
                          onClick={handleAddCategory}
                          className="w-6 h-6 rounded border border-teal-600 hover:bg-teal-600 text-teal-900 hover:text-white transition-colors flex items-center justify-center text-lg font-bold"
                          title="Add category"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </th>
                  <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900" style={{ maxWidth: '40%' }}>Assess</th>
                  <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900" style={{ maxWidth: '40%' }}>Trial</th>
                  <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900" style={{ maxWidth: '40%' }}>Adopt</th>
                  <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900" style={{ maxWidth: '40%' }}>Hold</th>
                  <th className="border border-teal-300 px-4 py-2 font-bold text-teal-900" style={{ maxWidth: '40%' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category} className="hover:bg-teal-50">
                    <td className="border border-teal-200 px-4 py-1.5 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {editMode && category !== "Other" ? (
                          <input
                            type="text"
                            value={editingCategory === category ? renameCategoryValue : category}
                            onChange={(e) => {
                              if (editingCategory !== category) {
                                setEditingCategory(category);
                                setRenameCategoryValue(e.target.value);
                              } else {
                                setRenameCategoryValue(e.target.value);
                              }
                            }}
                            onFocus={() => {
                              setEditingCategory(category);
                              setRenameCategoryValue(category);
                            }}
                            onBlur={() => handleRenameCategory(category, renameCategoryValue)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleRenameCategory(category, renameCategoryValue);
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="flex-1 bg-transparent border-b-2 border-teal-400 focus:border-teal-600 outline-none px-1 py-0.5 text-sm font-medium transition-colors"
                          />
                        ) : (
                          <span>{category}</span>
                        )}
                        {editMode && category !== "Other" && (
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600 hover:text-red-700 transition-colors ml-2"
                            title="Delete category"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    {(["assess", "trial", "adopt", "hold", "remove"] as const).map((stage) => {
                      const stageData = radarData[stage] as TechnologyItem[];
                      const categoryItems = stageData
                        .map((item, idx) => ({ item, idx }))
                        .filter(({ item }) => item.category === category);

                      return (
                        <td key={stage} className="border border-teal-200 px-4 py-1.5 align-top group" style={{ maxWidth: '40%' }}>
                          <Droppable droppableId={`${stage}|||${category}`}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`min-h-[60px] relative ${
                                  snapshot.isDraggingOver ? "bg-teal-100 rounded" : ""
                                }`}
                              >
                                {editMode && showAddInCell === `${stage}|||${category}` && (
                                  <div className="mb-2">
                                    <input
                                      type="text"
                                      value={inlineTechName}
                                      onChange={(e) => setInlineTechName(e.target.value)}
                                      onBlur={() => {
                                        if (!inlineTechName.trim()) {
                                          setShowAddInCell(null);
                                        }
                                      }}
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          handleAddInlinetech(stage, category);
                                        } else if (e.key === "Escape") {
                                          setShowAddInCell(null);
                                          setInlineTechName("");
                                        }
                                      }}
                                      placeholder="Technology name..."
                                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                      autoFocus
                                    />
                                  </div>
                                )}
                                {!editMode && categoryItems.length === 0 && (
                                  <span className="text-gray-400">-</span>
                                )}
                                {categoryItems.length > 0 && category === "Other" ? (
                                  <div className="flex flex-wrap gap-1">
                                    {categoryItems.flatMap(({ item }) => item.dependencies).map((dep, idx) => (
                                      <span key={idx} className={`rounded px-1.5 py-0.5 text-xs ${
                                        stage === "adopt" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                                      }`}>
                                        {dep}
                                      </span>
                                    ))}
                                  </div>
                                ) : categoryItems.length === 0 ? (
                                  editMode && showAddInCell !== `${stage}|||${category}` ? (
                                    <button
                                      onClick={() => setShowAddInCell(`${stage}|||${category}`)}
                                      className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition-all flex items-center justify-center text-gray-400 hover:text-teal-600 text-2xl opacity-0 group-hover:opacity-100"
                                    >
                                      +
                                    </button>
                                  ) : null
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {categoryItems.map(({ item: tech, idx: techIdx }, listIdx) => (
                                      <Draggable
                                        key={`${stage}-${category}-${techIdx}`}
                                        draggableId={`${stage}-${category}-${techIdx}`}
                                        index={listIdx}
                                        isDragDisabled={!editMode}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`rounded-lg border p-2 ${
                                              stage === "adopt"
                                                ? "border-green-300 bg-green-50"
                                                : stage === "trial"
                                                ? "border-teal-300 bg-teal-50"
                                                : stage === "assess"
                                                ? "border-blue-300 bg-blue-50"
                                                : stage === "hold"
                                                ? "border-yellow-300 bg-yellow-50"
                                                : "border-red-300 bg-red-50"
                                            } ${snapshot.isDragging ? "shadow-lg" : ""} ${
                                              editMode ? "cursor-move" : ""
                                            }`}
                                          >
                                            <div className={`mb-1 font-semibold ${
                                              stage === "adopt"
                                                ? "text-green-900"
                                                : stage === "trial"
                                                ? "text-teal-900"
                                                : stage === "assess"
                                                ? "text-blue-900"
                                                : stage === "hold"
                                                ? "text-yellow-900"
                                                : "text-red-900"
                                            }`}>
                                              {tech.name}
                                            </div>
                                            {showDetails && tech.dependencies.length > 0 && (
                                              <Droppable droppableId={`packages-${stage}-${category}-${techIdx}`} direction="horizontal">
                                                {(provided) => (
                                                  <div 
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className="flex flex-wrap gap-1"
                                                  >
                                                    {tech.dependencies.map((dep, depIdx) => (
                                                      <Draggable
                                                        key={`package-${stage}-${category}-${techIdx}-${depIdx}`}
                                                        draggableId={`package-${stage}-${category}-${techIdx}-${depIdx}`}
                                                        index={depIdx}
                                                        isDragDisabled={!editMode}
                                                      >
                                                        {(provided, snapshot) => (
                                                      <span
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`rounded px-1.5 py-0.5 text-xs ${
                                                          stage === "adopt"
                                                            ? "bg-green-200 text-green-800"
                                                            : stage === "trial"
                                                            ? "bg-teal-200 text-teal-800"
                                                            : stage === "assess"
                                                            ? "bg-blue-200 text-blue-800"
                                                            : stage === "hold"
                                                            ? "bg-yellow-200 text-yellow-800"
                                                            : "bg-red-200 text-red-800"
                                                        } ${editMode ? "cursor-move hover:opacity-70" : ""} ${snapshot.isDragging ? "shadow-lg opacity-80" : ""}`}
                                                        onClick={() => {
                                                          if (editMode && !snapshot.isDragging) {
                                                            handleRemovePackage(stage, category, techIdx, dep);
                                                          }
                                                        }}
                                                      >
                                                        {dep}
                                                        {editMode && " ✕"}
                                                        </span>
                                                      )}
                                                    </Draggable>
                                                  ))}
                                                  {provided.placeholder}
                                                </div>
                                              )}
                                            </Droppable>
                                            )}
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {editMode && showAddInCell !== `${stage}|||${category}` && (
                                      <button
                                        onClick={() => setShowAddInCell(`${stage}|||${category}`)}
                                        className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition-all flex items-center justify-center text-gray-400 hover:text-teal-600 text-xl opacity-0 group-hover:opacity-100"
                                      >
                                        +
                                      </button>
                                    )}
                                  </div>
                                )}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DragDropContext>
        
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-700">Current Technologies: {data.adopt.length}</p>
            <p className="font-semibold text-gray-700">Removed Technologies: {data.remove.length}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Branch: {data.branch || 'main'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo");
  const [radarData, setRadarData] = useState<TechMatrixData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null);

  useEffect(() => {
    if (!repoUrl) return;

    const fetchRadarData = async () => {
      setLoading(true);
      setError(null);
      setProgressMessages(["Checking for saved data..."]);

      try {
        // First, try to load from Firebase
        const savedData = await loadRadarData(repoUrl);
        
        if (savedData) {
          setProgressMessages(prev => [...prev, "✅ Loaded from saved data"]);
          setRadarData(savedData);
          setLoading(false);
          setToast({ message: "💾 Loaded from saved data. Switch to Edit Mode to make changes.", type: "info" });
          return;
        }

        // If not found in Firebase, compute it
        setProgressMessages(prev => [...prev, "No saved data found. Computing from repository..."]);
        setProgressMessages(prev => [...prev, "Connecting to repository...", "Preparing to fetch..."]);

        // Show initial progress before EventSource connects
        setTimeout(() => {
          setProgressMessages(prev => [...prev, "Fetching repository..."]);
        }, 500);

        const eventSource = new EventSource(`/api/analyze?repoUrl=${encodeURIComponent(repoUrl)}`);

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === "progress") {
            setProgressMessages(prev => {
              const newMessages = [...prev, data.message];
              return newMessages.slice(-5);
            });
          } else if (data.type === "complete") {
            setRadarData(data.data);
            setLoading(false);
            eventSource.close();
            
            // Auto-save the computed data to Firebase
            saveRadarData(repoUrl, data.data).catch(err => {
              console.warn("Failed to auto-save to Firebase:", err);
            });
          } else if (data.type === "error") {
            setError(data.error);
            setLoading(false);
            eventSource.close();
          }
        };

        eventSource.onerror = () => {
          setError("Connection error occurred");
          setLoading(false);
          eventSource.close();
        };
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data. Please try again.");
        setLoading(false);
      }
    };

    fetchRadarData();
  }, [repoUrl]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between px-8 pt-6">
          <div className="flex-1">
            <Link
              href="/"
              className="mb-4 inline-flex items-center text-sm text-teal-400 hover:text-teal-300"
            >
              OpenTechMatrix
            </Link>
            <h1 className="text-4xl font-bold text-teal-400">
              {repoUrl ? repoUrl.split('/').pop()?.replace('.git', '') || repoUrl : 'Repository'}
            </h1>
            {repoUrl && (
              <p className="mt-2 text-sm text-gray-400">
                Analyzing: <span className="font-medium">{repoUrl}</span>
              </p>
            )}
          </div>
        </div>

        {!repoUrl && (
          <div className="rounded-lg bg-white p-8 text-center shadow-md mx-8">
            <p className="text-lg text-gray-600">
              No repository URL provided. Please go back to the home page and
              enter a repository URL.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-teal-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-teal-600"
            >
              Go to Home
            </Link>
          </div>
        )}

        {loading && (
          <div className="rounded-lg bg-white p-12 text-center shadow-md mx-8">
            <div className="mb-4 text-6xl animate-pulse">🎯</div>
            <p className="text-xl font-semibold text-gray-700">
              Analyzing repository...
            </p>
            {progressMessages.length > 0 && (
              <div className="mt-6 space-y-2 max-h-40 overflow-y-auto">
                {progressMessages.map((msg, idx) => (
                  <div key={idx} className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                    <p 
                      className="text-sm text-gray-700 font-medium"
                      style={{ opacity: 0.4 + (idx / progressMessages.length) * 0.6 }}
                    >
                      {msg}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border-2 border-red-300 p-8 shadow-md mx-8">
            <p className="text-lg font-semibold text-red-700">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-500 px-6 py-2 font-semibold text-white transition-all hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {radarData && !loading && !error && (
          <TechRadarMatrix data={radarData} repoUrl={repoUrl || undefined} />
        )}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🎯</div>
          <p className="text-xl font-semibold text-teal-400">Loading...</p>
        </div>
      </div>
    }>
      <AnalyzePageContent />
    </Suspense>
  );
}
