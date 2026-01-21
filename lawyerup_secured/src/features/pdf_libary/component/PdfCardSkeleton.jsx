import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../css/PdfLibrary.css';
// SKELETON loder shell
const PdfCardSkeleton = () => (
    <div className="pdf-card">
        <div className="pdf-info">
            <Skeleton height={30} width={30} circle />
            <Skeleton height={20} width={`70%`} />
        </div>
        <Skeleton height={25} width={25} />
    </div>
);

export default PdfCardSkeleton;
