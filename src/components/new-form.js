window.customElements.define('new-form', class extends HTMLElement {

	capitalizeFirstLetter(string) {
		string = string.toString()
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	onsubmit(f) {
		if (typeof f === 'function') this.on_sub_f.push(f)
	}

	constructor() {
		super()
		this.on_sub_f = []
		let data
		try {
			data = JSON.parse((this.attributes.data.value) ? this.attributes.data.value : "{}")
		} catch (error) {
			data = {}
		}

		let title = data.title || ''

		let fields = ''
		if (data.fields) data.fields.map(field => {
			fields += `
                <div>
                    ${this.capitalizeFirstLetter(field)}
                    <input type="text" name="${field}">
                </div>
            `
		})

		this.innerHTML = `
        <div class="page">
            <form>
                <div class="page-title">${title}</div>
                ${fields}
                <div>				
                    <input type="submit" value="Save">
                </div>
            </form>
        </div>
        `

		this.form = this.querySelector('form')

		this.form.onsubmit = (e) => {
			e.preventDefault()
			let data = Object.fromEntries(new FormData(this.form))
			this.on_sub_f.map(f => f(data))
		}

	}

})