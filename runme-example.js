var mcping = require('./minecraft.js');
mcping.init("sky.mc-ro.ro", 25565, function() { // pinging sky.mc-ro.ro because this is a nice mc server I know...(25565 is the default port btw...)
	if(mcping.online) {
		console.log(`Server is online! Running version ${mcping.version}. There are ${mcping.current_players} player(s) online out of ${mcping.max_players} player(s).`);
		console.log("Server Message of the day is:");
		console.log(mcping.motd);
	} else {
		console.log("Server is offline! :(");
	}
});