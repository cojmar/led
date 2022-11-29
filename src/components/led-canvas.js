window.customElements.define('led-canvas', class extends HTMLElement {
	static formAssociated = true
	template() {
		return `
        <style>
            .led_canvas{
                border:1px solid black;
                font-smooth: never;
            }
           
        </style>
        <canvas class="led_canvas"></canvas>
        `
	}
	get form() {
		return this.internals.form
	}
	constructor() {
		super()
		this.internals = this.attachInternals()
		this.innerHTML = this.template()
		this.canvas = this.querySelector('canvas')
		this.ctx = this.canvas.getContext('2d')

		try {
			this.data = JSON.parse((this.attributes.data.value) ? this.attributes.data.value : "{}")
		} catch (error) {
			this.data = {}
		}

		this.data = Object.assign({
			width: 100,
			height: 100,
			zoom_factor: 10,
			on_color: 'yellow',
			off_color: 'RGB(51, 51, 51)',
			enable_click_draw: false,
			palette: false,
			pixels: []
		}, this.data)

		this.canvas.onclick = (e) => {
			let rect = e.target.getBoundingClientRect();
			let ex = e.clientX - rect.left; //x position within the element.
			let ey = e.clientY - rect.top; //y position within the element.

			let x = Math.floor(ex / this.data.zoom_factor)
			let y = Math.floor(ey / this.data.zoom_factor)

			this.on_click(x, y)
		}

		this.init_data()
		this.render()
		setInterval(() => this.animate(), 500);

	}

	on_click(x, y) {
		if (!this.data.enable_click_draw) return false
		let v = this.get_pixel(x, y) ? 0 : 1
		this.set_pixel(x, y, v)

	}
	get_index(x, y) {
		return y * this.data.width + x
	}
	get_pixel(x, y) {
		let i = this.get_index(x, y)
		return this.data.pixels[i]
	}
	set_pixel(x, y, v = 1) {
		let i = (y * this.data.width + x)
		this.data.pixels[i] = v
		this.render()
		this.dispatchEvent(new Event('change'))
	}

	get_pixels_data() {
		return this.data.pixels
	}

	init_data() {
		this.canvas.width = this.data.width * this.data.zoom_factor
		this.canvas.height = this.data.height * this.data.zoom_factor
		if (!this.data.pixels.length) {
			this.data.pixels = Array(this.data.width * this.data.height).fill(0)
		}
	}

	render_pixel(x, y, color) {

		let r = (this.data.zoom_factor / 2)

		let nx = (x * this.data.zoom_factor) + r
		let ny = (y * this.data.zoom_factor) + r

		let pixel_color = (color) ? this.data.on_color : this.data.off_color
		if (this.data.palette && color > 0) pixel_color = this.data.palette[color - 1]



		this.ctx.beginPath();
		this.ctx.arc(nx, ny, r - 1, 0, 2 * Math.PI, false);
		this.ctx.fillStyle = pixel_color;
		this.ctx.fill()
	}

	empty_pixels() {
		return Array(this.data.width * this.data.height).fill(0)
	}


	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
	}

	render(pixels = false) {
		this.clear()
		let x = 0
		let y = 0

		if (pixels) this.data.pixels = pixels

		let pixel_data = this.empty_pixels()
		this.data.pixels.map((p, i) => pixel_data[i] = p)

		pixel_data.map(pixel => {
			this.render_pixel(x, y, pixel)
			x++
			if (x >= this.data.width) {
				x = 0
				y++
			}
		})

		if (!this.areas) return false


		this.ctx.lineWidth = 4
		this.ctx.strokeStyle = "red"

		this.areas.map((a, i) => {
			if (i === this.selected_area) this.green_area = [a.x * this.data.zoom_factor, a.y * this.data.zoom_factor, (a.width) * this.data.zoom_factor, (a.height) * this.data.zoom_factor]
			else this.ctx.strokeRect(a.x * this.data.zoom_factor, a.y * this.data.zoom_factor, (a.width) * this.data.zoom_factor, (a.height) * this.data.zoom_factor)
		})

		this.ctx.strokeStyle = "green"
		this.ctx.strokeRect(...this.green_area)

	}
	animate() {
		if (!this.use_animation) return false
		if (!this.green_area) return false
		if (!this.color) this.color = "green"

		this.color = (this.color === "green") ? "lime" : "green"

		this.ctx.strokeStyle = this.color
		this.ctx.strokeRect(...this.green_area)


	}

	set_area_data(areas, selected) {
		this.areas = areas
		this.selected_area = selected
		this.render()
	}




})