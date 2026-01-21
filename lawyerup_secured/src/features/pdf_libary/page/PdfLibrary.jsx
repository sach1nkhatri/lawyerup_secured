import React from 'react';
import '../css/PdfLibrary.css';
import pdfIcon from '../../../app/assets/pdf.png';
import downloadIcon from '../../../app/assets/download.png';
import usePdfList from '../hooks/usePdfList';
import PdfCardSkeleton from '../component/PdfCardSkeleton';

const PdfLibrary = () => {
    const { pdfs, loading } = usePdfList();
    const handleDownload = (url, title) => {
        const link = document.createElement('a');
        link.href = `${process.env.REACT_APP_SERVER_URL}${url}`; // Use full URL
        link.download = `${title}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link); // required for Firefox
        link.click();
        document.body.removeChild(link);     // Remove this Form Here Idiot this approach use too much server resources too
    };

    return (
        <div className="pdf-library">
            <h2>PDF Library</h2>
            <div className="pdf-grid">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <PdfCardSkeleton key={i} />)
                    : pdfs.map((pdf) => (
                        <div className="pdf-card" key={pdf._id}>
                            <div className="pdf-info">
                                <img src={pdfIcon} alt="PDF" className="pdf-icon" />
                                <span className="pdf-title">{pdf.title}</span>
                            </div>
                            <img
                                src={downloadIcon}
                                alt="Download"
                                className="download-icon"
                                onClick={() => handleDownload(pdf.url, pdf.title)}
                            />
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default PdfLibrary;
