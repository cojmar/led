window.customElements.define('led-dev', class extends HTMLElement {

	template(w, h) {
		return `
        <style>
            .font_toolbar select,
			.font_toolbar input
			{
				width:200px;
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

		let font_select = this.querySelector('.font_select')
		font_select.innerHTML = this.data.fonts.map((f, i) => `<option value="${i}">${f.name}</option>`).join('\n')
		font_select.onchange = () => (this.area.font = this.data.fonts[font_select.value].name, this.render())

		let area_text = this.querySelector('.area_text')
		area_text.onkeyup = area_text.onchange = () => (this.area.text = area_text.value, this.render())

		let area_spacing = this.querySelector('.area_spacing')
		area_spacing.onchange = () => (this.area.spacing = area_spacing.value, this.render())

		this.led_canvas = this.querySelector('led-canvas')
		this.led_canvas.on_click = (ex, ey) => {
			console.log(ex, ey)
			area_text.focus()
		}



		this.selected_area = 0
		this.area = this.data.areas[this.selected_area]



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

				let point_x = cx + px
				let point_y = cy + py


				let ok = true
				if (p === 0) ok = false
				if (a.width - point_x <= 0) ok = false



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