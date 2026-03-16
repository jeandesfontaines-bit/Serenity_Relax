
"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const TWEEN_FACTOR_BASE = 0.52;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

export function CurvedCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
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

  const portraits = PlaceHolderImages.filter(img => img.id.startsWith('portrait-'));

  return (
    <div className="relative w-full overflow-hidden py-12 px-4" style={{ perspective: '1000px' }}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {portraits.map((portrait, index) => (
            <div
              key={index}
              className="flex-[0_0_240px] min-w-0 relative aspect-[4/5]"
              style={{
                transform: `
                  scale(${1 - Math.abs(tweenValues[index] || 0) * 0.5})
                  rotateY(${(tweenValues[index] || 0) * 80}deg)
                  translateZ(${Math.abs(tweenValues[index] || 0) * -100}px)
                `,
                transition: 'transform 0.1s ease-out',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-muted">
                <Image
                  src={portrait.imageUrl}
                  alt={portrait.description}
                  fill
                  className="object-cover"
                  data-ai-hint="portrait"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
