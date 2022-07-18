const fs = require('fs')
const path = require('path')
const build_path = './docs'


const deleteFolderRecursive = (directoryPath) => {
	if (fs.existsSync(directoryPath)) {
		fs.readdirSync(directoryPath).forEach((file, index) => {
			const curPath = path.join(directoryPath, file);
			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath);
			} else {
				// delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(directoryPath);
	}
}

const copyRecursiveSync = (src, dest) => {
	var exists = fs.existsSync(src);
	var stats = exists && fs.statSync(src);
	var isDirectory = exists && stats.isDirectory();
	if (isDirectory) {
		fs.mkdirSync(dest);
		fs.readdirSync(src).forEach(function (childItemName) {
			copyRecursiveSync(path.join(src, childItemName),
				path.join(dest, childItemName));
		});
	} else {
		fs.copyFileSync(src, dest);
	}
}


new class {
	constructor() {
		let components_folder = './src/components'

		this.index_import_folder(components_folder)
		this.make_build(components_folder)
	}
	index_import_folder(folder_path) {
		let import_location = `./${path.basename(folder_path)}`
		let files = fs.readdirSync(folder_path)
		let out_file = `${folder_path}.js`
		fs.writeFileSync(out_file, files.map(c => `import '${import_location}/${c}'\n`).join(''))
	}
	make_build(components_folder) {
		let build_folder = build_path
		let src_folder = './src'
		let comp_fol = path.basename(components_folder)
		let chat_script = `/main.js`


		deleteFolderRecursive(build_folder)
		copyRecursiveSync(src_folder, build_folder)
		deleteFolderRecursive(`${build_folder}/${comp_fol}`)
		fs.unlinkSync(`${build_folder}/${comp_fol}.js`)


		let files = fs.readdirSync(components_folder)
		let files_data = files.map(c => [`//component ${c.replace('.js', '')}`, fs.readFileSync(`${components_folder}/${c}`).toString()].join('\r\n')).join('\r\n\r\n')

		let script_data = fs.readFileSync(`${src_folder}${chat_script}`).toString().replace(`import './components.js'`, `\n${files_data}\n`)
		fs.writeFileSync(`${build_folder}${chat_script}`, script_data)

	}
}