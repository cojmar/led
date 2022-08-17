window.customElements.define('radio-list', class extends HTMLElement {
	template() {
		return `
            <template class="list-item-template">
				<div class="list-item">
					<div class="list-checkbox"></div>
					<span class="list-name"></span>
					<span class="list-description"></span>
				</div>
            </template>
			
			<div class="list"></div> 
            `
	}
	clear() {
		this.index = false
		this.items = []
		this.render()
	}
	set_items(items) {
		this.items = items
		this.render()
	}
	hide() {
		this.style.display = 'none'
	}
	show() {
		this.style.display = 'block'
	}
	set_index(i) {
		this.index = i
		this.check_items.map((el, i) => {
			if (i === this.index) el.classList.add('selected')
			else el.classList.remove('selected')
		})

		this.list_items.map((el, i) => {
			if (i === this.index) el.classList.add('selected')
			else el.classList.remove('selected')
		})
		this.value = this.items[i]
		this.dispatchEvent(new Event('change'))
	}
	render() {
		this.list = this.list || this.querySelector('.list')
		this.list.innerHTML = `<div class="list-title">${this.title}</div>`

		this.items.map((data, i) => {
			let item = this.item_template.cloneNode(true)

			item.querySelector('.list-name').innerHTML = data.name || ''
			item.querySelector('.list-description').innerHTML = data.description || ''
			item.querySelector('.list-item').addEventListener('click', (e) => this.set_index(i))

			this.list.appendChild(item)
		})

		this.list_items = Array.from(this.querySelectorAll('.list-item'))
		this.check_items = Array.from(this.querySelectorAll('.list-checkbox'))

	}
	constructor() {
		super()
		this.title = this.innerHTML
		this.innerHTML = this.template()
		this.item_template = this.querySelector('.list-item-template').content
		this.clear()
	}

})