import React, { useState, useEffect } from "react";
import { MdContentCopy, MdDownload, MdPrint } from "react-icons/md";
import "./RecoveryCodesModal.css";

export default function RecoveryCodesModal({ recoveryCodes, onDone, isOpen }) {
  const [copied, setCopied] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  // Don't render if modal is not open
  if (!isOpen) return null;

  // Split codes into two columns
  const midpoint = Math.ceil(recoveryCodes.length / 2);
  const leftColumn = recoveryCodes.slice(0, midpoint);
  const rightColumn = recoveryCodes.slice(midpoint);

  const handleOverlayClick = (e) => {
    // Close modal if clicking on overlay (background)
    if (e.target === e.currentTarget) {
      onDone();
    }
  };

  const handleCopy = () => {
    const codesText = recoveryCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const codesText = recoveryCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "recovery-codes.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // const handlePrint = () => {
  //   const printWindow = window.open("", "_blank");
  //   const codesHtml = recoveryCodes
  //     .map(
  //       (code) =>
  //         `<div style="margin: 8px 0; font-family: monospace; font-size: 14px;">${code}</div>`,
  //     )
  //     .join("");
  //
  //   printWindow.document.write(`
  //     <html>
  //       <head>
  //         <title>Recovery Codes</title>
  //         <style>
  //           body { font-family: Arial, sans-serif; padding: 20px; }
  //           h1 { color: #333; margin-bottom: 20px; }
  //           .codes-container { margin: 20px 0; }
  //         </style>
  //       </head>
  //       <body>
  //         <h1>Two-Factor Authentication Recovery Codes</h1>
  //         <p>Keep these codes safe. Each code can only be used once.</p>
  //         <div class="codes-container">
  //           ${codesHtml}
  //         </div>
  //         <p><strong>Important:</strong> Store these codes in a secure location. You'll need them to access your account if you lose your authentication device.</p>
  //       </body>
  //     </html>
  //   `);
  //   printWindow.document.close();
  //   printWindow.print();
  // };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onDone();
    }
  };

  return (
    <div
      className="recovery-modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className="recovery-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="recovery-modal-header">
          <h2 className="recovery-modal-title">Save Your Recovery Codes</h2>
          <button className="recovery-close-btn" onClick={onDone}>
            &times;
          </button>
        </div>

        <div className="recovery-modal-body">
          <p className="recovery-modal-description">
            These codes will allow you to access your account if you lose your
            authenticator device. Each code can only be used once.
          </p>

          <div className="recovery-codes-grid">
            <div className="recovery-codes-column">
              {leftColumn.map((code, index) => (
                <div
                  key={index}
                  data-testid={`recovery-code-${index}`}
                  className="recovery-code-item"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="recovery-codes-column">
              {rightColumn.map((code, index) => (
                <div key={index} className="recovery-code-item">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="recovery-actions">
            <button
              type="button"
              name="copyCodes"
              onClick={handleCopy}
              className={`recovery-btn recovery-btn-primary ${copied ? "copied" : ""}`}
            >
              <MdContentCopy size={16} />
              {copied ? "Copied!" : "Copy"}
            </button>

            <button
              type="button"
              name="downloadCodes"
              onClick={handleDownload}
              className="recovery-btn recovery-btn-success"
            >
              <MdDownload size={16} />
              Download
            </button>
          </div>

          <div className="recovery-warning">
            <p>
              <strong>Important:</strong> These recovery codes will not be shown
              again. Make sure to save them in a secure location before
              proceeding.
            </p>
          </div>
        </div>

        <div className="recovery-modal-footer">
          <button
            type="button"
            name="doneCodes"
            onClick={onDone}
            className="recovery-done-btn"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import { MdContentCopy, MdDownload, MdPrint } from "react-icons/md";
//
// export default function RecoveryCodesForm({ recoveryCodes, onDone }) {
//   const [copied, setCopied] = useState(false);
//
//   // Split codes into two columns
//   const midpoint = Math.ceil(recoveryCodes.length / 2);
//   const leftColumn = recoveryCodes.slice(0, midpoint);
//   const rightColumn = recoveryCodes.slice(midpoint);
//
//   const handleCopy = () => {
//     const codesText = recoveryCodes.join("\n");
//     navigator.clipboard.writeText(codesText);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };
//
//   const handleDownload = () => {
//     const codesText = recoveryCodes.join("\n");
//     const blob = new Blob([codesText], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "recovery-codes.txt";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };
//
//   const handlePrint = () => {
//     const printWindow = window.open("", "_blank");
//     const codesHtml = recoveryCodes
//       .map(
//         (code) =>
//           `<div style="margin: 8px 0; font-family: monospace; font-size: 14px;">${code}</div>`,
//       )
//       .join("");
//
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Recovery Codes</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             h1 { color: #333; margin-bottom: 20px; }
//             .codes-container { margin: 20px 0; }
//           </style>
//         </head>
//         <body>
//           <h1>Two-Factor Authentication Recovery Codes</h1>
//           <p>Keep these codes safe. Each code can only be used once.</p>
//           <div class="codes-container">
//             ${codesHtml}
//           </div>
//           <p><strong>Important:</strong> Store these codes in a secure location. You'll need them to access your account if you lose your authentication device.</p>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };
//
//   return (
//     <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
//       <div style={{ textAlign: "center", marginBottom: "30px" }}>
//         <h2 style={{ color: "#333", marginBottom: "10px" }}>
//           Save Your Recovery Codes
//         </h2>
//         <p style={{ color: "#666", margin: "0" }}>
//           These codes will allow you to access your account if you lose your
//           authenticator device. Each code can only be used once.
//         </p>
//       </div>
//
//       <div
//         style={{
//           display: "flex",
//           gap: "20px",
//           justifyContent: "center",
//           marginBottom: "30px",
//           flexWrap: "wrap",
//         }}
//       >
//         <div
//           style={{
//             flex: "1",
//             minWidth: "200px",
//             backgroundColor: "#f8f9fa",
//             padding: "20px",
//             borderRadius: "8px",
//             border: "1px solid #e9ecef",
//           }}
//         >
//           {leftColumn.map((code, index) => (
//             <div
//               key={index}
//               style={{
//                 fontFamily: "monospace",
//                 fontSize: "14px",
//                 padding: "8px 0",
//                 borderBottom:
//                   index < leftColumn.length - 1 ? "1px solid #dee2e6" : "none",
//                 textAlign: "center",
//                 fontWeight: "500",
//               }}
//             >
//               {code}
//             </div>
//           ))}
//         </div>
//
//         <div
//           style={{
//             flex: "1",
//             minWidth: "200px",
//             backgroundColor: "#f8f9fa",
//             padding: "20px",
//             borderRadius: "8px",
//             border: "1px solid #e9ecef",
//           }}
//         >
//           {rightColumn.map((code, index) => (
//             <div
//               key={index}
//               style={{
//                 fontFamily: "monospace",
//                 fontSize: "14px",
//                 padding: "8px 0",
//                 borderBottom:
//                   index < rightColumn.length - 1 ? "1px solid #dee2e6" : "none",
//                 textAlign: "center",
//                 fontWeight: "500",
//               }}
//             >
//               {code}
//             </div>
//           ))}
//         </div>
//       </div>
//
//       <div
//         style={{
//           display: "flex",
//           gap: "10px",
//           justifyContent: "center",
//           marginBottom: "30px",
//           flexWrap: "wrap",
//         }}
//       >
//         <button
//           type="button"
//           onClick={handleCopy}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             padding: "12px 20px",
//             backgroundColor: "#007bff",
//             color: "white",
//             border: "none",
//             borderRadius: "6px",
//             cursor: "pointer",
//             fontSize: "14px",
//             fontWeight: "500",
//             transition: "background-color 0.2s",
//           }}
//           onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
//           onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
//         >
//           <MdContentCopy size={16} />
//           {copied ? "Copied!" : "Copy"}
//         </button>
//
//         <button
//           type="button"
//           onClick={handleDownload}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             padding: "12px 20px",
//             backgroundColor: "#28a745",
//             color: "white",
//             border: "none",
//             borderRadius: "6px",
//             cursor: "pointer",
//             fontSize: "14px",
//             fontWeight: "500",
//             transition: "background-color 0.2s",
//           }}
//           onMouseOver={(e) => (e.target.style.backgroundColor = "#1e7e34")}
//           onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
//         >
//           <MdDownload size={16} />
//           Download
//         </button>
//
//         <button
//           type="button"
//           onClick={handlePrint}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             padding: "12px 20px",
//             backgroundColor: "#6c757d",
//             color: "white",
//             border: "none",
//             borderRadius: "6px",
//             cursor: "pointer",
//             fontSize: "14px",
//             fontWeight: "500",
//             transition: "background-color 0.2s",
//           }}
//           onMouseOver={(e) => (e.target.style.backgroundColor = "#545b62")}
//           onMouseOut={(e) => (e.target.style.backgroundColor = "#6c757d")}
//         >
//           <MdPrint size={16} />
//           Print
//         </button>
//       </div>
//
//       <div
//         style={{
//           backgroundColor: "#fff3cd",
//           border: "1px solid #ffeaa7",
//           borderRadius: "6px",
//           padding: "15px",
//           marginBottom: "20px",
//         }}
//       >
//         <p
//           style={{
//             margin: "0",
//             fontSize: "14px",
//             color: "#856404",
//             fontWeight: "500",
//           }}
//         >
//           ⚠️ <strong>Important:</strong> These recovery codes will not be shown
//           again. Make sure to save them in a secure location before proceeding.
//         </p>
//       </div>
//
//       <div style={{ textAlign: "center" }}>
//         <button
//           type="button"
//           onClick={onDone}
//           style={{
//             padding: "15px 40px",
//             backgroundColor: "#28a745",
//             color: "white",
//             border: "none",
//             borderRadius: "6px",
//             cursor: "pointer",
//             fontSize: "16px",
//             fontWeight: "600",
//             transition: "background-color 0.2s",
//           }}
//           onMouseOver={(e) => (e.target.style.backgroundColor = "#1e7e34")}
//           onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
//         >
//           Done
//         </button>
//       </div>
//     </div>
//   );
// }
