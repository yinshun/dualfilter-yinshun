var ksa=require("ksana-simple-api");
ksa.excerpt({db:"cbeta",q:"海文"},function(err,data){
	console.log(data);
});