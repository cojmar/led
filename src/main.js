import './components.js'

// main js
document.addEventListener('DOMContentLoaded', () => new class {
	constructor() {
		this.router()
		window.addEventListener('hashchange', () => this.router(), false)
	}

	// router
	router() {
		let container = document.querySelector('.container')
		container.innerHTML = ''

		let route = window.location.hash.substring(1) || 'projects_list'
		let template = document.querySelector(`#${route}`)

		let route_found = 0

		if (template) {
			let item = template.content.cloneNode(true)
			container.appendChild(item)
			route_found++
		}
		if (typeof this[`page_${route}`] === 'function') {
			this[`page_${route}`]()
			route_found++
		}

		Array.from(document.querySelectorAll('.menu-item > a')).map(a => {
			if (a.getAttribute('href').substring(1) === route) a.classList.add('selected')
			else a.classList.remove('selected')
		})

		// route not found
		if (route_found === 0) container.innerHTML = '<center><b>Route not found!</b></center>'
	}

	async server(route, data = false) {
		let url = `server/?route=${route}`
		let opts = { cache: "no-store" }
		opts = (typeof data === 'object') ? { cache: "no-store", method: 'post', body: JSON.stringify(data) } : opts

		const response = await fetch(url, opts)
		return await response.json()
	}

	// pages
	async page_projects_list() {
		let data = await this.server('projects_list')

		let dom = {
			projects: document.querySelector('#projects'),
			destinations: document.querySelector('#destinations'),
			panels: document.querySelector('#panels')
		}

		dom.projects.show()

		dom.projects.set_items(data)
		dom.projects.addEventListener('change', () => {
			dom.panels.hide()
			let items = dom.projects.value.destinations || []
			dom.destinations.set_items(items)
			dom.destinations.show()
		})

		dom.destinations.addEventListener('change', () => {
			let items = dom.projects.value.panels || []
			dom.panels.set_items(items)
			dom.panels.show()
		})
	}

	save_form(url, cb) {
		document.querySelector('new-form').onsubmit(async(data) => {
			let r = await this.server(url, data)
			if (typeof cb === 'function') cb(r)
		})
	}

	async page_test() {
		this.save_form('save_project', (r) => {
			console.log(r)
		})

	}


})