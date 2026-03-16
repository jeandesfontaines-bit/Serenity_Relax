"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SERVICES } from '@/lib/types';

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
    if (!engine) return;

    const scrollProgress = emblaApi.scrollProgress();
    const slidesInView = emblaApi.slidesInView();
    const isScrollEvent = !!slidesInView.length;

    const styles = emblaApi.scrollSnapList().map((scrollSnap, index) => {
      let diffToTarget = scrollSnap - scrollProgress;
      
      if (!engine.indexGroups || !engine.indexGroups[index]) {
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

  // Explicitly map therapeutic arts from number 1 to 6
  const therapeuticArts = SERVICES.slice(0, 6).map((service, index) => {
    const relevantImages = PlaceHolderImages.filter(img => 
      img.id !== 'hero-spa'
    );
    
    return {
      ...service,
      displayName: service.name.split(' - ')[0],
      image: relevantImages[index % relevantImages.length]
    };
  });

  if (therapeuticArts.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-12 px-4" style={{ perspective: '1200px' }}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6 py-12">
          {therapeuticArts.map((art, index) => (
            <div
              key={art.id}
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
                  src={art.image.imageUrl}
                  alt={art.displayName}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint={art.image.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                <div className="absolute bottom-8 left-8 right-8 transition-all duration-500">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary mb-2 block opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-700">Therapeutic Art 0{index + 1}</span>
                  <h4 className="text-xl font-headline font-medium text-white leading-tight">
                    {art.displayName}
                  </h4>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    {art.duration} • CHF {art.price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
