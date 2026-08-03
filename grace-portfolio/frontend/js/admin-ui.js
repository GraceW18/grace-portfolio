/*
=========================================================
Admin UI Components
Grace Wang Portfolio CMS

Reusable UI building blocks:
- Modal
- Toast notifications
- Confirm dialogs
=========================================================
*/

class AdminUI {
    constructor() {
        this.modal = null;
    }
    showModal(title, bodyHTML) {

        this.closeModal();

        const overlay = document.createElement("div");
        overlay.className = "admin-modal-overlay";

        overlay.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-header">
                    <h2>${title}</h2>
                    <button class="admin-close">
                        ✕
                    </button>
                </div>

                <div class="admin-modal-body">
                    ${bodyHTML}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay
            .querySelector(".admin-close")
            .onclick = () => this.closeModal();
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                this.closeModal();
            }
        };

        this.modal = overlay;
        return overlay;
    }
    closeModal() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}
window.AdminUI = new AdminUI();

AdminUI.showModal(
    "Hello!",
    `
        <p>

            The reusable modal works 🎉

        </p>
    `
);