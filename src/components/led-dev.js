window.customElements.define('led-dev', class extends HTMLElement {

	template() {
		return `
        <style>
            canvas{
                border:1px solid red;
                font-smooth: never;
            }
           
        </style>
        
        <div class="page">
        <canvas></canvas>
        <canvas></canvas>
        </div>
        `
	}

	constructor() {
		super()
		this.innerHTML = this.template()
		this.canvas = []
		this.ctx = []

		Array.from(this.querySelectorAll('canvas')).map(c => {
			this.canvas.push(c)
			this.ctx.push(c.getContext('2d'))
		})
		this.render()
	}

	load_font(font) {
		let font_name = font.split(' ').slice(-1)[0]
		return new Promise(r => {
			if (document.fonts.check(font)) r()
			else {
				let my_font = new FontFace(font_name, `url(fonts/${font_name}.ttf)`)
				my_font.load().then((font) => {
					document.fonts.add(font);
					r()
				});
			}
		})

	}

	async write_text(ctx, x, y, text, font) {
		if (font) await this.load_font(font)
		ctx.fillStyle = "green"
		ctx.imageSmoothingEnabled = false

		ctx.textBaseline = 'top'
		ctx.font = font
		ctx.fillText(text, x, y)
	}
	rgb_to_hex(r, g, b) {
		r = r.toString(16);
		g = g.toString(16);
		b = b.toString(16);

		if (r.length == 1)
			r = "0" + r;
		if (g.length == 1)
			g = "0" + g;
		if (b.length == 1)
			b = "0" + b;

		return "#" + r + g + b;
	}
	rgba_to_hex(r, g, b, a) {
		r = r.toString(16);
		g = g.toString(16);
		b = b.toString(16);
		a = Math.round(a * 255).toString(16);

		if (r.length == 1)
			r = "0" + r;
		if (g.length == 1)
			g = "0" + g;
		if (b.length == 1)
			b = "0" + b;
		if (a.length == 1)
			a = "0" + a;

		return "#" + r + g + b + a;
	}

	get_pixel_data(canvas) {
		let ctx = canvas.getContext('2d')
		let img_data = ctx.getImageData(0, 0, canvas.width, canvas.height)
		let pixels = []

		for (let i = 0; i < img_data.data.length; i += 4) {
			let r = img_data.data[i + 0]
			let g = img_data.data[i + 1]
			let b = img_data.data[i + 2]
			let a = img_data.data[i + 3] / 255

			let color = this.rgb_to_hex(r, g, b, a)

			if (a < 0.25) color = '#000000'

			pixels.push(color)
		}
		return pixels
	}

	zoom_canvas(canvas1, canvas2, factor) {
		let ctx1 = canvas1.getContext('2d')
		let ctx2 = canvas2.getContext('2d')

		canvas2.width = canvas1.width * factor
		canvas2.height = canvas1.height * factor
		let pixel_data = this.get_pixel_data(canvas1)

		//console.log(JSON.stringify(pixel_data))

		let x = 0
		let y = 0
		let r = factor
		pixel_data.map((pixel, i) => {
			let nx = (x * factor) + (r / 2)
			let ny = (y * factor) + (r / 2)
			ctx2.beginPath();
			ctx2.arc(nx, ny, r / 2, 0, 2 * Math.PI, false);
			ctx2.fillStyle = pixel;
			ctx2.fill();
			x++
			if (x >= canvas1.width) {
				x = 0
				y++
			}
		})


	}

	test1() {

		this.write_text(this.ctx[0], 0, 0, 'A', '30px Arial')
		this.write_text(this.ctx[0], 20, 0, 'A', '30px Kulminoituva')
		this.write_text(this.ctx[0], 40, 0, 'A', '12px slkscr')

	}
	async test2() {
		this.canvas[0].width = 80
		this.canvas[0].height = 8
			//await this.write_text(this.ctx[0], 0, 0, 'Armata poporului', '8px slkscr')
		await this.write_text(this.ctx[0], 0, 0, 'O', '8px slkscr')

		this.zoom_canvas(this.canvas[0], this.canvas[1], 10)
	}

	render() {
		this.test2()

	}

})