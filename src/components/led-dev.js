window.customElements.define('led-dev', class extends HTMLElement {

	template() {
		return `
        <style>
            canvas{
                border:1px solid red;
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
		ctx.textBaseline = 'top'
		ctx.font = font
		ctx.fillText(text, x, y)
	}

	test1() {

		this.write_text(this.ctx[0], 0, 0, 'A', '30px Arial')
		this.write_text(this.ctx[0], 20, 0, 'A', '30px Kulminoituva')
		this.write_text(this.ctx[0], 40, 0, 'A', '12px slkscr')

	}

	render() {
		this.test1()

	}

})