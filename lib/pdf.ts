import html2pdf from 'html2pdf.js';

export const generatePDF = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const opt = {
    margin:       [1, 1, 1, 1] as [number, number, number, number], // 1 inch margins all around
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
    pagebreak:    { mode: 'css', after: '.para' } // Attempt to break after paragraphs
  };
  
  html2pdf().set(opt).from(element).save();
};
