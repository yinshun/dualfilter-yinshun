(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\ksana2015\\dualfilter-yinshun\\index.js":[function(require,module,exports){
var React=require("react");
var ReactDOM=require("react-dom");
require("ksana2015-webruntime/livereload")(); 
var ksanagap=require("ksana2015-webruntime/ksanagap");
ksanagap.boot("dualfilter-cbeta",function(){
	var Main=React.createElement(require("./src/main.jsx"));
	ksana.mainComponent=ReactDOM.render(Main,document.getElementById("main"));
});
},{"./src/main.jsx":"C:\\ksana2015\\dualfilter-yinshun\\src\\main.jsx","ksana2015-webruntime/ksanagap":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\ksanagap.js","ksana2015-webruntime/livereload":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\livereload.js","react":"react","react-dom":"react-dom"}],"C:\\ksana2015\\dualfilter-yinshun\\src\\main.jsx":[function(require,module,exports){
/*
TODO _@80 cannot navigate
*/
var React=require("react");
var E=React.createElement;
var ksa=require("ksana-simple-api");
var DualFilter=require("ksana2015-dualfilter").Component;
var HTMLFileOpener=require("ksana2015-htmlfileopener").Component;
var BreadcrumbTOC=require("ksana2015-breadcrumbtoc").Component;
var SegNav=require("ksana2015-segnav").Component;
var db="yinshun";
var styles={
  container:{display:"flex"}
  ,dualfilter:{flex:1,height:"100%",overflowY:"auto"}
  ,rightpanel:{flex:3}
  ,input:{fontSize:"100%",width:"100%"}
}
var maincomponent = React.createClass({displayName: "maincomponent",
  getInitialState:function() {
    return {items:[],itemclick:" ",text:"",tofind1:"",q:"",toc:[],
            vpos:0,localmode:false,ready:false,segnames:[],txtid:"",
            tofind1:localStorage.getItem("yinshun-tofind1")||"般若",q:localStorage.getItem("yinshun-q")||"淨土"};
  }
  ,componentDidMount:function() {
    ksa.tryOpen(db,function(err){
      if (!err) {
        this.setState({ready:true});
      } else {
        this.setState({localmode:true});
      }
    }.bind(this));
  }
  ,onFilter:function(tofind1,q) {
    var that=this;
    ksa.filter({db:db,regex:tofind1,q:q,field:"head"},function(err,items){

      localStorage.setItem("yinshun-tofind1",tofind1);
      localStorage.setItem("yinshun-q",q);
      if (items.length&&items[0].hits&&items[0].hits.length) {
        items.sort(function(i1,i2){return i2.hits.length-i1.hits.length});
      }
      
      ksa.toc({db:db,q:q,tocname:"head"},function(err,res){


        that.setState({items:items,tofind1:tofind1,q:q,toc:res.toc},function(){
          that.fetchText(items[0].vpos);
        });
        if (!that.state.segnames.length) {
          ksa.get(db,"segnames",function(segnames){
            that.setState({segnames: segnames});
          });
        }
      })
    });
  }
  ,fetchText:function(vpos){
    ksa.fetch({db:db,vpos:vpos,q:this.state.q},function(err,content){
      if (!content || !content.length) return;
      this.setState({vpos:vpos,text:content[0].text,hits:content[0].hits,txtid:content[0].uti}); 

    }.bind(this));
  }
  ,onItemClick:function(idx) {
    this.fetchText(this.state.items[idx].vpos);
  }
  ,renderText:function() {
    return ksa.renderHits(this.state.text,this.state.hits,E.bind(null,"span"));
  }
  ,onFileReady:function(files) {
    this.setState({localmode:false,ready:true});
    db=files[db];//replace dbid with HTML File handle
  }
  ,renderOpenKDB:function() {
    if (!this.state.localmode)return React.createElement("div", null, "Loading ", db);
    return React.createElement("div", null, 
      React.createElement("h2", null, "Dual Filter for Yinshun"), 
      React.createElement(HTMLFileOpener, {onReady: this.onFileReady}), 
      React.createElement("br", null), "Google Chrome Only", 
      React.createElement("br", null), React.createElement("a", {target: "_new", href: "https://github.com/yinshun/dualfilter-yinshun"}, "Github Repo")
    )
  }
  ,onBreadcrumbSelect:function(itemidx,vpos) {
    this.fetchText(vpos);
  }
  ,onGoSegment:function(seg) {
    ksa.uti2vpos({db:db,uti:seg},function(err,vpos){
      if (!err) this.fetchText(vpos);
    }.bind(this));
  }
  ,render: function() {
    if (!this.state.ready) return this.renderOpenKDB();
    return React.createElement("div", {style: styles.container}, 
      React.createElement("div", {style: styles.dualfilter}, 
        React.createElement(DualFilter, {items: this.state.items, 
          inputstyle: styles.input, 
          tofind1: this.state.tofind1, 
          tofind2: this.state.q, 
          onItemClick: this.onItemClick, 
          onFilter: this.onFilter})
      ), 
      React.createElement("div", {style: styles.rightpanel}, 

      React.createElement(BreadcrumbTOC, {toc: this.state.toc, vpos: this.state.vpos, 
         keyword: this.state.tofind1, onSelect: this.onBreadcrumbSelect}), 

        React.createElement(SegNav, {size: 11, segs: this.state.segnames, value: this.state.txtid, onGoSegment: this.onGoSegment}), 
        React.createElement("br", null), 
        this.renderText()
      )
    )    
  }
});
module.exports=maincomponent;
},{"ksana-simple-api":"ksana-simple-api","ksana2015-breadcrumbtoc":"C:\\ksana2015\\node_modules\\ksana2015-breadcrumbtoc\\index.js","ksana2015-dualfilter":"C:\\ksana2015\\node_modules\\ksana2015-dualfilter\\index.js","ksana2015-htmlfileopener":"C:\\ksana2015\\node_modules\\ksana2015-htmlfileopener\\index.js","ksana2015-segnav":"C:\\ksana2015\\node_modules\\ksana2015-segnav\\index.js","react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-breadcrumbtoc\\breadcrumbtoc.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var buildToc = function(toc) {
	if (!toc || !toc.length || toc.built) return;
	var depths=[];
 	var prev=0;
 	for (var i=0;i<toc.length;i++) delete toc[i].n;
	for (var i=0;i<toc.length;i++) {
	    var depth=toc[i].d||toc[i].depth;
	    if (prev>depth) { //link to prev sibling
	      if (depths[depth]) toc[depths[depth]].n = i;
	      for (var j=depth;j<prev;j++) depths[j]=0;
	    }
    	depths[depth]=i;
    	prev=depth;
	}
	toc.built=true;
	return toc;
}
var getChildren = function(toc,n) {
	if (!toc[n]||!toc[n+1] ||toc[n+1].d!==toc[n].d+1) return [];
	var out=[],next=n+1;
	while (next) {
		out.push(next);
		if (!toc[next+1])break;
		if (toc[next].d==toc[next+1].d) {
			next++;
		} else if (toc[next].n){
			next=toc[next].n;			
		} else {
			next=0;
		}
	}
	return out;
}
var BreadcrumbTOC=React.createClass({
	propTypes:{
		toc:PT.array.isRequired
		,hits:PT.array
		,onSelect:PT.func
		,vpos:PT.number  //jump with vpos
		,keyword:PT.string
		,treenodeHits:PT.func
		,buttonClass:PT.string
		,separator:PT.node
	}
	,componentWillReceiveProps:function(nextProps,nextState) {
		if (nextProps.toc && !nextProps.toc.built) {
			buildToc(nextProps.toc);
		}
		if (nextProps.hits!==this.props.hits) {
			this.clearHits();
		}
	}
	,componentWillMount:function(){
		buildToc(this.props.toc);
	}
	,getInitialState:function(){
		return {};
	}
	,clearHits:function() {
		for (var i=0;i<this.props.toc;i++) {
			if (this.props.toc[i].hit) delete this.props.toc[i].hit;
		}
	}
	,onSelect:function(idx,children,level) {
		this.props.onSelect && this.props.onSelect(idx, children[idx].vpos+1);//don't know why???
	}
	,closestItem:function(tocitems,vpos) {
		for (i=1;i<tocitems.length;i++) {
			if (this.props.toc[tocitems[i]].vpos>=vpos) return i-1;
		}
		return tocitems.length-1;
	}
	,renderCrumbs:function() {
		var dropdown=require("./dropdown_bs");
		var cur=0,toc=this.props.toc,out=[],level=0;
		do {
			var children=getChildren(toc,cur);
			if (!children.length) break;

			var selected = this.closestItem(children,this.props.vpos) ;
			cur=children[selected];

			var items=children.map(function(child){
				var hit=toc[child].hit;
				if (this.props.hits && isNaN(hit) && this.props.treenodeHits) {
					hit=this.props.treenodeHits( toc,this.props.hits,child);
				}

				return {t:toc[child].t,idx:child,hit:hit,vpos:toc[child].vpos};
			}.bind(this));
			out.push(E(dropdown,{onSelect:this.onSelect,level:level,
				separator:this.props.separator,buttonClass:this.props.buttonClass,
				key:out.length,selected:selected,items:items,keyword:this.props.keyword}) );
			//if (out.length>5) break;
			level++;
		} while (true);
		return out;
	}
	,render:function(){
		return E("div",{},this.renderCrumbs());
	}
})
module.exports=BreadcrumbTOC;
},{"./dropdown_bs":"C:\\ksana2015\\node_modules\\ksana2015-breadcrumbtoc\\dropdown_bs.js","react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-breadcrumbtoc\\dropdown_bs.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;

var BreadCrumbDropdown=React.createClass({
	propTypes:{
		items:PT.array.isRequired
		,selected:PT.number
		,onSelect:PT.func
		,level:PT.number.isRequired //which level
		,keyword:PT.string
	}
	,getDefaultProp:function(){
		return {items:[]}
	}
	,onSelect:function(e) {
		domnode=e.target.parentElement;
		var idx=-1;
		while (domnode) {
			if (domnode.classList.contains("open")) domnode.classList.remove("open");
			if (domnode.dataset && domnode.dataset.idx) idx=parseInt(domnode.dataset.idx);
			domnode=domnode.parentElement;
		}
		this.props.onSelect&&this.props.onSelect(idx,this.props.items,this.props.level);
	}
	,renderKeyword:function(t) {
		if (this.props.keyword) {
			var o=[],lastidx=0;
			t.replace(new RegExp(this.props.keyword,"g"),function(m,idx){
				o.push(t.substr(lastidx,idx));
				o.push(E("span",{key:idx,style:{color:"red"}},m));
				lastidx=idx+m.length;
			});
			o.push(t.substr(lastidx));
			t=o;
		}
		return t;
	}
	,renderItem:function(item,idx) {
		var hit=null;
		var style={cursor:"pointer"};
		if (this.props.selected==idx) style.background="highlight"
		item.hit&&(hit=E("span",{style:{color:"red"},className:"pull-right"},item.hit));
		var t=this.renderKeyword(item.t);
		return E("li",{key:idx,"data-idx":idx},E("a",{style:style,onClick:this.onSelect},t,hit));
	}
	,blur:function(e){
		e.target.parentElement.classList.remove("open");
	}
	,open:function(e){
		e.target.parentElement.classList.add("open");
		e.target.nextSibling.focus();
	}
	,render:function(){
		var item=this.props.items[this.props.selected];
		var title=item.t;

		item.hit&&(title=[E("span",{key:1},item.t),E("span",{key:2,className:"hl0 pull-right"},item.hit||"")]);
		return E("span",{className:"dropdown"},
				E("button",{key:"drop","data-toggle":"dropdown",className:this.props.buttonClass||"btn btn-default",
					onClick:this.open}, this.props.items[this.props.selected].t ),
				this.props.separator,
				E("ul",{className:"dropdown-menu open",id:"for_shutting_warning_up"
					,onBlur:this.blur
					,noCaret:true,title:this.renderKeyword(title)},
			this.props.items.map(this.renderItem)));
	}
});
module.exports=BreadCrumbDropdown;
},{"react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-breadcrumbtoc\\index.js":[function(require,module,exports){
module.exports={Component:require("./breadcrumbtoc")};
},{"./breadcrumbtoc":"C:\\ksana2015\\node_modules\\ksana2015-breadcrumbtoc\\breadcrumbtoc.js"}],"C:\\ksana2015\\node_modules\\ksana2015-dualfilter\\dualfilter.js":[function(require,module,exports){
var React=require("react");
var ReactList=require("react-list");
var E=React.createElement;
var PT=React.PropTypes;

var styles={
  item:{cursor:"pointer"}
}
var DualFilter=React.createClass({
  getInitialState:function(){
    return {tofind1:this.props.tofind1||"",tofind2:this.props.tofind2||""};
  }
  ,componentDidMount:function() {
    if (this.state.tofind1||this.state.tofind2) {
      this.preparesearch();
    }
  }
  ,getDefaultProps:function(){
    return {items:[]};
  }
  ,propTypes:{
    items:PT.array.isRequired
    ,onFilter:PT.func.isRequired
    ,onItemClick:PT.func.isRequired
    ,inputstyle:PT.object
    ,inputclass:PT.oneOfType([PT.string, PT.func])

  }
  ,renderHit:function(hit) {
    return E("span",{className:"hl0"},hit);
  }
  ,itemClick:function(e) {
    ele=e.target;
    if (!(ele.dataset &&ele.dataset.idx)) ele=ele.parentElement;
    var idx=parseInt(ele.dataset.idx);
    this.props.onItemClick(idx);
  }
  ,renderItem:function(i,idx){
    var hit=(this.props.items[i].hits||[]).length||"";
    var vpos=this.props.items[i].vpos||0;
    return E("div",{key:idx,style:styles.item
      ,"data-vpos":vpos
      ,"data-idx":idx
      ,"data-hit":hit
      ,onClick:this.itemClick},this.props.items[i].text,this.renderHit.call(this,hit));
  }
  ,preparesearch:function() {
    clearTimeout(this.timer);
    this.timer=setTimeout(function(){
      this.props.onFilter(this.state.tofind1,this.state.tofind2);
    }.bind(this),500);    
  }
  ,onChange1:function(e) {
    this.setState({tofind1:e.target.value});
    this.preparesearch();
  }
  ,onChange2:function(e) {
    this.setState({tofind2:e.target.value});
    this.preparesearch();
  }
	,render:function() {
    var Input=this.props.inputclass||"input";
		return E("div",null,
      E(Input,{placeholder:"regular expression",style:this.props.inputstyle,value:this.state.tofind1,onChange:this.onChange1})
      ,E("br")
      ,E(Input,{placeholder:"full text search",style:this.props.inputstyle,value:this.state.tofind2,onChange:this.onChange2})
      ,E("br")
      ,E("span",null,"match count:",this.props.items.length)
      ,E("br")
      ,E(ReactList,{itemRenderer:this.renderItem,length:this.props.items.length})
    )
	}
})
module.exports=DualFilter;
},{"react":"react","react-list":"react-list"}],"C:\\ksana2015\\node_modules\\ksana2015-dualfilter\\index.js":[function(require,module,exports){
module.exports={Component:require("./dualfilter")};
},{"./dualfilter":"C:\\ksana2015\\node_modules\\ksana2015-dualfilter\\dualfilter.js"}],"C:\\ksana2015\\node_modules\\ksana2015-htmlfileopener\\htmlfileopener.js":[function(require,module,exports){
var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;
var styles={
	ready:{backgroundColor:"green",color:"yellow"}
}
var getFilesFromKsanajs=function() {
	var o={};
	ksana.js.files.map(function(file){
		if (file.substr(file.length-4)!==".kdb") return;
		kdbid=file.substr(file.lastIndexOf("/")+1);
		kdbid=kdbid.substr(0,kdbid.length-4);

		o[kdbid]=file;
	});
	return o;
}
var HTMLFileOpener=React.createClass({
	propTypes:{
		files:PT.object // { kdbid:url}
		,onReady:PT.func.isRequired
	}
	,getInitialState:function() {
		return {ready:{} };
	}
	,renderStatus:function(kdbid,url) {
		if(this.state.ready[kdbid]){
			return E("span",{style:styles.ready},"Ready");
		} else {
			return E("span",null,E("a",{href:url},"Download "));
		}
	}
	,renderFileStatus:function(){
		var o=[];
		for (var kdbid in this.props.files) {
			var url=this.props.files[kdbid];
			o.push(E("div",{key:kdbid},kdbid+".kdb ",this.renderStatus(kdbid,url)));
		}
		return o;
	}
	,getDefaultProps:function(){
		return {files:getFilesFromKsanajs()};
	}
	,openFile:function(e) {
		var files=e.target.files;
		var ready=this.state.ready;
		for (var i=0;i<files.length;i++) {
			var kdbid=files[i].name;
			kdbid=kdbid.substr(0,kdbid.length-4);
			if (this.props.files[kdbid]) {
				ready[kdbid]=files[i];
			}
		}
		if (Object.keys(ready).length==Object.keys(this.props.files).length) {
			this.props.onReady(ready);
		}
		this.setState({ready:ready});
	}
	,render:function() {
		var opts={type:"file", accept:".kdb", onChange:this.openFile}
		if (Object.keys(this.props.files).length>1) opts.multiple="multiple";
    return E("div",null
    	, this.renderFileStatus()
    	, E("input",opts)
    	,"click download if you don't have the kdb on your disk"
    );
	}
});
module.exports=HTMLFileOpener;
},{"react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-htmlfileopener\\index.js":[function(require,module,exports){
module.exports={Component:require("./htmlfileopener")};
},{"./htmlfileopener":"C:\\ksana2015\\node_modules\\ksana2015-htmlfileopener\\htmlfileopener.js"}],"C:\\ksana2015\\node_modules\\ksana2015-segnav\\index.js":[function(require,module,exports){
module.exports={Component:require("./segnav")};
},{"./segnav":"C:\\ksana2015\\node_modules\\ksana2015-segnav\\segnav.js"}],"C:\\ksana2015\\node_modules\\ksana2015-segnav\\segnav.js":[function(require,module,exports){
var React=require("react");

var E=React.createElement;
var PT=React.PropTypes;
var SegNav=React.createClass({
	propTypes:{
		"segpat":PT.string
		,"value":PT.string
		,"segs":PT.array.isRequired
		,"onGoSegment":PT.func
	}
	,getInitialState:function() {
		return {segs:this.props.segs};
	}
	,componentWillMount:function() {
		this.btn=this.props.button||"button";
		if (this.props.segpat) {
			var regex=new RegExp(this.props.segpat);
			var segnames={};
			this.props.segs.forEach(function(seg){
				var m=seg.match(regex);
				if (m && !segnames[m[1]]) segnames[m[1]]=true;
			});
			var segs=Object.keys(segnames);
			var segnow=segs.indexOf(this.props.value)||0;
			this.setState({segs:segs,segnow:segnow,segname:this.state.segs[segnow]});
		}
	}
	,componentWillReceiveProps:function(nextProps,nextState) {
		var idx=nextProps.segs.indexOf(nextProps.value);
		if (idx>-1) {
			this.setState({segnow:idx,segname:this.state.segs[idx]});
		}
		if (this.state.segs!==nextProps.segs) this.setState({segs:nextProps.segs});
		
	}
	,goSeg:function(idx) {
		this.setState({segnow:idx,segname:this.state.segs[idx]});
		this.props.onGoSegment&&this.props.onGoSegment(this.state.segs[idx]);
	}
	,prev:function() {
		var segnow=this.state.segnow;
		if (segnow>0) segnow--;
		this.goSeg(segnow);
	}
	,next:function(){
		var segnow=this.state.segnow;
		if (segnow<this.state.segs.length-1) segnow++;
		this.goSeg(segnow);
	}
	,onKeyPress:function(e) {
		if (e.key=="Enter") {
			var idx=this.state.segs.indexOf(e.target.value);
			if (idx>-1) this.goSeg(idx);
		}
	}
	,onChange:function(e) {
		var segname=e.target.value;
		var idx=this.state.segs.indexOf(segname);
		this.setState({segname:segname});
		clearTimeout(this.timer);
		this.timer=setTimeout(function(){
			if (idx>-1) this.goSeg(idx);
			else {
				this.refs.seg.getDOMNode().value=this.state.segs[this.state.segnow];
			}
		}.bind(this),2000);
	}
	,render : function() {
		return E("span",null,
			E(this.btn,{style:this.props.style,onClick:this.prev,disabled:this.state.segnow==0},"←"),
			E("input",{size:this.props.size||8,style:this.props.style,ref:"seg",value:this.state.segname,onKeyPress:this.onKeyPress,onChange:this.onChange}),
			E(this.btn,{style:this.props.style,onClick:this.next,disabled:this.state.segnow==this.state.segs.length-1},"→")
		);
	}
})
module.exports=SegNav;
},{"react":"react"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js":[function(require,module,exports){

var userCancel=false;
var files=[];
var totalDownloadByte=0;
var targetPath="";
var tempPath="";
var nfile=0;
var baseurl="";
var result="";
var downloading=false;
var startDownload=function(dbid,_baseurl,_files) { //return download id
	var fs     = require("fs");
	var path   = require("path");

	
	files=_files.split("\uffff");
	if (downloading) return false; //only one session
	userCancel=false;
	totalDownloadByte=0;
	nextFile();
	downloading=true;
	baseurl=_baseurl;
	if (baseurl[baseurl.length-1]!='/')baseurl+='/';
	targetPath=ksanagap.rootPath+dbid+'/';
	tempPath=ksanagap.rootPath+".tmp/";
	result="";
	return true;
}

var nextFile=function() {
	setTimeout(function(){
		if (nfile==files.length) {
			nfile++;
			endDownload();
		} else {
			downloadFile(nfile++);	
		}
	},100);
}

var downloadFile=function(nfile) {
	var url=baseurl+files[nfile];
	var tmpfilename=tempPath+files[nfile];
	var mkdirp = require("./mkdirp");
	var fs     = require("fs");
	var http   = require("http");

	mkdirp.sync(path.dirname(tmpfilename));
	var writeStream = fs.createWriteStream(tmpfilename);
	var datalength=0;
	var request = http.get(url, function(response) {
		response.on('data',function(chunk){
			writeStream.write(chunk);
			totalDownloadByte+=chunk.length;
			if (userCancel) {
				writeStream.end();
				setTimeout(function(){nextFile();},100);
			}
		});
		response.on("end",function() {
			writeStream.end();
			setTimeout(function(){nextFile();},100);
		});
	});
}

var cancelDownload=function() {
	userCancel=true;
	endDownload();
}
var verify=function() {
	return true;
}
var endDownload=function() {
	nfile=files.length+1;//stop
	result="cancelled";
	downloading=false;
	if (userCancel) return;
	var fs     = require("fs");
	var mkdirp = require("./mkdirp");

	for (var i=0;i<files.length;i++) {
		var targetfilename=targetPath+files[i];
		var tmpfilename   =tempPath+files[i];
		mkdirp.sync(path.dirname(targetfilename));
		fs.renameSync(tmpfilename,targetfilename);
	}
	if (verify()) {
		result="success";
	} else {
		result="error";
	}
}

var downloadedByte=function() {
	return totalDownloadByte;
}
var doneDownload=function() {
	if (nfile>files.length) return result;
	else return "";
}
var downloadingFile=function() {
	return nfile-1;
}

var downloader={startDownload:startDownload, downloadedByte:downloadedByte,
	downloadingFile:downloadingFile, cancelDownload:cancelDownload,doneDownload:doneDownload};
module.exports=downloader;
},{"./mkdirp":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\mkdirp.js","fs":false,"http":false,"path":false}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js":[function(require,module,exports){
/* emulate filesystem on html5 browser */
var get_head=function(url,field,cb){
	var xhr = new XMLHttpRequest();
	xhr.open("HEAD", url, true);
	xhr.onreadystatechange = function() {
			if (this.readyState == this.DONE) {
				cb(xhr.getResponseHeader(field));
			} else {
				if (this.status!==200&&this.status!==206) {
					cb("");
				}
			}
	};
	xhr.send();
}
var get_date=function(url,cb) {
	get_head(url,"Last-Modified",function(value){
		cb(value);
	});
}
var get_size=function(url, cb) {
	get_head(url,"Content-Length",function(value){
		cb(parseInt(value));
	});
};
var checkUpdate=function(url,fn,cb) {
	if (!url) {
		cb(false);
		return;
	}
	get_date(url,function(d){
		API.fs.root.getFile(fn, {create: false, exclusive: false}, function(fileEntry) {
			fileEntry.getMetadata(function(metadata){
				var localDate=Date.parse(metadata.modificationTime);
				var urlDate=Date.parse(d);
				cb(urlDate>localDate);
			});
		},function(){
			cb(false);
		});
	});
}
var download=function(url,fn,cb,statuscb,context) {
	 var totalsize=0,batches=null,written=0;
	 var fileEntry=0, fileWriter=0;
	 var createBatches=function(size) {
		var bytes=1024*1024, out=[];
		var b=Math.floor(size / bytes);
		var last=size %bytes;
		for (var i=0;i<=b;i++) {
			out.push(i*bytes);
		}
		out.push(b*bytes+last);
		return out;
	 }
	 var finish=function() {
		 rm(fn,function(){
				fileEntry.moveTo(fileEntry.filesystem.root, fn,function(){
					setTimeout( cb.bind(context,false) , 0) ;
				},function(e){
					console.log("failed",e)
				});
		 },this);
	 };
		var tempfn="temp.kdb";
		var batch=function(b) {
		var abort=false;
		var xhr = new XMLHttpRequest();
		var requesturl=url+"?"+Math.random();
		xhr.open('get', requesturl, true);
		xhr.setRequestHeader('Range', 'bytes='+batches[b]+'-'+(batches[b+1]-1));
		xhr.responseType = 'blob';
		xhr.addEventListener('load', function() {
			var blob=this.response;
			fileEntry.createWriter(function(fileWriter) {
				fileWriter.seek(fileWriter.length);
				fileWriter.write(blob);
				written+=blob.size;
				fileWriter.onwriteend = function(e) {
					if (statuscb) {
						abort=statuscb.apply(context,[ fileWriter.length / totalsize,totalsize ]);
						if (abort) setTimeout( cb.bind(context,false) , 0) ;
				 	}
					b++;
					if (!abort) {
						if (b<batches.length-1) setTimeout(batch.bind(context,b),0);
						else                    finish();
				 	}
			 	};
			}, console.error);
		},false);
		xhr.send();
	}

	get_size(url,function(size){
		totalsize=size;
		if (!size) {
			if (cb) cb.apply(context,[false]);
		} else {//ready to download
			rm(tempfn,function(){
				 batches=createBatches(size);
				 if (statuscb) statuscb.apply(context,[ 0, totalsize ]);
				 API.fs.root.getFile(tempfn, {create: 1, exclusive: false}, function(_fileEntry) {
							fileEntry=_fileEntry;
						batch(0);
				 });
			},this);
		}
	});
}

var readFile=function(filename,cb,context) {
	API.fs.root.getFile(filename, {create: false, exclusive: false},function(fileEntry) {
		fileEntry.file(function(file){
			var reader = new FileReader();
			reader.onloadend = function(e) {
				if (cb) cb.call(cb,this.result);
			};
			reader.readAsText(file,"utf8");
		});
	}, console.error);
}

function createDir(rootDirEntry, folders,  cb) {
  // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
  if (folders[0] == '.' || folders[0] == '') {
    folders = folders.slice(1);
  }
  rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
    // Recursively add the new subfolder (if we still have another to create).
    if (folders.length) {
      createDir(dirEntry, folders.slice(1),cb);
    } else {
			cb();
		}
  }, cb);
};


var writeFile=function(filename,buf,cb,context){
	var write=function(fileEntry){
		fileEntry.createWriter(function(fileWriter) {
			fileWriter.write(buf);
			fileWriter.onwriteend = function(e) {
				if (cb) cb.apply(cb,[buf.byteLength]);
			};
		}, console.error);
	}

	var getFile=function(filename){
		API.fs.root.getFile(filename, {exclusive:true}, function(fileEntry) {
			write(fileEntry);
		}, function(){
				API.fs.root.getFile(filename, {create:true,exclusive:true}, function(fileEntry) {
					write(fileEntry);
				});

		});
	}
	var slash=filename.lastIndexOf("/");
	if (slash>-1) {
		createDir(API.fs.root, filename.substr(0,slash).split("/"),function(){
			getFile(filename);
		});
	} else {
		getFile(filename);
	}
}

var readdir=function(cb,context) {
	var dirReader = API.fs.root.createReader();
	var out=[],that=this;
	dirReader.readEntries(function(entries) {
		if (entries.length) {
			for (var i = 0, entry; entry = entries[i]; ++i) {
				if (entry.isFile) {
					out.push([entry.name,entry.toURL ? entry.toURL() : entry.toURI()]);
				}
			}
		}
		API.files=out;
		if (cb) cb.apply(context,[out]);
	}, function(){
		if (cb) cb.apply(context,[null]);
	});
}
var getFileURL=function(filename) {
	if (!API.files ) return null;
	var file= API.files.filter(function(f){return f[0]==filename});
	if (file.length) return file[0][1];
}
var rm=function(filename,cb,context) {
	var url=getFileURL(filename);
	if (url) rmURL(url,cb,context);
	else if (cb) cb.apply(context,[false]);
}

var rmURL=function(filename,cb,context) {
	webkitResolveLocalFileSystemURL(filename, function(fileEntry) {
		fileEntry.remove(function() {
			if (cb) cb.apply(context,[true]);
		}, console.error);
	},  function(e){
		if (cb) cb.apply(context,[false]);//no such file
	});
}
function errorHandler(e) {
	console.error('Error: ' +e.name+ " "+e.message);
}
var initfs=function(grantedBytes,cb,context) {
	webkitRequestFileSystem(PERSISTENT, grantedBytes,  function(fs) {
		API.fs=fs;
		API.quota=grantedBytes;
		readdir(function(){
			API.initialized=true;
			cb.apply(context,[grantedBytes,fs]);
		},context);
	}, errorHandler);
}
var init=function(quota,cb,context) {
	if (!navigator.webkitPersistentStorage) return;
	navigator.webkitPersistentStorage.requestQuota(quota,
			function(grantedBytes) {
				initfs(grantedBytes,cb,context);
		}, errorHandler
	);
}
var queryQuota=function(cb,context) {
	var that=this;
	navigator.webkitPersistentStorage.queryUsageAndQuota(
	 function(usage,quota){
			initfs(quota,function(){
				cb.apply(context,[usage,quota]);
			},context);
	});
}
var API={
	init:init
	,readdir:readdir
	,checkUpdate:checkUpdate
	,rm:rm
	,rmURL:rmURL
	,getFileURL:getFileURL
	,writeFile:writeFile
	,readFile:readFile
	,download:download
	,get_head:get_head
	,get_date:get_date
	,get_size:get_size
	,getDownloadSize:get_size
	,queryQuota:queryQuota
}
module.exports=API;

},{}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\ksanagap.js":[function(require,module,exports){
var appname="installer";
if (typeof ksana=="undefined") {
	window.ksana={platform:"chrome"};
	if (typeof process!=="undefined" && 
		process.versions && process.versions["node-webkit"]) {
		window.ksana.platform="node-webkit";
	}
}
var switchApp=function(path) {
	var fs=require("fs");
	path="../"+path;
	appname=path;
	document.location.href= path+"/index.html"; 
	process.chdir(path);
}
var downloader={};
var rootPath="";

var deleteApp=function(app) {
	console.error("not allow on PC, do it in File Explorer/ Finder");
}
var username=function() {
	return "";
}
var useremail=function() {
	return ""
}
var runtime_version=function() {
	return "1.4";
}

//copy from liveupdate
var jsonp=function(url,dbid,callback,context) {
  var script=document.getElementById("jsonp2");
  if (script) {
    script.parentNode.removeChild(script);
  }
  window.jsonp_handler=function(data) {
    if (typeof data=="object") {
      data.dbid=dbid;
      callback.apply(context,[data]);    
    }  
  }
  window.jsonp_error_handler=function() {
    console.error("url unreachable",url);
    callback.apply(context,[null]);
  }
  script=document.createElement('script');
  script.setAttribute('id', "jsonp2");
  script.setAttribute('onerror', "jsonp_error_handler()");
  url=url+'?'+(new Date().getTime());
  script.setAttribute('src', url);
  document.getElementsByTagName('head')[0].appendChild(script); 
}


var loadKsanajs=function(){

	if (typeof process!="undefined" && !process.browser) {
		var ksanajs=require("fs").readFileSync("./ksana.js","utf8").trim();
		downloader=require("./downloader");
		ksana.js=JSON.parse(ksanajs.substring(14,ksanajs.length-1));
		rootPath=process.cwd();
		rootPath=require("path").resolve(rootPath,"..").replace(/\\/g,"/")+'/';
		ksana.ready=true;
	} else{
		var url=window.location.origin+window.location.pathname.replace("index.html","")+"ksana.js";
		jsonp(url,appname,function(data){
			ksana.js=data;
			ksana.ready=true;
		});
	}
}

loadKsanajs();

var boot=function(appId,cb) {
	if (typeof appId=="function") {
		cb=appId;
		appId="unknownapp";
	}
	if (!ksana.js && ksana.platform=="node-webkit") {
		loadKsanajs();
	}
	ksana.appId=appId;
	if (ksana.ready) {
		cb();
		return;
	}
	var timer=setInterval(function(){
			if (ksana.ready){
				clearInterval(timer);
				cb();
			}
		},100);
}


var ksanagap={
	platform:"node-webkit",
	startDownload:downloader.startDownload,
	downloadedByte:downloader.downloadedByte,
	downloadingFile:downloader.downloadingFile,
	cancelDownload:downloader.cancelDownload,
	doneDownload:downloader.doneDownload,
	switchApp:switchApp,
	rootPath:rootPath,
	deleteApp: deleteApp,
	username:username, //not support on PC
	useremail:username,
	runtime_version:runtime_version,
	boot:boot
}
module.exports=ksanagap;
},{"./downloader":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\downloader.js","fs":false,"path":false}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\livereload.js":[function(require,module,exports){
var started=false;
var timer=null;
var bundledate=null;
var get_date=require("./html5fs").get_date;
var checkIfBundleUpdated=function() {
	get_date("bundle.js",function(date){
		if (bundledate &&bundledate!=date){
			location.reload();
		}
		bundledate=date;
	});
}
var livereload=function() {
	if(window.location.origin.indexOf("//127.0.0.1")===-1) return;

	if (started) return;

	timer1=setInterval(function(){
		checkIfBundleUpdated();
	},2000);
	started=true;
}

module.exports=livereload;
},{"./html5fs":"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\html5fs.js"}],"C:\\ksana2015\\node_modules\\ksana2015-webruntime\\mkdirp.js":[function(require,module,exports){
function mkdirP (p, mode, f, made) {
     var path = nodeRequire('path');
     var fs = nodeRequire('fs');
	
    if (typeof mode === 'function' || mode === undefined) {
        f = mode;
        mode = 0x1FF & (~process.umask());
    }
    if (!made) made = null;

    var cb = f || function () {};
    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    fs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path.dirname(p), mode, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, mode, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                fs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made)
                    else cb(null, made);
                });
                break;
        }
    });
}

mkdirP.sync = function sync (p, mode, made) {
    var path = nodeRequire('path');
    var fs = nodeRequire('fs');
    if (mode === undefined) {
        mode = 0x1FF & (~process.umask());
    }
    if (!made) made = null;

    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    try {
        fs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), mode, made);
                sync(p, mode, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = fs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};

module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

},{}]},{},["C:\\ksana2015\\dualfilter-yinshun\\index.js"])
//# sourceMappingURL=bundle.js.map
