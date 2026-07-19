(() => {
    document.documentElement.classList.add("js");

    const body = document.body;
    const header = document.querySelector(".site-header");
    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.querySelector(".main-nav");
    let lastFocusedElement;

    const closeMenu = () => {
        menuToggle?.setAttribute("aria-expanded", "false");
        mainNav?.classList.remove("is-open");
        body.classList.remove("menu-open");
    };

    const openModal = modal => {
        if (!modal) return;
        lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        body.classList.add("modal-open");
        window.setTimeout(() => modal.querySelector(".modal-close, .success-modal__close")?.focus(), 0);
    };

    const closeModal = modal => {
        if (!modal) return;
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
        body.classList.remove("modal-open");
        window.setTimeout(() => lastFocusedElement?.focus?.(), 0);
    };

    const initializeMenu = () => {
        if (!menuToggle || !mainNav || menuToggle.dataset.ready === "true") return;
        menuToggle.dataset.ready = "true";
        menuToggle.addEventListener("click", () => {
            const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
            menuToggle.setAttribute("aria-expanded", String(!isOpen));
            mainNav.classList.toggle("is-open", !isOpen);
            body.classList.toggle("menu-open", !isOpen);
        });
        mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    };

    const initializeVisibleCounts = () => {
        const getColumnCount = grid => {
            const columns = window.getComputedStyle(grid).gridTemplateColumns;
            return columns && columns !== "none" ? columns.split(" ").filter(Boolean).length : 1;
        };

        const getRows = () => {
            if (window.matchMedia("(max-width: 600px)").matches) return 3;
            if (window.matchMedia("(max-width: 1080px)").matches) return 2;
            return 1;
        };

        document.querySelectorAll("[data-expandable-grid]").forEach(grid => {
            const items = [...grid.querySelectorAll("[data-expandable-item]")];
            const toggle = document.querySelector(`[data-expand-toggle][aria-controls='${grid.id}']`);
            if (!items.length || !toggle) return;

            const visibleCount = Math.max(1, getColumnCount(grid) * getRows());
            const expanded = toggle.getAttribute("aria-expanded") === "true";
            items.forEach((item, index) => { item.hidden = !expanded && index >= visibleCount; });
            toggle.hidden = items.length <= visibleCount;
            toggle.querySelector(".button__label").textContent = expanded ? "Show Less" : "Show More";
        });
    };

    const initializeExpandToggles = () => {
        document.querySelectorAll("[data-expand-toggle]:not([data-ready])").forEach(toggle => {
            toggle.dataset.ready = "true";
            toggle.addEventListener("click", () => {
                const expanded = toggle.getAttribute("aria-expanded") === "true";
                toggle.setAttribute("aria-expanded", String(!expanded));
                initializeVisibleCounts();
                if (expanded) document.getElementById(toggle.dataset.section)?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
    };

    const initializeModals = () => {
        document.querySelectorAll("[data-modal-target]:not([data-ready])").forEach(trigger => {
            trigger.dataset.ready = "true";
            trigger.addEventListener("click", () => openModal(document.getElementById(trigger.dataset.modalTarget)));
        });

        document.querySelectorAll(".site-modal:not([data-ready]), .success-modal:not([data-ready])").forEach(modal => {
            modal.dataset.ready = "true";
            modal.addEventListener("click", event => { if (event.target === modal) closeModal(modal); });
            modal.querySelectorAll(".modal-close, .success-modal__close, [data-modal-close]").forEach(control => {
                control.addEventListener("click", () => closeModal(modal));
            });
        });
    };

    const initializeFloatingContacts = () => {
        document.querySelectorAll("[data-contact-url]:not([data-ready])").forEach(link => {
            link.dataset.ready = "true";
            link.addEventListener("click", event => {
                const modal = document.getElementById("floating-contact-modal");
                if (!modal) return;
                event.preventDefault();
                modal.querySelector("#floating-contact-title").textContent = link.dataset.confirmTitle || "Continue?";
                modal.querySelector("[data-contact-kicker]").textContent = link.dataset.contactLabel || "Contact";
                modal.querySelector("[data-contact-message]").textContent = link.dataset.confirmMessage || "This will open a contact option.";
                modal.querySelector("[data-contact-note]").textContent = link.dataset.contactNote || "";
                const icon = modal.querySelector("[data-contact-icon]");
                icon.src = link.querySelector("img")?.getAttribute("src") || "images/icons/phone.svg";
                const action = modal.querySelector("[data-contact-action]");
                action.href = link.dataset.contactUrl;
                action.target = link.dataset.contactTarget || "_self";
                if (link.dataset.contactRel) action.rel = link.dataset.contactRel;
                else action.removeAttribute("rel");
                action.querySelector(".button__label").textContent = link.dataset.confirmButton || "Continue";
                action.querySelector("img").src = icon.src;
                openModal(modal);
            });
        });
    };

    const initializeScrollButtons = () => {
        document.querySelectorAll("[data-scroll-target]:not([data-ready])").forEach(button => {
            button.dataset.ready = "true";
            button.addEventListener("click", () => {
                document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
    };

    const initializeAppointmentForm = () => {
        const form = document.querySelector(".appointment-form");
        const modal = document.querySelector("#success-modal");
        const status = document.querySelector("#appointment-status");
        if (!form || !modal || form.dataset.appointmentReady === "true") return;
        form.dataset.appointmentReady = "true";

        form.addEventListener("submit", async event => {
            event.preventDefault();
            if (form.dataset.submitting === "true") return;
            if (status) status.textContent = "";
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const formData = new FormData(form);
            if (String(formData.get("honeypot") || "").trim()) { form.reset(); return; }
            const button = form.querySelector("button[type='submit']");
            const buttonLabel = button?.querySelector(".button__label");
            const label = button?.dataset.submitLabel || "Send Appointment Request";
            form.dataset.submitting = "true";
            if (button) button.disabled = true;
            if (buttonLabel) buttonLabel.textContent = "Sending...";

            try {
                const originalMessage = String(formData.get("message") || "").trim();
                formData.set("message", [
                    `Preferred Date: ${formData.get("preferredDate")}`,
                    `Preferred Time: ${formData.get("preferredTime")}`,
                    `Service Needed: ${formData.get("service")}`,
                    `Contact Number: ${formData.get("phone")}`,
                    `Email: ${formData.get("email")}`,
                    `Consent: ${formData.get("consent")}`,
                    "",
                    originalMessage
                ].join("\n"));
                const response = await fetch(form.action, { method: form.method || "POST", headers: { Accept: "application/json" }, body: formData });
                const result = await response.json().catch(() => ({}));
                if (!response.ok || result.success === false) throw new Error(result.message || "The appointment request could not be sent.");
                form.reset();
                openModal(modal);
            } catch (error) {
                console.error(error);
                if (status) status.textContent = "Something went wrong. Please try again or call 0960 819 3670.";
            } finally {
                delete form.dataset.submitting;
                if (button) button.disabled = false;
                if (buttonLabel) buttonLabel.textContent = label;
            }
        });
    };

    const initializeLazyMedia = () => {
        const assets = [...document.querySelectorAll("img[loading='lazy']:not([data-lazy-ready]), iframe[loading='lazy']:not([data-lazy-ready])")];
        assets.forEach(asset => {
            asset.dataset.lazyReady = "true";
            const target = asset.tagName === "IFRAME" ? asset : asset.closest(".site-image, .hmo-artwork, .section-photo, .footer-brand") ?? asset.parentElement;
            if (!target) return;
            const markLoaded = () => {
                target.classList.remove("is-loading");
                target.classList.add("is-loaded");
            };
            target.classList.add("lazy-media", "is-loading");
            if (asset.tagName === "IMG" && asset.complete && asset.naturalWidth > 0) markLoaded();
            else {
                asset.addEventListener("load", markLoaded, { once: true });
                asset.addEventListener("error", markLoaded, { once: true });
            }
        });
    };

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

    const initializePage = () => {
        initializeMenu();
        initializeExpandToggles();
        initializeVisibleCounts();
        initializeModals();
        initializeFloatingContacts();
        initializeScrollButtons();
        initializeAppointmentForm();
        initializeLazyMedia();
        initializeRevealAnimations();
        header?.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    window.addEventListener("resize", initializeVisibleCounts);
    window.addEventListener("scroll", () => header?.classList.toggle("is-scrolled", window.scrollY > 8), { passive: true });
    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        const open = document.querySelector(".site-modal:not([hidden]), .success-modal:not([hidden])");
        if (open) closeModal(open);
    });

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializePage, { once: true });
    else initializePage();
})();
