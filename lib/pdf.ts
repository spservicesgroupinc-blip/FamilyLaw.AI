import html2pdf from 'html2pdf.js';

export interface LegalDraftData {
  caption: string;
  court: string;
  county: string;
  case_no: string;
  document_title: string;
  paragraphs: string[];
  prayer_for_relief: string;
  verification?: string;
  attorney_name: string;
  attorney_bar_no?: string;
  attorney_firm?: string;
  attorney_address: string;
  attorney_address2?: string;
  attorney_phone?: string;
  attorney_email?: string;
  representing: string;
  certificate_of_service?: string;
}

export const generatePDF = async (elementId: string, filename: string, draftData?: any): Promise<void> => {
  if (draftData) {
    await generateLegalPDF(draftData, filename);
    return;
  }
  
  // Fallback for non-structured data using html2pdf
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

export const generateLegalPDF = async (data: LegalDraftData, filename: string): Promise<void> => {
  // 1. Build HTML string with strict Indiana Trial Rule 11(A) styling
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <style>
        @page { size: letter; margin: 0; }
        * { box-sizing: border-box; }
        body {
          margin: 1in;
          font-family: "Times New Roman", Times, serif;
          font-size: 12pt;
          line-height: 2; /* Ind. Trial R. 11(A): Double-spaced */
          text-align: justify;
          color: #000;
          background: #fff;
          counter-reset: paragraph;
        }
        .caption-block {
          text-align: center;
          text-transform: uppercase;
          line-height: 1.5;
          margin-bottom: 0.3in;
        }
        .court-info {
          text-align: center;
          line-height: 1.5;
          text-transform: uppercase;
          margin-top: 0.15in;
        }
        .doc-title {
          text-align: center;
          font-weight: bold;
          font-size: 13pt;
          margin: 0.6in 0 0.4in 0;
          text-decoration: underline;
          text-transform: uppercase;
          line-height: 1.5;
        }
        .para {
          counter-increment: paragraph;
          margin: 0;
          padding-left: 0.5in;
          text-indent: -0.5in;
          page-break-inside: avoid;
        }
        .para::before {
          content: counter(paragraph) ".  ";
          display: inline-block;
          width: 0.5in;
          margin-left: -0.5in;
        }
        .prayer, .verification {
          margin-top: 0.5in;
          text-indent: 0.5in;
          page-break-inside: avoid;
        }
        .sig-block, .cert-block {
          margin-top: 0.8in;
          line-height: 1.5; /* Single-spaced per rules */
          page-break-inside: avoid;
        }
        .sig-line {
          border-top: 1px solid #000;
          width: 3.2in;
          margin: 0.4in 0 0.15in 0;
        }
        .cert-title {
          font-weight: bold;
          text-decoration: underline;
          text-transform: uppercase;
          margin-bottom: 0.2in;
        }
      </style>
    </head>
    <body>
      <div class="caption-block">${(data.caption || '').replace(/\\n/g, '<br>')}</div>
      <div class="court-info">
        ${data.court}<br>
        ${data.county} COUNTY, INDIANA<br>
        CAUSE NO. ${data.case_no}
      </div>
      <div class="doc-title">${data.document_title}</div>

      <div class="content">
        ${(data.paragraphs || []).map(p => `<p class="para">${p.trim()}</p>`).join('')}
      </div>

      <div class="prayer">${data.prayer_for_relief}</div>
      ${data.verification ? `<div class="verification">${data.verification}</div>` : ''}

      <div class="sig-block">
        <div class="sig-line"></div>
        <div>/s/ ${data.attorney_name}</div>
        ${data.attorney_bar_no ? `<div>Bar No. ${data.attorney_bar_no}</div>` : ''}
        ${data.attorney_firm ? `<div>${data.attorney_firm}</div>` : ''}
        <div>${data.attorney_address}</div>
        ${data.attorney_address2 ? `<div>${data.attorney_address2}</div>` : ''}
        ${data.attorney_phone ? `<div>Tel: ${data.attorney_phone}</div>` : ''}
        ${data.attorney_email ? `<div>Email: ${data.attorney_email}</div>` : ''}
        <div style="margin-top: 0.2in;">Attorney for ${data.representing}</div>
      </div>

      ${data.certificate_of_service ? `
      <div class="cert-block">
        <div class="cert-title">Certificate of Service</div>
        <div style="text-indent: 0.5in; text-align: justify;">${data.certificate_of_service}</div>
        <div class="sig-line"></div>
        <div>/s/ ${data.attorney_name}</div>
      </div>` : ''}
    </body>
    </html>
  `;

  // 2. Render off-screen to avoid layout interference
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const opt = {
      margin: 0, // Handled by body margin
      filename,
      image: { type: 'jpeg' as const, quality: 1.0 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        logging: false
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait' as const
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await html2pdf().set(opt).from(container).save();
  } finally {
    // 3. Clean up
    document.body.removeChild(container);
  }
};
