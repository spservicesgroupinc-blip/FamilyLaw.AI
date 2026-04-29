import html2pdf from 'html2pdf.js';

export const generatePDF = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const opt = {
    margin:       1.0, // 1 inch margins for standard legal
    filename:     filename,
    image:        { type: 'jpeg' as const, quality: 1.0 },
    html2canvas:  { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        scrollY: 0
    },
    jsPDF:        { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait' as const 
    },
    pagebreak:    { mode: ['css', 'legacy'] } // Removed avoid-all which can cause issues with pagination
  };
  
  html2pdf().set(opt).from(element).save();
};
