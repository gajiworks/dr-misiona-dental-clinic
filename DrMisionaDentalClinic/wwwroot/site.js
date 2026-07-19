window.misionaHome = (() => {
    let componentReference;
    let resizeTimer;
    let listening = false;
    let lastModalType;

    const getColumnCount = gridId => {
        const grid = document.getElementById(gridId);
        if (!grid) return 1;

        const columns = window.getComputedStyle(grid).gridTemplateColumns;
        return columns && columns !== "none"
            ? columns.split(" ").filter(Boolean).length
            : 1;
    };

    const getDefaultRows = () => {
        if (window.matchMedia("(max-width: 600px)").matches) return 3;
        if (window.matchMedia("(max-width: 1080px)").matches) return 2;
        return 1;
    };

    const updateVisibleCounts = () => {
        if (!componentReference) return;

        const rows = getDefaultRows();
        componentReference.invokeMethodAsync(
            "UpdateVisibleCounts",
            getColumnCount("service-cards") * rows,
            getColumnCount("announcement-cards") * rows,
            getColumnCount("office-cards") * rows);
    };

    const handleResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(updateVisibleCounts, 160);
    };

    const handleScroll = () => {
        document.querySelector(".site-header")?.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    const focusFirstModalControl = () => {
        window.setTimeout(() => {
            document.querySelector(".site-modal .modal-close")?.focus();
        }, 0);
    };

    const initializeLazyMedia = () => {
        const assets = [...document.querySelectorAll("img[loading='lazy']:not([data-lazy-ready]), iframe[loading='lazy']:not([data-lazy-ready])")];

        assets.forEach(asset => {
            asset.dataset.lazyReady = "true";

            const target = asset.tagName === "IFRAME"
                ? asset
                : asset.closest(".site-image, .hmo-artwork, .section-photo, .footer-brand") ?? asset.parentElement;

            if (!target) return;

            const markLoaded = () => {
                target.classList.remove("is-loading");
                target.classList.add("is-loaded");
            };

            target.classList.add("lazy-media", "is-loading");

            if (asset.tagName === "IMG" && asset.complete && asset.naturalWidth > 0) {
                markLoaded();
                return;
            }

            asset.addEventListener("load", markLoaded, { once: true });
            asset.addEventListener("error", markLoaded, { once: true });
        });
    };

    const handleKeydown = event => {
        if (!document.body.classList.contains("modal-open")) return;

        if (event.key === "Escape") {
            event.preventDefault();
            if (lastModalType === "announcement") componentReference?.invokeMethodAsync("CloseAnnouncementModalAsync");
            if (lastModalType === "hmo") componentReference?.invokeMethodAsync("CloseHmoAnnouncementModalAsync");
            if (lastModalType === "gallery") componentReference?.invokeMethodAsync("CloseGalleryAsync");
            if (lastModalType === "floating-contact") componentReference?.invokeMethodAsync("CloseFloatingContactModalAsync");
            return;
        }

    };

    return {
        initialize(reference) {
            componentReference = reference;
            initializeLazyMedia();
            updateVisibleCounts();
            handleScroll();

            if (!listening) {
                window.addEventListener("resize", handleResize);
                window.addEventListener("scroll", handleScroll, { passive: true });
                document.addEventListener("keydown", handleKeydown);
                listening = true;
            }
        },
        setMenuOpen(isOpen) {
            document.body.classList.toggle("menu-open", isOpen);
        },
        initializeLazyMedia,
        openModal(type) {
            lastModalType = type;
            document.body.classList.add("modal-open");
            focusFirstModalControl();
        },
        closeModal(focusId) {
            lastModalType = undefined;
            document.body.classList.remove("modal-open");
            if (focusId) window.setTimeout(() => document.getElementById(focusId)?.focus(), 0);
        },
        scrollNear(sectionId) {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        dispose() {
            componentReference = undefined;
            lastModalType = undefined;
            document.body.classList.remove("menu-open", "modal-open");
            window.clearTimeout(resizeTimer);

            if (listening) {
                window.removeEventListener("resize", handleResize);
                window.removeEventListener("scroll", handleScroll);
                document.removeEventListener("keydown", handleKeydown);
                listening = false;
            }
        }
    };
})();

(() => {
    document.documentElement.classList.add("js");

    const initializeRevealAnimations = () => {
        const elements = [...document.querySelectorAll(".reveal:not([data-reveal-ready]), .reveal-card:not([data-reveal-ready])")];
        if (!elements.length) return;

        if (!("IntersectionObserver" in window)) {
            elements.forEach(element => {
                element.dataset.revealReady = "true";
                element.classList.add("is-visible");
            });
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

        elements.forEach((element, index) => {
            element.dataset.revealReady = "true";
            element.style.setProperty("--reveal-index", `${index % 6}`);
            observer.observe(element);
        });
    };

    const initializeLazyMedia = () => {
        window.misionaHome?.initializeLazyMedia?.();
    };

    const initializePageEffects = () => {
        initializeRevealAnimations();
        initializeLazyMedia();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializePageEffects, { once: true });
    } else {
        initializePageEffects();
    }

    document.addEventListener("enhancedload", initializePageEffects);
    new MutationObserver(initializePageEffects).observe(document.documentElement, { childList: true, subtree: true });
})();
