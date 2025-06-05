"use client";

import { useState, useLayoutEffect } from "react";

/**
 * Custom hook to manage chat model selection
 * @returns Object containing model state and setter
 */
export function useChatModel() {
  const [selectedModel, setSelectedModel] = useState("");
  const [showExperimentalModels, setShowExperimentalModels] = useState(false);

  // Load model preference from session storage
  useLayoutEffect(() => {
    const storedModel = sessionStorage.getItem("model");
    if (storedModel) {
      setSelectedModel(storedModel);
    }
  }, []);

  // Save model preference to session storage
  const updateSelectedModel = (model: string) => {
    setSelectedModel(model);
    sessionStorage.setItem("model", model);
  };

  return {
    selectedModel:
      selectedModel.length > 0
        ? selectedModel
        : "mmd-meta-llama/llama-3.3-8b-instruct:free",
    setSelectedModel: updateSelectedModel,
    showExperimentalModels,
    setShowExperimentalModels,
  };
}
