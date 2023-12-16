export default {
	save: function() {
		setTimeout(async () => {
			const token = auth_get_token.data['access_token'];
			add_token.run({ token });
			console.log(token);
		}, 5000); // Hàm `save` sẽ chạy sau 5 giây
	},

	runEveryFiveSeconds: function() {
		setInterval(() => {
			const token = auth_get_token.data['access_token'];
			const result =check_token_exist.run({token});
			console.log(result);
		}, 5000); // Hàm này sẽ chạy sau mỗi 5 giây
	}
}
