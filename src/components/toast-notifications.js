window.customElements.define('toast-notifications', class extends HTMLElement {
	template() {
		return `
		<div class="toast_container">
			<span class="toast">
				aa
			</span>
		</div>
		
		`
	}


	constructor() {
		super()
		this.innerHTML = this.template()
	}
})