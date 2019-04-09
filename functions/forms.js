/*exports.reshape = function(value, remove, separator){
	var dire = value.split(remove);
	
	var df = dire.pop();
	var did = df.toString();
	console.log(dire, df, did,value)
	var dd = did.split(',').join('separator');
	return dd;
}
*/
exports.change = function(value, remove, separator){
	var dire = value.split(remove);
	var did = dire.toString();
	var dd = did.split(',').join('separator');
	return dd;
}