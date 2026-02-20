"use client";

import { useEffect, useRef } from "react";

interface MermaidInitProps {
  children: React.ReactNode;
  docKey?: string;
}

export function MermaidInit({ children, docKey }: MermaidInitProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const codeNodes = container.querySelectorAll<HTMLElement>(
      "pre code.language-mermaid"
    );
    if (codeNodes.length === 0) return;

    import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        flowchart: {
          curve: "basis",
          padding: 20,
          useMaxWidth: true,
        },
        sequence: {
          useMaxWidth: true,
          wrap: true,
          mirrorActors: false,
          width: 180,
        },
        themeVariables: {
          primaryColor: "#1a2332",
          primaryTextColor: "#e8eaed",
          primaryBorderColor: "#00e5ff",
          lineColor: "#5f6368",
          secondaryColor: "#151924",
          tertiaryColor: "#0d1117",
          fontFamily: "DM Sans, system-ui, sans-serif",
          fontSize: "13px",
          noteBkgColor: "#1a1f2e",
          noteTextColor: "#e8eaed",
          noteBorderColor: "#5f6368",
          actorBkg: "#151924",
          actorBorder: "#00e5ff",
          actorTextColor: "#e8eaed",
          signalColor: "#9aa0a6",
          labelBoxBkgColor: "#151924",
          labelBoxBorderColor: "#5f6368",
          labelTextColor: "#e8eaed",
        },
      });

      const nodes: HTMLElement[] = [];
      Array.from(codeNodes).forEach((code) => {
        const pre = code.parentElement;
        if (!pre) return;

        const mermaidDiv = document.createElement("div");
        mermaidDiv.className = "mermaid";
        mermaidDiv.textContent = code.textContent || "";
        nodes.push(mermaidDiv);

        const wrapper = document.createElement("div");
        wrapper.className = "mermaid-wrapper";
        wrapper.appendChild(mermaidDiv);
        pre.replaceWith(wrapper);
      });

      mermaid.run({ nodes, suppressErrors: true });
    });
  }, [docKey]);

  return <div ref={containerRef}>{children}</div>;
}
