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
var maincomponent = React.createClass({
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
    if (!this.state.localmode)return <div>Loading {db}</div>;
    return <div>
      <h2>Dual Filter for Yinshun</h2>
      <HTMLFileOpener onReady={this.onFileReady}/>
      <br/>Google Chrome Only
      <br/><a target="_new" href="https://github.com/yinshun/dualfilter-yinshun">Github Repo</a>
    </div>
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
    return <div style={styles.container}>    
      <div style={styles.dualfilter}>
        <DualFilter items={this.state.items} 
          inputstyle={styles.input}
          tofind1={this.state.tofind1}
          tofind2={this.state.q}
          onItemClick={this.onItemClick}
          onFilter={this.onFilter} />
      </div>
      <div style={styles.rightpanel}>

      <BreadcrumbTOC toc={this.state.toc} vpos={this.state.vpos} hits={this.state.hits} treenodeHits={ksa.treenodehits}
          onSelect={this.onBreadcrumbSelect} buttonClass="btn btn-link" separator="/"/>

        <SegNav size={11} segs={this.state.segnames} value={this.state.txtid} onGoSegment={this.onGoSegment}/>
        <br/>
        {this.renderText()}
      </div>
    </div>    
  }
});
module.exports=maincomponent;