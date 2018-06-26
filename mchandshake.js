// reverse-engineered handshake package
// by Talnaci Alexandru
// reversed engineered thanks to Wireshark, the best friend of a hacker! <3

const pack = require("./pack.js");

function varInt(value) {
	var temp;
	var x = [];
	var i = 0;
    do {
        temp = value & 0b01111111;
        value >>>= 7;
        if (value != 0) {
            temp |= 0b10000000;
		}
        x[i] = temp;
		i++;
    } while (value != 0);
	return Buffer.from(x);
}

function readVarInt(input) {
        if (input == null) {
			input = 0;
		}
        var bytes = 0;
        var result = 0;
		var index = 0;
        var b;
        do {
            b = input.readInt8(0);
            result |= (b & 0b01111111) << (7 * bytes++);
            if (bytes > 5) {
                return 0;
			}
			index++;
        } while ((b & 0b10000000) != 0);
        return result;
}

function unsignedShort(value) {
	return ~value & 0xFFFF;
}

function packString(string) {
	return Buffer.concat([varInt(string.length), Buffer.from(string.toString("UTF-8"))]);
}

module.exports = {
	handshake: function(address, port) {
	  var tmpMessage = new Buffer([ 0x00 ]); // start with handshake message
	  tmpMessage = Buffer.concat([tmpMessage, varInt(340)]); // put latest client version in an ugly way(varint(clientvers))
	  tmpMessage = Buffer.concat([tmpMessage, packString(address)]); // put server ip in an ugly way
	  var portBuf = new Buffer(2); // it's maximum 2 bytes length
	  portBuf.writeUInt16BE(port, 0); // put port of server(as unsigned integer 16 bit big endian) in a nice way
	  tmpMessage = Buffer.concat([tmpMessage, portBuf]); // write to the message in an ugly way
	  tmpMessage = Buffer.concat([tmpMessage, new Buffer([0x01])]); // end message with status query again in an ugly way
	  var msg = Buffer.concat([varInt(tmpMessage.length), tmpMessage]); // create message with length in a nice way
	  return msg;
	}
};