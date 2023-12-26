export default {
	intervalId: null,
	isTokenValid : () =>{
		const token = appsmith.store.token;
		try {
			jsonwebtoken.verify(token, 'gtn-id');
			return true; 
		} catch (error) {
			return false; 
		}
	},

	async checkValidTokenInDb (){
		const isTokenValid = this.isTokenValid();
		if (isTokenValid){
			console.log('token still valid, continue')
		}
		else {
			console.log('token exprire, delete token in db')
			const token = appsmith.store.token;
			delete_token_in_db.run({token});
			console.log('deleted token in db ')
		}
	},

	async loopToCheckTokenExist() { 
		if (!this.intervalId) {
			const process = async () => {
				const token = appsmith.store.token;
				console.log('token', token)

				//check if current token is still valid or not
				this.checkValidTokenInDb();

				// if token is not valid, count in db is 0, else do nothing
				const tokenInDb = await check_token_exist.run({token});
				console.log('token in db', tokenInDb)
				const tokenCountInDb= tokenInDb[0]['count'];
				console.log('tokenCountInDb', tokenCountInDb);
				if ( tokenCountInDb === 0 && appsmith.mode !== 'EDIT' ){
					navigateTo('Login');
					console.log('navigate to login')
				}
				console.log('token still valid')

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

