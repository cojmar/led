window.customElements.define('led-dev', class extends HTMLElement {

	template(w, h) {
		return `
        <style>
            .font_toolbar select,
			.font_toolbar input
			{
				width:200px;
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
				Spacing:
					<input type="number" class="area_spacing" value=0 style="width:30px;">
					<span class="move_text_left">⬅️</span>
					<span class="move_text_right">➡️</span>
					<span class="move_text_up">⬆️</span>
					<span class="move_text_down">⬇️</span>
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
			areas: [

			]
		}, this.data)



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
				x: 0,
				y: 0,
				width: this.data.width,
				height: this.data.height,
				text: '',
				spacing: 0,
				font: this.data.fonts[0].name || false
			})
		}

		this.data.areas.forEach(a => {
			if (!a.left) a.left = 0
			if (!a.top) a.top = 0
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

			}
			area_text.focus()

		}



		this.selected_area = 0
		this.area = this.data.areas[this.selected_area]
		this.led_canvas.set_area_data(this.data.areas, this.selected_area)


		this.querySelector(".move_text_left").onclick = () => (this.area.left--, this.render())
		this.querySelector(".move_text_right").onclick = () => (this.area.left++, this.render())
		this.querySelector(".move_text_up").onclick = () => (this.area.top--, this.render())
		this.querySelector(".move_text_down").onclick = () => (this.area.top++, this.render())



		this.render()

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
					pixel_data[ci] = v
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