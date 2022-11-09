window.customElements.define('led-canvas', class extends HTMLElement {
	static formAssociated = true
	template() {
		return `
        <style>
            .led_canvas{
                border:1px solid red;
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
			zoom_factor: 20,
			on_color: 'yellow',
			off_color: 'RGB(51, 51, 51)',
			enable_click_draw: false,
			pixels: []
		}, this.data)

		this.canvas.onclick = (e) => {
			let rect = e.target.getBoundingClientRect();
			let x = e.clientX - rect.left; //x position within the element.
			let y = e.clientY - rect.top; //y position within the element.
			this.on_click(x, y)
		}

		this.init_data()
		this.render()
	}

	on_click(ex, ey) {
		if (!this.data.enable_click_draw) return false

		let x = Math.floor(ex / this.data.zoom_factor)
		let y = Math.floor(ey / this.data.zoom_factor)

		let v = this.get_pixel(x, y) ? 0 : 1
		this.set_pixel(x, y, v)

	}
	get_pixel(x, y) {
		let i = (y * this.data.width + x)
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
	}

	render_pixel(x, y, color) {

		let r = (this.data.zoom_factor / 2)

		let nx = (x * this.data.zoom_factor) + r
		let ny = (y * this.data.zoom_factor) + r

		let pixel_color = (color) ? this.data.on_color : this.data.off_color
		this.ctx.beginPath();
		this.ctx.arc(nx, ny, r - 1, 0, 2 * Math.PI, false);
		this.ctx.fillStyle = pixel_color;
		this.ctx.fill()
	}

	render() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
		let x = 0
		let y = 0
		this.data.pixels.map(pixel => {
			this.render_pixel(x, y, pixel)
			x++
			if (x >= this.data.width) {
				x = 0
				y++
			}
		})

	}


})