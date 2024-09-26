export default {
	async genRandomStr(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
	},

	async genRandomFileName(orgFileName) {
		let random = await this.genRandomStr(5);
		return random+'-'+orgFileName;
	},
	/**
	* For convert array like ["a", "b"] to {"a", "b"} (insert postgres enum array)
	*/
	convertArrayToPostgresArray: (array) =>{
		const formattedString = `{${array.join(", ")}}`;
		return formattedString;
	},
	validateEmail: (email) => {
		return String(email)
			.toLowerCase()
			.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
	},
	async copyToClipboard($str, $msg) {
		await copyToClipboard($str);
		showAlert($msg);
	}
}