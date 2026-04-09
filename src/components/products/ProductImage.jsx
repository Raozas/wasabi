import { ImageSquare } from '@phosphor-icons/react'
import { useState } from 'react'
import styles from './ProductImage.module.css'

function joinClassNames(...values) {
  return values.filter(Boolean).join(' ')
}

export function ProductImage({
  alt,
  className = '',
  fallbackClassName = '',
  iconSize = 24,
  src,
}) {
  const normalizedSrc = typeof src === 'string' ? src.trim() : ''
  const [failedSrc, setFailedSrc] = useState('')

  if (!normalizedSrc || failedSrc === normalizedSrc) {
    return (
      <div className={joinClassNames(styles.fallback, fallbackClassName)} aria-hidden="true">
        <div className={styles.shimmer} />
        <ImageSquare size={iconSize} weight="duotone" />
      </div>
    )
  }

  return (
    <img
      className={className}
      src={normalizedSrc}
      alt={alt}
      onError={() => setFailedSrc(normalizedSrc)}
    />
  )
}
