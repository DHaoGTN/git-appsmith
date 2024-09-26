export default {
	ip: 0,
	ipAPI: "https://api.db-ip.com/v2/free/self",
	
	logUserAction: async (action, object, data) => {
		try{
			const user = appsmith.store.user;

			await fetch(this.ipAPI)
			  .then(x => x.text())
			  .then(y => {this.ip = JSON.parse(y).ipAddress})
			console.log(JSON.stringify(this.ip));

			const result = {
				timestamp: new Date().toLocaleTimeString(),
				action,
				user: {
					email: user.email,
					name: user.name,
				},
				object,
				data,
				ip_address: this.ip,
				user_agent: navigator.userAgent
			};

			console.log('result logUserAction: ', result)
		}catch(error){
			console.log(error)
		}
	},

	getObjectChanges: (oldObj, newObj) => {
		const changes = [];

		for (const key in oldObj) {
			if (oldObj.hasOwnProperty(key) && newObj.hasOwnProperty(key)) {
				const oldValue = oldObj[key];
				console.log(oldValue);
				const newValue = newObj[key];

				const isDifferent = Array.isArray(oldValue) && Array.isArray(newValue) ?
							oldValue.length !== newValue.length || oldValue.some((val, index) => val !== newValue[index]) :
				oldValue !== newValue;

				if (isDifferent) {
					changes.push({
						"field": key,
						"from": oldValue,
						"to": newValue
					});
				}
			}
		}

		for (const key in newObj) {
			if (!oldObj.hasOwnProperty(key) && newObj.hasOwnProperty(key)) {
				changes.push({
					"field": key,
					"from": undefined,
					"to": newObj[key]
				});
			}
		}

		return changes;
	},

	triedGetObjectChanges: async () =>{
		const oldObj ={
			key1: [
				{
					key2: 1,
					key3: "a",
				},
				{
					key2: 2,
					key3: "b",
				},
				{
					key2: 3,
					key3: "c",
				},
			] 
		};

		const newObj ={
			key1: [
				{
					key2: 2,
					key3: "a",
				},
				{
					key2: 3,
					key3: "a",
				},
			] 
		};

		return await this.getObjectChanges(oldObj, newObj);
	},

	triedLogUserAction: async ()=>{
		const object = {
			"type": "document",
			"id": "doc-78910"
		};
		const changes = [
			{
				"field": "title",
				"from": "Draft Document",
				"to": "Updated Draft Document"
			},
			{
				"field": "description",
				"from": "Initial description",
				"to": "Revised description with more details"
			},
			{
				"field": "status",
				"from": "In Progress",
				"to": "Completed"
			}
		];
		return await this.logUserAction('create', object, changes)
	},
}