import React from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallback?: string;
    loader?: React.ReactNode;
    lazy?: boolean;
    aspectRatio?: string;
    blurUpSrc?: string;
    cover?: boolean;
    sources?: string[];
    videoUrl?: string;
}
declare const SmartImage: React.FC<SmartImageProps>;

export { SmartImage, type SmartImageProps };
