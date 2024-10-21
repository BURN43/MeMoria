import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FaPlus, FaEye, FaTrashAlt } from 'react-icons/fa';
import EXIF from 'exif-js';

const MediaItem = React.memo(({ mediaItem, isAdmin, openModal, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [orientation, setOrientation] = useState(1);
  const controls = useAnimation();
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const mediaRef = useRef(null);

  useEffect(() => {
    const loadImage = async () => {
      if (mediaItem.mediaType === 'image') {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          EXIF.getData(img, function() {
            const exifOrientation = EXIF.getTag(this, "Orientation");
            setOrientation(exifOrientation || 1);
          });
        };
        img.src = mediaItem.thumbnailUrl || mediaItem.mediaUrl;
      } else if (mediaItem.mediaType === 'video' && mediaRef.current) {
        mediaRef.current.addEventListener('loadedmetadata', () => {
          const { videoWidth, videoHeight } = mediaRef.current;
          setOrientation(videoWidth > videoHeight ? 1 : 6);
        });
      }
    };
    loadImage();
  }, [mediaItem]);

  const getOrientationStyle = () => {
    switch (orientation) {
      case 2: return { transform: 'scaleX(-1)' };
      case 3: return { transform: 'rotate(180deg)' };
      case 4: return { transform: 'scaleY(-1)' };
      case 5: return { transform: 'rotate(-90deg) scaleY(-1)' };
      case 6: return { transform: 'rotate(90deg)' };
      case 7: return { transform: 'rotate(90deg) scaleY(-1)' };
      case 8: return { transform: 'rotate(-90deg)' };
      default: return {};
    }
  };

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDelete(mediaItem._id);
    }
  }, [mediaItem._id, onDelete]);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    touchEndY.current = e.changedTouches[0].clientY;
    if (Math.abs(touchStartY.current - touchEndY.current) < 10) {
      openModal(mediaItem);
    }
  }, [openModal, mediaItem]);

  const handleMouseEnter = useCallback(() => {
    if (isAdmin) {
      setShowOptions(true);
    }
  }, [isAdmin]);

  const handleMouseLeave = useCallback(() => {
    setShowOptions(false);
  }, []);

  const handleClick = useCallback(() => {
    openModal(mediaItem);
  }, [openModal, mediaItem]);

  return (
    <motion.div
      className="relative w-full cursor-pointer aspect-square bg-gray-800 rounded-lg overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      animate={controls}
    >
      {mediaItem.mediaType === 'video' ? (
        <video 
          ref={mediaRef}
          className="w-full h-full object-cover"
          style={getOrientationStyle()}
        >
          <source src={mediaItem.thumbnailUrl || mediaItem.mediaUrl} type="video/mp4" />
        </video>
      ) : (
        <img
          src={mediaItem.thumbnailUrl || mediaItem.mediaUrl}
          alt={mediaItem.title || 'Media'}
          className="object-cover w-full h-full"
          style={getOrientationStyle()}
        />
      )}

      {showOptions && isAdmin && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-4">
          <button
            className="p-2 bg-primary text-white rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              openModal(mediaItem);
            }}
          >
            <FaEye size={24} />
          </button>
          <button
            className="p-2 bg-accent text-white rounded-full"
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

  const sortedMedia = useMemo(() => {
    return [...new Set(media.map(item => item._id || item.id))]
      .map(id => media.find(item => (item._id || item.id) === id))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  }, [media]);

  const handleFileChange = useCallback(async (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      await handleFileUpload(file);
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
          <label className="relative flex flex-col items-center justify-center w-full cursor-pointer aspect-square bg-card rounded-lg border-2 border-dashed border-accent p-4">
            <input
              type="file"
              accept="image/*,video/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
            ) : (
              <FaPlus className="text-accent text-4xl" />
            )}
            <div className="mt-1 text-xs text-accent">Add Images</div>
          </label>
        )}
        {memoizedMediaItems}
        {infiniteScroll && <div id="sentinel" style={{ height: '10px' }} />}
      </div>
      {!infiniteScroll && sortedMedia.length > itemsToShow && (
        <button
          onClick={loadMoreItems}
          className="button button-accent mt-4 w-full"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default React.memo(MediaGrid);