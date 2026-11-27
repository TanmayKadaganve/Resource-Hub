
function PDFReader({ selectedPDF, API, renderBackButton, goBackFromReader }) {
  const pdfUrl = `${API}/resources/${selectedPDF._id}/view#toolbar=1&navpanes=0&view=FitH`;

  return (
    <section className="reader-section pdf-reader-page">
      {renderBackButton("Back", goBackFromReader)}

      <div className="section-heading reader-heading">
        <div>
          <p className="eyebrow">PDF READER</p>
          <h2>{selectedPDF.originalName}</h2>
          <p>Use the full-size reader controls to zoom and move through the document.</p>
        </div>

        <div className="pdf-reader-actions">
          <a className="secondary-button" href={pdfUrl} target="_blank" rel="noopener noreferrer">Open in new tab ↗</a>
          <a className="primary-button" href={`${API}/resources/${selectedPDF._id}/download`}>↓ Download PDF</a>
        </div>
      </div>

      <div className="pdf-frame pdf-frame-large">
        <iframe
          key={selectedPDF._id}
          title={`PDF: ${selectedPDF.originalName}`}
          src={pdfUrl}
          allow="fullscreen"
        />
      </div>
    </section>
  );
}

export default PDFReader;
