import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FaPlus, FaTrashAlt, FaEye, FaRedoAlt } from 'react-icons/fa';

const spinnerStyles = {
  border: '4px solid rgba(255, 255, 255, 0.3)',
  borderLeftColor: '#ffffff',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  animation: 'spin 1s linear infinite',
};

const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const ThumbnailImage = React.memo(({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState(placeholderImage);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const retryCount = useRef(0);

  const loadImage = useCallback(() => {
    setIsLoading(true);
    setError(null);

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };
  }, [src]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  const handleRetry = () => {
    if (retryCount.current < 3) {
      retryCount.current += 1;
      loadImage();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-200">
        <button onClick={handleRetry} className="text-gray-500 hover:text-gray-700">
          <FaRedoAlt size={24} />
        </button>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div style={spinnerStyles} />
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </>
  );
});

const MediaItem = React.memo(({ mediaItem, isAdmin, openModal, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);
  const controls = useAnimation();
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDelete(mediaItem._id);
    }
  }, [mediaItem._id, onDelete]);

  const handleTouchStart = useCallback(() => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowOptions(true);
      controls.start({ scale: 0.95 });
    }, 500); // 500ms for long press
  }, [controls]);

  const handleTouchEnd = useCallback(() => {
    clearTimeout(longPressTimer.current);
    controls.start({ scale: 1 });
    if (!isLongPress.current) {
      openModal(mediaItem);
    }
  }, [controls, openModal, mediaItem]);

  const handleMouseEnter = useCallback(() => {
    if (isAdmin) {
      setShowOptions(true);
    }
  }, [isAdmin]);

  const handleMouseLeave = useCallback(() => {
    setShowOptions(false);
  }, []);

  return (
    <motion.div
      className="relative w-full cursor-pointer aspect-square bg-gray-800 rounded-lg overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={controls}
    >
      {mediaItem.mediaType === 'video' ? (
        <video className="w-full h-full object-cover">
          <source src={mediaItem.thumbnailUrl || mediaItem.mediaUrl} type="video/mp4" />
        </video>
      ) : (
        <ThumbnailImage
          src={mediaItem.thumbnailUrl || mediaItem.mediaUrl}
          alt={mediaItem.title || 'Media'}
          className="object-cover w-full h-full"
        />
      )}

      {showOptions && isAdmin && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-4">
          <button
            className="p-2 bg-blue-500 text-white rounded-full"
            onClick={() => openModal(mediaItem)}
          >
            <FaEye size={24} />
          </button>
          <button
            className="p-2 bg-red-500 text-white rounded-full"
            onClick={handleDelete}
          >
            <FaTrashAlt size={24} />
          </button>
        </div>
      )}
    </motion.div>
  );
});

const MediaGrid = ({
  media = [],
  handleFileUpload,
  openModal,
  loading,
  infiniteScroll = false,
  loadMoreMedia,
  isAdmin,
  onDelete,
  canUpload,
}) => {
  const [itemsToShow, setItemsToShow] = useState(12);
  const [isFetching, setIsFetching] = useState(false);
  const fileInputRef = useRef(null);
  const observerRef = useRef(null);

  // Sort media from newest to oldest
  const sortedMedia = useMemo(() => {
    return [...media].sort((a, b) => {
      return new Date(b.uploadedAt || b.createdAt).getTime() - new Date(a.uploadedAt || a.createdAt).getTime();
    });
  }, [media]);

  const handleFileChange = useCallback((e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileUpload(file);
      e.target.value = '';
    }
  }, [handleFileUpload]);

  const handleIntersection = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && !isFetching && infiniteScroll) {
      setIsFetching(true);
      loadMoreMedia();
    }
  }, [isFetching, infiniteScroll, loadMoreMedia]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver(handleIntersection, options);

    if (infiniteScroll) {
      const sentinel = document.querySelector('#sentinel');
      if (sentinel) observerRef.current.observe(sentinel);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [infiniteScroll, handleIntersection]);

  useEffect(() => {
    setIsFetching(false);
  }, [media]);

  const memoizedMediaItems = useMemo(() => 
    sortedMedia.slice(0, itemsToShow).map((mediaItem) => (
      <MediaItem 
        key={mediaItem._id || mediaItem.id}
        mediaItem={mediaItem}
        isAdmin={isAdmin}
        openModal={openModal}
        onDelete={onDelete}
      />
    )),
    [sortedMedia, itemsToShow, isAdmin, openModal, onDelete]
  );

  const loadMoreItems = useCallback(() => {
    setItemsToShow((prev) => prev + 6);
  }, []);

  return (
    <div className="flex flex-col w-full mt-2 h-fit xl:p-2">
      <div className="grid grid-cols-3 gap-1 sm:gap-1.5 md:grid-cols-6 lg:grid-cols-8 h-fit">
        {canUpload && (
          <label className="relative flex flex-col items-center justify-center w-full cursor-pointer aspect-square bg-purple-200 rounded-lg border-2 border-dashed border-purple-600 p-4">
            <input
              type="file"
              accept="image/*,video/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {loading ? (
              <div className="circle-progress">
                <div style={spinnerStyles} />
              </div>
            ) : (
              <FaPlus className="text-purple-600 text-4xl" />
            )}
            <div className="mt-1 text-xs text-purple-500">Bilder hinzufügen</div>
          </label>
        )}

        {memoizedMediaItems}

        {infiniteScroll && <div id="sentinel" style={{ height: '10px' }} />}

        {!infiniteScroll && sortedMedia.length > itemsToShow && (
          <button
            onClick={loadMoreItems}
            className="col-span-full p-2 bg-purple-600 text-white mt-4 rounded"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(MediaGrid);