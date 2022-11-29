window.customElements.define('led-dev', class extends HTMLElement {

	template(w, h) {
		return `
        <style>
            .font_toolbar select,
			.font_toolbar input
			{
				width:200px;
			}
			.font_toolbar{
				user-select: none;
			}

			.font_toolbar span{
				cursor:pointer;
				user-select: none;
			}
           
        </style>
        
        <div class="page">
			<div class="font_toolbar">
				Font:
					<select class="font_select"></select>
				Text:
					<input type="text" class="area_text">				
					<input type="color" style="width:60px;" list="color_palette" class="area_color">
					<datalist id="color_palette">
						<option>#df0000</option>
					</datalist>
				Spacing:
					<input type="number" class="area_spacing" value=0 style="width:30px;">

					<select style="width:70px;" class="panel_template">
						<option value=0>-------</option>
						<option value=1>--|----</option>
						<option value=2>--|====</option>
					</select>

					<span class="move_text_left" title="Move left">⬅️</span>
					<span class="move_text_right" title="Move right">➡️</span>
					<span class="move_text_up" title="Move up">⬆️</span>
					<span class="move_text_down" title="Move down">⬇️</span>
					
					<span class="align_top" title="Align top">A⬆</span>
					<span class="align_down" title="Align bottom">A⬇</span>										

					<span class="align_left" title="Align left">A⬅</span>										
					<span class="align_right" title="Align right">A➡</span>

					<span class="align_center_v" title="Align vertical center">A↕️</span>
					<span class="align_center_h" title="Align horizontal center">A↔️</span>
					<span class="align_center" title="Align center">A✛</span>

					<label>
						<input type="checkbox" class="area_scrolling" style="width:20px;"/>
						Scrolling text
					</label>
					
					

			</div>
			<led-canvas data='${JSON.stringify({width:w,height:h,enable_click_draw:false})}'></led-canvas>
        </div>
        `
	}

	constructor() {
		super()
		try {
			this.data = JSON.parse((this.attributes.data.value) ? this.attributes.data.value : "{}")
		} catch (error) {
			this.data = {}
		}

		this.data = Object.assign({
			width: 0,
			height: 0,
			fonts: [],
			palette: [],
			areas: []
		}, this.data)

		//setInterval(() => this.update(), 300)

	}

	init_panel(p) {
		switch (p) {
			default: this.data.areas = []
			this.init_data()
			break
			case "1":
					this.init_data({
					areas: [{
							x: 0,
							y: 0,
							width: 30,
							height: this.data.height,

						},
						{
							x: 30,
							y: 0,
							height: this.data.height,
						}
					]
				})
				break
			case "2":
					this.init_data({
					areas: [{
							x: 0,
							y: 0,
							width: 30,
							height: this.data.height,

						},
						{
							x: 30,
							y: 0,
							height: Math.ceil(this.data.height / 2),
						},
						{
							x: 30,
							y: Math.ceil(this.data.height / 2),

						}
					]
				})
				break

		}
		this.querySelector(".panel_template").value = p
	}


	init_data(data) {
		if (data) {
			Object.keys(this.data).map(k => {
				if (data[k]) this.data[k] = data[k]
			})
		}
		this.innerHTML = this.template(this.data.width, this.data.height)

		if (!this.data.areas.length) {
			this.data.areas.push({

			})
		}

		this.data.areas.forEach(a => {
			if (!a.x) a.x = 0
			if (!a.y) a.y = 0
			if (!a.width) a.width = this.data.width - a.x
			if (!a.height) a.height = this.data.height - a.y
			if (!a.left) a.left = 0
			if (!a.top) a.top = 0
			if (!a.color) a.color = 164
			if (!a.text) a.text = ''
			if (!a.spacing) a.spacing = 0
			if (!a.font) a.font = this.data.fonts[0].name || false
		})



		let font_select = this.querySelector('.font_select')
		font_select.innerHTML = this.data.fonts.map((f, i) => `<option value="${i}">${f.name}</option>`).join('\n')
		font_select.onchange = () => (this.area.font = this.data.fonts[font_select.value].name, this.render())

		let area_text = this.querySelector('.area_text')
		area_text.onkeyup = area_text.onchange = () => (this.area.text = area_text.value, this.render())

		area_text.onfocus = () => {
			this.led_canvas.use_animation = true
		}

		area_text.onblur = () => {
			this.led_canvas.use_animation = false
		}

		let area_spacing = this.querySelector('.area_spacing')
		area_spacing.onchange = () => (this.area.spacing = area_spacing.value, this.render())

		let area_color = this.querySelector('.area_color')

		this.led_canvas = this.querySelector('led-canvas')
		this.led_canvas.on_click = (x, y) => {

			let area_clicked = 0

			this.data.areas.map((a, i) => {
				if (x >= a.x && x <= a.x + a.width && y >= a.y && y <= a.y + a.height) area_clicked = i
			})

			if (area_clicked !== this.selected_area) {
				this.selected_area = area_clicked
				this.led_canvas.set_area_data(this.data.areas, this.selected_area)
				this.area = this.data.areas[this.selected_area]

				area_text.value = this.area.text
				font_select.value = this.data.fonts.findIndex(v => v.name === this.area.font)
				area_spacing.value = this.area.spacing
				area_color.value = this.data.palette[this.area.color - 1]

			}
			area_text.focus()

		}

		this.led_canvas.data.palette = this.data.palette



		this.selected_area = 0
		this.area = this.data.areas[this.selected_area]
		this.led_canvas.set_area_data(this.data.areas, this.selected_area)


		this.querySelector('#color_palette').innerHTML = this.data.palette.map(c => `<option value="${c}">${c}</option>`).join('\n')

		area_color.value = this.data.palette[this.area.color - 1]


		area_color.onchange = () => {
			let color = this.data.palette.indexOf(area_color.value) + 1
			this.area.color = color || 1
			this.render()
		}

		this.querySelector(".move_text_left").onclick = () => (this.area.left--, this.render())
		this.querySelector(".move_text_right").onclick = () => (this.area.left++, this.render())
		this.querySelector(".move_text_up").onclick = () => (this.area.top--, this.render())
		this.querySelector(".move_text_down").onclick = () => (this.area.top++, this.render())


		let panel_template = this.querySelector(".panel_template")
		panel_template.onchange = () => this.init_panel(panel_template.value)

		this.querySelector(".align_down").onclick = () => {
			this.area.top = 0
			this.render
			let pad = this.get_area_padding(this.area)
			this.area.top = pad[3]
			this.render()
		}

		this.querySelector(".align_top").onclick = () => {
			this.area.top = 0
			this.render()
			let pad = this.get_area_padding(this.area)
			this.area.top = pad[1] * -1
			this.render()
		}

		this.querySelector(".align_right").onclick = () => {
			this.area.left = 0
			this.render
			let pad = this.get_area_padding(this.area)
			this.area.left = pad[2]
			this.render()
		}

		this.querySelector(".align_left").onclick = () => {
			this.area.left = 0
			this.render()
			let pad = this.get_area_padding(this.area)
			this.area.left = pad[0] * -1
			this.render()
		}


		this.querySelector(".align_center_h").onclick = () => {
			this.area.left = 0
			this.render()
			let pad = this.get_area_padding(this.area)
			this.area.left = Math.floor((pad[0] * -1) + (Math.abs(pad[0] - pad[2]) / 2))
			this.render()
		}

		this.querySelector(".align_center_v").onclick = () => {
			this.area.top = 0
			this.render()
			let pad = this.get_area_padding(this.area)
			this.area.top = Math.floor((pad[1] * -1) + (Math.abs(pad[1] - pad[3]) / 2))
			this.render()
		}

		this.querySelector(".align_center").onclick = () => {
			this.area.top = 0
			this.area.left = 0
			this.render()
			let pad = this.get_area_padding(this.area)
			this.area.top = Math.floor((pad[1] * -1) + (Math.abs(pad[1] - pad[3]) / 2))
			this.area.left = Math.floor((pad[0] * -1) + (Math.abs(pad[0] - pad[2]) / 2))
			this.render()
		}

		let area_scrolling = this.querySelector('.area_scrolling')
		this.querySelector('.area_scrolling').onclick = () => this.area.area_scrolling = area_scrolling.checked





		this.render()

	}
	get_area_padding(a) {
		let img_data = this.get_area_image(a)
		let ret = false
		img_data.map((row, y) => {
			row.map((v, x) => {
				if (!v) return false
				if (!ret) ret = [x, y, x, y]
				if (x < ret[0]) ret[0] = x
				if (y < ret[1]) ret[1] = y

				if (x > ret[2]) ret[2] = x
				if (y > ret[3]) ret[3] = y
			})
		})
		if (!ret) ret = [0, 0, 0, 0]
		ret[2] = (a.width - ret[2]) - 1
		ret[3] = (a.height - ret[3]) - 1
		return ret
	}

	update() {
		if (!this.data.areas) return false

		let render = false
		this.data.areas.map(a => {
			if (!a.area_scrolling) return false
			a.left -= 1

			let pad = this.get_area_padding(a)
			let img = JSON.stringify(this.get_area_image(a))


			if (img.indexOf('1') < 0) a.left = a.width - (pad[0] + 1)

			render = true
		})
		if (render) this.render()
	}

	get_area_image(a) {
		let font = this.data.fonts.find(f => f.name === a.font)
		let cx = 0
		let cy = 0
		let sep = parseInt(font.width) + parseInt(a.spacing)
		let img_data = []
		for (let y = 0; y <= a.height; y++) img_data.push(Array(a.width).fill(0))
		a.text.split('').map(l => {

			if (l === ' ') {
				cx += sep
				return true
			}

			let char = font.chars.find(c => c.char === l)
			if (!char) return false

			let px = 0
			let py = 0
			char.pixels.map((p, i) => {

				let point_x = cx + px + a.left
				let point_y = cy + py + a.top


				let ok = true
				if (p === 0) ok = false
				if (a.width - point_x <= 0) ok = false
				if (a.height - point_y <= 0) ok = false
				if (point_x < 0) ok = false
				if (point_y < 0) ok = false



				if (ok) {
					img_data[point_y][point_x] = p
				}


				px++
				if (px >= font.width) {
					px = 0
					py++
				}
			})

			cx += sep


		})
		return img_data
	}

	render() {
		let pixel_data = this.led_canvas.empty_pixels()
		this.data.areas.map(a => {
			let area_image = this.get_area_image(a)




			area_image.map((col, y) => {
				col.map((v, x) => {
					let ci = this.led_canvas.get_index(x + a.x, y + a.y)
					pixel_data[ci] = (v) ? a.color : v
				})
			})

			this.led_canvas.render(pixel_data)

		})
	}

	render_old() {


		let pixel_data = this.led_canvas.empty_pixels()

		this.data.areas.map(a => {
			let font = this.data.fonts.find(f => f.name === a.font)
			let cx = a.x
			let cy = a.y
			let sep = parseInt(font.width) + parseInt(a.spacing)

			a.text.split('').map(l => {

				if (l === ' ') {
					cx += sep
					return true
				}

				let char = font.chars.find(c => c.char === l)
				if (!char) return false

				let px = 0
				let py = 0
				char.pixels.map((p, i) => {

					let point_x = cx + px
					let point_y = cy + py


					let ok = true
					if (p === 0) ok = false
					if (a.width - point_x <= 0) ok = false



					if (ok) {
						let ci = this.led_canvas.get_index(point_x, point_y)
						pixel_data[ci] = p
					}


					px++
					if (px >= font.width) {
						px = 0
						py++
					}
				})

				cx += sep


			})


		})


		this.led_canvas.render(pixel_data)



	}

})