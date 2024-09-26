export default {
	createHash : ()=>{
		const password= 'asdasd123';
		return dcodeIO.bcrypt.hashSync(password,10 );
	},

	verifyHash : (password, hash ) =>{
		return dcodeIO.bcrypt.compareSync(password, hash);
	},

	createToken : (email ) =>{
		return jsonwebtoken.sign({email}, 'gtn-id', {expiresIn: 3600});
	},

	signIn:async () =>{
		const email = Email_si.text;
		const password = Password_si.text;

		try{
			const [user] = await find_user_by_email.run({email});
			const [user_info] = await find_user_without_hash_info.run({email});
			if ( user && this.verifyHash(password, user?.hash)){
				const token = this.createToken(email);

				await this.addTokenToDb(email, token)
				console.log('successfully added token to db')
				await storeValue('user', user_info )
				await storeValue('token', token)
					.then( () => navigateTo('申し込みフォーム'))
				console.log('added token to local')
			}  
			else {
				showAlert("Invalid email or password. Please try again.", "error")
			}
		}catch(error){
			showAlert('Something wrong, please login again! \n'+error.message,'error')
		}
	},

	addTokenToDb: async(email, token)=>{
		const site_code= 'agency';
		return await add_token_info_to_db.run({email, site_code, token})
			.then(() => showAlert("You have been logged in successfully.",'success'))
			.catch(error=> 			showAlert('Something wrong, please login again! \n'+error.message,'error'));
	}

	///-------- SIGN UP, save for later --------//

	// signUp: async () =>{
	// const name = Name_su.text;
	// const email = Email_su.text;
	// 
	// const check_email =await check_email_exist.run({email});
	// const count_email= check_email[0]['count'];
	// console.log('count', count_email)   ;
	// if (count_email === 0  ){
	// if (name.length=== 0) {
	// return showAlert('Please type your name', 'error')
	// }
	// else if (Password_su.text != confirm_password_su.text){
	// return showAlert('Your password is not match', 'error')
	// }
	// else if (name.length != 0 ){
	// const pass = Password_su.text;
	// const password = this.createHash(pass);
	// return insert_user_info.run({ email,password,name})
	// .then(() => showAlert("Your account hass been created, Please log in",'success'))
	// .catch(e => showAlert(e.message, 'error'));
	// }
	// }
	// else {
	// return showAlert('Your email have been registed, please login or try another email', 'error')
	// }
	// },

}