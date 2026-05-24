"use client";

import { useCallback, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface UsePDFDownloadOptions {
  filename?: string;
}

export function usePDFDownload(options: UsePDFDownloadOptions = {}) {
  const { filename = "especificaciones-ultracem.pdf" } = options;
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = useCallback(async () => {
    const element = elementRef.current;
    if (!element) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const scaleFactor = contentWidth / imgWidth;
      const scaledHeight = imgHeight * scaleFactor;

      // Header
      pdf.setFillColor(0, 62, 120);
      pdf.rect(0, 0, pageWidth, 16, "F");
      pdf.setTextColor(255, 202, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("UltraCem", margin, 10);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text("Calculadora de materiales", pageWidth - margin, 10, {
        align: "right",
      });

      const headerOffset = 22;
      const availableHeight = pageHeight - headerOffset - margin;

      let finalWidth = contentWidth;
      let finalHeight = scaledHeight;
      let finalY = headerOffset;

      // If content is taller than available space, scale down to fit one page
      if (scaledHeight > availableHeight) {
        const fitScale = availableHeight / scaledHeight;
        finalWidth = contentWidth * fitScale;
        finalHeight = availableHeight;
        finalY = headerOffset + (availableHeight - finalHeight) / 2;
      }

      pdf.addImage(
        imgData,
        "PNG",
        margin + (contentWidth - finalWidth) / 2,
        finalY,
        finalWidth,
        finalHeight
      );

      // Footer
      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(7);
      pdf.text(
        "Documento generado por UltraCem | ultracem.co",
        margin,
        pageHeight - 6
      );
      pdf.text(`Página 1`, pageWidth - margin, pageHeight - 6, {
        align: "right",
      });

      pdf.save(filename);
    } catch (error) {
      console.error("Error generando PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [filename]);

  return { elementRef, downloadPDF, isGenerating };
}
