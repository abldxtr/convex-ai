import type React from "react";
import {
  LampIcon,
  EarthIcon,
  MicrophoneIcon,
  PlusIcon,
  MicIcon,
  PaintIcon,
  SpeechIcon,
  ThreeDotsIcon,
  ArrowIcon,
  StopIcon,
} from "@/components/icons";

import { cn } from "@/lib/utils";
import TooltipContainer from "@/components/tooltip-container";

type IconComponent = ({ size }: { size?: number }) => React.ReactNode;

// Common tools for the chat interface
export const tools = [
  {
    name: "Plus",
    icon: PlusIcon,
    description: "Add photos and files",
  },
  {
    name: "Earth",
    icon: EarthIcon,
    description: "Search the web",
  },
  {
    name: "Lamp",
    icon: LampIcon,
    description: "Think before responding",
  },
  {
    name: "Microphone",
    icon: MicrophoneIcon,
    description: "Get detailed report",
  },
  {
    name: "Paint",
    icon: PaintIcon,
    description: "Visualize anything",
  },
  {
    name: "ThreeDots",
    icon: ThreeDotsIcon,
    description: "View tools",
  },
];

// Search tools for the input area
export const searchTools = [
  {
    name: "upload",
    icon: MicIcon as IconComponent,
    description: "Image Upload",
    // activeIcon: MicIcon as IconComponent,
    // stopIcon: MicIcon as IconComponent,
  },
  {
    name: "ActionButton",
    icon: ArrowIcon as IconComponent,
    // activeIcon:  SpeechIcon as IconComponent
    // stopIcon: StopIcon as IconComponent,
    description: "Submit",
  },
  {
    name: "StopButton",
    icon: StopIcon as IconComponent,
    // activeIcon: ArrowIcon as IconComponent,
    // stopIcon: StopIcon as IconComponent,
    description: "Stop",
  },
];
