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