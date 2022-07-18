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