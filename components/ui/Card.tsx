"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  ReactNode,
  TouchEvent,
} from "react";

/* -------------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------------- */

type Visibility = "all" | "mobile-tablet" | "hidden";

type BaseCardProps = {
  children?: ReactNode;
  /**
   * Classes extras aplicadas na caixa externa do Card (largura, margem,
   * visibilidade responsiva como "hidden lg:block" etc).
   *
   * Seguro por design: o layout interno (flex-column que organiza banner/
   * carrossel + corpo) vive num wrapper separado, com `display`/`flex-direction`
   * definidos via `style` inline — que tem prioridade sobre qualquer classe
   * Tailwind. Ou seja, não importa o que você passe aqui (`hidden lg:block`,
   * `hidden lg:grid`, etc): o conteúdo interno nunca perde o contexto flex.
   */
  className?: string;
};

/** Discriminated union: cada `type` só aceita as props que fazem sentido pra ele. */
type CardProps =
  | (BaseCardProps & {
      type?: "default";
      banner?: string;
      bannerClassName?: string;
      bannerTitle?: string;
      bannerSubtitle?: string;
      visible?: Visibility;
    })
  | (BaseCardProps & {
      type: "carousel" | "carousel-full";
      images?: string[];
      visible?: Visibility;
      /** Intervalo do autoplay em ms (padrão: 4000) */
      autoplayInterval?: number;
      /** Texto alternativo por slide, para leitores de tela */
      imageAlts?: string[];
    });

const CAROUSEL_AUTOPLAY_MS = 4000;

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1618401479427-c8ef9465fbe1?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
];

const DEFAULT_BANNER_GRADIENT =
  "bg-[linear-gradient(135deg,var(--primary),var(--success)_55%,var(--warning))]";

/**
 * Layout do card lateral: largura/altura fixas em telas grandes, fluidas
 * abaixo disso. Propositalmente NÃO inclui `flex`/`flex-col` — isso fica no
 * wrapper interno (ver `buildCard`) pra não colidir com classes de
 * visibilidade (`hidden`, `block` etc) que o consumidor passar via `className`.
 */
const SIDE_CARD_LAYOUT =
  "min-h-0 w-full max-lg:flex-1 lg:h-[calc(100vh-180px)]";

/* -------------------------------------------------------------------------
 * Primitives
 * ---------------------------------------------------------------------- */

function Card({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-2xl border border-foreground/10 bg-background/55 backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

const Banner = memo(function Banner({
  src,
  className,
  visible = "all",
  title,
  subtitle,
}: {
  src?: string;
  className?: string;
  visible?: Visibility;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div
      className={clsx(
        "relative flex h-44 w-full shrink-0 items-end overflow-hidden p-6 sm:h-52",
        visible === "mobile-tablet" && "max-lg:block lg:hidden",
        visible === "hidden" && "hidden",
        visible !== "hidden" && "block",
        className,
      )}
    >
      {src ? (
        <div
          role="img"
          aria-label={title ?? ""}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${src})` } as CSSProperties}
        />
      ) : (
        <div
          aria-hidden="true"
          className={clsx("absolute inset-0", DEFAULT_BANNER_GRADIENT)}
        />
      )}

      <div
        aria-hidden="true"
        className="absolute -left-8 -top-12 size-40 rounded-full bg-white/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-10 -right-6 size-40 rounded-full bg-white/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent"
      />

      {(title || subtitle) && (
        <div className="relative z-10">
          {title ? (
            <h3 className="text-xl font-semibold text-foreground drop-shadow-sm">
              {title}
            </h3>
          ) : null}

          {subtitle ? (
            <p className="mt-1 text-sm text-foreground/70">{subtitle}</p>
          ) : null}
        </div>
      )}
    </div>
  );
});

function CardBody({
  children,
  full = false,
}: {
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={clsx("flex flex-col p-6 sm:p-8", !full && "flex-1")}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Carousel
 * ---------------------------------------------------------------------- */

/** Detecta `prefers-reduced-motion` sem quebrar em SSR. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reduced;
}

const Carousel = memo(function Carousel({
  images,
  imageAlts,
  className,
  visible = "all",
  full = false,
  autoplayInterval = CAROUSEL_AUTOPLAY_MS,
}: {
  images: string[];
  imageAlts?: string[];
  className?: string;
  visible?: Visibility;
  full?: boolean;
  autoplayInterval?: number;
}) {
  const slides = useMemo(
    () => (images.length > 0 ? images : FALLBACK_IMAGES),
    [images],
  );

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const touchStartX = useRef<number | null>(null);

  // Evita índice fora do array quando `slides` muda de tamanho.
  useEffect(() => {
    setIndex((prev) => (prev >= slides.length ? 0 : prev));
  }, [slides.length]);

  const goTo = useCallback(
    (nextIndex: number) => {
      setIndex(((nextIndex % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  const goRelative = useCallback(
    (dir: number) => goTo(index + dir),
    [goTo, index],
  );

  // Autoplay: pausa em hover/foco, navegação manual, ou reduced-motion.
  useEffect(() => {
    if (isPaused || prefersReducedMotion || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, autoplayInterval);
    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion, slides.length, autoplayInterval, index]);

  const handleManualNav = useCallback(
    (dir: number) => {
      goRelative(dir);
    },
    [goRelative],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleManualNav(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleManualNav(1);
      }
    },
    [handleManualNav],
  );

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 40;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      handleManualNav(deltaX < 0 ? 1 : -1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={clsx(
        "relative w-full shrink-0 overflow-hidden outline-none",
        // `full`: precisa de um ANCESTRAL flex-column pra "flex-1" funcionar.
        // Isso é garantido pelo wrapper interno em `buildCard` (ver style
        // inline lá), então este componente pode confiar que o contexto
        // existe sempre que `full` for true.
        full ? "min-h-0 flex-1" : "h-44 sm:h-52",
        visible === "mobile-tablet" && "max-lg:block lg:hidden",
        visible === "hidden" && "hidden",
        visible !== "hidden" && "block",
        className,
      )}
    >
      {slides.map((src, i) => (
        <div
          key={src + i}
          role="img"
          aria-label={imageAlts?.[i] ?? `Slide ${i + 1} de ${slides.length}`}
          aria-hidden={i !== index}
          className={clsx(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-500",
            i === index ? "opacity-100" : "opacity-0",
          )}
          style={{ backgroundImage: `url(${src})` } as CSSProperties}
        />
      ))}

      {/* Anúncio para leitores de tela a cada troca de slide */}
      <span className="sr-only" aria-live="polite">
        Slide {index + 1} de {slides.length}
      </span>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent"
      />

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Slide anterior"
            onClick={() => handleManualNav(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2 text-white/90 backdrop-blur-md transition-colors hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-white"
          >
            <span aria-hidden="true" className="block text-lg leading-none">
              ‹
            </span>
          </button>

          <button
            type="button"
            aria-label="Próximo slide"
            onClick={() => handleManualNav(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2 text-white/90 backdrop-blur-md transition-colors hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-white"
          >
            <span aria-hidden="true" className="block text-lg leading-none">
              ›
            </span>
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir para slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={clsx(
                  "size-1.5 rounded-full transition-colors",
                  i === index ? "bg-white" : "bg-white/40",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

/* -------------------------------------------------------------------------
 * Composition
 * ---------------------------------------------------------------------- */

/**
 * Type guard explícito. Como `type` é opcional na variante "default" (undefined
 * também significa "default"), comparar com `!== "default"` não estreita a
 * união de forma confiável — o TS não sabe tratar `undefined` como parte do
 * branch "default". Checar as literais do outro lado resolve isso.
 */
function isCarouselProps(
  props: CardProps,
): props is Extract<CardProps, { type: "carousel" | "carousel-full" }> {
  return props.type === "carousel" || props.type === "carousel-full";
}

function CardContent(props: CardProps) {
  const { children } = props;
  const visible = props.visible ?? "all";
  const showTop = visible !== "hidden";

  if (isCarouselProps(props)) {
    const isCarouselFull = props.type === "carousel-full";

    return (
      <>
        {isCarouselFull ? (
          <Carousel
            images={props.images ?? []}
            imageAlts={props.imageAlts}
            autoplayInterval={props.autoplayInterval}
            visible={visible}
            full
          />
        ) : showTop ? (
          <Carousel
            images={props.images ?? []}
            imageAlts={props.imageAlts}
            autoplayInterval={props.autoplayInterval}
            visible={visible}
          />
        ) : null}

        <CardBody full={isCarouselFull}>{children}</CardBody>
      </>
    );
  }

  // Aqui `props` já está estreitado para a variante "default" (type ausente ou "default").
  return (
    <>
      {showTop ? (
        <Banner
          src={props.banner}
          className={props.bannerClassName}
          visible={visible}
          title={props.bannerTitle}
          subtitle={props.bannerSubtitle}
        />
      ) : null}

      <CardBody>{children}</CardBody>
    </>
  );
}

function buildCard(align: "left" | "right", props: CardProps) {
  const alignClass = align === "left" ? "ml-auto mr-0" : "mr-auto ml-0";

  return (
    <motion.div
      className={clsx("flex flex-col", props.className)}
      initial={{ opacity: 0, y: -60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className={clsx(alignClass, SIDE_CARD_LAYOUT)}>
        {/*
          Wrapper de layout interno: SEMPRE flex-column, garantido via `style`
          inline (maior especificidade que qualquer classe Tailwind).

          Por que isso existe: antes, `flex flex-col` vinha junto no mesmo
          elemento que recebia o `className` do consumidor. Se alguém passasse
          algo como `className="hidden lg:block"` (padrão comum pra esconder/
          mostrar por breakpoint), o Tailwind gera "hidden" e "lg:block" com a
          MESMA especificidade que "flex" — e como utilitários responsivos são
          emitidos depois dos utilitários base no CSS gerado, "lg:block" vencia
          de "flex" em telas grandes. Resultado: o Card perdia o contexto flex,
          o Carousel (que depende de `flex-1` no modo `full`) colapsava pra
          altura zero (imagens são `absolute`, não geram altura no fluxo normal),
          e sobrava só a caixa translúcida vazia — o "card preto sem imagens".

          Com o `style` inline aqui, o `className` da Card pode conter qualquer
          classe de visibilidade/display (`hidden lg:block`, `hidden xl:grid`,
          o que for) sem nunca mais quebrar o layout interno.
        */}
        <div
          className="flex h-full flex-col"
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <CardContent {...props} />
        </div>
      </Card>
    </motion.div>
  );
}

export function LeftCard(props: CardProps) {
  return buildCard("left", props);
}

export function RightCard(props: CardProps) {
  return buildCard("right", props);
}

export function FooterCard({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={clsx("mx-auto w-full", className)}>
      {children}
    </Card>
  );
}