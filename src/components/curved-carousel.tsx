"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const TWEEN_FACTOR_BASE = 0.52;

export function CurvedCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: true,
  });

  const [tweenValues, setTweenValues] = useState<number[]>([]);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;

    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();
    const slidesInView = emblaApi.slidesInView();
    const isScrollEvent = !!slidesInView.length;

    const styles = emblaApi.scrollSnapList().map((scrollSnap, index) => {
      let diffToTarget = scrollSnap - scrollProgress;
      
      // Defensive check for engine and indexGroups to prevent runtime TypeErrors
      if (!engine || !engine.indexGroups || !engine.indexGroups[index]) {
        return 0;
      }

      const slidesInSnap = engine.indexGroups[index];

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopPoint) => {
            const target = loopPoint.target();

            if (slideIndex === loopPoint.index && target !== 0) {
              const sign = Math.sign(target);

              if (sign === -1) {
                diffToTarget = scrollSnap - (1 + scrollProgress);
              }
              if (sign === 1) {
                diffToTarget = scrollSnap + (1 - scrollProgress);
              }
            }
          });
        }
      });

      return diffToTarget * TWEEN_FACTOR_BASE;
    });

    setTweenValues(styles);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onScroll();
    emblaApi.on('reInit', onScroll);
    emblaApi.on('scroll', onScroll);
  }, [emblaApi, onScroll]);

  // Filter for both portraits and massage-related images to enrich the carousel
  const displayImages = PlaceHolderImages.filter(img => 
    img.id.startsWith('portrait-') || 
    ['massage-1', 'stones', 'oils'].includes(img.id)
  );

  if (displayImages.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-12 px-4" style={{ perspective: '1200px' }}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6 py-12">
          {displayImages.map((image, index) => (
            <div
              key={image.id}
              className="flex-[0_0_280px] min-w-0 relative aspect-[3/4]"
              style={{
                transform: `
                  scale(${1 - Math.abs(tweenValues[index] || 0) * 0.4})
                  rotateY(${(tweenValues[index] || 0) * 65}deg)
                  translateZ(${Math.abs(tweenValues[index] || 0) * -150}px)
                `,
                transition: 'transform 0.1s ease-out',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="w-full h-full rounded-[3rem] overflow-hidden shadow-2xl bg-muted group cursor-pointer transition-all duration-500 hover:shadow-primary/20">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint={image.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">{image.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
