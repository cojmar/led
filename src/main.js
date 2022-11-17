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
		this.extra_top = document.querySelector('.top-extra-menu')
		container.innerHTML = this.extra_top.innerHTML = ''

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
		let r = await response.text()
		let ret
		try {
			ret = JSON.parse(r)
		} catch (error) {
			ret = { error: r }
		}
		return ret
	}

	save_form(url, cb) {
		let form = document.querySelector('app-form')
		if (!form) return false
		form.onsubmit(async(data) => {
			let r = await this.server(url, data)
			if (typeof cb === 'function') cb(r)
		})
	}

	log(data) {
		console.log(data)
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

			dom.projects.querySelector('#del_button').onclick = async(e) => {
				e.preventDefault()
				if (!dom.projects.value) return false
				if (confirm("Delete selected project ?")) {
					let server_call = await this.server('del_project', { id: dom.projects.value.id })
					if (server_call.error) {
						this.log(server_call.error)
					} else {
						this.router()
					}
				}

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

			dom.destinations.querySelector('#del_button').onclick = async(e) => {
				e.preventDefault()
				if (!dom.projects.value) return false
				if (confirm("Delete selected destination ?")) {
					let server_call = await this.server('del_destination', { id: dom.destinations.value.id })
					if (server_call.error) {
						this.log(server_call.error)
					} else {
						let index = dom.projects.index
						this.router()
						setTimeout(() => {
							document.querySelector('#projects').set_index(index)
						}, 100)
					}
				}
			}

			dom.panels.querySelector('#new_button').onclick = (e) => {
				e.preventDefault()
				if (!dom.projects.value) return false
				window.location.href = `#new_panel/${dom.projects.value.id}/${dom.destinations.index}`
			}


		})


		dom.panels.addEventListener('change', () => {
			dom.panels.querySelector('#edit_button').onclick = (e) => {
				e.preventDefault()
				if (!dom.panels.value) return false
				window.location.href = `#edit_panel/${dom.panels.value.id}`
			}

			dom.panels.querySelector('#del_button').onclick = async(e) => {
				e.preventDefault()
				if (!dom.panels.value) return false
				if (confirm("Delete selected panel ?")) {
					let server_call = await this.server('del_panel', { id: dom.panels.value.id })
					if (server_call.error) {
						this.log(server_call.error)
					} else {
						let index = dom.projects.index
						let dest_index = dom.destinations.index
						this.router()
						setTimeout(() => {
							document.querySelector('#projects').set_index(index)
							setTimeout(() => {
								document.querySelector('#destinations').set_index(dest_index)
							}, 100)
						}, 100)
					}
				}
			}

		})
	}


	async page_new_project() {
		this.save_form('save_project', (r) => {
			if (r.error) this.log(r.error)
			else {
				this.log('save done');
				window.location.href = '#'
			}
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

		let form = document.querySelector('app-form')
		form.querySelector('.page-title').innerHTML = `Edit project ${project.id}`
		form.set_data(project)

		this.save_form('save_project', (r) => {
			if (r.error) this.log(r.error)
			else {
				this.log('save done');
				window.location.href = '#'
			}
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

		let form = document.querySelector('app-form')
		form.set_data({ project_id: project_id })

		this.save_form('save_destination', (r) => {
			if (r.error) this.log(r.error)
			else {
				this.log('save done');
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

		let form = document.querySelector('app-form')
		form.querySelector('.page-title').innerHTML = `Edit destination ${id}`
		form.set_data(destination)

		this.save_form('save_destination', (r) => {
			if (r.error) this.log(r.error)
			else {
				this.log('save done');
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


	async page_new_panel(project_id, destination_index) {
		if (!project_id) {
			window.location.href = '#'
			return
		}

		destination_index *= 1

		let data = await this.server('projects_list')
		let project = data.find((v) => v.id === project_id);


		if (!project) {
			window.location.href = '#'
			return
		}

		let project_index = data.findIndex((v) => v.id === project_id)


		console.log(destination_index)
		let form = document.querySelector('app-form')
		form.set_data({ project_id: project_id })

		this.save_form('save_panel', (r) => {
			if (r.error) this.log(r.error)
			else {
				this.log('save done');
				window.location.href = '#'
				setTimeout(() => {
					document.querySelector('#projects').set_index(project_index)
					setTimeout(() => {
						document.querySelector('#destinations').set_index(destination_index)
					}, 200)

				}, 100)
			}
		})
	}

	async page_edit_panel(id, destination_index) {
		if (!id) {
			window.location.href = '#'
			return
		}

		destination_index *= 1

		let data = await this.server('projects_list')
		let project = data.find((v) => v.panels.find((v) => v.id === id))

		if (!project) {
			window.location.href = '#'
			return
		}


		let panel = project.panels.find((v) => v.id === id)
		let panel_index = project.panels.findIndex((v) => v.id === id)

		let project_index = data.findIndex((v) => v.id === panel.project_id)

		if (!panel) {
			window.location.href = '#'
			return
		}

		let form = document.querySelector('app-form')
		if (form) {
			form.querySelector('.page-title').innerHTML = `Edit panel ${id}`
			form.set_data(panel)
		}


		this.save_form('save_panel', (r) => {
			if (r.error) this.log(r.error)
			else {
				this.log('save done');
				window.location.href = '#'
				setTimeout(() => {
					document.querySelector('#projects').set_index(project_index)
						/*
						setTimeout(() => {
							document.querySelector('#destinations').set_index(destination_index)
						}, 100)
						*/
				}, 100)
			}
		})

	}

	page_new_font(id, destination_index) {
		document.querySelector('app-form').onsubmit((data) => {

			this.new_font(data)
		})
	}

	async page_fonts() {
		let r = await this.server('fonts_list')

		let cont = document.querySelector('.container')
		cont.innerHTML = '<ul>' + r.map(f => `<li><a style="color:black" href='#edit_font/${f}'>${f}</a></li>`).join('\n') + '</ul>'

	}

	async page_edit_font(font_name) {
		let r = await this.server('pixel_font', { name: font_name })
		document.querySelector('#font_name').innerHTML = font_name
		this.edit_font(r)
	}

	async page_test() {
		let fonts = await this.load_pixel_fonts()
		Array.from(document.querySelectorAll('led-dev')).map((el, i) => {

			if (i == 1)
				el.init_data({
					fonts: fonts,
					width: 80,
					height: 13,
					areas: [{
							x: 0,
							y: 0,
							width: 30,
							height: 13,
							text: '',
							spacing: 0,
							font: fonts[0].name
						},
						{
							x: 30,
							y: 0,
							width: 50,
							height: 13,
							text: '',
							spacing: 0,
							font: fonts[0].name
						},
					]
				})
			else if (i == 2)
				el.init_data({
					fonts: fonts,
					width: 80,
					height: 13,
					areas: [{
							x: 0,
							y: 0,
							width: 30,
							height: 7,
							text: '',
							spacing: 0,
							font: fonts[0].name
						},
						{
							x: 30,
							y: 0,
							width: 50,
							height: 13,
							text: '',
							spacing: 0,
							font: fonts[0].name
						},
					]
				})
			else
				el.init_data({ fonts: fonts, width: 80, height: 13 })

		})

	}

	// fonts
	async load_pixel_fonts() {
		let font_list = await this.server('fonts_list')
		let loading_fonts = font_list.map((font_name) => this.server('pixel_font', { name: font_name }))
		return await Promise.all(loading_fonts)
	}

	load_font(font) {
		let font_name = font.split(' ').slice(-1)[0]
		return new Promise(r => {
			if (document.fonts.check(font)) r(true)
			else {
				let my_font = new FontFace(font_name, `url(fonts/${font_name}.ttf)`)
				my_font.load().then((font) => {
					document.fonts.add(font);
					r(true)
				}).catch(e => {
					r(false)
				});
			}
		})

	}

	async new_font(data) {
		let font = {
			name: `${data.base_font}-${data.width}x${data.height}`,
			width: parseInt(data.width),
			height: parseFloat(data.height),
			chars: []
		}

		let font_to_use = `${font.height}px ${data.base_font}`
		let font_loaded = await this.load_font(font_to_use)

		if (!font_loaded) {
			console.log(`custom font not found in fonts folder, using Arial`)
			font_to_use = `${font.height}px Arial`
		}

		let canvas = document.createElement('canvas')
		let ctx = canvas.getContext('2d')

		canvas.width = font.width
		canvas.height = font.height
		ctx.fillStyle = "red"
		ctx.textBaseline = 'top'
		ctx.textAlign = 'center'
		ctx.textRendering = 'geometricPrecision'
		ctx.font = font_to_use

		let charmap = data.charmap.split('')
		charmap.map(c => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillText(c, Math.ceil(canvas.width / 2), 0)
			let img_data = ctx.getImageData(0, 0, canvas.width, canvas.height)
			let pixels = []
			for (let i = 0; i < img_data.data.length; i += 4) {
				let has_color = img_data.data[i] === 255 ? 1 : 0
				if (img_data.data[i + 3] < 90) has_color = 0
				if (data.make_empty_template) has_color = 0
				pixels.push(has_color)
			}

			font.chars.push({
				char: c,
				pixels: pixels
			})
		})


		this.edit_font(font)


	}
	edit_font(font) {
		let el = document.querySelector('.edit_font')

		el.innerHTML = ''
		this.extra_top.innerHTML = `
			<button class="add_char">➕ ADD CHAR</button>
			<button class="save_font">💾 SAVE</button>
		`


		let template = (w, h, c) => `
			<form class="page letter_form">
				<input type="text" name="char" value="${c.char}" onchange="this.form.onsubmit()" maxlength="1" autocomplete="off">
				<led-canvas data='${JSON.stringify({width:w,height:h,pixels:c.pixels,enable_click_draw:true})}' onchange="this.form.onsubmit()"></led-canvas>
			</form>
		`

		let make_font_chars = () => {
			font.chars = []
			Array.from(document.querySelectorAll('.letter_form')).map(f => {
				let char = f.querySelector('input').value
				if (char === '') return false
				font.chars.push({
					char: char,
					pixels: f.querySelector('led-canvas').get_pixels_data()
				})
			})

			let charmap_input = document.querySelector('.font_charmap')
			if (charmap_input) charmap_input.value = charmap_input.value = font.chars.map(c => c.char).join('')
		}

		let map_forms = () => {
			Array.from(document.querySelectorAll('.letter_form')).map(f => {
				f.onsubmit = (e) => {
					if (e) e.preventDefault()
					make_font_chars()
				}
			})
		}

		el.innerHTML += font.chars.map(c => template(font.width, font.height, c)).join('')
		map_forms()

		document.querySelector('.add_char').onclick = () => {
			el.innerHTML += template(font.width, font.height, { char: '', pixels: Array(font.width * font.height).fill(0) })
			map_forms()

			let cont = document.querySelector('.container')
			cont.scrollTop = cont.scrollHeight
		}

		document.querySelector('.save_font').onclick = async() => {
			let r = await this.server('save_font', font)
			window.location.href = '#fonts'
		}



	}

})