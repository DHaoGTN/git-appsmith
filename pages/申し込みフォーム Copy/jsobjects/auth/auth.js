export default {
	secretBE: 'secret',
	baseUrlBE: 'http://affiliate-stg-api.gtn.co.jp/rpa/',
	getSecretBE: this.baseUrlBE+'get_secret',
	rpaBE: this.baseUrlBE+'application_forms',
	jwtBE: '',
	async createTokenBE() {
		let payload = {
			// 'exp': 3600,
			'scope': 'agency'
		};
		this.jwtBE = await jsonwebtoken.sign(payload, this.secretBE, {expiresIn: 3600});
		// console.log('jwtBE: '+this.jwtBE);
	},
	
	
	////----------- AUTHENTICATION FUNCTION------------////
	async startUp() {
		const token = await appsmith.store.token;
		const tokenInDb = await check_token_exist.run({ token });
		const tokenCountInDb = tokenInDb[0]["count"];

		if (token !== undefined && tokenCountInDb === 1) {
			console.log("do nothing");
		} else if (
			token === undefined &&
			tokenCountInDb === 0 &&
			appsmith.mode !== "EDIT"
		) {
			navigateTo("ログイン");
		}
	},

	isTokenValid: () => {
		const token = appsmith.store.token;
		try {
			jsonwebtoken.verify(token, "gtn-id");
			return true;
		} catch (error) {
			return false;
		}
	},

	logout: async () => {
		const token = appsmith.store.token;
		// check_token_exist.run({token});
		// use try catch incase there is token in local storage to compare with token in db
		try {
			await delete_token_in_db.run({ token });
			await window.localStorage.clear();
		} catch (error) {
			return navigateTo("ログイン");
		}
		return showAlert(messages.Auth.LOGOUT_SUCCESS, "success")
			.then(() => navigateTo("ログイン"))
			.catch((e) => showAlert(e.message, "error"));
	},

	checkToken: () => {
		const token = appsmith.store.token;
		console.log(token);
	},

	////-------------------main loop ---------------------////
	intervalId: null,
	async checkValidTokenInDb() {
		try {
			const isTokenValid = this.isTokenValid();
			if (isTokenValid) {
				console.log("token still valid, continue");
			} else {
				console.log("token exprire, delete token in db");
				const token = appsmith.store.token;
				delete_token_in_db.run({ token });
				showAlert(messages.Auth.SESSION_EXPIRED, "error");
				console.log("deleted token in db ");
			}
		} catch (error) {
			showAlert(messages.Auth.GENERAL_ERROR + "\n" + error.message, "error");
		}
	},

	async loopToCheckTokenExist() {
		if (!this.intervalId) {
			const process = async () => {
				try {
					const token = appsmith.store.token;
					console.log("token", token);

					//check if current token is still valid or not
					this.checkValidTokenInDb();

					// if token is not valid, count in db is 0, else do nothing
					const tokenInDb = await check_token_exist.run({ token });
					console.log("token in db", tokenInDb);
					const tokenCountInDb = tokenInDb[0]["count"];
					console.log("tokenCountInDb", tokenCountInDb);
					// if ( tokenCountInDb === 0 && appsmith.mode !== 'EDIT' ){
					if (tokenCountInDb === 0) {
						showAlert(messages.Error.SESSION_EXPIRED,'error')
						this.logout();
						console.log("navigate to ログイン");
					}
					console.log("token still valid");
				} catch (error) {
					showAlert(
						messages.Auth.GENERAL_ERROR + "\n" + error.message,
						"error"
					);
				}
			};
			this.intervalId = setInterval(process, 5000);
		}
	},

	stopCountingAndLogging() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	},
};
