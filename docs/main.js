
//component app-form
window.customElements.define('app-form', class extends HTMLElement {

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

//component led-panel
window.customElements.define('led-panel',
	class extends HTMLElement {
		template() {
			return `
			<style>

				canvas{
					left:50px;
					font-smooth: never;
					-webkit-font-smoothing : none;
				}
				input{
					position:absolute;
					background: transparent;
					border: none;					
					color:rgba(0, 0, 0, 0);
							
				}				
				::selection {
					color: rgba(0, 0, 0, 0);
					background: rgba(0, 0, 0, 0);
				}
				input:focus{
					outline: none;
				}
				div{
					border: 2px solid;
					background-color:darkblue;
					
					
					resize: both;
					overflow: hidden;					

				}
			</style>
			<div id="my_container">
				<input type="text" id="my_text" autocomplete='off' spellcheck='false' autocorrect='off'></input>
				<canvas></canvas>			
			</div>
            
            `
		}

		set_data(k,v){
			this[k] =(typeof this[k] ==='number')?Number(v):v
			if(this.r_time_out) clearTimeout(this.r_time_out)
			this.r_time_out = setTimeout(() => this.render())			
		}

		constructor() {
			super()
			this.font = "Arial Black"
			this.font_size =28
			
			this.width =800
			this.height = 120

			this.canvas_width =128
			this.canvas_height =19


			this.text = '178'

			this.bg_color = 'darkblue'

			this.fr_color = '#000000'

			this.color = '#df0000'

			this.text_left = 0
			this.text_top = 0

			


			this.attachShadow({ mode: "open" })
			this.shadowRoot.innerHTML = this.innerHTML+ this.template()

			this.shadowRoot.set_data = (...arg)=> this.set_data(...arg)
			
			
			//this.setAttribute('socket', false)
		}		

		connectedCallback(){
			this.canvas = this.shadowRoot.querySelector('canvas')
			this.input = this.shadowRoot.querySelector('input')
			this.my_container = this.shadowRoot.querySelector('#my_container')

			new ResizeObserver(()=>{
				let w = this.my_container.offsetWidth
				let h = this.my_container.offsetHeight-8

				this.set_data('width',w)
				this.set_data('height',h)

				//console.log(h,this.height)
			}).observe(this.my_container)
			
			


			this.input.value = this.text		

			this.input.addEventListener('change',()=>{				
				this.text = this.input.value
				this.render()
			})

			this.input.addEventListener('keyup',()=>{				
				this.text = this.input.value
				this.render()
			})

			this.ctx = this.canvas.getContext("2d")	
			
			this.render()
		}

		
		init_canvas(canvas){
			canvas.width = `${this.canvas_width}`
			canvas.height = `${this.canvas_height}`
			let ctx = canvas.getContext("2d")
			ctx.fillStyle = this.bg_color
			ctx.fillRect(0, 0, canvas.width, canvas.height)
		}

		add_text(){

			let canvas = document.createElement('canvas')
			this.init_canvas(canvas)			
			let ctx = canvas.getContext("2d")

			let text = this.text		
			ctx.fillStyle = this.color
			ctx.font = `${this.font_size}px ${this.font}`
			
			let left = ctx.measureText(text).actualBoundingBoxLeft
			let top = ctx.measureText(text).actualBoundingBoxAscent			
			
			ctx.fillText(text, left+this.text_left,top+this.text_top)

			return this.get_pixel_data(ctx)
		}
		rgb_to_hex(r, g, b) {
			if (r > 255 || g > 255 || b > 255)
				throw "Invalid color component";
			return ((r << 16) | (g << 8) | b).toString(16);
		}

		get_pixel(ctx,x,y){
			let p = ctx.getImageData(x, y, 1, 1).data
			return "#" + ("000000" + this.rgb_to_hex(p[0], p[1], p[2])).slice(-6)
		}

		get_pixel_data(ctx){
			let x = 0
			let y=0
			let max_x = this.canvas_width
			let max_y = this.canvas_height
			let loop = true

			let p_data = []
			
			while(loop){
				if (x === max_x && y===max_y) loop = false				
				p_data.push((this.get_pixel(ctx,x,y) === this.color) ? 1 : 0)

				x++
				if(x>max_x){
					y++
					x=0
				}
			}

			return p_data
		}

		fill(ix, iy, color) {			

			let radius = this.width / this.canvas_width  > this.height / this.canvas_height ?this.height / (this.canvas_height+1): this.width / (this.canvas_width +1) 
			let padding = radius / 5

			let x = (ix * radius)
			let y = (iy * radius)

			x+= padding
			y+= padding

			this.ctx.fillStyle = color
			this.ctx.fillRect(x, y, radius-(padding*2), radius-(padding*2))
			
		}

		render(){		
			let pixels = this.add_text()
			

			this.canvas.width = `${this.width}`
			this.canvas.height = `${this.height}`

			this.input.style.width = `${this.width}px`
			this.input.style.height = `${this.height}px`
			
			let f_size = (this.font_size * 100) / (this.canvas_height *100 / this.height )			

			this.input.style.fontSize = `${f_size}px`			
			this.input.style.fontFamily = this.font
			
			this.input.style.caretColor = this.color			

			this.ctx.fillStyle = this.bg_color
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)								
			
			let x = 0
			let y = 0
			pixels.map(pixel=>{
				this.fill(x,y,this.fr_color)	
				if (pixel) this.fill(x,y,this.color)					
				x++
				if(x>this.canvas_width){
					y++
					x=0
				}

				

			})

		}
	}
)

//component led-tool-panel
window.customElements.define('led-tool-panel',
	class extends HTMLElement {
		template() {
			return `
			<style>
				input[type="number"]{
					width:50px;
				}
			</style>
			<div>
				Font:
				<select id="font"></select>
				

				Font-size:
				<input type="number" id="font_size" autocomplete='off' spellcheck='false' autocorrect='off' value='28'></input>				

				Width:
				<input type="number" id="canvas_width" autocomplete='off' spellcheck='false' autocorrect='off' value='128'></input>				

				Height:
				<input type="number" id="canvas_height" autocomplete='off' spellcheck='false' autocorrect='off' value='19'></input>				

			</div>
            
            `
		}

		change(e){
			this.getRootNode().set_data(e.id,e.value)
		}
		
		init_fonts(){

			const fontCheck = new Set([
				// Windows 10
			  'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
				// macOS
				'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
			  ].sort());
			  
			  (async() => {
				await document.fonts.ready;
			  
				const fontAvailable = new Set();
			  
				for (const font of fontCheck.values()) {
				  if (document.fonts.check(`12px "${font}"`)) {
					fontAvailable.add(font);
				  }
				}
			  
				let opt = Array.from(fontAvailable.values()).reduce((r,f)=>r+=`<option value="${f}">${f}</option>`,'')				
				let fnt = this.shadowRoot.querySelector('#font')
				fnt.innerHTML = opt
				fnt.value = 'Arial Black'

				fnt.addEventListener('change',()=>this.change(fnt))

				
			  })();

		}

		constructor() {
			super()	

			this.attachShadow({ mode: "open" })
			this.shadowRoot.innerHTML = this.innerHTML+ this.template()
		}		
		connectedCallback(){
			Array.from(this.shadowRoot.querySelectorAll('input')).map(e=>{
				e.addEventListener('change',()=>this.change(e))
				e.addEventListener('keyup',()=>this.change(e))
			})

			this.init_fonts()

		}

		

	}
)

//component radio-list
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
		this.list.innerHTML = `<div class="list-title">${this.my_title}</div>`

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
		this.hide()
		this.my_title = this.innerHTML
		this.innerHTML = this.template()
		this.item_template = this.querySelector('.list-item-template').content
		this.clear()
	}

})


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
		document.querySelector('app-form').onsubmit(async(data) => {
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
		form.querySelector('.page-title').innerHTML = `Edit panel ${id}`
		form.set_data(panel)

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



})