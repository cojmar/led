window.customElements.define('led-canvas', class extends HTMLElement {

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
	constructor() {
		super()
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
			pixels: []
		}, this.data)

		this.init_data()
		this.render()
	}

	init_data() {
		this.canvas.width = this.data.width * this.data.zoom_factor
		this.canvas.height = this.data.height * this.data.zoom_factor
	}

	set_pixel(x, y, color) {


		let factor = this.data.zoom_factor
		let r = (factor / 2)

		let nx = (x * factor) + r
		let ny = (y * factor) + r

		let pixel_color = (color) ? this.data.on_color : this.data.off_color
		this.ctx.beginPath();
		this.ctx.arc(nx, ny, r, 0, 2 * Math.PI, false);
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
			this.set_pixel(x, y, pixel)
			x++
			if (x >= this.data.width) {
				x = 0
				y++
			}
		})

	}


})