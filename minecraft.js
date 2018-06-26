// node-mcping
// written by Talnaci Alexandru
// I actually reversed engineered the Minecraft protocol!
// thanks to Wireshark! <3

// please credit me if you plan to use this in another project!
// or else I will put it down!
// github: talnacialex

var mc = require("./mchandshake.js");

address = null;
port = null;
online = null;          // online or offline?
version = null;         // server version
motd = null;  // nice motd formatted!
motdJSON = null; // get the motd as an object! wash your hands with it!!!!1!
current_players = null; // current number of players online
max_players = null;     // maximum player capacity
favicon = null;

function readVarInt(input) {
        if (input == null) {
			input = 0;
		}
        var bytes = 0;
        var result = 0;
        var b;
        do {
            b = input[bytes];
            result |= (b & 0b01111111) << (7 * bytes++);
        } while ((b & 0b10000000) != 0);
        return result;
}

module.exports =
{
  init: function(address, port, callback)
  {
    this.address = address;
    this.port = port || 25565;

    const net = require('net');
    const client = net.connect(port, address, () =>
    {
	  var buff = mc.handshake(client.remoteAddress, port); // wrapped into a library to fix things faster.
      client.write(buff); // push handshake message to the socket
	  client.write(new Buffer([0x01, 0x00])); // push separate message to query the status
    });

    // Set timeout to 5 seconds
    client.setTimeout(5000);
	var message = new Buffer(1); // create some dummy buffer, will be changed by the length var down 
	var firstpackageTriggered = false;
	var length = 0;

    client.on('data', (data) =>
    {
      if(data != null && data != '')
      {
		this.online = true;
		var d = data;
		if (!firstpackageTriggered) {
			var lPk = d.slice(0,3)
			length = readVarInt(lPk); // read value sent by MC - 58(offset)
			message = new Buffer(length);
			firstpackageTriggered = true;
			message = Buffer.concat([d.slice(5)]);
		} else {
			message = Buffer.concat([message, d]);
		}
      }
	  client.end();
    });

    client.on('timeout', () =>
    {
      callback();
      client.end();
      process.exit();
    });

    client.on('end', () =>
    {
	  var obj = JSON.parse(message.toString());
	  this.version = obj.version.name;
	  this.motdJSON = obj.description.extra;
	  this.max_players = obj.players.max;
	  this.current_players = obj.players.online;
	  this.favicon = obj.favicon;
	  var m = "";
	  Object.keys(obj.description.extra).forEach(function(key) {
			m += obj.description.extra[key].text;
	  });
	  this.motd = m;
      callback();
    });

    client.on('error', (err) =>
    {
      // Uncomment the lines below to handle error codes individually. Otherwise,
      // call callback() and simply report the remote server as being offline.

      /*
      if(err.code == "ENOTFOUND")
      {
        console.log("Unable to resolve " + this.address + ".");
        return;
      }

      if(err.code == "ECONNREFUSED")
      {
        console.log("Unable to connect to port " + this.port + ".");
        return;
      }
      */

      callback();

      // Uncomment the line below for more details pertaining to network errors.
      //console.log(err);
    });
  }
};