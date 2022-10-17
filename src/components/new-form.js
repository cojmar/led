window.customElements.define('new-form', class extends HTMLElement {

	capitalizeFirstLetter(string) {
		string = string.toString()
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	onsubmit(f) {
		if (typeof f === 'function') this.on_sub_f.push(f)
	}

	set_data(data) {
		Object.keys(data).map(key => {
			let el = this.querySelector(`#el_${key}`)
			if (el) el.value = data[key]
		})
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

		let hidden_fields = data.hidden_fields || []

		let fields = ''
		if (data.fields) data.fields.map(field => {
			if (~hidden_fields.indexOf(field)) {
				fields += `<input type="hidden" name="${field}" id="el_${field}">`
			} else {
				fields += `
                <div>
                    ${this.capitalizeFirstLetter(field)}
                    <input type="text" name="${field}" id="el_${field}">
                </div>
            `
			}
		})

		this.innerHTML = `
        <div class="page">
            <form autocomplete="off">
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