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

		let url_data = window.location.hash.substring(1) || 'projects_list'
		url_data = url_data.split('/')

		let route = url_data.shift()



		let template = document.querySelector(`#${route}`)

		let route_found = 0

		if (template) {
			let item = template.content.cloneNode(true)
			container.appendChild(item)
			route_found++
		}
		if (typeof this[`page_${route}`] === 'function') {
			this[`page_${route}`](...url_data)
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

	save_form(url, cb) {
		document.querySelector('new-form').onsubmit(async(data) => {
			let r = await this.server(url, data)
			if (typeof cb === 'function') cb(r)
		})
	}

	// pages
	async page_projects_list() {
		let data = await this.server('projects_list')

		let dom = {
			projects: document.querySelector('#projects'),
			destinations: document.querySelector('#destinations'),
			panels: document.querySelector('#panels'),
		}

		dom.projects.show()

		dom.projects.set_items(data)
		dom.projects.addEventListener('change', () => {
			dom.panels.hide()
			let items = dom.projects.value.destinations || []
			dom.destinations.set_items(items)
			dom.destinations.show()

			dom.projects.querySelector('#edit_button').onclick = (e) => {
				e.preventDefault()
				if (!dom.projects.value) return false
				window.location.href = `#edit_project/${dom.projects.value.id}`
			}

			dom.destinations.querySelector('#new_button').onclick = (e) => {
				e.preventDefault()
				if (!dom.projects.value) return false
				window.location.href = `#new_destination/${dom.projects.value.id}`
			}

		})

		dom.destinations.addEventListener('change', () => {
			let items = dom.projects.value.panels || []
			dom.panels.set_items(items)
			dom.panels.show()

			dom.destinations.querySelector('#edit_button').onclick = (e) => {
				e.preventDefault()
				if (!dom.destinations.value) return false
				window.location.href = `#edit_destination/${dom.destinations.value.id}`
			}
		})
	}


	async page_new_project() {
		this.save_form('save_project', (r) => {
			if (r.error) console.log(r.error)
			else window.location.href = '#'
		})
	}

	async page_edit_project(id) {
		if (!id) {
			window.location.href = '#'
			return
		}

		let data = await this.server('projects_list')
		let project = data.find((v) => v.id === id);

		if (!project) {
			window.location.href = '#'
			return
		}

		let form = document.querySelector('new-form')
		form.querySelector('.page-title').innerHTML = `Edit project ${project.id}`
		form.set_data(project)

		this.save_form('save_project', (r) => {
			if (r.error) console.log(r.error)
			else window.location.href = '#'
		})
	}

	async page_new_destination(project_id) {
		if (!project_id) {
			window.location.href = '#'
			return
		}

		let data = await this.server('projects_list')
		let project = data.find((v) => v.id === project_id);


		if (!project) {
			window.location.href = '#'
			return
		}

		let project_index = data.findIndex((v) => v.id === project_id)

		let form = document.querySelector('new-form')
		form.set_data({ project_id: project_id })

		this.save_form('save_destination', (r) => {
			if (r.error) console.log(r.error)
			else {
				window.location.href = '#'
				setTimeout(() => {
					document.querySelector('#projects').set_index(project_index)
					setTimeout(() => {
						document.querySelector('#destinations').set_index(project.destinations.length)
					}, 100)
				}, 100)
			}
		})
	}

	async page_edit_destination(id) {
		if (!id) {
			window.location.href = '#'
			return
		}

		let data = await this.server('projects_list')
		let project = data.find((v) => v.destinations.find((v) => v.id === id))

		if (!project) {
			window.location.href = '#'
			return
		}


		let destination = project.destinations.find((v) => v.id === id)
		let destination_index = project.destinations.findIndex((v) => v.id === id)

		let project_index = data.findIndex((v) => v.id === destination.project_id)

		if (!destination) {
			window.location.href = '#'
			return
		}

		let form = document.querySelector('new-form')
		form.set_data(destination)

		this.save_form('save_destination', (r) => {
			if (r.error) console.log(r.error)
			else {
				window.location.href = '#'
				setTimeout(() => {
					document.querySelector('#projects').set_index(project_index)
					setTimeout(() => {
						document.querySelector('#destinations').set_index(destination_index)
					}, 100)
				}, 100)
			}
		})

	}



})