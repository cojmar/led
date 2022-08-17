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

		let routes = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).reduce((r, i) => {
			if (i.indexOf('page_') === 0) r.push(i)
			return r
		}, [])

		let route = window.location.hash.substring(1) || routes[0].replace('page_', '')
		let template = document.querySelector(`#${route}`)

		let route_found = 0

		if (template) {
			let item = template.content.cloneNode(true)
			container.appendChild(item)
			route_found++
		}
		if (~routes.indexOf(`page_${route}`)) {
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

	// get projects
	async get_projects() {
		const response = await fetch('projects.json')
		const projects = await response.json()
		return projects
	}

	// pages
	async page_projects_list() {
		let data = await this.get_projects()

		let dom = {
			projects: document.querySelector('#projects'),
			destinations: document.querySelector('#destinations'),
			panels: document.querySelector('#panels')
		}

		dom.destinations.hide()
		dom.panels.hide()

		dom.projects.set_items(data)
		dom.projects.addEventListener('change', () => {
			let items = dom.projects.value.items || []
			dom.destinations.set_items(items)
			dom.destinations.show()
		})

		dom.destinations.addEventListener('change', () => {
			let items = dom.destinations.value.items || []
			dom.panels.set_items(items)
			dom.panels.show()
		})
	}


})