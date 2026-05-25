import React, { useRef, useState, useEffect } from 'react';

/**
 * Imagen optimizada con:
 * - lazy loading nativo (loading="lazy") + IntersectionObserver fallback
 * - WebP automático via Cloudinary URL transform
 * - placeholder blur mientras carga
 * - soporte para avatares circulares
 */

function toWebP(src, width) {
  if (!src) return src;
  // Solo transforma URLs de Cloudinary
  if (!src.includes('cloudinary.com') && !src.includes('res.cloudinary')) return src;
  // Inserta transformaciones: format webp + resize si se pide width
  const transforms = width ? `f_webp,w_${width},q_auto` : 'f_webp,q_auto';
  // Cloudinary URL: .../upload/<transforms>/<public_id>
  return src.replace('/upload/', `/upload/${transforms}/`);
}

export default function KronosImage({
  src,
  alt = '',
  width,
  height,
  style = {},
  className = '',
  rounded = false,      // borderRadius: '50%'
  radius,               // borderRadius custom
  fallback,             // URL de fallback si la imagen falla
  placeholder = 'blur', // 'blur' | 'none'
}) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);

  // IntersectionObserver para browsers sin loading="lazy" nativo
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    if ('loading' in HTMLImageElement.prototype) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const optimized = error
    ? (fallback || `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || 'K')}&background=7c3aed&color=fff&size=${width || 40}`)
    : toWebP(src, width);

  const borderRadius = rounded ? '50%' : (radius ?? style.borderRadius ?? undefined);

  const baseStyle = {
    display: 'block',
    objectFit: style.objectFit ?? 'cover',
    borderRadius,
    transition: 'opacity 0.25s ease',
    opacity: (placeholder === 'blur' && !loaded) ? 0 : 1,
    background: loaded ? 'transparent' : 'rgba(255,255,255,0.06)',
    ...style,
    width: width ? `${width}px` : (style.width ?? '100%'),
    height: height ? `${height}px` : (style.height ?? 'auto'),
  };

  return (
    <img
      ref={imgRef}
      src={visible ? optimized : undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
      style={baseStyle}
      className={className}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
    />
  );
}
