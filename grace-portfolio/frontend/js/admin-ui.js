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

class AdminUIManager {
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
    confirm(title, message) {
        return new Promise(resolve => {
            const modal = this.showModal(
                title,
                `
                    <p>${message}</p>
                    <div class="admin-modal-actions">
                        <button id="cancelAction">
                            Cancel
                        </button>
                        <button
                            id="confirmAction"
                            class="danger">
                            Delete
                        </button>
                    </div>
                `
            );
            modal
                .querySelector("#cancelAction")
                .onclick = () => {
                    this.closeModal();
                    resolve(false);
                };
            modal
                .querySelector("#confirmAction")
                .onclick = () => {
                    this.closeModal();
                    resolve(true);
                };
        });
    }
    closeModal() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}
window.AdminUI = new AdminUIManager();