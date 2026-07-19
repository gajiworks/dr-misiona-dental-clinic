(() => {
  const initializeAppointmentForm = () => {
    const form = document.querySelector('.appointment-form');
    const modal = document.querySelector('#success-modal');
    const status = document.querySelector('#form-status');
    if (!form || !modal || form.dataset.appointmentReady === 'true') return;
    form.dataset.appointmentReady = 'true';

    const openModal = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        modal.querySelector('.success-modal__close')?.focus();
    };
    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    modal.querySelectorAll('.success-modal__close').forEach(button => button.addEventListener('click', closeModal));
    modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (form.dataset.submitting === 'true') return;
        status.textContent = '';
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const formData = new FormData(form);
        if (String(formData.get('honeypot') || '').trim()) { form.reset(); return; }
        const button = form.querySelector('button[type="submit"]');
        const buttonLabel = button?.querySelector('.button__label');
        const label = button?.dataset.submitLabel || 'Send Appointment Request';
        form.dataset.submitting = 'true';
        if (button) {
            button.disabled = true;
            if (buttonLabel) buttonLabel.textContent = 'Sending...';
            else button.textContent = 'Sending...';
        }

        try {
            const originalMessage = String(formData.get('message') || '').trim();
            formData.set('message', [
                `Preferred Date: ${formData.get('preferredDate')}`,
                `Preferred Time: ${formData.get('preferredTime')}`,
                `Service Needed: ${formData.get('service')}`,
                `Contact Number: ${formData.get('phone')}`,
                `Email: ${formData.get('email')}`,
                `Consent: ${formData.get('consent')}`,
                '',
                originalMessage
            ].join('\n'));
            const response = await fetch(form.action, { method: form.method || 'POST', headers: { Accept: 'application/json' }, body: formData });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || result.success === false) throw new Error(result.message || 'The appointment request could not be sent.');
            form.reset();
            openModal();
        } catch (error) {
            console.error(error);
            status.textContent = 'Something went wrong. Please try again or call 0960 819 3670.';
        } finally {
            delete form.dataset.submitting;
            if (button) {
                button.disabled = false;
                if (buttonLabel) buttonLabel.textContent = label;
                else button.textContent = label;
            }
        }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAppointmentForm, { once: true });
  } else {
    initializeAppointmentForm();
  }

  document.addEventListener('enhancedload', initializeAppointmentForm);
  const pageObserver = new MutationObserver(() => {
    initializeAppointmentForm();
    if (document.querySelector('.appointment-form')?.dataset.appointmentReady === 'true') pageObserver.disconnect();
  });
  pageObserver.observe(document.documentElement, { childList: true, subtree: true });
})();
